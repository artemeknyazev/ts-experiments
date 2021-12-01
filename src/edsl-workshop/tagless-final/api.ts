import { Kind, URIS } from "fp-ts/HKT";
import * as E from "fp-ts/Either";
import {
  CreateEntityErrors,
  CreateEntityRequest,
  DeleteEntityErrors,
  Entity,
  EntityId,
  GetEntitiesError,
  GetEntityErrors,
  UpdateEntityErrors,
  UpdateEntityRequest,
} from "../domain";
import { Monad1 } from "fp-ts/Monad";

// -----------------------------------------------------------------------------
// API methods types
// -----------------------------------------------------------------------------

export interface Db<F extends URIS> {
  dbGetEntities: () => Kind<F, E.Either<GetEntitiesError, Entity[]>>;
  dbGetEntity: (id: EntityId) => Kind<F, E.Either<GetEntityErrors, Entity>>;
  dbCreateEntity: (
    request: CreateEntityRequest
  ) => Kind<F, E.Either<CreateEntityErrors, Entity>>;
  dbUpdateEntity: (
    id: EntityId,
    request: UpdateEntityRequest
  ) => Kind<F, E.Either<UpdateEntityErrors, Entity>>;
  dbDeleteEntity: (
    id: EntityId
  ) => Kind<F, E.Either<DeleteEntityErrors, Entity>>;
}

type Methods<F extends URIS> = Db<F>;

export type Program<F extends URIS> = Methods<F> & Monad1<F>;

// -----------------------------------------------------------------------------
// API method creators
// -----------------------------------------------------------------------------

const dbGetEntities =
  <F extends URIS>(P: Program<F>): Program<F>["dbGetEntities"] =>
  () =>
    P.dbGetEntities();

const dbGetEntity =
  <F extends URIS>(P: Program<F>): Program<F>["dbGetEntity"] =>
  (id: EntityId) =>
    P.dbGetEntity(id);

const dbCreateEntity =
  <F extends URIS>(P: Program<F>): Program<F>["dbCreateEntity"] =>
  (request: CreateEntityRequest) =>
    P.dbCreateEntity(request);

const dbUpdateEntity =
  <F extends URIS>(P: Program<F>): Program<F>["dbUpdateEntity"] =>
  (id: EntityId, request: UpdateEntityRequest) =>
    P.dbUpdateEntity(id, request);

const dbDeleteEntity =
  <F extends URIS>(P: Program<F>): Program<F>["dbDeleteEntity"] =>
  (id: EntityId) =>
    P.dbDeleteEntity(id);

// -----------------------------------------------------------------------------
// API instance creator
// -----------------------------------------------------------------------------

export const getInstanceFor = <F extends URIS>(P: Program<F>): Methods<F> => ({
  dbGetEntities: dbGetEntities(P),
  dbGetEntity: dbGetEntity(P),
  dbCreateEntity: dbCreateEntity(P),
  dbUpdateEntity: dbUpdateEntity(P),
  dbDeleteEntity: dbDeleteEntity(P),
});
