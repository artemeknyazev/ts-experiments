import * as S from "fp-ts/State";
import { State } from "fp-ts/State";

import { Program } from "../../api";
import { Entity, EntityId } from "../../../domain";
import { getInstanceFor as dbGetInstanceFor } from "./db";

export interface TestState {
  db: {
    entities: Map<EntityId, Entity>;
  };
}

export const URI = "InterpreterState";
export type URI = typeof URI;

type InterpreterState<A> = State<TestState, A>;

declare module "fp-ts/lib/HKT" {
  interface URItoKind<A> {
    [URI]: InterpreterState<A>;
  }
}

export const stateInterpreter: Program<URI> = {
  ...S.Monad,
  URI: URI,
  ...dbGetInstanceFor(),
};
