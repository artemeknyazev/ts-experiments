import { Either } from "fp-ts/Either";
import { liftF } from "fp-ts-contrib/Free";
import { identity } from "fp-ts/function";

import { ProgramFURI } from "../";
import {
  CreateEntityErrors,
  CreateEntityRequest,
  Entity,
} from "../../../domain";

export const DbCreateEntityTag = "DbCreateEntity";

export class DbCreateEntity<A> {
  readonly tag: typeof DbCreateEntityTag = DbCreateEntityTag;
  readonly _A!: A;
  readonly _URI!: ProgramFURI;
  constructor(
    readonly request: CreateEntityRequest,
    readonly next: (result: Either<CreateEntityErrors, Entity>) => A
  ) {}
}

/**
 * Create entity in DB
 *
 * @param request
 */
export const dbCreateEntity = (request: CreateEntityRequest) =>
  liftF(new DbCreateEntity(request, identity));
