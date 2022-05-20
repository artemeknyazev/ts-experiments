/* Types */

type Tx<T> = () => Promise<T>;
type Cx = () => Promise<unknown>;

export class ReadOnly<T> {
  constructor(public tx: Tx<T>) {}
}

export class Mutating<T> {
  constructor(public tx: Tx<T>, public cx?: Cx) {}
}

type Step<T> = ReadOnly<T> | Mutating<T>;

export type Workflow = Generator<Step<any>, void, any>;

/* Constructors */

export const readOnly = <T>(tx: Tx<T>): ReadOnly<T> => new ReadOnly<T>(tx);

export const mutating = <T>(tx: Tx<T>, cx?: Cx): Mutating<T> =>
  new Mutating<T>(tx, cx);

/* Workflow executor */

export async function run(workflow: Workflow): Promise<void> {
  // a list of compensating functions
  let cxs: Cx[] = [];
  // is the whole workflow compensatable
  let isCompensatable: boolean = true;
  // should the workflow be unrolled
  let isUnroll: boolean = false;
  let unrollReason: unknown;

  let next: IteratorResult<Step<unknown>>;
  // acquire first value
  try {
    next = workflow.next();
  } catch (e) {
    // received a synchronous error, unroll
    isUnroll = true;
    unrollReason = e;
  }

  // iterate each generator step
  while (!isUnroll && !next!.done) {
    const flow = next!.value;
    // error out if an unknown value is yielded
    if (!(flow instanceof ReadOnly || flow instanceof Mutating)) {
      isUnroll = true;
      unrollReason = new Error("Unknown workflow step type");
      break;
    }

    try {
      // try executing
      const res = await flow.tx();
      try {
        // inject result into workflow
        next = workflow.next(res);
      } catch (e) {
        // received a synchronous error, unroll
        isUnroll = true;
        unrollReason = e;
      }
    } catch (e1) {
      // external call/async error
      try {
        // try throwing it inside workflow to potentially handle it there
        next = workflow.throw(e1);
      } catch (e2) {
        // external call error is not handled inside workflow, unroll
        isUnroll = true;
        unrollReason = e2;
        break;
      }
    }

    // execution succeeded
    if (flow instanceof Mutating) {
      if (flow.cx && isCompensatable) {
        // this is a mutating compensatable step
        // all previous steps were compensatable
        // add compensating function to a list
        cxs.push(flow.cx);
      } else {
        // this is a mutating not compensatable step
        // consider the whole workflow not compensatable
        isCompensatable = false;
        cxs = [];
      }
    }
  }

  // unroll if error happened
  if (isUnroll) {
    for (const cx of cxs.reverse()) {
      // compensating function error means the state is unknown
      // this can only be handled by a caller, so no try-catch
      await cx();
    }
    throw unrollReason;
  }
}
