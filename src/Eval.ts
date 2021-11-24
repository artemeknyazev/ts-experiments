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
type EvalThunk<A> = () => Eval<A> | A;

/**
 * A result transformer function
 *
 * Returns
 * - `A` for simple once recursive function
 * - `Eval<A>` for multiply and/or mutually recursive function(s)
 */
type EvalAfter<A> = (a: A) => Eval<A> | A;

/**
 * Lazy evaluation of any recursive function
 *
 * Inspired by/adopted from https://typelevel.org/cats/datatypes/eval.html
 *
 * @example
 * // Standard form factorial
 * const factorial_ = (n: number): Eval<number> =>
 *   later(() => (n > 1 ? factorial_(n - 1).after((x) => x * n) : 1));
 * const factorial = (n: number): number => factorial_(n).value;
 *
 * @example
 * // Tail call-optimized factorial
 * const factorial_ = (n: number, acc: number): Eval<number> =>
 *   later(() => (n > 1 ? factorial_(n - 1, n * acc) : acc));
 * const factorial = (n: number) => factorial_(n, 1).value;
 *
 * @example
 * // Fibonacci
 * const fib_ = (n: number): Eval<number> => later(() =>
 *   n === 0 || n === 1
 *     ? 1
 *     : fib_(n - 1).after((x) => fib_(n - 2).after((y) => x + y))
 * );
 * const fib = (n: number) => fib_(n).value;
 *
 * @example
 * // Mutual recursion
 * const even_ = (n: number): Eval<boolean> =>
 *   later(() => (n === 0 ? true : odd_(n - 1)));
 * const odd_ = (n: number): Eval<boolean> =>
 *   later(() => (n === 0 ? false : even_(n - 1)));
 * const even = (n: number): boolean => even_(n).value;
 * const odd = (n: number): boolean => odd_(n).value;
 */
export class Eval<A> {
  private _after: EvalAfter<A> | undefined = undefined;
  private _up: Eval<A> | undefined = undefined;
  private _cached: A | undefined;
  private _isCached: boolean = false;

  constructor(
    private readonly _value: EvalThunk<A>,
    private readonly _options: Readonly<EvalOptions> = {
      strategy: EvalStrategy.Later,
    }
  ) {
    if (this._options.strategy === EvalStrategy.Now) {
      this._cache();
    }
  }

  /**
   * Call a function `f` after the result of a call is calculated
   */
  public after(f: EvalAfter<A>): this {
    this._after = f;
    return this;
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
    let e: Eval<A> = this;
    // A value calculated at the current step
    let x: Eval<A> | A = e.getStepValue();
    while (true) {
      if (x instanceof Eval) {
        // Next case is generated, go down and calculate the next step
        x._up = e;
        e = x;
        x = e.getStepValue();
      } else {
        // Reached the base case; `after` call determines where to go
        x = e.getStepAfter(x);
        if (x instanceof Eval) {
          // `after` generated `Eval`, go down
          x._up = e;
          e = x;
          x = e.getStepValue();
        } else {
          // `after` generated not an `Eval`, continue up
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

  private getStepValue(): Eval<A> | A {
    return this._value();
  }

  private getStepAfter(x: A): Eval<A> | A {
    if (this._after) {
      let y = this._after(x);
      // `after` is evaluated on a bottom->top route; if it generates `Eval`
      // and is not cleared, on a next way up it generates an infinite loop
      this._after = undefined;
      return y;
    } else {
      return x;
    }
  }
}

/**
 * Immediate evaluation -- evaluates a thunk on call and memoizes the result
 */
export const now = <A>(thunk: EvalThunk<A>) =>
  new Eval(thunk, { strategy: EvalStrategy.Now });

/**
 * Deferred evaluation with memoization -- evaluates a thunk on `value` property
 * access and memoizes the result
 */
export const later = <A>(thunk: EvalThunk<A>) =>
  new Eval(thunk, { strategy: EvalStrategy.Later });

/**
 * Deferred evaluation without memoization -- always evaluates a thunk on
 * `value` property access
 */
export const always = <A>(thunk: EvalThunk<A>) =>
  new Eval(thunk, { strategy: EvalStrategy.Always });
