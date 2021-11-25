import { ev, createEv, EvF, EvDefaultCache } from "./Ev";
import {
  Ack,
  Adder,
  AdderTr,
  Fact,
  FactTr,
  Fib,
  Predicate,
  ack as ackRef,
  adder as adderRef,
  fact as factRef,
  factTr as factTrRef,
  fib as fibRef,
  checkAdder,
  checkEvenOdd,
  checkFact,
  checkFib,
  checkAck,
  checkMutRec,
  sortAckCacheEntries,
  sortFibCacheEntries,
} from "./utils";
import * as O from "fp-ts/lib/Option";

it("transforms trampolined standard form factorial correctly", () => {
  const fact_: EvF<Fact> = (n: number) =>
    n > 1 ? ev(fact_)(n - 1).after((x) => x * n) : 1;
  const fact: Fact = (n) => ev(fact_)(n).value;

  checkFact(fact, factRef);
});

it("transforms trampolined tail-call form factorial correctly", () => {
  const fact_: EvF<FactTr> = (n: number, acc: number) =>
    n > 1 ? ev(fact_)(n - 1, n * acc) : acc;
  const fact: Fact = (n) => ev(fact_)(n, 1).value;

  checkFact(fact, factTrRef);
});

it("transforms a stack-overflowing function into a not-overflowing one", () => {
  const adder_: EvF<AdderTr> = (n: number, acc: number) =>
    n > 1 ? ev(adder_)(n - 1, acc + 1) : acc;
  const adder: Adder = (n) => ev(adder_)(n, 0).value;

  checkAdder(adder, adderRef);
});

it("transforms naive Fibonacci correctly", () => {
  const fib_: EvF<Fib> = (n: number) =>
    n === 0 || n === 1
      ? 1
      : ev(fib_)(n - 1).after((x) => ev(fib_)(n - 2).after((y) => x + y));
  const fib: Fib = (n) => ev(fib_)(n).value;

  checkFib(fib, fibRef);
});

it("transforms mutually recursive even/odd functions correctly", () => {
  const even_: EvF<Predicate<number>> = (n: number) =>
    n === 0 ? true : ev(odd_)(n - 1);
  const odd_: EvF<Predicate<number>> = (n: number) =>
    n === 0 ? false : ev(even_)(n - 1);
  const even: Predicate<number> = (n) => ev(even_)(n).value;
  const odd: Predicate<number> = (n) => ev(odd_)(n).value;

  checkEvenOdd(even, odd);
});

it("transforms trampolined Ackerman function correctly", () => {
  const ack_: EvF<Ack> = (m: number, n: number) =>
    m === 0
      ? n + 1
      : n === 0
      ? ev(ack_)(m - 1, 1)
      : ev(ack_)(m, n - 1).after((x) => ev(ack_)(m - 1, x));
  const ack: Ack = (m, n) => ev(ack_)(m, n).value;

  checkAck(ack, ackRef);
});

it("transforms naive Fibonacci correctly with memoization", () => {
  const cache = new EvDefaultCache();
  const ev = createEv({ cache });

  const fib_: EvF<Fib> = (n: number) =>
    n === 0 || n === 1
      ? 1
      : ev(fibm_)(n - 1).after((x) => ev(fibm_)(n - 2).after((y) => x + y));
  const fibm_ = jest.fn(fib_);
  const fib: Fib = (n) => ev(fibm_)(n).value;

  let n = 0;
  expect(fib(3)).toBe(fibRef(3));
  expect(fibm_).toBeCalledTimes((n += 4));
  expect(Array.from(cache.entries(fibm_)).sort(sortFibCacheEntries)).toEqual(
    [0, 1, 2, 3].map((x) => [String(x), fibRef(x)])
  );
  expect(fib(10)).toBe(fibRef(10));
  expect(Array.from(cache.entries(fibm_)).sort(sortFibCacheEntries)).toEqual(
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((x) => [String(x), fibRef(x)])
  );
  expect(fibm_).toBeCalledTimes((n += 7));

  checkFib(fib, fibRef);
});

it("transforms trampolined Ackerman function correctly with memoization", () => {
  const cache = new EvDefaultCache();
  const ev = createEv({ cache });

  const ack_: EvF<Ack> = (m: number, n: number) =>
    m === 0
      ? n + 1
      : n === 0
      ? ev(ackm_)(m - 1, 1)
      : ev(ackm_)(m, n - 1).after((x) => ev(ackm_)(m - 1, x));
  const ackm_ = jest.fn(ack_);
  const ack: Ack = (m, n) => ev(ackm_)(m, n).value;

  let n = 0;
  expect(ack(2, 0)).toBe(ackRef(2, 0));
  expect(ackm_).toBeCalledTimes((n += 5));
  expect(Array.from(cache.entries(ackm_)).sort(sortAckCacheEntries)).toEqual(
    (
      [
        [0, 1],
        [0, 2],
        [1, 0],
        [1, 1],
        [2, 0],
      ] as [number, number][]
    ).map<[string, number]>((x) => [`${x[0]}_${x[1]}`, ackRef(x[0], x[1])])
    // .sort(sortAckCacheEntries)
  );
  // also memoized
  expect(ack(2, 1)).toBe(ackRef(2, 1));
  expect(Array.from(cache.entries(ackm_)).sort(sortAckCacheEntries)).toEqual(
    (
      [
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [1, 0],
        [1, 1],
        [1, 2],
        [1, 3],
        [2, 0],
        [2, 1],
      ] as [number, number][]
    ).map<[string, number]>((x) => [`${x[0]}_${x[1]}`, ackRef(x[0], x[1])])
  );
  expect(ackm_).toBeCalledTimes(n + 5);

  checkAck(ack, ackRef);
});

it("mutual recursion of functions with different signatures and return types", () => {
  type F = (n: number) => number;
  type G = (n: number, b: boolean) => O.Option<number>;
  const f_: EvF<F> = (n: number) =>
    n > 0
      ? ev(g_)(n, n % 3 === 0).after(
          O.match(
            () => n - 2,
            (x) => x - 1
          )
        )
      : 1;
  const g_: EvF<G> = (n: number, b: boolean) =>
    n > 0 ? (b ? O.none : ev(f_)(n - 1).after(O.some)) : O.some(0);
  const f: F = (n: number) => ev(f_)(n).value;
  const g: G = (n: number, b: boolean) => ev(g_)(n, b).value;

  checkMutRec(f, g);
});
