import {
  DbCreateEntityTag,
  DbGetEntitiesTag,
  DbGetEntityTag,
  DbPutEntityTag,
  DbUpdateEntityTag,
  DbDeleteEntityTag,
} from "../../api";
import { TestState, StateInterpreter } from "./types";
import {
  dbCreateEntity,
  dbDeleteEntity,
  dbGetEntities,
  dbGetEntity,
  dbPutEntity,
  dbUpdateEntity,
} from "./db";

export { TestState };

export const stateInterpreter: StateInterpreter = (program) => (state) => {
  switch (program.tag) {
    case DbGetEntitiesTag:
      return dbGetEntities(program)(state);
    case DbGetEntityTag:
      return dbGetEntity(program)(state);
    case DbCreateEntityTag:
      return dbCreateEntity(program)(state);
    case DbPutEntityTag:
      return dbPutEntity(program)(state);
    case DbUpdateEntityTag:
      return dbUpdateEntity(program)(state);
    case DbDeleteEntityTag:
      return dbDeleteEntity(program)(state);
  }
};
