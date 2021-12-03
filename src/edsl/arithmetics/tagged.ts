import { Do } from "fp-ts-contrib/Do";

import * as Ev from "../../deferred-computations/Eval";
import Eval = Ev.Eval;

export const ConstantTag = "ConstantTag";
type ConstantTag = typeof ConstantTag;
interface Constant {
  tag: ConstantTag;
  value: any;
}

export const cnst = (value: any): Constant => ({
  tag: ConstantTag,
  value,
});

export const NegateTag = "NegateTag";
type NegateTag = typeof NegateTag;
interface Negate<A> {
  tag: NegateTag;
  op0: Op<A>;
}

export const neg = <A>(op0: Op<A>): Negate<A> => ({
  tag: NegateTag,
  op0,
});

export const AddTag = "AddTag";
type AddTag = typeof AddTag;
interface Add<A> {
  tag: AddTag;
  op0: Op<A>;
  op1: Op<A>;
}
export const add = <A>(op0: Op<A>, op1: Op<A>): Add<A> => ({
  tag: AddTag,
  op0,
  op1,
});

export const SubTag = "SubTag";
type SubTag = typeof SubTag;
interface Sub<A> {
  tag: SubTag;
  op0: Op<A>;
  op1: Op<A>;
}

export const sub = <A>(op0: Op<A>, op1: Op<A>): Sub<A> => ({
  tag: SubTag,
  op0,
  op1,
});

export const MulTag = "MulTag";
type MulTag = typeof MulTag;
interface Mul<A> {
  tag: MulTag;
  op0: Op<A>;
  op1: Op<A>;
}

export const mul = <A>(op0: Op<A>, op1: Op<A>): Mul<A> => ({
  tag: MulTag,
  op0,
  op1,
});

export const DivTag = "DivTag";
type DivTag = typeof DivTag;
interface Div<A> {
  tag: DivTag;
  op0: Op<A>;
  op1: Op<A>;
}

export const div = <A>(op0: Op<A>, op1: Op<A>): Div<A> => ({
  tag: DivTag,
  op0,
  op1,
});

export type Op<A> = Constant | Negate<A> | Add<A> | Sub<A> | Mul<A> | Div<A>;

// todo: write this as a folder for `cata`

/**
 * Evaluates an `Op` to `number`. Not stack-safe
 */
export const evaluateNum = <A>(op: Op<A>): number => {
  const f = evaluateNum; // rename self-reference for brevity
  switch (op.tag) {
    case ConstantTag:
      return Number(op.value);
    case NegateTag:
      return -f(op.op0);
    case AddTag:
      return f(op.op0) + f(op.op1);
    case SubTag:
      return f(op.op0) - f(op.op1);
    case MulTag:
      return f(op.op0) * f(op.op1);
    case DivTag:
      return f(op.op0) / f(op.op1);
    default:
      throw new Error(`Cannot evaluate op: ${JSON.stringify(op)}`);
  }
};

// todo: can a `cata` folder be extenable like this?

/**
 * Extendable evaluator of `Op` to `string`. Not stack safe
 *
 * It's fixed point is an actual evaluator function, meaning
 * `evaluateStrF(evaluateStr) = evaluateStr`
 *
 * To get an actual evaluator it can
 * - either be wrapped with a `fix` combinator
 * - or reference it's result (see `evaluateStr`)
 */
export const evaluateStrF =
  <A>(f: (op: Op<A>) => string) =>
  (op: Op<A>): string => {
    switch (op.tag) {
      case ConstantTag:
        return String(op.value);
      case NegateTag:
        return "-" + f(op.op0);
      case AddTag:
        return "(" + f(op.op0) + "+" + f(op.op1) + ")";
      case SubTag:
        return "(" + f(op.op0) + "-" + f(op.op1) + ")";
      case MulTag:
        return "(" + f(op.op0) + "*" + f(op.op1) + ")";
      case DivTag:
        return "(" + f(op.op0) + "/" + f(op.op1) + ")";
      default:
        throw new Error(`Cannot evaluate op: ${JSON.stringify(op)}`);
    }
  };

/**
 * Evaluates an `Op` to `string`. Not stack-safe
 */
export const evaluateStr = <A>(op: Op<A>): string =>
  evaluateStrF<A>(evaluateStr)(op);

/**
 * Extendable stack-safe evaluator of Ops to Eval<number>
 */
export const evaluateNumFEval =
  <A>(f: (op: Op<A>) => Eval<number>) =>
  (op: Op<A>): Eval<number> => {
    const d = Do(Ev.Monad);
    switch (op.tag) {
      case ConstantTag:
        return Ev.of(Number(op.value));
      case NegateTag:
        // All bindings are lazy, because eager ones cause immediate recursion
        return d.bindL("a", () => f(op.op0)).return(({ a }) => -a);
      case AddTag:
        return d
          .bindL("a", () => f(op.op0))
          .bindL("b", () => f(op.op1))
          .return(({ a, b }) => a + b);
      case SubTag:
        return d
          .bindL("a", () => f(op.op0))
          .bindL("b", () => f(op.op1))
          .return(({ a, b }) => a - b);
      case MulTag:
        return d
          .bindL("a", () => f(op.op0))
          .bindL("b", () => f(op.op1))
          .return(({ a, b }) => a * b);
      case DivTag:
        return d
          .bindL("a", () => f(op.op0))
          .bindL("b", () => f(op.op1))
          .return(({ a, b }) => a / b);
      default:
        throw new Error(`Cannot evaluate op: ${JSON.stringify(op)}`);
    }
  };

/**
 * Extendable stack-safe evaluator of Ops to Eval<string>
 */
export const evaluateStrFEval =
  <A>(f: (op: Op<A>) => Eval<string>) =>
  (op: Op<A>): Eval<string> => {
    const d = Do(Ev.Monad);
    switch (op.tag) {
      case ConstantTag:
        return Ev.of(String(op.value));
      case NegateTag:
        return d.bindL("a", () => f(op.op0)).return(({ a }) => "-" + a);
      case AddTag:
        return d
          .bindL("a", () => f(op.op0))
          .bindL("b", () => f(op.op1))
          .return(({ a, b }) => "(" + a + "+" + b + ")");
      case SubTag:
        return d
          .bindL("a", () => f(op.op0))
          .bindL("b", () => f(op.op1))
          .return(({ a, b }) => "(" + a + "-" + b + ")");
      case MulTag:
        return d
          .bindL("a", () => f(op.op0))
          .bindL("b", () => f(op.op1))
          .return(({ a, b }) => "(" + a + "*" + b + ")");
      case DivTag:
        return d
          .bindL("a", () => f(op.op0))
          .bindL("b", () => f(op.op1))
          .return(({ a, b }) => "(" + a + "/" + b + ")");
      default:
        throw new Error(`Cannot evaluate op: ${JSON.stringify(op)}`);
    }
  };

/**
 * Stack-safely evaluates an `Op` to `Eval<number>`
 */
export const evaluateNumEval = <A>(op: Op<A>): Eval<number> =>
  evaluateNumFEval<A>(evaluateNumEval)(op);

/**
 * Stack-safely evaluates an `Op` to `Eval<string>`
 */
export const evaluateStrEval = <A>(op: Op<A>): Eval<string> =>
  evaluateStrFEval<A>(evaluateStrEval)(op);

// todo: implement `fix` combinator and validate that `fix(evaluateStrFEval)`
//   transforms the same way as `evaluateStrEval`

export const PowTag = "PowTag";
type PowTag = typeof PowTag;
interface Pow<A> {
  tag: PowTag;
  op0: OpExt<A>;
  op1: OpExt<A>;
}

export const pow = <A>(op0: OpExt<A>, op1: OpExt<A>): Pow<A> => ({
  tag: PowTag,
  op0,
  op1,
});

export type OpExt<A> = Pow<A> | Op<A>;

/**
 * Extended evaluator that calls the base one
 */
export const evaluateExtStrF =
  <A>(f: (op: OpExt<A>) => string) =>
  (op: OpExt<A>): string => {
    const def = evaluateStrF(f); // base transformer
    switch (op.tag) {
      case PowTag:
        // A new operation
        return f(op.op0) + "^" + f(op.op1);
      case "ConstantTag":
        // Transform result of a specific operation
        return "[" + def(op) + "]";
      default:
        return def(op);
    }
  };

/**
 * Evaluates an `OpExt` to `string`. Not stack-safe
 */
export const evaluateExtStr = <A>(op: OpExt<A>): string =>
  evaluateExtStrF<A>(evaluateExtStr)(op);

/**
 * Extended evaluator that calls the base one
 */
export const evaluateExtStrFEval =
  <A>(f: (op: OpExt<A>) => Eval<string>) =>
  (op: OpExt<A>): Eval<string> => {
    const d = Do(Ev.Monad);
    const def = evaluateStrFEval(f); // base transformer
    switch (op.tag) {
      case PowTag:
        // A new operation
        return d
          .bindL("a", () => f(op.op0))
          .bindL("b", () => f(op.op1))
          .return(({ a, b }) => a + "^" + b);
      case "ConstantTag":
        // Transform result of a specific operation
        return d.bindL("a", () => def(op)).return(({ a }) => "[" + a + "]");
      default:
        return def(op);
    }
  };

/**
 * Stack-safely evaluates an `OpExt` to `string`
 */
export const evaluateExtStrEval = <A>(op: OpExt<A>): Eval<string> =>
  evaluateExtStrFEval<A>(evaluateExtStrEval)(op);
