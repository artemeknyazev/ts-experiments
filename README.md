# ts-experiments

A small collection of Typescript experiments

## Contents

- [Workflows/Sagas](/src/workflows) -- musings on a workflow framework for microservices influenced by talk ["Data Consistency in Microservice Using Sagas"](https://www.youtube.com/watch?v=txlSrGVCK18)
- [Deferred Computations](/src/deferred-computations) -- a number of utilities for deferring computations, including
  - `Pr`, a `Promise`-like data type for sync/async computations conforming to `Monad` laws
  - Cat's-like `Eval` data structure for sync computations
  - various trampoliners with optional caching
- eDSL experiments -- various experiments with eDSLs, tagged and tagless, and transformations between them
  - ["Building eDSLs in functional TypeScript" workshop files](/src/edsl/edsl-workshop) -- implementation directed by [Yuri Bogomolov's workshop](https://github.com/YBogomolov/workshop-edsl-in-typescript)
  - [Extendable eDSLs](/src/edsl/extendable-edsls) -- implementation of tagged extendable eDSLs for basic arithmetics along with some pitfalls. A more typesafe version than Arithmetics below
  - [Arithmetics](/src/edsl/arithmetics) -- a playground for tagged and tagless representation of basic arithmetics
  - [Handlers eDSL](/src/edsl/handlers-edsl) -- musings on eDSLs that have both creation-time and execution-time dependencies (e.g. DB operations that require a connection/client/transaction object for each operation); **tldr:** use `ReaderTaskEither`
