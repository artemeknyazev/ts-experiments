import * as E from "fp-ts/Either";
import { liftF } from "fp-ts-contrib/Free";
import { identity } from "fp-ts/function";

import { ProgramFURI } from "../";
import { Entity, GetEntitiesError } from "../../../domain";

export const DbGetEntitiesTag = "DbGetEntities";

export class DbGetEntities<A> {
  readonly tag: typeof DbGetEntitiesTag = DbGetEntitiesTag;
  readonly _A!: A;
  readonly _URI!: ProgramFURI;
  constructor(
    readonly next: (result: E.Either<GetEntitiesError, Entity[]>) => A
  ) {}
}

/**
 * Get a list of entities from DB
 */
export const dbGetEntities = () => liftF(new DbGetEntities(identity));
