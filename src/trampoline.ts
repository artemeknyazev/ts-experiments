import * as E from "fp-ts/lib/Either";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";

import Either = E.Either;

/**
 * Trampolined once-recursive (only one recursive call inside)
 * self-recursive (calls only itself) function type
 */
namespace TrampolinedORSR_ {
  /**
   * A result computing function for some step; binds step-specific
   * data (e.g. `x => n * x` for `fact(n) = n * fact(n-1)`, where `n > 1`)
   */
  type ResultCombinator<B> = (b: B) => B;

  /**
   * A final case is a value to be reduced through all result computing
   * functions for each step
   */
  type FinalCase<B> = B;

  /**
   * Non-final case consists of
   * - an (optional) result computing function for this step
   *   (e.g. `x => n * x` for `fact(n) = n * fact(n-1)`, where `n > 1`);
   *   if not provided, will be assumed as an `x => x` identity function
   * - a required list of arguments for the next trampolined function call
   */
  type NonFinalCase<NextCaseArgs extends any[], B> = [
    ResultCombinator<B> | undefined,
    NextCaseArgs
  ];

  /**
   * A trampolined recursive function result type
   * - `left` is a non-final case (e.g. `fact(n) = n * fact(n-1)`, where `n > 1`)
   * - `right` is a final case (e.g. `fact(1) = 1`)
   */
  type FuncRes<As extends any[], B> = Either<NonFinalCase<As, B>, FinalCase<B>>;

  /**
   * A trampolined once-recursive function type
   */
  export type Func<As extends any[], B> = (...args: As) => FuncRes<As, B>;

  export const trampoline_ =
    <As extends any[], B>(f: Func<As, B>) =>
    (...args: As): B => {
      const stack: (ResultCombinator<B> | undefined)[] = [];
      let r: B;
      while (true) {
        const next = f(...args);
        if (E.isLeft(next)) {
          stack.push(next.left[0]);
          args = next.left[1];
        } else {
          r = next.right;
          break;
        }
      }
      return pipe(
        stack,
        A.reduceRight(r, (f, b) => (f ? f(b) : b))
      );
    };
}

export type TrampolinedORSR<As extends any[], B> = TrampolinedORSR_.Func<As, B>;

/**
 * Transforms a trampolined once-recursive function into
 * a continuation stack-based function computing it
 *
 * **Assumptions**
 * - `f` converges
 * - non-trampolined version of `f` calls only itself
 * - `f` returns
 *   - `Either.left` for a non-final case with a tuple
 *     - an (optional) result combinator or undefined
 *     - a list of arguments to pass to the next call
 *   - `Either.right` for the final/base case
 *
 * @example
 * const fact_: TrampolinedORSR<[number], number> =
 *   (n) => n > 1 ? E.left([x => n * x, [n - 1]]) : E.right(1);
 *
 * const fact = trampolineORSR(fact_);
 * fact(1) === 1;
 * fact(2) === 2;
 * fact(3) === 6;
 */
export const trampolineORSR = <As extends any[], B>(
  f: TrampolinedORSR<As, B>
): ((...args: As) => B) => TrampolinedORSR_.trampoline_(f);

/**
 * Trampolined once-recursive function that uses thunks and optional
 * result combinators to delay result calculation and execution
 */
namespace TrampolinedOR_ {
  type ResultCombinator<B> = (x: B) => B;

  type FinalCase<B> = B;

  type NextCaseThunk<As extends any[], B> = () => FuncRes<As, B>;

  type NonFinalCase<As extends any[], B> = [
    ResultCombinator<B> | undefined,
    NextCaseThunk<As, B>
  ];

  type FuncRes<As extends any[], B> = Either<NonFinalCase<As, B>, FinalCase<B>>;

  export type Func<As extends any[], B> = (...args: As) => FuncRes<As, B>;

  export const trampoline_ =
    <As extends any[], B>(f: Func<As, B>) =>
    (...args: As): B => {
      const stack: (ResultCombinator<B> | undefined)[] = [];
      let next: FuncRes<As, B> = f(...args);
      let r: B;
      while (true) {
        if (E.isLeft(next)) {
          stack.push(next.left[0]);
          next = next.left[1]();
        } else {
          r = next.right;
          break;
        }
      }
      return pipe(
        stack,
        A.reduceRight(r, (f, b) => (f ? f(b) : b))
      );
    };
}

export type TrampolinedOR<As extends any[], B> = TrampolinedOR_.Func<As, B>;

/**
 * Transforms a trampolined once-recursive function into
 * a continuation stack-based function computing it
 *
 * **Assumptions**
 * - `f` converges
 * - `f` returns
 *   - `Either.left` for a non-final case with a tuple
 *     - an (optional) result combinator
 *     - a thunk returning `Either` for the next iteration
 *   - `Either.right` for the final/base case
 *
 * @example
 * const fact_: TrampolinedOR<[number], number> = (n) =>
 *   n > 1 ? E.left([x => n * x, () => fact(n - 1)]) : E.right(n);
 *
 * const fact = trampolineOR(fact_);
 * fact(1) === 1;
 * fact(2) === 2;
 * fact(3) === 6;
 */
export const trampolineOR = <As extends any[], B>(
  f: TrampolinedOR<As, B>
): ((...args: As) => B) => TrampolinedOR_.trampoline_(f);

/**
 * Universal trampoline for once- and multiply-recursive functions
 */
namespace Trampolined_ {
  const CallSymbol = Symbol("Call");

  export type Call<As extends any[], B> = {
    readonly tag: typeof CallSymbol;
    readonly fn: (...args: As) => B;
    readonly args: As;
  };

  export const call = <As extends any[], B>(
    f: (...args: As) => B,
    ...args: As
  ): Call<As, B> => ({ tag: CallSymbol, fn: f, args });

  const isCall = <As extends any[], B>(x: Call<As, B>): x is Call<As, B> =>
    x.tag === CallSymbol;

  export type Trampolined<As extends any[], B> = (
    next: (x: B) => B | Call<any[], any>,
    ...args: As
  ) => Call<any[], any>;

  export const trampoline_ =
    <As extends any[], B>(f: Trampolined<As, B>) =>
    (...args: As): B => {
      let x = f((x) => x, ...args);
      while (true) {
        if (x && isCall(x)) {
          // console.log('call', x.fn.name, x.args);
          x = x.fn(...x.args);
        } else {
          return x;
        }
      }
    };
}

/**
 * A thunk type for the `trampoline` function's function argument
 */
export type Call<As extends any[], B> = Trampolined_.Call<As, B>;

/**
 * Thunkifys a call to some function with a provided list of arguments
 */
export const call = Trampolined_.call;

/**
 * A trampolined function type with computations delayed using a `call` function
 */
export type Trampolined<As extends any[], B> = Trampolined_.Trampolined<As, B>;

/**
 * Transforms a trampolined function into a stack-safe function
 *
 * **Assumptions**
 * - `f` converges
 * - for the base case `f` or some function it calls returns `call(next, <value>)`
 * - for the intermediate case `f` (or some function it calls) returns
 *   `call(g, transform, ...<arguments of g>)`, where `g` is `f`
 *   or any other function, and `transform: (x: B) => B` is a result transformer
 *   function that binds arguments from this intermediate step, receives a result
 *   from the step below, and returns it's result to the step above
 *
 * @example
 * // Factorial is a function that recurses once in a call
 * const fact_: Trampolined<[number], number> = (next, n) =>
 *   n > 1 ? call(ftr_, (x) => call(next, x * n), n - 1) : call(next, 1);
 *
 * const fact = trampoline(fact_);
 *
 * fact(1) === 1;
 * fact(2) === 2;
 * fact(3) === 6;
 *
 * @example
 * // TODO: Fibonacci is a function that recurses twice in a call
 *
 * @example
 * // TODO: Ackerman function is a function that recurses once or twice
 */
export const trampoline = Trampolined_.trampoline_;

// TODO: an intermediate results caching `trampoline`
// Cache is a WeakMap<Map<string>>, first caching by a function,
// then by a `resolver(fn, args)` where `resolver` is a user-provided
// function converting an arguments list into a `string` cache key
