# ts-experiments

A small collection of Typescript experiments

## Contents

- [Deferred Computations](https://github.com/artemeknyazev/ts-experiments/tree/master/src/deferred-computations) -- a number of utilities for deferring computations, including
    - `Pr`, a `Promise`-like data type for sync/async computations conforming to `Monad` laws
    - Cat's-like `Eval` data structure for sync computations
    - various trampoliners with optional caching