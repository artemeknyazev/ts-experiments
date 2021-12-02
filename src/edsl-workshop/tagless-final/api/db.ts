import { Kind, URIS } from "fp-ts/HKT";
import * as E from "fp-ts/Either";

import {
  Entity,
  EntityId,
  GetEntitiesError,
  GetEntityErrors,
  CreateEntityErrors,
  CreateEntityRequest,
  UpdateEntityErrors,
  UpdateEntityRequest,
  DeleteEntityErrors,
} from "../../domain";
import { Program } from "./";

export type DbGetEntities<F extends URIS> = () => Kind<
  F,
  E.Either<GetEntitiesError, Entity[]>
>;

const dbGetEntities =
  <F extends URIS>(P: Program<F>): DbGetEntities<F> =>
  () =>
    P.dbGetEntities();

export type DbGetEntity<F extends URIS> = (
  id: EntityId
) => Kind<F, E.Either<GetEntityErrors, Entity>>;

const dbGetEntity =
  <F extends URIS>(P: Program<F>): DbGetEntity<F> =>
  (id: EntityId) =>
    P.dbGetEntity(id);

export type DbCreateEntity<F extends URIS> = (
  request: CreateEntityRequest
) => Kind<F, E.Either<CreateEntityErrors, Entity>>;

const dbCreateEntity =
  <F extends URIS>(P: Program<F>): DbCreateEntity<F> =>
  (request: CreateEntityRequest) =>
    P.dbCreateEntity(request);

export type DbUpdateEntity<F extends URIS> = (
  id: EntityId,
  request: UpdateEntityRequest
) => Kind<F, E.Either<UpdateEntityErrors, Entity>>;

const dbUpdateEntity =
  <F extends URIS>(P: Program<F>): DbUpdateEntity<F> =>
  (id: EntityId, request: UpdateEntityRequest) =>
    P.dbUpdateEntity(id, request);

export type DbDeleteEntity<F extends URIS> = (
  id: EntityId
) => Kind<F, E.Either<DeleteEntityErrors, Entity>>;

const dbDeleteEntity =
  <F extends URIS>(P: Program<F>): DbDeleteEntity<F> =>
  (id: EntityId) =>
    P.dbDeleteEntity(id);

export interface Db<F extends URIS> {
  dbGetEntities: DbGetEntities<F>;
  dbGetEntity: DbGetEntity<F>;
  dbCreateEntity: DbCreateEntity<F>;
  dbUpdateEntity: DbUpdateEntity<F>;
  dbDeleteEntity: DbDeleteEntity<F>;
}

export const getInstanceFor = <F extends URIS>(P: Program<F>): Db<F> => ({
  dbGetEntities: dbGetEntities(P),
  dbGetEntity: dbGetEntity(P),
  dbCreateEntity: dbCreateEntity(P),
  dbUpdateEntity: dbUpdateEntity(P),
  dbDeleteEntity: dbDeleteEntity(P),
});
