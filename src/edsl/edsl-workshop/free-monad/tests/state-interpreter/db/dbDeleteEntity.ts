import * as S from "fp-ts/State";
import * as E from "fp-ts/Either";

import { TestState } from "../types";
import { EntityDoesNotExistError } from "../../../../domain";
import { DbDeleteEntity } from "../../../api";

export const dbDeleteEntity =
  <A>(program: DbDeleteEntity<A>): S.State<TestState, A> =>
  (state) => {
    if (!state.db.entities.has(program.id)) {
      return [
        program.next(E.left(new EntityDoesNotExistError(program.id))),
        state,
      ];
    }
    const entity = state.db.entities.get(program.id)!;
    state.db.entities.delete(program.id);
    return [program.next(E.right(entity)), state];
  };
