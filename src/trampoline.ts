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
 *
 * // TODO: add an example for mutual recursion
 */
export const trampolineOR = <As extends any[], B>(
  f: TrampolinedOR<As, B>
): ((...args: As) => B) => TrampolinedOR_.trampoline_(f);
