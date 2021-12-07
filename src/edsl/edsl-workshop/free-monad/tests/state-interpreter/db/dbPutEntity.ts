import * as S from "fp-ts/State";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";

import { TestState } from "../types";
import {
  CreateEntityValidationError,
  Entity,
  EntityAlreadyExistsError,
} from "../../../../domain";
import { DbPutEntity } from "../../../api";

export const dbPutEntity =
  <A>(program: DbPutEntity<A>): S.State<TestState, A> =>
  (state) => {
    if (state.db.entities.has(program.id)) {
      return [
        program.next(E.left(new EntityAlreadyExistsError(program.id))),
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
    const entity: Entity = {
      ...program.request,
      id: program.id,
      createdAt: new Date(),
      createdBy: "user",
      updatedAt: O.none,
      updatedBy: O.none,
    };
    state.db.entities.set(program.id, entity);
    return [program.next(E.right(entity)), state];
  };
