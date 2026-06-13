#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env};

#[contract]
pub struct PoliciesContract;

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum SenderRule {
    Default,
    Allow,
    Block,
}

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct MailboxPolicy {
    pub allow_unknown: bool,
    pub require_verified: bool,
    pub minimum_postage: i128,
}

#[contracttype]
#[derive(Clone)]
enum DataKey {
    Policy(Address),
    Rule(Address, Address),
}

#[contractimpl]
impl PoliciesContract {
    pub fn set_policy(env: Env, owner: Address, policy: MailboxPolicy) {
        owner.require_auth();
        if policy.minimum_postage < 0 {
            panic!("minimum postage cannot be negative");
        }

        env.storage()
            .persistent()
            .set(&DataKey::Policy(owner.clone()), &policy);
        env.events()
            .publish((symbol_short!("policy"), owner), policy);
    }

    pub fn get_policy(env: Env, owner: Address) -> MailboxPolicy {
        env.storage()
            .persistent()
            .get(&DataKey::Policy(owner))
            .unwrap_or(MailboxPolicy {
                allow_unknown: false,
                require_verified: true,
                minimum_postage: 0,
            })
    }

    pub fn set_sender_rule(env: Env, owner: Address, sender: Address, rule: SenderRule) {
        owner.require_auth();
        let key = DataKey::Rule(owner.clone(), sender.clone());

        if rule == SenderRule::Default {
            env.storage().persistent().remove(&key);
        } else {
            env.storage().persistent().set(&key, &rule);
        }
        env.events()
            .publish((symbol_short!("sender"), owner, sender), rule);
    }

    pub fn sender_rule(env: Env, owner: Address, sender: Address) -> SenderRule {
        env.storage()
            .persistent()
            .get(&DataKey::Rule(owner, sender))
            .unwrap_or(SenderRule::Default)
    }

    pub fn can_mail(
        env: Env,
        owner: Address,
        sender: Address,
        verified: bool,
        postage: i128,
    ) -> bool {
        match Self::sender_rule(env.clone(), owner.clone(), sender) {
            SenderRule::Allow => true,
            SenderRule::Block => false,
            SenderRule::Default => {
                let policy = Self::get_policy(env, owner);
                policy.allow_unknown
                    && (!policy.require_verified || verified)
                    && postage >= policy.minimum_postage
            }
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;

    #[test]
    fn owner_controls_who_can_mail() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(PoliciesContract, ());
        let client = PoliciesContractClient::new(&env, &contract_id);
        let owner = Address::generate(&env);
        let trusted = Address::generate(&env);
        let blocked = Address::generate(&env);
        let unknown = Address::generate(&env);

        client.set_policy(
            &owner,
            &MailboxPolicy {
                allow_unknown: true,
                require_verified: true,
                minimum_postage: 100,
            },
        );
        client.set_sender_rule(&owner, &trusted, &SenderRule::Allow);
        client.set_sender_rule(&owner, &blocked, &SenderRule::Block);

        assert!(client.can_mail(&owner, &trusted, &false, &0));
        assert!(!client.can_mail(&owner, &blocked, &true, &1000));
        assert!(!client.can_mail(&owner, &unknown, &false, &100));
        assert!(client.can_mail(&owner, &unknown, &true, &100));
    }
}
