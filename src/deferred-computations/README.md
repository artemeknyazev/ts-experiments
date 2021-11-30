# Deferred Computations

## Contents

- `Pr.ts` -- `Promise`-like data type conforming to `Monad` interface and laws
- `Eval.ts` -- Cat's `Eval`-like data type for synchronous thunks conforming to `Monad` interface and laws
- `Ev.ts` -- same as `Eval` but receives a function and it's arguments, and not a thunk; can cache intermediate results
- `trampoline.ts` -- various trampoliners for synchronous recursive functions

## `Pr.ts`

- A custom `Promise`-like data type conforming to `Monad` laws
- Implements `fp-ts`'s required `Monad` methods

```typescript
import { pipe } from "fp-ts/lib/function";
import { of, then, unwrap } from "./Pr";

const n = 1;
pipe(
  of(n), // or `wrap(() => n)`
  then((n) => of(String(n))),
  unwrap((a) => {
    expect(a).toBe(String(a));
  })
);
```

```typescript
import { pipe } from "fp-ts/lib/function";
import { of, then, wrap, flatten, Pr } from "./Pr";

// Next call should be deferred, so it is `wrap`'ed, but this requires
// - flattening `fact_`'s result before doing further calculations
// - wrapping twice results of non-recursive cases
const fib_ = (n: number): Pr<Pr<number>> =>
  n === 0 || n === 1
    ? of(of(1))
    : wrap(() =>
        pipe(
          fib_(n - 1),
          flatten,
          then((x) =>
            pipe(
              fib_(n - 2),
              flatten,
              then((y) => of(x + y))
            )
          )
        )
      );
const fib = (n: number): Pr<number> => flatten(fib_(n));
```

## `Eval.ts`

- A lazy evaluator inspired by/adopted from [Cats's Eval.](https://typelevel.org/cats/datatypes/eval.html)
- Works only for synchronous functions
- Use `ev.value` to evaluate and access the result
- Supports result memoization (only returns value per-`Eval` object, not results for internal recursion)
- `now`, `later`, `always` helpers construct `Eval` with required evaluation/memoization strategy
- Conforms to `Monad` laws (with `after` as `chain`) and implements `Monad` interface from `fp-ts`

```typescript
import { Eval, always } from "./Eval";

// Naive factorial
const factorial_ = (n: number): Eval<number> =>
  always(() => (n > 1 ? factorial_(n - 1).after((x) => x * n) : 1));
const factorial = (n: number): number => factorial_(n).value;
```

```typescript
import { Eval, always } from "./Eval";

// Tail call-optimized factorial
const factorial_ = (n: number, acc: number): Eval<number> =>
  always(() => (n > 1 ? factorial_(n - 1, n * acc) : acc));
const factorial = (n: number) => factorial_(n, 1).value;
```

```typescript
import { Eval, always } from "./Eval";

// Naive Fibonacci
const fib_ = (n: number): Eval<number> =>
  always(() =>
    n === 0 || n === 1
      ? 1
      : fib_(n - 1).after((x) => fib_(n - 2).after((y) => x + y))
  );
const fib = (n: number) => fib_(n).value;
```

```typescript
import { Eval, always } from "./Eval";

// Mutual recursion
const even_ = (n: number): Eval<boolean> =>
  always(() => (n === 0 ? true : odd_(n - 1)));
const odd_ = (n: number): Eval<boolean> =>
  always(() => (n === 0 ? false : even_(n - 1)));
const even = (n: number): boolean => even_(n).value;
const odd = (n: number): boolean => odd_(n).value;
```

## `Ev.ts`

- Same lazy evaluator as `Eval` but supports caching of all intermediate values
- Is called `ev(<function>)(...<args>)`
- `ev` works the same way as `Eval`
- `evMemo` uses the default internal cache for all intermediate results
- `createEv` creates an `ev`-like function with a custom cache object. See `EvCache` interface and `EvDefaultCache` default cache implementation

```typescript
import { ev, EvF } from "./Ev";

// Naive factorial
type Fact = (n: number) => number;
const fact_: EvF<Fact> = (n: number) =>
  n > 1 ? ev(fact_)(n - 1).after((x) => x * n) : 1;
const fact: Fact = (n) => ev(fact_)(n).value;
```

```typescript
import { ev, EvF } from "./Ev";

// Naive Fibonacci
type Fib = (n: number) => number;
const fib_: EvF<Fib> = (n: number) =>
  n === 0 || n === 1
    ? 1
    : ev(fib_)(n - 1).after((x) => ev(fib_)(n - 2).after((y) => x + y));
const fib: Fib = (n) => ev(fib_)(n).value;
```

```typescript
import { ev, EvF } from "./Ev";

// Mutual recursion
type Predicate<A> = (x: A) => boolean;
const even_: EvF<Predicate<number>> = (n: number) =>
  n === 0 ? true : ev(odd_)(n - 1);
const odd_: EvF<Predicate<number>> = (n: number) =>
  n === 0 ? false : ev(even_)(n - 1);
const even: Predicate<number> = (n) => ev(even_)(n).value;
const odd: Predicate<number> = (n) => ev(odd_)(n).value;
```

```typescript
import { ev, EvF } from "./Ev";

// Ackerman function
type Ack = (m: number, n: number) => number;
const ack_: EvF<Ack> = (m: number, n: number) =>
  m === 0
    ? n + 1
    : n === 0
    ? ev(ack_)(m - 1, 1)
    : ev(ack_)(m, n - 1).after((x) => ev(ack_)(m - 1, x));
const ack: Ack = (m, n) => ev(ack_)(m, n).value;
```

## `trampoline.ts`

An attempt to write stack-safe recursive function evaluators

### `trampolineORSR`

- Evaluates a once-recursive self-recursive function
- Explicitly stack-based
- The wrapped function
  - must converge
  - for a non-recursive case must return `Either.right(<value>)`
  - for a recursive case must return `Either.left([<result combinator | undefined>, [...<next call args>]])`

```typescript
import * as E from "fp-ts/Either";
import { TrampolinedORSR, trampolineORSR } from "./trampoline";

// Naive factorial
type Fact = (x: number) => number;
const fact_: TrampolinedORSR<Fact> = (n) =>
  n > 1 ? E.left([(x) => n * x, [n - 1]]) : E.right(1);
const fact: Fact = trampolineORSR(fact_);
```

### `trampolineOR`

- Same as `trampolineORSR`, but a non-recursive case must return an optional result combinator and a thunk (instead of a next call arguments), making mutual recursion available

```typescript
import * as E from "fp-ts/Either";
import { TrampolinedOR, trampolineOR } from "./trampoline";

// Naive factorial
type Fact = (x: number) => number;
const fact_: TrampolinedOR<Fact> = (n) =>
  n > 1 ? E.left([(x) => n * x, () => fact(n - 1)]) : E.right(n);
const fact: Fact = trampolineOR(fact_);
```

### `trampoline`

- Similar to `trampolineOr`, but utilizes a `next` callback to bring the computed result out of this iteration
- Implicit stack is constructed in memory using
  - a `call` function that defers a call to a provided function with specified list of arguments
  - optional result combinator thunks binding some data from the iteration they were created in
- The wrapped function
  - must accept `next` function as the first parameter
  - returns `call(next, <result>)` for the non-recursive case
  - returns `call(<recursive function>, <result transformer or next>, ...<arguments>)` for the recursive case

```typescript
import { Trampolined, trampoline, call } from "./trampoline";

// Naive factorial
type Fact = (x: number) => number;
const fact_: Trampolined<Fact> = (next, n) =>
  n > 1 ? call(fact_, (x) => call(next, x * n), n - 1) : call(next, 1);
const fact: Fact = trampoline(fact_);
```

```typescript
import { Trampolined, trampoline, call } from "./trampoline";

// Naive Fibonacci
type Fib = (x: number) => number;
const fib_: Trampolined<Fib> = (next, n) =>
  n === 0 || n === 1
    ? call(next, 1)
    : call(fib_, (x) => call(fib_, (y) => call(next, x + y), n - 1), n - 2);
const fib: Fib = trampoline(fib_);
```

```typescript
import { Trampolined, trampoline, call } from "./trampoline";

// Ackerman function
type Ack = (m: number, n: number) => number;
const ack_: Trampolined<Ack> = (next, m, n) =>
  m === 0
    ? call(next, n + 1)
    : n === 0
    ? call(ack_, next, m - 1, 1)
    : call(ack_, (x) => call(ack_, next, m - 1, x), m, n - 1);
const ack: Ack = trampoline(ack_);
```
