import * as F from "fp-ts-contrib/Free";
import { Free } from "fp-ts-contrib/Free";
import { Do } from "fp-ts-contrib/Do";
import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";
import { Either } from "fp-ts/Either";

import {
  PutEntityErrors,
  CreateEntityRequest,
  Entity,
  EntityId,
} from "../domain";
import * as Api from "./api";

export const createEntityIfNotExists = (
  id: EntityId,
  request: CreateEntityRequest
): Free<Api.ProgramFURI, Either<PutEntityErrors, Entity>> =>
  Do(F.free)
    .bind("existingEntityResult", Api.dbGetEntity(id))
    .bindL("result", ({ existingEntityResult }) =>
      pipe(
        existingEntityResult,
        E.fold(
          () => Api.dbPutEntity(id, request),
          // Point-free style `flow(E.right, F.free.of)` doesn't typecheck!
          (entity) => F.free.of(E.right(entity))
        )
      )
    )
    .return(({ result }) => result);
