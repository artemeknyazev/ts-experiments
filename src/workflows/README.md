# Workflows/Sagas

## Contents

- [Introduction](#introduction)
- [Key Terms&Ideas](#key-termsideas)
- [Implementations](#implementations)
  - [Generator-based](#generator-based)
  - [Async-based](#async-based)
  - [Async-based with `AsyncLocalStorage`](#async-based-with-asynclocalstorage)
  - [State machine-based](#state-machine-based)
  - [Other variants](#other-variants)

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
- compensatable/mutating step consists of **forward** `Tx[i]` and **compensating** `Cx[i]` operations
- pivot step consists only of forward `Tx[i]` operation
- if a step fails, all previous steps are reverted, or **"compensated"** -- i.e. if a step `Tx[i]` fails, then compensating operations starting from a previous step are called in a reverse order, i.e. `Cx[i-1]`, `Cx[i-2]`, ... `Cx[0]`
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

- A workflow is defined as a state machine
- each node corresponds to a transactional external async operation
- all code in all nodes share a global state
- each node contains:
  - `before` hook (optional) represents what to do before an external operation executes, e.g. a data preparation step
  - `execute` hook (required) represents a _description_ of an operation to perform, e.g. external call with what arguments taken from what parts of a global state to perform
  - `after` hook (optional) represents a bookkeeping operation of storing an operation result in global state and choosing what node to go to next
- global state together with current node's id is serializable
- workflow execution can be paused and resumed when a trigger event happened, e.g. timer fires, or an event is received
- compensating operations can be implemented as
  - either a list of descriptions of compensating operations to be performed which is executed in a separate looping step,
  - or each compensating operation can be defined as a `Cx[i]` node and a forward `Tx[i+1]` operation sends execution to `Cx[i]` node on error,
  - and executed when some node reroutes execution to a specific "revert sink" node
- workflows are executed with an engine
  - it is either a separate microservice executing all existing workflows,
  - or just a library code that executes workflows located in different microservices
- implementation can be
  - either language-agnostic -- before and after hooks, and execute params are described as expressions in some DSL,
  - or language-dependent, where
    - each node has
      - required `label: NodeLabel` node label
      - required `execute` hook _descriptor_ with definition of required forward and optional compensating operations
      - optional `before` hook, e.g. `before(state: GlobalState, next: (patch: StatePatch) => unknown): void`
      - optional `after` after hook, e.g. `after<TStepResult>(state: GlobalState, stepResult: TStepResult, next: (nodeLabel: NodeLabel, patch: StatePatch) => unknown): void`
    - and a state machine is described as a set of nodes, where one node is marked as a source node and multiple nodes may be marked as sink nodes: "success" sinks, "fail" sinks, and "fail-revert" sinks
    - assumptions are made that
      - code in `before` and `after` hooks runs very quickly (in ~2-10ms range),
      - and execute hook defines
        - either async operations where an engine waits for the result of an async call (REST, gRPC, etc.), and this waiting is done by a separate thread/process/executor,
        - or a request-reply pattern, where a message with "reply-to" parameter is sent into an external worker's request queue, execution is paused and resumed only when the message is received
      - so that one engine can have a large throughput for executions
- workflows must be versioned, to not override state machines for existing executions during deployment of new versions

#### Pros&Cons

- Good, because unlike other implementations execution can be started at any point, meaning it can be abstracted as something like `AWS Step Functions`, executing only after external result is acquired, or external event is triggered
- Good, because hooks'. and descriptors' implementations, and global state can be sufficiently typed
- Bad, because additional observation tools should be implemented, e.g. a list of currently running and finished workflows, their state including an ending one and state change history
- Bad, because state machine can become too complex, though visualization tools partially help
- Bad, because migrating from existing async-/generator-based workflows to state machine-based requires sufficient rewriting
- Bad, because implementation is sufficiently complex and requires a separate one-two person team to support it

### Other Variants

- [`AWS Step Functions`,](https://aws.amazon.com/step-functions/) [`GCP Workflows,`](https://cloud.google.com/workflows) [`Azure Logic Apps`](https://docs.microsoft.com/en-us/azure/logic-apps/logic-apps-overview)
  - state machine-based representation of a workflow
  - compensating operations can be implemented the same way as in [state machine-based variant above](#state-machine-based)
    - either a list of descriptions of compensating operations to be performed which is executed in a separate looping step,
    - or each compensating operation can be defined as a `Cx[i]` node and a forward `Tx[i+1]` operation sends execution to `Cx[i]` node on error
  - **Pros&Cons**
    - Good, because it's a managed service
      - observability&alerts
      - execution monitoring: can see a list of currently executing and past workflows -- what states they are in and their history of execution
    - Good, because feature rich
      - control structures like branching/looping can be implemented
      - execution can be paused and resumed on external triggers, e.g. received a message, or timer started
      - seamless communication with other managed services in the vendor-specific cloud
    - Bad, because located in vendor-specific clouds -- migrating workflows&workers from one vendor to another is not straightforward, and migrating workflows&workers from a vendor to a self-managed cloud is even more cumbersome
- [`BPMN`]()/[`BPEL`]()
  - a separate language for describing business workflows
  - can be used to describe executible workflows
  - execution of a workflow requires an engine, see [here](https://en.wikipedia.org/wiki/List_of_BPMN_2.0_engines) and [here](https://en.wikipedia.org/wiki/List_of_BPEL_engines) for a list self-managed services
  - **Pros&Cons**
    - Good, because a workflow can be represented visually, which is great for communication with BAs and non-technical people
    - Bad, because executing engine is a self-managed black box service -- another point of failure, need to assess risks, need to assess security
    - Otherwise, pros&cons are similar to cloud solutions above
