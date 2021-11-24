import { AnyFunction } from "./utils";

export interface EvCache<
  F extends AnyFunction,
  As extends any[],
  B extends any
> {
  has(f: F, args: As): boolean;
  get(f: F, args: As): B | undefined;
  set(f: F, args: As, value: B): this;
}

interface EvOptions {
  cache?: EvCache<AnyFunction, any[], any>;
}

type EvAfter<F extends AnyFunction> = (
  x: ReturnType<F>
) => ReturnType<F> | Ev<F>;

export type EvF<F extends AnyFunction> = (
  ...args: Parameters<F>
) => Ev<EvF<F>> | ReturnType<F>;

export class Ev<F extends AnyFunction> {
  private _after: EvAfter<F> | undefined = undefined;
  private _up: Ev<F> | undefined = undefined;

  constructor(
    private readonly _fn: EvF<F>,
    private readonly _args: Parameters<F>,
    private readonly _options?: EvOptions
  ) {}

  public after(after: EvAfter<F>): this {
    this._after = after;
    return this;
  }

  get value(): ReturnType<F> {
    return this._evaluate();
  }

  private _evaluate(): ReturnType<F> {
    // Start calculating from this `Ev` - it's the top of the stack
    let e: Ev<any> = this;
    // A value calculated at the current step
    let x = e._getStepValue();
    while (true) {
      if (x instanceof Ev) {
        // Next case is generated, go down and calculate the next step
        x._up = e;
        e = x;
        x = e._getStepValue();
      } else {
        // Reached the base case; `after` call determines where to go
        e._afterStepValueCalculated(x);
        x = e._getStepAfter(x);
        if (x instanceof Ev) {
          // `after` generated `Ev`, go down
          x._up = e;
          e = x;
          x = e._getStepValue();
        } else {
          // `after` generated not an `Ev`, continue up
          if (e._up) {
            // go up one level
            e = e._up;
          } else {
            // reached the top of the `Ev`-stack without generating more `Ev`'s
            return x;
          }
        }
      }
    }
  }

  private _isCachedStepValue(): boolean {
    return this._options!.cache!.has(this._fn, this._args);
  }

  private _getCachedStepValue(): ReturnType<F> {
    return this._options!.cache!.get(this._fn, this._args)!;
  }

  private _afterStepValueCalculated(x: ReturnType<F>): void {
    // May receive a new value for an already calculated step meaning `after`
    // function was called; but `after` is related to the step above, so we
    // postpone setting a value to cache until a not-cached step is encountered
    if (
      this._options?.cache &&
      !this._options.cache.has(this._fn, this._args)
    ) {
      this._options!.cache!.set(this._fn, this._args, x);
    }
  }

  private _getStepValue(): Ev<F> | ReturnType<F> {
    return this._options?.cache && this._isCachedStepValue()
      ? this._getCachedStepValue()
      : this._fn.apply(undefined, this._args);
  }

  private _getStepAfter(x: ReturnType<F>): Ev<any> | ReturnType<F> {
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

export class EvDefaultCache implements EvCache<AnyFunction, any[], any> {
  private readonly _cache = new WeakMap<AnyFunction, Map<string, any>>();

  public has(f: AnyFunction, args: any[]): boolean {
    return this._cache.has(f) && this._cache.get(f)!.has(this._getKey(args));
  }

  public get(f: AnyFunction, args: any[]): any | undefined {
    return this._cache.has(f)
      ? this._cache.get(f)!.get(this._getKey(args))
      : undefined;
  }

  public set(f: AnyFunction, args: any[], value: any): this {
    let resCache = this._cache.get(f);
    if (!resCache) {
      resCache = new Map<string, any>();
      this._cache.set(f, resCache);
    }
    resCache.set(this._getKey(args), value);
    return this;
  }

  public entries(f: AnyFunction) {
    return this._cache.has(f) ? this._cache.get(f)!.entries() : [];
  }

  private _getKey(args: any[]): string {
    return args.join("_");
  }
}

export const defaultCache = new EvDefaultCache();

export const createEv =
  (options?: EvOptions) =>
  <F extends AnyFunction>(f: EvF<F>) =>
  (...args: Parameters<F>): Ev<F> =>
    new Ev<F>(f, args, options);

export const evMemo =
  <F extends AnyFunction>(f: EvF<F>) =>
  (...args: Parameters<F>): Ev<F> =>
    new Ev<F>(f, args, { cache: defaultCache });

export const ev =
  <F extends AnyFunction>(f: EvF<F>) =>
  (...args: Parameters<F>): Ev<F> =>
    new Ev<F>(f, args);
