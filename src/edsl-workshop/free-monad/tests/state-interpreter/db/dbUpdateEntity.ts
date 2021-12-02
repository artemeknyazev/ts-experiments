import * as S from "fp-ts/State";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";

import { TestState } from "../types";
import {
  CreateEntityValidationError,
  Entity,
  EntityDoesNotExistError,
} from "../../../../domain";
import { DbUpdateEntity } from "../../../api";

export const dbUpdateEntity =
  <A>(program: DbUpdateEntity<A>): S.State<TestState, A> =>
  (state) => {
    if (!state.db.entities.has(program.id)) {
      return [
        program.next(E.left(new EntityDoesNotExistError(program.id))),
        state,
      ];
    }
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
    }
    const prevEntity = state.db.entities.get(program.id)!;
    const entity: Entity = {
      ...prevEntity,
      ...program.request,
      updatedAt: O.some(new Date()),
      updatedBy: O.some("user"),
    };
    state.db.entities.set(program.id, entity);
    return [program.next(E.right(entity)), state];
  };
