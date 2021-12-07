import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";

import {
  CreateEntityValidationError,
  Entity,
  EntityDoesNotExistError,
} from "../../../domain";
import {
  Db,
  DbCreateEntity,
  DbDeleteEntity,
  DbGetEntities,
  DbGetEntity,
  DbUpdateEntity,
} from "../../api/db";
import { URI } from "./index";

const dbGetEntities: DbGetEntities<URI> = () => (state) =>
  [E.right(Array.from(state.db.entities.values())), state];

const dbGetEntity: DbGetEntity<URI> = (id) => (state) =>
  [
    E.fromNullable(new EntityDoesNotExistError(id))(state.db.entities.get(id)),
    state,
  ];

const dbCreateEntity: DbCreateEntity<URI> = (request) => (state) => {
  if (!request.name || request.name.length < 3) {
    return [
      E.left(
        new CreateEntityValidationError(request, [
          "`name` must be a non-empty string with 3 or more characters",
        ])
      ),
      state,
    ];
  } else {
    const id = Date.now();
    const entity: Entity = {
      ...request,
      id,
      createdAt: new Date(),
      createdBy: "user",
      updatedAt: O.none,
      updatedBy: O.none,
    };
    state.db.entities.set(id, entity);
    return [E.right(entity), state];
  }
};

const dbUpdateEntity: DbUpdateEntity<URI> = (id, request) => (state) => {
  if (!state.db.entities.has(id)) {
    return [E.left(new EntityDoesNotExistError(id)), state];
  } else if (!request.name || request.name.length < 3) {
    return [
      E.left(
        new CreateEntityValidationError(request, [
          "`name` must be a non-empty string with 3 or more characters",
        ])
      ),
      state,
    ];
  } else {
    const prevEntity = state.db.entities.get(id)!;
    const entity: Entity = {
      ...prevEntity,
      ...request,
      updatedAt: O.some(new Date()),
      updatedBy: O.some("user"),
    };
    state.db.entities.set(id, entity);
    return [E.right(entity), state];
  }
};

const dbDeleteEntity: DbDeleteEntity<URI> = (id) => (state) => {
  if (state.db.entities.has(id)) {
    const entity = state.db.entities.get(id)!;
    state.db.entities.delete(id);
    return [E.right(entity), state];
  } else {
    return [E.left(new EntityDoesNotExistError(id)), state];
  }
};

export const getInstanceFor = (): Db<URI> => ({
  dbGetEntities,
  dbGetEntity,
  dbCreateEntity,
  dbUpdateEntity,
  dbDeleteEntity,
});
