import * as E from "fp-ts/Either";
import * as RTE from "fp-ts/ReaderTaskEither";
import ReaderTaskEither = RTE.ReaderTaskEither;
import * as T from "fp-ts/Task";
import { pipe } from "fp-ts/function";
import { Do } from "fp-ts-contrib/Do";
import { TaskEither } from "fp-ts/TaskEither";

// External library

type Connect = (map: Map<string, any>) => Promise<DbClient>;

interface DbClient {
  query<R>(query: string): Promise<R[]>;
  query<As extends any[], R>(query: string, values?: As): Promise<R[]>;

  release(): void;
}

class DbClient implements DbClient {
  private _released: boolean = false;

  // @ts-ignore
  constructor(private readonly _map: Map<string, any>) {}

  query<As extends any[] = never, R = never>(
    query: string,
    _values?: As
  ): Promise<R[]> {
    if (this._released)
      return Promise.reject(new Error("Client is already released"));
    switch (query) {
      // todo: implement basic functions
      default:
        return Promise.reject(`Unknown query ${query}`);
    }
  }
}

export const connect: Connect = (map) => Promise.resolve(new DbClient(map));

// Domain

export interface User {
  id: number;
}

export interface Entity {
  id: number;
  value: string;
  createdAt: string;
  createdBy: User["id"];
  updatedAt: string | null;
  updatedBy: User["id"] | null;
}

// DB Handlers

interface DbDeps {
  client: DbClient;
}

const dbBeginTransaction =
  (): ReaderTaskEither<DbDeps, Error, void> =>
  ({ client }) =>
  () =>
    client.query("BEGIN").then(
      () => E.right(undefined),
      (e) => E.left(new Error(e.message))
    );

const dbCommitTransaction =
  (): ReaderTaskEither<DbDeps, Error, void> =>
  ({ client }) =>
  () =>
    client.query("COMMIT").then(
      () => E.right(undefined),
      (e) => E.left(new Error(e.message))
    );

const dbRollbackTransaction =
  (): ReaderTaskEither<DbDeps, Error, void> =>
  ({ client }) =>
  () =>
    client.query("ROLLBACK").then(
      () => E.right(undefined),
      (e) => E.left(new Error(e.message))
    );

const dbInsertEntity =
  (data: Entity): ReaderTaskEither<DbDeps, Error, Entity> =>
  ({ client }) =>
  () =>
    client.query("INSERT", [data.id, data.value]).then(
      (rs) => (rs.length && rs[0] ? E.right(rs[0]) : E.left(new Error())),
      (e) => E.left(new Error(e.message))
    );

const dbUpdateEntity =
  (
    id: Entity["id"],
    data: Omit<Entity, "id">
  ): ReaderTaskEither<DbDeps, Error, Entity> =>
  ({ client }) =>
  () =>
    client.query("UPDATE", [id, data]).then(
      (rs) => (rs.length && rs[0] ? E.right(rs[0]) : E.left(new Error())),
      (e) => E.left(new Error(e.message))
    );

const dbDeleteEntity =
  (id: Entity["id"]): ReaderTaskEither<DbDeps, Error, void> =>
  ({ client }) =>
  () =>
    client.query("DELETE", [id]).then(
      () => E.right(undefined),
      (e) => E.left(new Error(e.message))
    );

const dbSelectEntity =
  (id: Entity["id"]): ReaderTaskEither<DbDeps, Error, Entity> =>
  ({ client }) =>
  () =>
    client.query("SELECT", [id]).then(
      (rs) =>
        rs.length && rs[0] ? E.right(rs[0]) : E.left(new Error("Not found")),
      (e) => E.left(new Error(e.message))
    );

const dbSelectEntities =
  (): ReaderTaskEither<DbDeps, Error, Entity[]> =>
  ({ client }) =>
  () =>
    client.query("SELECT").then(
      (rs) => E.right(rs),
      (e) => E.left(new Error(e.message))
    );

export const dbHandlers = () => ({
  dbBeginTransaction,
  dbCommitTransaction,
  dbRollbackTransaction,
  dbSelectEntities,
  dbSelectEntity,
  dbInsertEntity,
  dbUpdateEntity,
  dbDeleteEntity,
});

export type DbHandlers = ReturnType<typeof dbHandlers>;

// App Handlers

export interface AppDeps extends DbDeps {
  user: User;
  db: DbHandlers;
}

const GetEntities = (): ReaderTaskEither<AppDeps, Error, Entity[]> => (deps) =>
  deps.db.dbSelectEntities()(deps);

const GetEntity =
  (id: Entity["id"]): ReaderTaskEither<AppDeps, Error, Entity> =>
  (deps) =>
    deps.db.dbSelectEntity(id)(deps);

interface AddEntityRequest {
  id: Entity["id"];
  value: Entity["value"];
}

const AddEntity =
  (data: AddEntityRequest): ReaderTaskEither<AppDeps, Error, Entity> =>
  (deps) =>
    deps.db.dbInsertEntity({
      ...data,
      createdAt: String(new Date()),
      createdBy: deps.user.id,
      updatedAt: null,
      updatedBy: null,
    })(deps);

interface UpdateEntityRequest {
  value?: Entity["value"];
}

const UpdateEntity =
  (
    id: Entity["id"],
    data: UpdateEntityRequest
  ): ReaderTaskEither<AppDeps, Error, Entity> =>
  (deps) =>
    Do(T.Monad)
      .bind("entity", deps.db.dbSelectEntity(id)(deps))
      .bindL("result", ({ entity }) =>
        pipe(
          entity,
          E.fold<Error, Entity, TaskEither<Error, Entity>>(
            (e) => T.of(E.left(e)),
            (entity) => deps.db.dbUpdateEntity(id, { ...entity, ...data })(deps)
          )
        )
      )
      .return(({ result }) => result);

const DeleteEntity =
  (id: Entity["id"]): ReaderTaskEither<AppDeps, Error, void> =>
  (deps) =>
    deps.db.dbDeleteEntity(id)(deps);

export const handlers = () => ({
  GetEntities,
  GetEntity,
  AddEntity,
  UpdateEntity,
  DeleteEntity,
});
