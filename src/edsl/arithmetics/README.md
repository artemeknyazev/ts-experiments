# Arithmetics DSL

A playground for writing an arithmetics-themed DSL, supporting operations such as

- `cnst` to inject values into term sequences
- `neg` -- unary `-`
- `add`, `sub`, `mul`, `div` -- `+`, `-`, `*`, `/`
- `pow` -- power operation, e.g. `pow(2, 8)` ~ `2 ** 8`

There are two algebras, one containing all operations except `pow` (base algebra), and the other one with a single `pow` operator along with altered `const` command interpretation (extended algebra).

## [`tagged.ts`](/src/edsl/arithmetics/tagged.ts)

Each tagged algebra has two interpreters, one calculating a numerical result of an expression (`evaluateNum*`), and the other one returning a string representation of an expression (`evaluateStr*`).

There are not-extendable interpreters (`evaluateNum`, `evaluateStr`) that are "closed", i.e. only call themselves, and there are extendable interpreter creators (`evaluateNumF`, `evaluateStrF`, `evaluateNumExtF`, `evaluateStrExtF`), which are functions having an interpreter as theirs fixed point.

`evaluateStrFEval` and `evaluateExtStrFEval` are hand-written interpreter creators that lift calculations to `Eval` monad, ensuring stack safety.

**NOTE:** the typing for the operations here is wrong, because operations of the base algebra can't accept operations of an extended one. All

## [`tagless.ts`](/src/edsl/arithmetics/tagless.ts)

These are tagless algebras, so no "evaluating" interpreters required. Instead, each set of operations is called an interpreter with the same shape as the algebra interface, and can be passed as a dependency to some function.

`interpreterNum` and `interpreterStr` calculate using the base algebra, and `interpreterExtNum` and `interpreterExtStr` calculate using the extended algebra.

`interpreterNumEval` is an interpreter manually lifted to `Eval` monad. `arithmeticsInterpreterLiftM` is a function that lifts a base interpreter to some monad `M`. `interpreterStrEval` is an automatically lifted interpreter. `arithmeticsInterpreterExtLiftM` is a lifter for extended algebra depending on a lifter for the base one. `interpreterExtNumEval` and `interpreterExtStrEval` are interpreters automatically lifted to `Eval` monad.

## [`transformations.ts`](/src/edsl/arithmetics/transformations.ts)

This file contains tagless interpreters constructed from operations of a tagged one and tagged interpreters that perform calculations for each operation using a tagless interpreter.

`getEvaluate[Ext]ByTagless[Ext]FM` are interpreters for tagged algebras (base and extended) that use a tagless interpreter for calculations while automatically lifting a tagless interpreter to some monad `M` to achieve stack safety.
