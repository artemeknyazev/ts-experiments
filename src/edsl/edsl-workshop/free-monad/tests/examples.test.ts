import * as E from "fp-ts/Either";
import * as S from "fp-ts/lib/State";
import * as F from "fp-ts-contrib/lib/Free";

import { CreateEntityRequest, EntityId } from "../../domain";
import { createEntityIfNotExists } from "../examples";
import { stateInterpreter, TestState } from "./state-interpreter";

describe("createEntityIfNotExists", () => {
  it("with bad data on an empty db", () => {
    const stateBefore: TestState = { db: { entities: new Map() } };
    const folder = F.foldFree(S.Monad)(
      stateInterpreter,
      createEntityIfNotExists(1, { name: "" })
    );
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
    const folder = F.foldFree(S.Monad)(
      stateInterpreter,
      createEntityIfNotExists(id, request)
    );
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
