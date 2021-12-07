# ts-experiments

A small collection of Typescript experiments

## Contents

- [Deferred Computations](/src/deferred-computations) -- a number of utilities for deferring computations, including
  - `Pr`, a `Promise`-like data type for sync/async computations conforming to `Monad` laws
  - Cat's-like `Eval` data structure for sync computations
  - various trampoliners with optional caching
- eDSL experiments -- various experiments with eDSLs, tagged and tagless, and transformations between them
  - ["Building eDSLs in functional TypeScript" workshop files](/src/edsl/edsl-workshop) -- implementation directed by [Yuri Bogomolov's workshop](https://github.com/YBogomolov/workshop-edsl-in-typescript)
  - [Extendable eDSLs](/src/edsl/extendable-edsls) -- implementation of tagged extendable eDSLs for basic arithmetics along with some pitfalls. A more typesafe version than Arithmetics below
  - [Arithmetics](/src/edsl/arithmetics) -- a playground for tagged and tagless representation of basic arithmetics
