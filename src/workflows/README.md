# Workflows/Sagas

## Contents

- [Introduction](#introduction)
- [Key Terms&Ideas](#key-termsideas)
- [Implementations](#implementations)
  - [Generator-based](#generator-based)
  - [Async-based](#async-based)
  - [Async-based with `AsyncLocalStorage`](#async-based-with-asynclocalstorage)
  - [State machine-based](#state-machine-based)

## Introduction

**NOTE:** ideas for this experiment are acquired from a talk ["Data Consistency in Microservice Using Sagas"](https://www.youtube.com/watch?v=txlSrGVCK18)

A **workflow** is a list of potentially revertible steps that may be reverted as a whole. **Workflows** (or **sagas**) are commonly used in microservice architecture to implement a semi-transactional behavior when calling multiple microservices.

### Key Terms&Ideas

- an **orchestrator** microservice sequentially calls multiple **worker** microservices
- each call is abstracted as a workflow **step**
- each step is a transaction having ACID properties; external calls being atomic ensures us that they either succeed or fail with no intermediate semi-success state
- this allows us to define a "reverse" or a **compensation** for each step, i.e. a call (may be not transactional) that reverts changes applied on this step
- revertible steps are called **compensatable** or **mutating,** e.g. write a new value by key to a key-value storage is compensatable by rewriting it with a previous value, or removing that value
- not revertible steps are called **not compensatable** or **pivot,** e.g. sending a message to a message broker
- if a step fails, all previous steps are reverted, i.e. **compensated**
- a pivot step makes a part of a workflow after it not compensatable:
  - error before a pivot step reverts a workflow
  - error during a pivot step still reverts a workflow, because all actions are assumed to be transactional
  - error after a pivot step doesn't revert a workflow
- all ideas above produce ACD (atomicity, consistency, durability), i.e. ACID without isolation, or BASE (basically available, soft state, eventually consistent) as described in [paper](https://queue.acm.org/detail.cfm?id=1394128)

## Implementations

### Generator-based

- [`generator-based.ts`](./generator-based.ts) -- a reference implementation more or less similar to [`redux-saga`](https://github.com/redux-saga/redux-saga)
  - `readOnly` abstracts a read-only async operation that does not modify external state, so no compensation is required
  - `mutating` abstracts a mutating async operation that modifies external state
    - `mutating(<tx>)` -- describes a not compensatable mutating operation `tx`
    - `mutating(<tx>, <cx>)` -- describes a mutating operation `tx` compensatable by a `cx` call
- [`generator-based.test.ts`](./generator-based.test.ts) -- tests for the reference implementation
- [`generator-based.example.test.ts`](./generator-based.example.test.ts) -- an example workflow with both compensatable and pivot steps

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

### Async-based

- a read-only operation is just an async operation, no wrappers needed
- `pivot(<ctx>, <tx>)` abstracts a not compensatable/pivot operation
- `mutating(<ctx>, <tx>, <cx>)` abstracts a compensatable mutating operation
- both use a `Context` object to capture the order of compensating operations an existence of pivot ones
- `workflow` creates a context and passes it to a workflow factory function, returning a workflow executor that handles potential compensation

#### Pros&Cons

- Good, because uses even simpler language-specific features (Promise, async/await)
- Good, because any existing code requires only small changes to wrap mutating operations
- Good, because preserves type information about return types
- Bad, because requires manual context passing (`ctx` in a workflow factory function)

### Async-based with `AsyncLocalStorage`

- [`async-based.ts`](./async-based.ts) -- a reference implementation
  - a read-only operation is just an async operation, no wrappers needed
  - `pivot(<tx>)` abstracts a not compensatable/pivot operation
  - `mutating(<tx>, <cx>)` abstracts a compensatable mutating operation
  - `workflow` executes a workflow factory function, returning a workflow executor that handles potential compensation
  - a workflow context is bound internally using an `AsyncLocalStorage`
- [`async-based.test.ts`](./async-based.test.ts) -- tests for the reference implementation
- [`async-based.example.test.ts`](./async-based.example.test.ts) -- an example workflow with both compensatable and pivot steps

#### Pros&Cons

- Same as with [async-based](#async-based)
- Good, because eliminates the need of manual context-passing
- Bad, because there [_may be_ problems with context loss in async code](https://nodejs.org/api/async_context.html#troubleshooting-context-loss)

### State machine-based

- Similar to [`AWS Step Functions`,](https://aws.amazon.com/step-functions/) maybe implemented with [`xstate`](https://xstate.js.org/docs/)
- A workflow is defined as a state machine
  - each node corresponds to an external async operation
  - upon completion, a node may choose an edge to go to
  - async operations in nodes share a global state
  - global state together with a current node's id is serializable
- TBD

#### Pros&Cons

- Good, because unlike other implementations execution can be started at any point, meaning it can be abstracted as something like `AWS Step Functions`, executing only after external result is acquired
- TBD
