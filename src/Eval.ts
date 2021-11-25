import { Functor1 } from "fp-ts/lib/Functor";
import { Pointed1 } from "fp-ts/lib/Pointed";
import { Apply1 } from "fp-ts/lib/Apply";
import { Applicative1 } from "fp-ts/lib/Applicative";
import { Chain1, chainFirst as chainFirst_ } from "fp-ts/lib/Chain";
import { Monad1 } from "fp-ts/lib/Monad";
import { MonadIO1 } from "fp-ts/lib/MonadIO";
import { FromIO1 } from "fp-ts/lib/FromIO";
import { absurd, identity } from "fp-ts/lib/function";

export enum EvalStrategy {
  Now = "now",
  Later = "later",
  Always = "always",
}

export interface EvalOptions {
  /**
   * Evaluation strategy
   * - `Now` -- evaluates a thunk on an object creation and memoizes the result
   * - `Later` -- evaluates a thunk on `value` property access and memoizes the result
   * - `Always` -- evaluates a thunk on `value` property access without memoization
   */
  strategy: EvalStrategy;
}

/**
 * A thunk to be calculated by `Eval`
 *
 * Returns
 * - `A` for the base case
 * - `Eval<A>` for some intermediate case with (optional) `EvalAfter<A>`
 *   function calculated on the result of this case after the result is acquired
 */
type EvalThunk<A> = () => A | Eval<any, A>;

/**
 * A result transformer function
 *
 * Returns
 * - `A` for simple once recursive function
 * - `Eval<A>` for multiply and/or mutually recursive function(s)
 */
type EvalAfter<A, B> = (a: A) => B | Eval<any, B>;

// todo: rewrite `Eval<A, B>` into `Eval<B>`, because specifying `after` always
//  transforms result to type `B`

/**
 * Lazy evaluation of any synchronous recursive function
 *
 * Inspired by/adopted from https://typelevel.org/cats/datatypes/eval.html
 *
 * In `Eval<A, B>`
 * - `A` is a type of a thunk result
 * - `B` is a type of an optional result transformer's result (see `after`) or
 *   `A` if no transformer is specified
 *
 * @example
 * // Standard form factorial
 * const factorial_ = (n: number): Eval<number> =>
 *   always(() => (n > 1 ? factorial_(n - 1).after((x) => x * n) : 1));
 * const factorial = (n: number): number => factorial_(n).value;
 *
 * @example
 * // Tail call-optimized factorial
 * const factorial_ = (n: number, acc: number): Eval<number> =>
 *   always(() => (n > 1 ? factorial_(n - 1, n * acc) : acc));
 * const factorial = (n: number) => factorial_(n, 1).value;
 *
 * @example
 * // Fibonacci
 * const fib_ = (n: number): Eval<number> => always(() =>
 *   n === 0 || n === 1
 *     ? 1
 *     : fib_(n - 1).after((x) => fib_(n - 2).after((y) => x + y))
 * );
 * const fib = (n: number) => fib_(n).value;
 *
 * @example
 * // Mutual recursion
 * const even_ = (n: number): Eval<boolean> =>
 *   always(() => (n === 0 ? true : odd_(n - 1)));
 * const odd_ = (n: number): Eval<boolean> =>
 *   always(() => (n === 0 ? false : even_(n - 1)));
 * const even = (n: number): boolean => even_(n).value;
 * const odd = (n: number): boolean => odd_(n).value;
 */
export class Eval<A, B = A> {
  private _up: Eval<B, any> | undefined = undefined;
  private _isAfter: boolean = true;
  private _cached: A | undefined;
  private _isCached: boolean = false;

  constructor(
    private readonly _value: EvalThunk<A>,
    private readonly _options: Readonly<EvalOptions> = {
      strategy: EvalStrategy.Later,
    },
    private _after?: EvalAfter<A, B>
  ) {
    if (this._options.strategy === EvalStrategy.Now) {
      this._cache();
    }
  }

  /**
   * Call a result transformer function `f` after the result of a call is calculated
   */
  public after<C>(f: EvalAfter<B, C>): Eval<B, C> {
    return new Eval(() => this, this._options, f);
  }

  /**
   * Acquire the value
   */
  get value(): A {
    switch (this._options.strategy) {
      case EvalStrategy.Now:
        return this._cached!;
      case EvalStrategy.Always:
        return this._evaluate();
      case EvalStrategy.Later:
        return this._isCached ? this._cached! : this._cache();
    }
  }

  private _cache(): A {
    this._isCached = true;
    return (this._cached = this._evaluate());
  }

  private _evaluate(): A {
    // Start calculating from this Eval - it's the top of the stack
    let e: Eval<any, any> = this;
    // A value calculated at the current step
    let x: any | Eval<any, any> = e._getStepValue();
    while (true) {
      if (x instanceof Eval) {
        // Next case is generated, go down and calculate the next step
        x._up = e;
        e = x;
        x = e._getStepValue();
      } else {
        // Reached the base case; `after` call determines where to go
        x = e._getStepAfter(x);
        if (x instanceof Eval) {
          // `after` generated `Eval`, go down
          x._up = e;
          e = x;
          x = e._getStepValue();
        } else {
          // `after` generated not an `Eval`, continue up
          // allow `after` to run on the next top->bottom route
          e._isAfter = true;
          if (e._up) {
            // go up one level
            e = e._up;
          } else {
            // reached the top of the `Eval`-stack without generating more `Eval`'s
            return x;
          }
        }
      }
    }
  }

  private _getStepValue(): A | Eval<any, A> {
    return this._value();
  }

  private _getStepAfter(x: A): B | Eval<any, B> {
    if (this._after && this._isAfter) {
      let y = this._after(x);
      // `after` is evaluated on a bottom->top route; if it generates `Eval`
      // and is not cleared, on a next way up it generates an infinite loop
      this._isAfter = false;
      return y;
    } else {
      // When `after` is not specified, it's assumed that B = A
      return x as unknown as B;
    }
  }
}

/**
 * Immediate evaluation -- evaluates a synchronous thunk on call and memoizes
 * the result, returning it on `value` property access
 *
 * @param thunk A synchronous thunk to be evaluated
 * @param after An optional result transformer. Note, that for `now` specifying
 *   it will cause a thunk to be computed only once, but specifying it using an
 *   `after` call will cause a recomputation
 */
export const now = <A, B = A>(
  thunk: EvalThunk<A>,
  after?: EvalAfter<A, B>
): Eval<A, B> => new Eval<A, B>(thunk, { strategy: EvalStrategy.Now }, after);

/**
 * Deferred evaluation with memoization -- evaluates a synchronous thunk on
 * `value` property access and memoizes the result
 *
 * @param thunk A synchronous thunk to be evaluated
 * @param after An optional result transformer
 */
export const later = <A, B = A>(
  thunk: EvalThunk<A>,
  after?: EvalAfter<A, B>
): Eval<A, B> => new Eval<A, B>(thunk, { strategy: EvalStrategy.Later }, after);

/**
 * Deferred evaluation without memoization -- always evaluates a synchronous
 * thunk on `value` property access
 *
 * @param thunk A synchronous thunk to be evaluated
 * @param after An optional result transformer
 */
export const always = <A, B = A>(
  thunk: EvalThunk<A>,
  after?: EvalAfter<A, B>
): Eval<A, B> =>
  new Eval<A, B>(thunk, { strategy: EvalStrategy.Always }, after);

// -----------------------------------------------------------------------------
// fp-ts
// -----------------------------------------------------------------------------

// Non-pipables

// todo: check laws for Functor, Apply, Applicative, Chain, Monad

// @ts-ignore todo: fix this
const chain_: Chain1<URI>["chain"] = (fa, f) => fa.after(f);

const map_: Functor1<URI>["map"] = (fa, f) => chain_(fa, (a) => of(f(a)));

const ap_: Apply1<URI>["ap"] = (fab, fa) => chain_(fab, (f) => map_(fa, f));

// Type class members

export const of: Pointed1<URI>["of"] = (a) => always(() => a);

export const map: <A, B>(f: (a: A) => B) => (fa: Eval<A>) => Eval<B> =
  (f) => (fa) =>
    map_(fa, f);

export const ap: <A>(fa: Eval<A>) => <B>(fab: Eval<(a: A) => B>) => Eval<B> =
  (fa) => (fab) =>
    ap_(fab, fa);

export const chain: <A, B>(f: (a: A) => Eval<B>) => (ma: Eval<A>) => Eval<B> =
  (f) => (ma) =>
    chain_(ma, f);

export const flatten: <A>(mma: Eval<Eval<A>>) => Eval<A> = chain(identity);

// Instances

export const URI = "Eval";

export type URI = typeof URI;

declare module "fp-ts/lib/HKT" {
  interface URItoKind<A> {
    readonly [URI]: Eval<A>;
  }
}

export const Functor: Functor1<URI> = {
  URI,
  map: map_,
};

export const Pointed: Pointed1<URI> = {
  URI,
  of,
};

export const Apply: Apply1<URI> = {
  URI,
  map: map_,
  ap: ap_,
};

export const Applicative: Applicative1<URI> = {
  URI,
  map: map_,
  ap: ap_,
  of,
};

export const Chain: Chain1<URI> = {
  URI,
  map: map_,
  ap: ap_,
  chain: chain_,
};

export const Monad: Monad1<URI> = {
  URI,
  map: map_,
  ap: ap_,
  of,
  chain: chain_,
};

export const chainFirst = chainFirst_(Chain);

export const MonadIO: MonadIO1<URI> = {
  URI,
  map: map_,
  ap: ap_,
  of,
  chain: chain_,
  // todo: fix this
  // @ts-ignore
  fromIO: absurd,
};

export const FromIO: FromIO1<URI> = {
  URI,
  // todo: fix this
  // @ts-ignore
  fromIO: absurd,
};
