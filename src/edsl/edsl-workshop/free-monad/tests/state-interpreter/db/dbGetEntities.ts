import * as S from "fp-ts/State";
import * as E from "fp-ts/Either";

import { TestState } from "../types";
import { DbGetEntities } from "../../../api";

export const dbGetEntities =
  <A>(program: DbGetEntities<A>): S.State<TestState, A> =>
  (state) =>
    [program.next(E.right(Array.from(state.db.entities.values()))), state];
