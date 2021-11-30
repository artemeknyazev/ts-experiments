import * as E from "fp-ts/lib/Either";
import {
  trampolineORSR,
  TrampolinedORSR,
  trampolineOR,
  TrampolinedOR,
  trampoline,
  call,
  Trampolined,
} from "./trampoline";
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
} from "../utils";

describe("trampolineORSR", () => {
  it("transforms trampolined standard form factorial correctly", () => {
    const fact_: TrampolinedORSR<Fact> = (n) =>
      n > 1 ? E.left([(x) => n * x, [n - 1]]) : E.right(1);
    const fact: Fact = trampolineORSR(fact_);

    checkFact(fact, factRef);
  });

  it("transforms trampolined tail-call form factorial correctly", () => {
    const fact_: TrampolinedORSR<FactTr> = (n, acc) =>
      n > 1 ? E.left([undefined, [n - 1, n * acc]]) : E.right(acc);
    const fact: Fact = (n) => trampolineORSR(fact_)(n, 1);

    checkFact(fact, factTrRef);
  });

  it("transforms a stack-overflowing function into a not-overflowing one", () => {
    const adder_: TrampolinedORSR<AdderTr> = (n, acc) =>
      n > 1 ? E.left([undefined, [n - 1, acc + 1]]) : E.right(acc);
    const adder: Adder = (n: number) => trampolineORSR(adder_)(n, 0);

    checkAdder(adder, adderRef);
  });
});

describe("trampolineOR", () => {
  it("transforms trampolined standard form factorial correctly", () => {
    const fact_: TrampolinedOR<Fact> = (n) =>
      n > 1 ? E.left([(x) => n * x, () => fact_(n - 1)]) : E.right(1);
    const fact = trampolineOR(fact_);

    checkFact(fact, factRef);
  });

  it("transforms trampolined tail-call form factorial correctly", () => {
    const fact_: TrampolinedOR<FactTr> = (n, acc) =>
      n > 1 ? E.left([undefined, () => fact_(n - 1, n * acc)]) : E.right(acc);
    const fact: Fact = (n: number) => trampolineOR(fact_)(n, 1);

    checkFact(fact, factRef);
  });

  it("transforms a stack-overflowing function into a not-overflowing one", () => {
    const adder_: TrampolinedOR<AdderTr> = (n, acc) =>
      n > 1 ? E.left([undefined, () => adder_(n - 1, acc + 1)]) : E.right(acc);
    const adder: Adder = (n: number) => trampolineOR(adder_)(n, 0);

    checkAdder(adder, adderRef);
  });
});

describe("trampoline", () => {
  it("transforms trampolined standard form factorial correctly", () => {
    const fact_: Trampolined<Fact> = (next, n) =>
      n > 1 ? call(fact_, (x) => call(next, x * n), n - 1) : call(next, 1);
    const fact: Fact = trampoline(fact_);

    checkFact(fact, factRef);
  });

  it("transforms trampolined tail-call form factorial correctly", () => {
    const fact_: Trampolined<FactTr> = (next, n, acc) =>
      n > 1 ? call(fact_, next, n - 1, acc * n) : call(next, acc);
    const fact: Fact = (n) => trampoline(fact_)(n, 1);

    checkFact(fact, factTrRef);
  });

  it("transforms a stack-overflowing function into a not-overflowing one", () => {
    const adder_: Trampolined<AdderTr> = (next, n, acc) =>
      n > 1 ? call(adder_, next, n - 1, acc + 1) : call(next, acc);
    const adder: Adder = (n) => trampoline(adder_)(n, 0);

    checkAdder(adder, adderRef);
  });

  it("transforms naive Fibonacci correctly", () => {
    const fib_: Trampolined<Fib> = (next, n) =>
      n === 0 || n === 1
        ? call(next, 1)
        : call(fib_, (x) => call(fib_, (y) => call(next, x + y), n - 1), n - 2);
    const fib: Fib = trampoline(fib_);

    checkFib(fib, fibRef);
  });

  it("transforms mutually recursive even/odd functions correctly", () => {
    const even_: Trampolined<Predicate<number>> = (next, n) =>
      n === 0 ? call(next, true) : call(odd_, next, n - 1);
    const odd_: Trampolined<Predicate<number>> = (next, n) =>
      n === 0 ? call(next, false) : call(even_, next, n - 1);
    const even: Predicate<number> = trampoline(even_);
    const odd: Predicate<number> = trampoline(odd_);

    checkEvenOdd(even, odd);
  });

  it("transforms trampolined Ackerman function correctly", () => {
    const ack_: Trampolined<Ack> = (next, m, n) =>
      m === 0
        ? call(next, n + 1)
        : n === 0
        ? call(ack_, next, m - 1, 1)
        : call(ack_, (x) => call(ack_, next, m - 1, x), m, n - 1);
    const ack: Ack = trampoline(ack_);

    checkAck(ack, ackRef);
  });
});
