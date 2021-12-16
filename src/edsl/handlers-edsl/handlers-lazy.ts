import { Monad2 } from "fp-ts/Monad";

export interface StoreClient<A> {
  getValue: (key: string) => A;
  setValue: (key: string, value: A) => A;
}

export interface Transform {
  transform: (a: number) => number;
}

interface HandlerDependenciesBefore {
  transform: Transform;
}

interface HandlerDependenciesAfter<A> {
  client: StoreClient<A>;
}

export type Handler<E, A> = (deps: HandlerDependenciesAfter<E>) => A;

namespace GetValue {
  export type Type<A> = (key: string) => Handler<A, A>;

  export const handler =
    <A>(_: HandlerDependenciesBefore): Type<A> =>
    (key) =>
    ({ client }) =>
      client.getValue(key);
}

namespace SetValue {
  export type Type<A> = (key: string, value: A) => Handler<A, A>;

  export const handler =
    <A>(_: HandlerDependenciesBefore): Type<A> =>
    (key, value) =>
    ({ client }) =>
      client.setValue(key, value);
}

namespace TransformValue {
  export type Type<A> = (value: number) => Handler<A, number>;

  export const handler =
    <A>({ transform }: HandlerDependenciesBefore): Type<A> =>
    (a: number) =>
    () =>
      transform.transform(a);
}

export interface Handlers<A> {
  getValue: GetValue.Type<A>;
  setValue: SetValue.Type<A>;
  transformValue: TransformValue.Type<A>;
}

export const handlers = <A>(deps: HandlerDependenciesBefore): Handlers<A> => ({
  getValue: GetValue.handler<A>(deps),
  setValue: SetValue.handler<A>(deps),
  transformValue: TransformValue.handler<A>(deps),
});

const URI = "HandlerEdsl";

type URI = typeof URI;

declare module "fp-ts/HKT" {
  interface URItoKind2<E, A> {
    readonly [URI]: Handler<E, A>;
  }
}

export const of =
  <E, A>(a: A): Handler<E, A> =>
  (_deps) =>
    a;

const _map =
  <E, A, B>(fa: Handler<E, A>, f: (a: A) => B): Handler<E, B> =>
  (deps) => {
    const a = fa(deps);
    return f(a);
  };

const _ap =
  <E, A, B>(fab: Handler<E, (a: A) => B>, fa: Handler<E, A>): Handler<E, B> =>
  (deps) => {
    const ab = fab(deps);
    const a = fa(deps);
    return ab(a);
  };

const _chain =
  <E, A, B>(fa: Handler<E, A>, f: (a: A) => Handler<E, B>): Handler<E, B> =>
  (deps) => {
    const a = fa(deps);
    return f(a)(deps);
  };

export const map =
  <A, B>(f: (a: A) => B) =>
  <E>(fa: Handler<E, A>): Handler<E, B> =>
    _map(fa, f);

export const ap =
  <E, A, B>(fab: Handler<E, (a: A) => B>) =>
  (fa: Handler<E, A>): Handler<E, B> =>
    _ap(fab, fa);

export const chain =
  <E, A, B>(f: (a: A) => Handler<E, B>) =>
  (fa: Handler<E, A>): Handler<E, B> =>
    _chain(fa, f);

export const Monad: Monad2<URI> = {
  URI,
  map: _map,
  ap: _ap,
  of,
  chain: _chain,
};
