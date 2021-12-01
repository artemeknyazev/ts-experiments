import { liftF } from "fp-ts-contrib/Free";
import { identity } from "fp-ts/function";
import * as E from "fp-ts/Either";
import { Either } from "fp-ts/Either";

import {
  Entity,
  CreateEntityRequest,
  UpdateEntityRequest,
  GetEntitiesError,
  GetEntityErrors,
  CreateEntityErrors,
  UpdateEntityErrors,
  DeleteEntityErrors,
  EntityId,
} from "../domain";

// -----------------------------------------------------------------------------
// API methods descriptors
// -----------------------------------------------------------------------------

type DbGetEntitiesTag = "DbGetEntities";
export const DbGetEntitiesTag: DbGetEntitiesTag = "DbGetEntities";

class DbGetEntities<A> {
  readonly tag: DbGetEntitiesTag = DbGetEntitiesTag;
  readonly _A!: A;
  readonly _URI!: ProgramFURI;
  constructor(
    readonly next: (result: E.Either<GetEntitiesError, Entity[]>) => A
  ) {}
}

type DbGetEntityTag = "DbGetEntity";
export const DbGetEntityTag: DbGetEntityTag = "DbGetEntity";

class DbGetEntity<A> {
  readonly tag: DbGetEntityTag = DbGetEntityTag;
  readonly _A!: A;
  readonly _URI!: ProgramFURI;
  constructor(
    readonly id: EntityId,
    readonly next: (result: Either<GetEntityErrors, Entity>) => A
  ) {}
}

type DbCreateEntityTag = "DbCreateEntity";
export const DbCreateEntityTag: DbCreateEntityTag = "DbCreateEntity";

class DbCreateEntity<A> {
  readonly tag: DbCreateEntityTag = DbCreateEntityTag;
  readonly _A!: A;
  readonly _URI!: ProgramFURI;
  constructor(
    readonly request: CreateEntityRequest,
    readonly next: (result: Either<CreateEntityErrors, Entity>) => A
  ) {}
}

type DbUpdateEntityTag = "DbUpdateEntity";
export const DbUpdateEntityTag: DbUpdateEntityTag = "DbUpdateEntity";

class DbUpdateEntity<A> {
  readonly tag: DbUpdateEntityTag = DbUpdateEntityTag;
  readonly _A!: A;
  readonly _URI!: ProgramFURI;
  constructor(
    readonly id: EntityId,
    readonly request: UpdateEntityRequest,
    readonly next: (result: Either<UpdateEntityErrors, Entity>) => A
  ) {}
}

type DbDeleteEntityTag = "DbDeleteEntity";
export const DbDeleteEntityTag: DbDeleteEntityTag = "DbDeleteEntity";

class DbDeleteEntity<A> {
  readonly tag: DbDeleteEntityTag = DbDeleteEntityTag;
  readonly _A!: A;
  readonly _URI!: ProgramFURI;
  constructor(
    readonly id: EntityId,
    readonly next: (result: Either<DeleteEntityErrors, Entity>) => A
  ) {}
}

type DatabaseF<A> =
  | DbGetEntities<A>
  | DbGetEntity<A>
  | DbCreateEntity<A>
  | DbUpdateEntity<A>
  | DbDeleteEntity<A>;

// -----------------------------------------------------------------------------
// API type
// -----------------------------------------------------------------------------

export type ProgramFURI = "ProgramF";
export const ProgramFURI: ProgramFURI = "ProgramF";

export type ProgramF<A> = DatabaseF<A>;

declare module "fp-ts/lib/HKT" {
  interface URItoKind<A> {
    [ProgramFURI]: ProgramF<A>;
  }
}

// -----------------------------------------------------------------------------
// API methods
// -----------------------------------------------------------------------------

/**
 * Get a list of entities from DB
 */
export const dbGetEntities = () => liftF(new DbGetEntities(identity));

/**
 * Get an entity from DB
 *
 * @param id
 */
export const dbGetEntity = (id: EntityId) =>
  liftF(new DbGetEntity(id, identity));

/**
 * Create entity in DB
 *
 * @param request
 */
export const dbCreateEntity = (request: CreateEntityRequest) =>
  liftF(new DbCreateEntity(request, identity));

/**
 * Update an entity in DB
 *
 * @param id
 * @param request
 */
export const dbUpdateEntity = (id: EntityId, request: UpdateEntityRequest) =>
  liftF(new DbUpdateEntity(id, request, identity));

/**
 * Delete an entity in DB
 *
 * @param id
 */
export const dbDeleteEntity = (id: EntityId) =>
  liftF(new DbDeleteEntity(id, identity));
