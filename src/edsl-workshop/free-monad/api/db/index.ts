import { DbGetEntities } from "./dbGetEntities";
import { DbGetEntity } from "./dbGetEntity";
import { DbCreateEntity } from "./dbCreateEntity";
import { DbPutEntity } from "./dbPutEntity";
import { DbUpdateEntity } from "./dbUpdateEntity";
import { DbDeleteEntity } from "./dbDeleteEntity";

export * from "./dbGetEntities";
export * from "./dbGetEntity";
export * from "./dbCreateEntity";
export * from "./dbPutEntity";
export * from "./dbUpdateEntity";
export * from "./dbDeleteEntity";

export type DatabaseF<A> =
  | DbGetEntities<A>
  | DbGetEntity<A>
  | DbCreateEntity<A>
  | DbPutEntity<A>
  | DbUpdateEntity<A>
  | DbDeleteEntity<A>;
