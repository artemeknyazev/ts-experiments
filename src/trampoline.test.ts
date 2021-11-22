import * as E from "fp-ts/lib/Either";
import { identity } from "fp-ts/lib/function";
import {
  trampolineORSR,
  TrampolinedORSR,
  trampolineOR,
  TrampolinedOR,
  trampoline,
  call,
  Trampolined,
} from "./trampoline";

// A recursive factorial function in a standard form
const factorialRef = (n: number): number =>
  n > 1 ? n * factorialRef(n - 1) : 1;

// A recursive factorial function in a tail-call form
const factorialTrRef_ = (n: number, acc: number): number =>
  n > 1 ? factorialTrRef_(n - 1, acc * n) : acc;
const factorialTrRef = (n: number) => factorialTrRef_(n, 1);

// A stack-unsafe (for large n ~ 2**16) recursive adder
const adderRef_ = (n: number, acc: number): number =>
  n > 1 ? adderRef_(n - 1, acc + 1) : acc;
const adderRef = (n: number) => adderRef_(n, 0);

// A naive Fibonacci
const fibRef = (n: number): number =>
  n === 0 || n === 1 ? 1 : fibRef(n - 1) + fibRef(n - 2);

// An Ackerman function
const ackRef = (m: number, n: number): number =>
  m === 0
    ? n + 1
    : n === 0
    ? ackRef(m - 1, 1)
    : ackRef(m - 1, ackRef(m, n - 1));

describe("trampolineORSR", () => {
  it("transforms trampolined standard form factorial correctly", () => {
    // A trampolined standard form factorial function
    const factorial_: TrampolinedORSR<[number], number> = (n) =>
      n > 1 ? E.left([(x) => n * x, [n - 1]]) : E.right(1);
    const factorial = trampolineORSR(factorial_);

    for (let i = 0; i < 10; i++) {
      expect(factorial(i)).toBe(factorialRef(i));
    }
  });

  it("transforms trampolined tail-call form factorial correctly", () => {
    // A trampolined tail-call form factorial function
    const factorial_: TrampolinedORSR<[number, number], number> = (n, acc) =>
      n > 1 ? E.left([undefined, [n - 1, n * acc]]) : E.right(acc);

    const factorial = (n: number) => trampolineORSR(factorial_)(n, 1);

    for (let i = 0; i < 10; i++) {
      expect(factorial(i)).toBe(factorialTrRef(i));
    }
  });

  it("transforms a stack-overflowing function into a not-overflowing one", () => {
    const adder_: TrampolinedORSR<[number, number], number> = (
      n: number,
      acc: number
    ) => (n > 1 ? E.left([undefined, [n - 1, acc + 1]]) : E.right(acc));

    const adder = (n: number) => trampolineORSR(adder_)(n, 0);

    // depends on Node's stack size: `node --v8-options | grep -A1 "stack-size"`
    const n = 2 ** 16;

    expect(() => {
      adderRef(n);
    }).toThrow();

    expect(() => {
      expect(adder(n)).toBe(n - 1);
    }).not.toThrow();
  });
});

describe("trampolineOR", () => {
  it("transforms trampolined standard form factorial correctly", () => {
    // A trampolined standard form factorial function
    const factorial_: TrampolinedOR<[number], number> = (n) =>
      n > 1 ? E.left([(x) => n * x, () => factorial_(n - 1)]) : E.right(1);
    const factorial = trampolineOR(factorial_);

    for (let i = 0; i < 10; i++) {
      expect(factorial(i)).toBe(factorialRef(i));
    }
  });

  it("transforms trampolined tail-call form factorial correctly", () => {
    // A trampolined tail-call form factorial function
    const factorial_: TrampolinedOR<[number, number], number> = (n, acc) =>
      n > 1
        ? E.left([undefined, () => factorial_(n - 1, n * acc)])
        : E.right(acc);

    const factorial = (n: number) => trampolineOR(factorial_)(n, 1);

    for (let i = 0; i < 10; i++) {
      expect(factorial(i)).toBe(factorialTrRef(i));
    }
  });

  it("transforms a stack-overflowing function into a not-overflowing one", () => {
    const adder_: TrampolinedOR<[number, number], number> = (
      n: number,
      acc: number
    ) =>
      n > 1 ? E.left([undefined, () => adder_(n - 1, acc + 1)]) : E.right(acc);

    const adder = (n: number) => trampolineOR(adder_)(n, 0);

    // depends on Node's stack size: `node --v8-options | grep -A1 "stack-size"`
    const n = 2 ** 16;

    expect(() => {
      adderRef(n);
    }).toThrow();

    expect(() => {
      expect(adder(n)).toBe(n - 1);
    }).not.toThrow();
  });
});

describe("trampoline", () => {
  it("transforms trampolined standard form factorial correctly", () => {
    // A thunkified function describing what happens at each iteration
    const factorial_: Trampolined<[number], number> = (next, n) =>
      n > 1 ? call(factorial_, (x) => call(next, x * n), n - 1) : call(next, 1);

    const factorial = trampoline(factorial_);

    for (let i = 0; i < 10; i++) {
      expect(factorial(i)).toBe(factorialRef(i));
    }
  });

  it("transforms trampolined tail-call form factorial correctly", () => {
    // A trampolined tail-call form factorial function
    const factorial_: Trampolined<[number, number], number> = (next, n, acc) =>
      n > 1 ? call(factorial_, (x) => x, n - 1, acc * n) : call(next, acc);

    const factorial = (n: number) => trampoline(factorial_)(n, 1);

    for (let i = 0; i < 10; i++) {
      expect(factorial(i)).toBe(factorialTrRef(i));
    }
  });

  it("transforms a stack-overflowing function into a not-overflowing one", () => {
    const adder_: Trampolined<[number, number], number> = (next, n, acc) =>
      n > 1 ? call(adder_, (x) => x, n - 1, acc + 1) : call(next, acc);

    const adder = (n: number) => trampoline(adder_)(n, 0);

    // depends on Node's stack size: `node --v8-options | grep -A1 "stack-size"`
    const n = 2 ** 16;

    expect(() => {
      adderRef(n);
    }).toThrow();

    expect(() => {
      expect(adder(n)).toBe(n - 1);
    }).not.toThrow();
  });

  it("transforms naive Fibonacci correctly", () => {
    const fib_: Trampolined<[number], number> = (next, n) =>
      n === 0 || n === 1
        ? call(next, 1)
        : call(fib_, (x) => call(fib_, (y) => call(next, x + y), n - 1), n - 2);
    const fib = trampoline(fib_);

    for (let i = 0; i < 30; i++) {
      expect(fib(i)).toBe(fibRef(i));
    }
  });

  it("transforms mutually recursive even/odd functions correctly", () => {
    const even_: Trampolined<[number], boolean> = (next, n) =>
      n === 0 ? call(next, true) : call(odd_, identity, n - 1);
    const odd_: Trampolined<[number], boolean> = (next, n) =>
      n === 0 ? call(next, false) : call(even_, identity, n - 1);
    const even = trampoline(even_);
    const odd = trampoline(odd_);

    for (let i = 0; i < 20; i++) {
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
  });

  it.skip("transforms trampolined Ackerman function correctly", () => {
    // TODO: fix this!
    const ack_: Trampolined<[number, number], number> = (next, m, n) =>
      m === 0
        ? (console.log("1", m, n), call(next, n + 1))
        : n === 0
        ? (console.log("2", m, n),
          call(
            ack_,
            (x) => {
              console.log("m > 0, n = 0", x);
              return x;
            },
            m - 1,
            1
          ))
        : (console.log("3", m, n),
          call(
            ack_,
            (x) => {
              console.log("m > 0, n > 0 (1)", x);
              return x + 1;
              return call(ack_, identity, m - 1, x);
            },
            m,
            n - 1
          ));
    const ack = trampoline(ack_);
    console.log(ack(2, 0));

    // console.log(1, ack_(identity, 0, 2));

    // expect(ack(0, 0)).toBe(ackRef(0, 0));
    // expect(ack(1, 0)).toBe(ackRef(1, 0));
    // expect(ack(2, 0)).toBe(ackRef(2, 0));
    // expect(ack(2, 0)).toBe(ackRef(2, 0));
    // expect(ack(0, 2)).toBe(ackRef(0, 2));
    // expect(ack(1, 0)).toBe(ackRef(1, 0));
  });
});

describe("trampolineCached", () => {
  it("", () => {
    // TODO: Fibbonaci
  });

  it("", () => {
    // TODO: mutual recursion
  });

  it("transforms trampolined Ackerman function correctly", () => {
    // TODO: transform `ack`
  });
});
