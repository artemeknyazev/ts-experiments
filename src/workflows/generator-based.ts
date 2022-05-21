/* Types */

type Tx<T> = () => Promise<T>;
type Cx = () => Promise<unknown>;

export class ReadOnly<T> {
  constructor(public tx: Tx<T>) {}
}

export class Mutating<T> {
  constructor(public tx: Tx<T>, public cx: Cx) {}
}

export class Pivot<T> {
  constructor(public tx: Tx<T>) {}
}

type Step<T> = ReadOnly<T> | Mutating<T> | Pivot<T>;

export type Workflow = Generator<Step<any>, void, any>;

/* Constructors */

export const readOnly = <T>(tx: Tx<T>): ReadOnly<T> => new ReadOnly<T>(tx);

export const mutating = <T>(tx: Tx<T>, cx: Cx): Mutating<T> =>
  new Mutating<T>(tx, cx);

export const pivot = <T>(tx: Tx<T>): Pivot<T> => new Pivot<T>(tx);

/* Workflow executor */

export async function run(workflow: Workflow): Promise<void> {
  // a list of compensating functions
  let cxs: Cx[] = [];
  // a number of pivot operations happened during the workflow
  let nPivots: number = 0;
  // should the workflow be unrolled
  let unrollReason: unknown;

  let next: IteratorResult<Step<unknown>>;
  let res: unknown;

  try {
    next = workflow.next();
  } catch (e) {
    unrollReason = e;
  }

  while (!unrollReason && !next!.done) {
    const flow = next!.value;

    try {
      // execute async operation
      res = await flow.tx();
    } catch (e1) {
      // async exception caught
      try {
        // try rethrowing into workflow -- this acquires a next workflow step;
        // compensating operation is not added, because the atomic forward
        // operation didn't succeed, so nothing to compensate
        next = workflow.throw(e1);
        continue;
      } catch (e2) {
        // rethrowing didn't succeed, unroll
        unrollReason = e2;
        break;
      }
    }

    // async operation succeeds, register its aftereffects
    if (flow instanceof Mutating) {
      cxs.push(flow.cx);
    } else if (flow instanceof Pivot) {
      nPivots++;
    }

    // try acquiring next workflow step
    try {
      next = workflow.next(res);
      continue;
    } catch (e) {
      // caught a sync exception that is not caught inside workflow, unroll
      unrollReason = e;
      break;
    }
  }

  // unroll if error happened
  if (unrollReason) {
    // workflow is not revertible if there were completed pivot operations
    if (nPivots) {
      throw unrollReason;
    }

    for (const cx of cxs.reverse()) {
      // compensating function error means the state is unknown
      // this can only be handled by a caller, so no try-catch
      await cx();
    }
    throw unrollReason;
  }
}
