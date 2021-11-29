import { next } from "./utils";
import { Pointed1 } from "fp-ts/Pointed";
import { Functor1, flap as flap_ } from "fp-ts/Functor";
import {
  Apply1,
  apFirst as apFirst_,
  apSecond as apSecond_,
} from "fp-ts/Apply";
import { Chain1, chainFirst as chainFirst_ } from "fp-ts/Chain";
import { identity, pipe } from "fp-ts/function";
import { Monad1 } from "fp-ts/Monad";
import { Applicative1 } from "fp-ts/Applicative";

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

export type Pr<A> =
  | {
      readonly _tag: TagPr;
      readonly _subtag: TagStart;
      readonly _thunk: CtorThunk<A>;
      readonly _prev: undefined;
    }
  | {
      readonly _tag: TagPr;
      readonly _subtag: TagNext;
      readonly _then: ThenThunk<any, A>;
      readonly _prev: Pr<any>;
    };

type UnwrapPr<A> =
  | {
      readonly _tag: TagUnwrapPr;
      readonly _subtag: TagStart;
      readonly _thunk: CtorThunk<A>;
      readonly _next: UnwrapPr<any> | undefined;
    }
  | {
      readonly _tag: TagUnwrapPr;
      readonly _subtag: TagNext;
      readonly _then: ThenThunk<any, A>;
      readonly _next: UnwrapPr<any> | undefined;
    };

const TagPr = "Pr";
const TagUnwrapPr = "UnwrapPr";
type TagPr = typeof TagPr;
type TagUnwrapPr = typeof TagUnwrapPr;
const TagStart = "Start";
const TagNext = "Next";
type TagStart = typeof TagStart;
type TagNext = typeof TagNext;

type AsyncThunk<A> = (resolve: (result: A) => any) => any;
type SyncThunk<A> = () => A;
type CtorThunk<A> = AsyncThunk<A> | SyncThunk<A>;
type ThenThunk<A, B> = (result: A) => Pr<B>;

// -----------------------------------------------------------------------------
// Non-pipeables
// -----------------------------------------------------------------------------

const _then = <A, B>(thunk: ThenThunk<A, B>, pr: Pr<A>): Pr<B> => ({
  _tag: TagPr,
  _subtag: TagNext,
  _then: thunk,
  _prev: pr,
});

const _unwrap = <A, B>(callback: (a: A) => B, pr: Pr<A>): void => {
  let curr: UnwrapPr<any> | undefined = transformChain(pr);

  const iter = next((a: any) => {
    if (curr) {
      switch (curr._subtag) {
        case TagStart:
          throw new Error("_unwrap: impossible state");
        case TagNext:
          const then = curr._then;
          curr = curr._next;
          // Each `then` call returns a `Pr`, need to unwrap it before using
          // in the current `Pr` chain
          _unwrap(iter, then(a));
          break;
      }
    } else {
      callback(a);
    }
  });

  switch (curr._subtag) {
    case TagStart: {
      const thunk = curr._thunk;
      curr = curr._next;
      if (thunk.length) {
        thunk(iter);
      } else {
        // @ts-ignore // can't distinguish between two function types
        const a = thunk();
        if (curr) {
          iter(a);
        } else {
          // short-circuit to not call `iter`
          callback(a);
        }
      }
      break;
    }
    case TagNext:
      throw new Error("_unwrap: impossible state");
  }
};

const _map: Functor1<URI>["map"] = (fa, f) =>
  pipe(
    fa,
    then((a) => of(f(a)))
  );

const _ap: Apply1<URI>["ap"] = (fab, fa) =>
  pipe(
    fab,
    then((ab) => _map(fa, ab))
  );

const _chain: Chain1<URI>["chain"] = (fa, f) => _then(f, fa);

// -----------------------------------------------------------------------------
// Constructors
// -----------------------------------------------------------------------------

export const wrap = <A>(thunk: CtorThunk<A>): Pr<A> => ({
  _tag: TagPr,
  _subtag: TagStart,
  _thunk: thunk,
  _prev: undefined,
});

export const then =
  <A, B>(thunk: ThenThunk<A, B>) =>
  (pr: Pr<A>): Pr<B> =>
    _then(thunk, pr);

// -----------------------------------------------------------------------------
// Pipeables
// -----------------------------------------------------------------------------

export const unwrap =
  <A, B>(callback: (a: A) => B) =>
  (pr: Pr<A>) =>
    _unwrap(callback, pr);

// -----------------------------------------------------------------------------
// Type class members
// -----------------------------------------------------------------------------

export const of: Pointed1<URI>["of"] = (a) => wrap(() => a);

export const map: <A, B>(f: (a: A) => B) => (fa: Pr<A>) => Pr<B> =
  (f) => (fa) =>
    _map(fa, f);

export const ap: <A>(fa: Pr<A>) => <B>(fab: Pr<(a: A) => B>) => Pr<B> =
  (fa) => (fab) =>
    _ap(fab, fa);

export const chain: <A, B>(f: (a: A) => Pr<B>) => (fa: Pr<A>) => Pr<B> =
  (f) => (fa) =>
    _chain(fa, f);

export const flatten: <A>(ffa: Pr<Pr<A>>) => Pr<A> = chain(identity);

// -----------------------------------------------------------------------------
// Instances
// -----------------------------------------------------------------------------

export const URI = TagPr;

export type URI = typeof URI;

declare module "fp-ts/lib/HKT" {
  interface URItoKind<A> {
    readonly [URI]: Pr<A>;
  }
}

export const Functor: Functor1<URI> = {
  URI,
  map: _map,
};

export const flap = flap_(Functor);

export const Pointed: Pointed1<URI> = {
  URI,
  of,
};

export const Apply: Apply1<URI> = {
  URI,
  map: _map,
  ap: _ap,
};

export const apFirst = apFirst_(Apply);

export const apSecond = apSecond_(Apply);

export const Applicative: Applicative1<URI> = {
  URI,
  map: _map,
  ap: _ap,
  of,
};

export const Chain: Chain1<URI> = {
  URI,
  map: _map,
  ap: _ap,
  chain: _chain,
};

export const Monad: Monad1<URI> = {
  URI,
  map: _map,
  ap: _ap,
  of,
  chain: _chain,
};

export const chainFirst = chainFirst_(Chain);

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

const transformItem = <A, B>(
  pr: Pr<A>,
  next: UnwrapPr<B> | undefined
): UnwrapPr<A> => {
  switch (pr._subtag) {
    case TagStart:
      return {
        _tag: TagUnwrapPr,
        _subtag: TagStart,
        _thunk: pr._thunk,
        _next: next,
      };
    case TagNext:
      return {
        _tag: TagUnwrapPr,
        _subtag: TagNext,
        _then: pr._then,
        _next: next,
      };
  }
};

const transformChain = <A>(pr: Pr<A>): UnwrapPr<any> => {
  let curr: Pr<any> = pr;
  let result = transformItem(curr, undefined);
  while (curr._prev) {
    curr = curr._prev;
    result = transformItem(curr, result);
  }
  return result;
};
