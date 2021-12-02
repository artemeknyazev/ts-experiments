import { Entity, EntityId } from "../../../domain";
import { ProgramF } from "../../api";
import * as S from "fp-ts/State";

export interface TestState {
  readonly db: {
    entities: Map<EntityId, Entity>;
  };
}

export type StateInterpreter = <A>(
  program: ProgramF<A>
) => S.State<TestState, A>;
