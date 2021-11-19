import * as E from "fp-ts/lib/Either";
import {
  trampolineORSR,
  TrampolinedORSR,
  trampolineOR,
  TrampolinedOR,
} from "./trampoline";

describe("trampolineORSR", () => {
  it("transforms trampolined standard form factorial correctly", () => {
    // A recursive factorial function in a standard form
    const f = (n: number): number => (n > 1 ? n * f(n - 1) : 1);

    // A trampolined standard form factorial function
    const ftr_: TrampolinedORSR<[number], number> = (n) =>
      n > 1 ? E.left([(x) => n * x, [n - 1]]) : E.right(1);
    const ftr = trampolineORSR(ftr_);

    for (let i = 0; i < 10; i++) {
      expect(ftr(i)).toBe(f(i));
    }
  });

  it("transforms trampolined tail-call form factorial correctly", () => {
    // A recursive factorial function in a tail-call form
    const f_ = (n: number, acc: number): number =>
      n > 1 ? f_(n - 1, acc * n) : acc;

    const f = (n: number) => f_(n, 1);

    // A trampolined tail-call form factorial function
    const ftr_: TrampolinedORSR<[number, number], number> = (n, acc) =>
      n > 1 ? E.left([undefined, [n - 1, n * acc]]) : E.right(acc);

    const ftr = (n: number) => trampolineORSR(ftr_)(n, 1);

    for (let i = 0; i < 10; i++) {
      expect(ftr(i)).toBe(f(i));
    }
  });

  it("transforms a stack-overflowing function into a not-overflowing one", () => {
    const f_ = (n: number, acc: number): number =>
      n > 1 ? f_(n - 1, acc + 1) : acc;
    const f = (n: number) => f_(n, 0);

    const ftr_: TrampolinedORSR<[number, number], number> = (
      n: number,
      acc: number
    ) => (n > 1 ? E.left([undefined, [n - 1, acc + 1]]) : E.right(acc));

    const ftr = (n: number) => trampolineORSR(ftr_)(n, 0);

    // depends on Node's stack size: `node --v8-options | grep -A1 "stack-size"`
    const n = 2 ** 16;

    expect(() => {
      f(n);
    }).toThrow();

    expect(() => {
      expect(ftr(n)).toBe(n - 1);
    }).not.toThrow();
  });
});

describe("trampolineOR", () => {
  it("transforms trampolined standard form factorial correctly", () => {
    // A recursive factorial function in a standard form
    const f = (n: number): number => (n > 1 ? n * f(n - 1) : 1);

    // A trampolined standard form factorial function
    const ftr_: TrampolinedOR<[number], number> = (n) =>
      n > 1 ? E.left([(x) => n * x, () => ftr_(n - 1)]) : E.right(1);
    const ftr = trampolineOR(ftr_);

    for (let i = 0; i < 10; i++) {
      expect(ftr(i)).toBe(f(i));
    }
  });

  it("transforms trampolined tail-call form factorial correctly", () => {
    // A recursive factorial function in a tail-call form
    const f_ = (n: number, acc: number): number =>
      n > 1 ? f_(n - 1, acc * n) : acc;

    const f = (n: number) => f_(n, 1);

    // A trampolined tail-call form factorial function
    const ftr_: TrampolinedOR<[number, number], number> = (n, acc) =>
      n > 1 ? E.left([undefined, () => ftr_(n - 1, n * acc)]) : E.right(acc);

    const ftr = (n: number) => trampolineOR(ftr_)(n, 1);

    for (let i = 0; i < 10; i++) {
      expect(ftr(i)).toBe(f(i));
    }
  });

  it("transforms a stack-overflowing function into a not-overflowing one", () => {
    const f_ = (n: number, acc: number): number =>
      n > 1 ? f_(n - 1, acc + 1) : acc;
    const f = (n: number) => f_(n, 0);

    const ftr_: TrampolinedOR<[number, number], number> = (
      n: number,
      acc: number
    ) =>
      n > 1 ? E.left([undefined, () => ftr_(n - 1, acc + 1)]) : E.right(acc);

    const ftr = (n: number) => trampolineOR(ftr_)(n, 0);

    // depends on Node's stack size: `node --v8-options | grep -A1 "stack-size"`
    const n = 2 ** 16;

    expect(() => {
      f(n);
    }).toThrow();

    expect(() => {
      expect(ftr(n)).toBe(n - 1);
    }).not.toThrow();
  });

  // TODO: mutually recursive test case for `transformOR`
});
