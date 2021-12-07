import { Option } from "fp-ts/Option";

// -----------------------------------------------------------------------------
// Entity description
// -----------------------------------------------------------------------------

export type EntityId = number;

export interface CommonF {
  readonly createdAt: Date;
  readonly createdBy: string;
  readonly updatedAt: Option<Date>;
  readonly updatedBy: Option<string>;
}

interface EntityF {
  readonly id: EntityId;
  readonly name: string;
}

export interface Entity extends EntityF, CommonF {}

// -----------------------------------------------------------------------------
// Entity requests
// -----------------------------------------------------------------------------

export interface CreateEntityRequest {
  readonly name: string;
}

export type PutEntityRequest = CreateEntityRequest;

export interface UpdateEntityRequest {
  readonly name: string;
}

// -----------------------------------------------------------------------------
// Entity requests errors
// -----------------------------------------------------------------------------

export class EntityDoesNotExistError extends Error {
  constructor(id: EntityId) {
    super(`Entity ${id} doesn't exist`);
  }
}

export class EntityAlreadyExistsError extends Error {
  constructor(id: EntityId) {
    super(`Entity ${id} already exists`);
  }
}

export class CreateEntityValidationError extends Error {
  constructor(
    public readonly request: CreateEntityRequest,
    public readonly errors: string[]
  ) {
    super(`Invalid create entity request`);
  }
}

export class UpdateEntityValidationError extends Error {
  constructor(
    public readonly id: EntityId,
    public readonly request: UpdateEntityRequest,
    public readonly errors: string
  ) {
    super(`Invalid update entity request`);
  }
}

export type GetEntitiesError = never;
export type GetEntityErrors = EntityDoesNotExistError;
export type CreateEntityErrors = CreateEntityValidationError;
export type PutEntityErrors = EntityAlreadyExistsError | CreateEntityErrors;
export type UpdateEntityErrors =
  | UpdateEntityValidationError
  | EntityDoesNotExistError;
export type DeleteEntityErrors = EntityDoesNotExistError;
