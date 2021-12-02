import { Either } from "fp-ts/Either";
import { liftF } from "fp-ts-contrib/Free";
import { identity } from "fp-ts/function";

import { ProgramFURI } from "../";
import {
  Entity,
  EntityId,
  UpdateEntityErrors,
  UpdateEntityRequest,
} from "../../../domain";

export const DbUpdateEntityTag = "DbUpdateEntity";

export class DbUpdateEntity<A> {
  readonly tag: typeof DbUpdateEntityTag = DbUpdateEntityTag;
  readonly _A!: A;
  readonly _URI!: ProgramFURI;
  constructor(
    readonly id: EntityId,
    readonly request: UpdateEntityRequest,
    readonly next: (result: Either<UpdateEntityErrors, Entity>) => A
  ) {}
}

/**
 * Update an entity in DB
 *
 * @param id
 * @param request
 */
export const dbUpdateEntity = (id: EntityId, request: UpdateEntityRequest) =>
  liftF(new DbUpdateEntity(id, request, identity));
