import { describe, expect, it } from "vitest";

import { ACTOR_HEADER, requireActor, requireActorMatches } from "../../../src/server/api/actor";

const owner = `G${"A".repeat(55)}`;
const sender = `G${"B".repeat(55)}`;

describe("API actor guard", () => {
  it("requires a valid actor header", () => {
    expect(() => requireActor(new Request("https://stealth.test/api"))).toThrowError(
      expect.objectContaining({ status: 401 }),
    );
  });

  it("rejects an actor that does not own the resource", () => {
    const request = new Request("https://stealth.test/api", {
      headers: { [ACTOR_HEADER]: sender },
    });

    expect(() => requireActorMatches(request, owner)).toThrowError(
      expect.objectContaining({ status: 403 }),
    );
  });

  it("returns the matching owner", () => {
    const request = new Request("https://stealth.test/api", {
      headers: { [ACTOR_HEADER]: owner },
    });

    expect(requireActorMatches(request, owner)).toBe(owner);
  });
});
