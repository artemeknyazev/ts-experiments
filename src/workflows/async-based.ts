type Tx<T> = () => Promise<T>;
type Cx = () => Promise<unknown>;

class Context {
  public cxs: (
    | { cx: Cx; isError: boolean }
    | { isPivot: true; isError: boolean }
  )[] = [];
  public pivots: number = 0;

  /**
   * Add a compensation record for a mutating compensatable operation
   * @param cx Compensation operation
   * @param isError If an operation linked to this compensation operation errored out
   */
  addCx(cx: Cx, isError: boolean): void {
    this.cxs.push({ cx, isError });
  }

  /**
   * Add a record for a pivot (i.e. mutating not compensatable) operation
   */
  addPivot(isError: boolean): void {
    this.cxs.push({ isPivot: true, isError });
    this.pivots++;
  }
}

/**
 * Wraps a mutating operation
 *
 * @param ctx Workflow context
 * @param tx Workflow step operation
 * @param cx Compensating operation. If not defined, this step is not compensatable
 * @returns Step operation result
 */
export const mutating = <T>(ctx: Context, tx: Tx<T>, cx?: Cx): Promise<T> =>
  tx().then(
    (x) => {
      if (cx) {
        ctx.addCx(cx, false);
      } else {
        ctx.addPivot(false);
      }
      return x;
    },
    (e) => {
      if (cx) {
        ctx.addCx(cx, true);
      } else {
        ctx.addPivot(true);
      }
      throw e;
    }
  );

/**
 * Wraps a workflow, binding a workflow context
 *
 * @param f A factory function returning workflow implementation
 * @returns A function that runs a workflow
 */
export const workflow =
  <T>(f: (ctx: Context) => Promise<T>): (() => Promise<T>) =>
  () => {
    const ctx: Context = new Context();
    return f(ctx).catch(async (e): Promise<never> => {
      // Nothing to do
      if (!ctx.cxs.length) {
        throw e;
      }

      // There exist at least one pivot operation
      if (ctx.pivots) {
        if (ctx.pivots > 1) {
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
          // a compensatable operation
          if (isLast) {
            if (!x.isError) {
              // if an error happened after the last compensatable operation
              // but not because of it, then compensate it
              await x.cx();
            }
            // if an error is caused by the last compensatable operation
            // (meaning it didn't complete), then don't compensate it
            isLast = false;
          } else {
            // always compensate a non-last compensatable operation
            await x.cx();
          }
        } else {
          throw new Error("Assumed no pivot operations, but got one");
        }
      }
      throw e;
    });
  };
