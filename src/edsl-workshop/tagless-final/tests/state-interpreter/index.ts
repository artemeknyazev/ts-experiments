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

export const InterpreterStateURI = "InterpreterState";
export type InterpreterStateURI = typeof InterpreterStateURI;

type InterpreterState<A> = State<TestState, A>;

declare module "fp-ts/lib/HKT" {
  interface URItoKind<A> {
    [InterpreterStateURI]: InterpreterState<A>;
  }
}

export const stateInterpreter: Program<InterpreterStateURI> = {
  ...S.Monad,
  URI: InterpreterStateURI,
  ...dbGetInstanceFor(),
};
