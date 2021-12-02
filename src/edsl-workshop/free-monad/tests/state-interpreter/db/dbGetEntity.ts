import * as S from "fp-ts/State";
import * as E from "fp-ts/Either";

import { TestState } from "../types";
import { EntityDoesNotExistError } from "../../../../domain";
import { DbGetEntity } from "../../../api";

export const dbGetEntity =
  <A>(program: DbGetEntity<A>): S.State<TestState, A> =>
  (state) =>
    [
      program.next(
        E.fromNullable(new EntityDoesNotExistError(program.id))(
          state.db.entities.get(program.id)
        )
      ),
      state,
    ];
