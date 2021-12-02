import { Either } from "fp-ts/Either";
import { liftF } from "fp-ts-contrib/Free";
import { identity } from "fp-ts/function";

import { ProgramFURI } from "../";
import { DeleteEntityErrors, Entity, EntityId } from "../../../domain";

export const DbDeleteEntityTag = "DbDeleteEntity";
export class DbDeleteEntity<A> {
  readonly tag: typeof DbDeleteEntityTag = DbDeleteEntityTag;
  readonly _A!: A;
  readonly _URI!: ProgramFURI;
  constructor(
    readonly id: EntityId,
    readonly next: (result: Either<DeleteEntityErrors, Entity>) => A
  ) {}
}

/**
 * Delete an entity in DB
 *
 * @param id
 */
export const dbDeleteEntity = (id: EntityId) =>
  liftF(new DbDeleteEntity(id, identity));
