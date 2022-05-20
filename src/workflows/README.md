# Workflows/Sagas

## Introduction

**NOTE:** ideas for this experiment are acquired from a talk ["Data Consistency in Microservice Using Sagas"](https://www.youtube.com/watch?v=txlSrGVCK18)

A **workflow** is a list of potentially revertible steps that may be reverted as a whole. **Workflows** (or **sagas**) are commonly used in microservice architecture to implement a semi-transactional behavior when calling multiple microservices.

### Key terms&Ideas

- an **orchestrator** microservice sequentially calls multiple **worker** microservices
- each call is abstracted as a workflow **step**
- revertible steps are called **compensatable,** e.g. write a new value by key to a key-value storage is compensatable by rewriting it with a previous value, or removing that value
- not revertible steps are called **not compensatable,** e.g. sending a message to a message broker
- if a step fails, all previous steps a reverted, i.e. **compensated**
- one not compensatable step makes a part of a workflow after it not compensatable:
  - error before a not compensatable step reverts a workflow
  - error after a not compensatable step doesn't revert a workflow

## Implementations

### Generator-based

- [`generator-based.ts`](./generator-based.ts) -- a reference implementation more or less similar to [`redux-saga`](https://github.com/redux-saga/redux-saga)
  - `readOnly` abstracts a read-only async operation that does not modify external state, so no compensation is required
  - `mutating` abstracts a mutating async operation that modifies external state
    - `mutating(<tx>)` -- describes a not compensatable mutating operation `tx`
    - `mutating(<tx>, <cx>)` -- describes a mutating operation `tx` compensatable by a `cx` call
- [`generator-based.test.ts`](./generator-based.test.ts) -- tests for a reference implementation
- [`generator-based.example.test.ts`](./generator-based.example.test.ts) -- an example workflow with both compensatable and not steps

#### Pros&Cons

- Good, because uses simple language-specific features (generators)
- Good, because any existing code can be more or less simply translated into a workflow code
- Bad, because a result of a `yield` call can't be properly typed
  - `yield`-expression return type uses a `TYield` type of a `Generator`
  - in presence of multiple workflow steps that return different types, `TYield` can be described as
    - a union type of all return types
    - an `unknown`
    - an `any`
  - performing type-conversion/narrowing manually is not conventient, so return type of `yield`-expression in workflows is `any`, meaning we loose type information and a developer should manually check if return types of effects are still applicable at call sites
