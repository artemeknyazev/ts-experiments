import * as E from "fp-ts/Either";

import { EntityId, CreateEntityRequest } from "../../domain";
import { createEntityIfNotExists } from "../examples";
import { stateInterpreter, TestState } from "./state-interpreter";

describe("createEntityIfNotExists", () => {
  it("with bad data on an empty db", () => {
    const stateBefore: TestState = { db: { entities: new Map() } };
    const folder = createEntityIfNotExists(stateInterpreter)(1, { name: "" });
    const [result, stateAfter] = folder(stateBefore);

    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.message).toBe("Invalid create entity request");
    }
    expect(stateAfter.db.entities.size).toBe(0);
  });

  it("with good data on an empty db", () => {
    const stateBefore: TestState = { db: { entities: new Map() } };
    const id: EntityId = Date.now();
    const request: CreateEntityRequest = { name: "new entity" };
    const folder = createEntityIfNotExists(stateInterpreter)(id, request);
    const [result, stateAfter] = folder(stateBefore);

    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right).toMatchObject(request);
      expect(stateAfter.db.entities.get(result.right.id)).toMatchObject(
        request
      );
      expect(stateAfter.db.entities.size).toBe(1);
    }
  });
});
