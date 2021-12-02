import { Either } from "fp-ts/Either";
import { liftF } from "fp-ts-contrib/Free";
import { identity } from "fp-ts/function";

import { ProgramFURI } from "../";
import {
  CreateEntityRequest,
  Entity,
  EntityId,
  PutEntityErrors,
  PutEntityRequest,
} from "../../../domain";

export const DbPutEntityTag = "DbPutEntity";

export class DbPutEntity<A> {
  readonly tag: typeof DbPutEntityTag = DbPutEntityTag;
  readonly _A!: A;
  readonly _URI!: ProgramFURI;
  constructor(
    readonly id: EntityId,
    readonly request: CreateEntityRequest,
    readonly next: (result: Either<PutEntityErrors, Entity>) => A
  ) {}
}

/**
 * Put entity in DB
 *
 * @param id
 * @param request
 */
export const dbPutEntity = (id: EntityId, request: PutEntityRequest) =>
  liftF(new DbPutEntity(id, request, identity));
