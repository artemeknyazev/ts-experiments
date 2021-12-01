import { URIS } from "fp-ts/HKT";
import { Do } from "fp-ts-contrib/Do";
import { pipe } from "fp-ts/function";
import * as E from "fp-ts/Either";

import { CreateEntityRequest, EntityId } from "../domain";
import { Program, getInstanceFor } from "./api";

export const createEntityIfNotExists =
  <F extends URIS>(P: Program<F>) =>
  (id: EntityId, request: CreateEntityRequest) => {
    const Api = getInstanceFor(P);
    return Do(P)
      .bind("existingEntityResult", Api.dbGetEntity(id))
      .bindL("result", ({ existingEntityResult }) =>
        pipe(
          existingEntityResult,
          E.fold(
            () => Api.dbCreateEntity(request),
            (entity) => P.of(E.right(entity))
          )
        )
      )
      .return(({ result }) => result);
  };
