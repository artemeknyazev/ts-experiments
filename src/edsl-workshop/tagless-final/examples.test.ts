import * as S from "fp-ts/State";
import { State } from "fp-ts/State";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";

import { Program } from "./api";
import {
  EntityId,
  Entity,
  CreateEntityRequest,
  CreateEntityValidationError,
  EntityDoesNotExistError,
} from "../domain";
import { createEntityIfNotExists } from "./examples";

interface TestState {
  db: {
    entities: Map<EntityId, Entity>;
  };
}

const InterpreterStateURI = "InterpreterState";
type InterpreterStateURI = typeof InterpreterStateURI;

type InterpreterState<A> = State<TestState, A>;

declare module "fp-ts/lib/HKT" {
  interface URItoKind<A> {
    [InterpreterStateURI]: InterpreterState<A>;
  }
}

const stateInterpreter: Program<InterpreterStateURI> = {
  ...S.Monad,
  URI: InterpreterStateURI,
  dbGetEntities: () => (state) =>
    [E.right(Array.from(state.db.entities.values())), state],
  dbGetEntity: (id) => (state) =>
    [
      E.fromNullable(new EntityDoesNotExistError(id))(
        state.db.entities.get(id)
      ),
      state,
    ],
  dbCreateEntity: (request) => (state) => {
    if (!request.name || request.name.length < 3) {
      return [
        E.left(
          new CreateEntityValidationError(request, [
            "`name` must be a non-empty string with 3 or more characters",
          ])
        ),
        state,
      ];
    } else {
      const id = Date.now();
      const entity: Entity = {
        ...request,
        id,
        createdAt: new Date(),
        createdBy: "user",
        updatedAt: O.none,
        updatedBy: O.none,
      };
      state.db.entities.set(id, entity);
      return [E.right(entity), state];
    }
  },
  dbUpdateEntity: (id, request) => (state) => {
    if (!state.db.entities.has(id)) {
      return [E.left(new EntityDoesNotExistError(id)), state];
    } else if (!request.name || request.name.length < 3) {
      return [
        E.left(
          new CreateEntityValidationError(request, [
            "`name` must be a non-empty string with 3 or more characters",
          ])
        ),
        state,
      ];
    } else {
      const prevEntity = state.db.entities.get(id)!;
      const entity: Entity = {
        ...prevEntity,
        ...request,
        updatedAt: O.some(new Date()),
        updatedBy: O.some("user"),
      };
      state.db.entities.set(id, entity);
      return [E.right(entity), state];
    }
  },
  dbDeleteEntity: (id) => (state) => {
    if (state.db.entities.has(id)) {
      const entity = state.db.entities.get(id)!;
      state.db.entities.delete(id);
      return [E.right(entity), state];
    } else {
      return [E.left(new EntityDoesNotExistError(id)), state];
    }
  },
};

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
