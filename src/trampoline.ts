import * as E from "fp-ts/lib/Either";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import { AnyFunction } from "./utils";

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
  type FinalCase<F extends AnyFunction> = ReturnType<F>;

  /**
   * Non-final case consists of
   * - an (optional) result computing function for this step
   *   (e.g. `x => n * x` for `fact(n) = n * fact(n-1)`, where `n > 1`);
   *   if not provided, will be assumed as an `x => x` identity function
   * - a required list of arguments for the next trampolined function call
   */
  type NonFinalCase<F extends AnyFunction> = [
    ResultCombinator<ReturnType<F>> | undefined,
    Parameters<F>
  ];

  /**
   * A trampolined recursive function result type
   * - `left` is a non-final case (e.g. `fact(n) = n * fact(n-1)`, where `n > 1`)
   * - `right` is a final case (e.g. `fact(1) = 1`)
   */
  type FuncRes<F extends AnyFunction> = Either<NonFinalCase<F>, FinalCase<F>>;

  /**
   * A trampolined once-recursive function type
   */
  export type Func<F extends AnyFunction> = (
    ...args: Parameters<F>
  ) => FuncRes<F>;

  export const trampoline_ =
    <F extends AnyFunction>(f: Func<F>) =>
    (...args: Parameters<F>): ReturnType<F> => {
      const stack: (ResultCombinator<ReturnType<F>> | undefined)[] = [];
      let r: ReturnType<F>;
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

export type TrampolinedORSR<F extends AnyFunction> = TrampolinedORSR_.Func<F>;

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
 * type Fact = (x: number) => number
 * const fact_: TrampolinedORSR<Fact> =
 *   (n) => n > 1 ? E.left([x => n * x, [n - 1]]) : E.right(1);
 * const fact: Fact = trampolineORSR(fact_);
 */
export const trampolineORSR = <F extends AnyFunction>(
  f: TrampolinedORSR<F>
): ((...args: Parameters<F>) => ReturnType<F>) =>
  TrampolinedORSR_.trampoline_(f);

/**
 * Trampolined once-recursive function that uses thunks and optional
 * result combinators to delay result calculation and execution
 */
namespace TrampolinedOR_ {
  type ResultCombinator<B> = (x: B) => B;

  type FinalCase<F extends AnyFunction> = ReturnType<F>;

  type NextCaseThunk<F extends AnyFunction> = () => FuncRes<F>;

  type NonFinalCase<F extends AnyFunction> = [
    ResultCombinator<ReturnType<F>> | undefined,
    NextCaseThunk<F>
  ];

  type FuncRes<F extends AnyFunction> = Either<NonFinalCase<F>, FinalCase<F>>;

  export type Func<F extends AnyFunction> = (
    ...args: Parameters<F>
  ) => FuncRes<F>;

  export const trampoline_ =
    <F extends AnyFunction>(f: Func<F>) =>
    (...args: Parameters<F>): ReturnType<F> => {
      const stack: (ResultCombinator<ReturnType<F>> | undefined)[] = [];
      let next: FuncRes<F> = f(...args);
      let r: ReturnType<F>;
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

export type TrampolinedOR<F extends AnyFunction> = TrampolinedOR_.Func<F>;

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
 * type Fact = (x: number) => number;
 * const fact_: TrampolinedOR<Fact> = (n) =>
 *   n > 1 ? E.left([x => n * x, () => fact(n - 1)]) : E.right(n);
 * const fact: Fact = trampolineOR(fact_);
 */
export const trampolineOR = <F extends AnyFunction>(
  f: TrampolinedOR<F>
): ((...args: Parameters<F>) => ReturnType<F>) => TrampolinedOR_.trampoline_(f);

/**
 * Universal trampoline for once- and multiply-recursive functions
 */
namespace Trampolined_ {
  const CallSymbol = Symbol("Call");

  export type Call<F extends AnyFunction> = {
    readonly tag: typeof CallSymbol;
    readonly fn: F;
    readonly args: Parameters<F>;
  };

  export const call = <F extends AnyFunction>(
    f: F,
    ...args: Parameters<F>
  ): Call<F> => ({ tag: CallSymbol, fn: f, args });

  const isCall = <F extends AnyFunction>(x: Call<F>): x is Call<F> =>
    x.tag === CallSymbol;

  export type Trampolined<F extends AnyFunction> = (
    next: (x: ReturnType<F>) => ReturnType<F> | Call<AnyFunction>,
    ...args: Parameters<F>
  ) => Call<AnyFunction>;

  export const trampoline_ =
    <F extends AnyFunction>(f: Trampolined<F>) =>
    (...args: Parameters<F>): ReturnType<F> => {
      let x = f((x) => x, ...args);
      while (true) {
        if (x && isCall(x)) {
          x = x.fn(...x.args);
        } else {
          return x;
        }
      }
    };
}

/**
 * Thunkifys a call to some function with a provided list of arguments
 */
export const call = Trampolined_.call;

/**
 * A trampolined function type with computations delayed using a `call` function
 */
export type Trampolined<F extends AnyFunction> = Trampolined_.Trampolined<F>;

/**
 * Transforms a trampolined function into a stack-safe function
 *
 * **Assumptions**
 * - `f` converges
 * - for the base case `f` or some function it calls returns `call(next, <value>)`
 * - for the intermediate case `f` (or some function it calls) returns
 *   `call(g, transform, ...<arguments of g>)`, where `g` is `f`
 *   or any other function, and `transform: (x: B) => B` is
 *   - either a `next` function
 *   - or a result transformer function that binds arguments from this
 *     intermediate step, receives a result from the step below, and returns
 *     it's result to the step above using the `call(next, <result>)`
 *
 * @example
 * type Fact = (x: number) => number;
 * const fact_: Trampolined<Fact> = (next, n) =>
 *   n > 1 ? call(ftr_, (x) => call(next, x * n), n - 1) : call(next, 1);
 * const fact: Fact = trampoline(fact_);
 *
 * @example
 * type Fib = (x: number) => number;
 * const fib_: Trampolined<Fib> = (next, n) =>
 *   n === 0 || n === 1
 *   ? call(next, 1)
 *   : call(fib_, (x) => call(fib_, (y) => call(next, x + y), n - 1), n - 2);
 * const fib: Fib = trampoline(fib_);
 *
 * @example
 * type Ack = (m: number, n: number) => number;
 * const ack_: Trampolined<Ack> = (next, m, n) =>
 *   m === 0
 *   ? call(next, n + 1)
 *   : n === 0
 *   ? call(ack_, next, m - 1, 1)
 *   : call(ack_, (x) => call(ack_, next, m - 1, x), m, n - 1);
 * const ack: Ack = trampoline(ack_);
 */
export const trampoline = Trampolined_.trampoline_;
