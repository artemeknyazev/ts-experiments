import * as E from "fp-ts/lib/Either";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";

import Either = E.Either;

/**
 * A result computing function for some step; binds step-specific
 * data (e.g. `x => n * x` for `fact(n) = n * fact(n-1)`, where `n > 1`)
 */
type ResultStep<B> = (b: B) => B;

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
type NonFinalCase<As, B> = [ResultStep<B> | undefined, As];

/**
 * A trampolined recursive function result type
 * - `left` is a non-final case (e.g. `fact(n) = n * fact(n-1)`, where `n > 1`)
 * - `right` is a final case (e.g. `fact(1) = 1`)
 */
type RecFuncRes<As extends any, B> = Either<NonFinalCase<As, B>, FinalCase<B>>;

/**
 * A trampolined recursive function type
 */
export type RecFunc<As extends any[], B> = (...args: As) => RecFuncRes<As, B>;

/**
 * Transforms a trampolined once-recursive function into
 * a continuation stack-based function computing it
 *
 * *Note:* this function assumes that
 * - `f` converges
 * - non-trampolined version of `f` calls only itself
 *
 * @example
 * const fact: RecFunc<[number], number> =
 *   (n) => n > 1 ? E.left([x => n * x, [n - 1]]) : E.right(1);
 *
 * const fact = itt(fact_);
 * fact(1) === 1;
 * fact(2) === 2;
 * fact(3) === 6;
 */
export const transformTrampoline =
  <As extends any[], B>(f: RecFunc<As, B>) =>
  (...args: As): B => {
    const stack: (ResultStep<B> | undefined)[] = [];
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

// TODO: create a trampolined function that returns a thunk
