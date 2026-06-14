import { stellarAddressSchema } from "./domain";
import { ApiError } from "./errors";

export const ACTOR_HEADER = "x-stealth-address";

export function requireActor(request: Request) {
  const value = request.headers.get(ACTOR_HEADER);
  if (!value) {
    throw new ApiError(401, "unauthorized", `Missing ${ACTOR_HEADER} header`);
  }

  const result = stellarAddressSchema.safeParse(value);
  if (!result.success) {
    throw new ApiError(401, "unauthorized", `${ACTOR_HEADER} must be a valid Stellar G-address`);
  }

  return result.data;
}

export function requireActorMatches(request: Request, expectedAddress: string) {
  const actor = requireActor(request);
  if (actor !== expectedAddress) {
    throw new ApiError(403, "forbidden", "The authenticated actor cannot modify this resource");
  }
  return actor;
}
