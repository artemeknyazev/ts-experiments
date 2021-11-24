import { Eval, always, now, later } from "./Eval";
import {
  Ack,
  Adder,
  Fact,
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
} from "./utils";

it("`always` evaluates a thunk on every call", () => {
  const f = jest.fn(() => 1);
  expect(f).toBeCalledTimes(0);
  const e = always(f);
  expect(f).toBeCalledTimes(0);
  expect(e.value).toBe(1);
  expect(f).toBeCalledTimes(1);
  expect(e.value).toBe(1);
  expect(f).toBeCalledTimes(2);
});

it("`now` evaluates a thunk at creation and memoizes the result", () => {
  const f = jest.fn(() => 1);
  expect(f).toBeCalledTimes(0);
  const e = now(f);
  expect(f).toBeCalledTimes(1);
  expect(e.value).toBe(1);
  expect(f).toBeCalledTimes(1);
  expect(e.value).toBe(1);
  expect(f).toBeCalledTimes(1);
});

it("`later` evaluates a thunk at the first call and memoizes the result", () => {
  const f = jest.fn(() => 1);
  expect(f).toBeCalledTimes(0);
  const e = later(f);
  expect(f).toBeCalledTimes(0);
  expect(e.value).toBe(1);
  expect(f).toBeCalledTimes(1);
  expect(e.value).toBe(1);
  expect(f).toBeCalledTimes(1);
});

it("transforms trampolined standard form factorial correctly", () => {
  const fact_ = (n: number): Eval<number> =>
    always(() => (n > 1 ? fact_(n - 1).after((x) => x * n) : 1));
  const fact: Fact = (n) => fact_(n).value;

  checkFact(fact, factRef);
});

it("transforms trampolined tail-call form factorial correctly", () => {
  const fact_ = (n: number, acc: number): Eval<number> =>
    always(() => (n > 1 ? fact_(n - 1, n * acc) : acc));
  const fact: Fact = (n) => fact_(n, 1).value;

  checkFact(fact, factTrRef);
});

it("transforms a stack-overflowing function into a not-overflowing one", () => {
  const adder_ = (n: number, acc: number): Eval<number> =>
    always(() => (n > 1 ? adder_(n - 1, acc + 1) : acc));
  const adder: Adder = (n) => adder_(n, 0).value;

  checkAdder(adder, adderRef);
});

it("transforms naive Fibonacci correctly", () => {
  const fib_ = (n: number): Eval<number> =>
    always(() =>
      n === 0 || n === 1
        ? 1
        : fib_(n - 1).after((x) => fib_(n - 2).after((y) => x + y))
    );
  const fib: Fib = (n) => fib_(n).value;

  checkFib(fib, fibRef);
});

it("transforms mutually recursive even/odd functions correctly", () => {
  const even_ = (n: number): Eval<boolean> =>
    always(() => (n === 0 ? true : odd_(n - 1)));
  const odd_ = (n: number): Eval<boolean> =>
    always(() => (n === 0 ? false : even_(n - 1)));
  const even: Predicate<number> = (n) => even_(n).value;
  const odd: Predicate<number> = (n) => odd_(n).value;

  checkEvenOdd(even, odd);
});

it("transforms trampolined Ackerman function correctly", () => {
  const ack_ = (m: number, n: number): Eval<number> =>
    always(() =>
      m === 0
        ? n + 1
        : n === 0
        ? ack_(m - 1, 1)
        : ack_(m, n - 1).after((x) => ack_(m - 1, x))
    );
  const ack: Ack = (m, n) => ack_(m, n).value;

  checkAck(ack, ackRef);
});

// todo: mutual recursion with a function with different number of args returning a different type and an `after` function converting it to a type of a current function; requires changing types
