import {
  CreateEntityRequest,
  CreateEntityValidationError,
  Entity,
  EntityDoesNotExistError,
  EntityId,
} from "../domain";
import { ProgramF } from "./api";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import * as S from "fp-ts/lib/State";
import * as F from "fp-ts-contrib/lib/Free";
import { createEntityIfNotExists } from "./examples";

interface TestState {
  readonly db: {
    entities: Map<EntityId, Entity>;
  };
}

type Interpreter = <A>(program: ProgramF<A>) => S.State<TestState, A>;

const stateInterpreter: Interpreter = (program) => (state) => {
  switch (program.tag) {
    case "DbGetEntities":
      return [
        program.next(E.right(Array.from(state.db.entities.values()))),
        state,
      ];
    case "DbGetEntity":
      return [
        program.next(
          E.fromNullable(new EntityDoesNotExistError(program.id))(
            state.db.entities.get(program.id)
          )
        ),
        state,
      ];
    case "DbCreateEntity":
      if (!program.request.name || program.request.name.length < 3) {
        return [
          program.next(
            E.left(
              new CreateEntityValidationError(program.request, [
                "`name` must be a non-empty string with 3 or more characters",
              ])
            )
          ),
          state,
        ];
      } else {
        const id = Date.now();
        const entity: Entity = {
          ...program.request,
          id,
          createdAt: new Date(),
          createdBy: "user",
          updatedAt: O.none,
          updatedBy: O.none,
        };
        state.db.entities.set(id, entity);
        return [program.next(E.right(entity)), state];
      }
    case "DbUpdateEntity":
      if (!state.db.entities.has(program.id)) {
        return [
          program.next(E.left(new EntityDoesNotExistError(program.id))),
          state,
        ];
      } else if (!program.request.name || program.request.name.length < 3) {
        return [
          program.next(
            E.left(
              new CreateEntityValidationError(program.request, [
                "`name` must be a non-empty string with 3 or more characters",
              ])
            )
          ),
          state,
        ];
      } else {
        const prevEntity = state.db.entities.get(program.id)!;
        const entity: Entity = {
          ...prevEntity,
          ...program.request,
          updatedAt: O.some(new Date()),
          updatedBy: O.some("user"),
        };
        state.db.entities.set(program.id, entity);
        return [program.next(E.right(entity)), state];
      }
    case "DbDeleteEntity":
      if (state.db.entities.has(program.id)) {
        const entity = state.db.entities.get(program.id)!;
        state.db.entities.delete(program.id);
        return [program.next(E.right(entity)), state];
      } else {
        return [
          program.next(E.left(new EntityDoesNotExistError(program.id))),
          state,
        ];
      }
  }
};
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
