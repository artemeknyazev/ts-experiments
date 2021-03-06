import * as O from "fp-ts/Option";
import { Kind, URIS } from "fp-ts/HKT";
import { Monad1 } from "fp-ts/Monad";
import { flow } from "fp-ts/function";

// -----------------------------------------------------------------------------
// Common types
// -----------------------------------------------------------------------------

export type AnyFunction = (...args: any[]) => any;

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

/**
 * Defer a function call so that the stack empties to prevent stack overflow
 *
 * @param thunk A deferred function
 */
export const next =
  <A extends any[]>(thunk: (...args: A) => any) =>
  (...args: A): void => {
    process.nextTick(() => {
      thunk.apply(undefined, args);
    });
  };

/**
 * Defer a value resolution using the `next` call
 *
 * @param a A deferred value
 */
export const resolveNext =
  <A>(a: A) =>
  (resolve: (a: A) => any): void =>
    next(resolve)(a);

/**
 * Transform a unary function into a function returning a lifted into a monad result
 *
 * Less strict version of `liftMUnaryS`
 */
export const liftMUnaryS: <F extends URIS>(
  M: Monad1<F>
) => <A, B>(f: (a: A) => B) => (a: A) => Kind<F, B> = (M) => (f) =>
  flow(f, M.of);

/**
 * Lift a unary function into a monad
 *
 * Less strict version of `liftMUnary`
 */
export const liftMUnary: <F extends URIS>(
  M: Monad1<F>
) => <A, B>(f: (a: A) => B) => (fa: Kind<F, A>) => Kind<F, B> =
  (M) => (f) => (fa) =>
    M.map(fa, f);

/**
 * Lift a binary function into a monad
 *
 * Less strict version of `liftMBinary`
 */
export const liftMBinary: <F extends URIS>(
  M: Monad1<F>
) => <A, B, C>(
  f: (a: A, b: B) => C
) => (fa: Kind<F, A>, fb: Kind<F, B>) => Kind<F, C> = (M) => (f) => (fa, fb) =>
  M.chain(fa, (a) => M.map(fb, (b) => f(a, b)));

/**
 * Postpone evaluation of a function with specified arguments using a monad
 */
export const postponeM =
  <F extends URIS>(M: Monad1<F>) =>
  <A extends any[], B>(f: (...args: A) => Kind<F, B>) =>
  (...args: A): Kind<F, B> =>
    M.chain(M.of(undefined), () => f.apply(undefined, args));

// -----------------------------------------------------------------------------
//  Reference implementations
// -----------------------------------------------------------------------------

/**
 * A recursive factorial function in a standard form
 */
export const fact: Fact = (n) => (n > 1 ? n * fact(n - 1) : 1);

export type Fact = (n: number) => number;

/**
 * A recursive factorial function in a tail recursive form
 */
export const factTr: Fact = (n) => factTr_(n, 1);

const factTr_: FactTr = (n, acc) => (n > 1 ? factTr_(n - 1, acc * n) : acc);

export type FactTr = (n: number, acc: number) => number;

/**
 * A stack-unsafe (for large n ~ 2**16) recursive adder
 */
export const adder: Adder = (n) => adder_(n, 0);

const adder_: AdderTr = (n, acc) => (n > 1 ? adder_(n - 1, acc + 1) : acc);

export type Adder = (n: number) => number;

export type AdderTr = (n: number, acc: number) => number;

/**
 * A naive Fibonacci
 */
export const fib: Fib = (n) =>
  n === 0 || n === 1 ? 1 : fib(n - 1) + fib(n - 2);

export type Fib = (n: number) => number;

/**
 * An Ackerman function
 */
export const ack: Ack = (m, n) =>
  m === 0 ? n + 1 : n === 0 ? ack(m - 1, 1) : ack(m - 1, ack(m, n - 1));

export type Ack = (m: number, n: number) => number;

export type Predicate<A> = (x: A) => boolean;

// -----------------------------------------------------------------------------
//  Checkers for tests
// -----------------------------------------------------------------------------

export function checkFact(fact: Fact, factRef: Fact): void {
  for (let i = 0; i < 10; i++) {
    expect(fact(i)).toBe(factRef(i));
  }
}

export function checkAdder(adder: Adder, adderRef: Adder): void {
  // depends on Node's stack size: `node --v8-options | grep -A1 "stack-size"`
  const n = 2 ** 16;

  expect(() => {
    adderRef(n);
  }).toThrow();

  expect(() => {
    expect(adder(n)).toBe(n - 1);
  }).not.toThrow();
}

export function checkFib(fib: Fib, fibRef: Fib): void {
  for (let i = 0; i < 10; i++) {
    expect(fib(i)).toBe(fibRef(i));
  }
}

export function checkEvenOdd(
  even: Predicate<number>,
  odd: Predicate<number>
): void {
  for (let i = 0; i < 10; i++) {
    const isEven = i % 2 === 0;
    expect(even(i)).toBe(isEven);
    expect(odd(i)).toBe(!isEven);
  }

  const n = 2 ** 16 + 1;
  expect(() => {
    expect(even(n)).toBe(false);
  }).not.toThrow();
  expect(() => {
    expect(odd(n)).toBe(true);
  }).not.toThrow();
}

export function checkAck(ack: Ack, ackRef: Ack): void {
  for (let m = 0; m < 4; m++) {
    for (let n = 0; n < 6; n++) {
      expect(ack(m, n)).toBe(ackRef(m, n));
    }
  }
}

export function checkMutRec(
  f: (n: number) => number,
  g: (n: number, b: boolean) => O.Option<number>
): void {
  for (let [[n, b], r] of [
    [[0, true], O.some(0)],
    [[0, false], O.some(0)],
    [[1, true], O.none],
    [[1, false], O.some(1)],
    [[2, true], O.none],
    [[2, false], O.some(0)],
    [[3, true], O.none],
    [[3, false], O.some(-1)],
  ] as [[number, boolean], O.Option<number>][]) {
    expect(g(n, b)).toEqual(r);
  }

  for (let [n, r] of [
    [0, 1],
    [1, 0],
    [2, -1],
    [3, 1],
  ] as [number, number][]) {
    expect(f(n)).toBe(r);
  }
}

// -----------------------------------------------------------------------------
//  Test helpers
// -----------------------------------------------------------------------------

export const sortFibCacheEntries = (a: [string, number], b: [string, number]) =>
  Math.sign(Number(a[0]) - Number(b[0]));

export const sortAckCacheEntries = (
  a: [string, number],
  b: [string, number]
) => {
  const as = a[0].split("_");
  const bs = b[0].split("_");
  return (
    Math.sign(Number(as[0]) - Number(bs[0])) ||
    Math.sign(Number(as[1]) - Number(bs[1]))
  );
};
