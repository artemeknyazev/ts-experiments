import * as S from "fp-ts/State";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";

import { TestState } from "../types";
import { CreateEntityValidationError, Entity } from "../../../../domain";
import { DbCreateEntity } from "../../../api";

export const dbCreateEntity =
  <A>(program: DbCreateEntity<A>): S.State<TestState, A> =>
  (state) => {
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
  };
