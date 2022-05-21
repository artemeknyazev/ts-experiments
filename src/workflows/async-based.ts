import { AsyncLocalStorage } from "node:async_hooks";

type Tx<T> = () => Promise<T>;
type Cx = () => Promise<unknown>;

class Context {
  public cxs: (
    | { cx: Cx; isError: boolean }
    | { isPivot: true; isError: boolean }
  )[] = [];
  public nPivots: number = 0;

  /**
   * Add a compensation record for a mutating (i.e. compensatable) operation
   * @param cx Compensation operation
   * @param isError If an operation linked to this compensation operation errored out
   */
  addCx(cx: Cx, isError: boolean): void {
    this.cxs.push({ cx, isError });
  }

  /**
   * Add a record for a pivot (i.e. not compensatable) operation
   */
  addPivot(isError: boolean): void {
    this.cxs.push({ isPivot: true, isError });
    this.nPivots++;
  }
}

const ctxStorage = new AsyncLocalStorage<Context>();

const getCtx = (): Context => {
  const ctx = ctxStorage.getStore();
  if (!ctx) {
    throw new Error(
      "Cannot acquire workflow context from AsyncLocalStorage, context is lost"
    );
  }
  return ctx;
};

/**
 * Wraps a mutating (i.e. compensatable) operation
 *
 * @param tx Workflow step operation
 * @param cx Compensating operation
 * @returns Step operation result
 */
export const mutating = async <T>(tx: Tx<T>, cx: Cx): Promise<T> => {
  try {
    // tx may throw an exception synchronously
    // async/await handles both sync and async exceptions cases
    const x = await tx();
    getCtx().addCx(cx, false);
    return x;
  } catch (e) {
    getCtx().addCx(cx, true);
    throw e;
  }
};

/**
 * Wraps a pivot (i.e. not compensatable) operation
 *
 * @param tx Workflow step operation
 */
export const pivot = async <T>(tx: Tx<T>): Promise<T> => {
  try {
    // tx may throw an exception synchronously
    // async/await handles both sync and async exceptions cases
    const x = await tx();
    getCtx().addPivot(false);
    return x;
  } catch (e) {
    getCtx().addPivot(true);
    throw e;
  }
};

/*
NOTE:

Each workflow operation is defined as transactional, i.e. it is atomic,
meaning it either succeeds and applies changes, or doesn't succeed and no
changes are applied -- there's no intermediate state of partial application.

If a workflow is to be compensated, all operations inside it must be
compensated in a reverse order. But what about the last operation? If it
didn't error out, it is applied, so it should be compensated. If it did,
then it should not, because no changes have been applied. Furthermore,
the last operation may be either a pivot one (not compensatable), or a
mutating one (compensatable). This gives us cases:
- last is pivot, error happened during it
- last is pivot, error happened after it
- last is mutating, error happened during it
- last is mutating, error happened after it
 */

/**
 * Wraps a workflow, binding a workflow context
 *
 * @param f A factory function returning workflow implementation
 * @returns A function that runs a workflow
 */
export const workflow =
  <T>(f: () => Promise<T>): (() => Promise<T>) =>
  () => {
    // run a workflow inside a context
    return ctxStorage.run(new Context(), () =>
      f().catch(async (e): Promise<never> => {
        // if a workflow errors out, need to either compensate, or rethrow
        const ctx: Context = getCtx();

        // Nothing to do
        if (!ctx.cxs.length) {
          throw e;
        }

        // There exist at least one pivot operation
        if (ctx.nPivots) {
          if (ctx.nPivots > 1) {
            // Multiple pivot operations makes a workflow not compensatable
            throw e;
          }
          const last = ctx.cxs[ctx.cxs.length - 1];
          if (last && "isPivot" in last && last.isError) {
            // A workflow with one pivot operation is compensatable only if the
            // last operation is a pivot one and an error happened because of it
            // (meaning this operation didn't complete)
            ctx.cxs.pop();
          } else {
            throw e;
          }
        }

        let isLast = true;
        for (const x of ctx.cxs.reverse()) {
          if ("cx" in x) {
            // a mutating operation
            if (isLast) {
              if (!x.isError) {
                // if an error happened after the last mutating operation
                // but not because of it, then compensate it
                await x.cx();
              }
              // if an error is caused by the last mutating operation
              // (meaning it didn't complete), then don't compensate it
              isLast = false;
            } else if (!x.isError) {
              // always compensate a non-last mutating not-errored operation:
              // if execution continues after an exception, then the exception
              // is handled inside the workflow and the workflow should not
              // be compensated
              await x.cx();
            }
          } else {
            throw new Error("Assumed no pivot operations, but got one");
          }
        }
        throw e;
      })
    );
  };
