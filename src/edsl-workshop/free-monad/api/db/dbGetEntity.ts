import { Either } from "fp-ts/Either";
import { liftF } from "fp-ts-contrib/Free";
import { identity } from "fp-ts/function";

import { ProgramFURI } from "../";
import { Entity, EntityId, GetEntityErrors } from "../../../domain";

export const DbGetEntityTag = "DbGetEntity";

export class DbGetEntity<A> {
  readonly tag: typeof DbGetEntityTag = DbGetEntityTag;
  readonly _A!: A;
  readonly _URI!: ProgramFURI;
  constructor(
    readonly id: EntityId,
    readonly next: (result: Either<GetEntityErrors, Entity>) => A
  ) {}
}

/**
 * Get an entity from DB
 *
 * @param id
 */
export const dbGetEntity = (id: EntityId) =>
  liftF(new DbGetEntity(id, identity));
