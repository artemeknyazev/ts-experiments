// todo: extract number to an arbitrary type A

const ConstantTag = "ConstantTag";
type ConstantTag = typeof ConstantTag;
interface Constant {
  tag: ConstantTag;
  value: number;
}

export const cnst = (value: number): Constant => ({
  tag: ConstantTag,
  value,
});

const NegateTag = "NegateTag";
type NegateTag = typeof NegateTag;
interface Negate {
  tag: NegateTag;
  op0: Op;
}

export const neg = (op0: Op): Negate => ({
  tag: NegateTag,
  op0,
});

const AddTag = "AddTag";
type AddTag = typeof AddTag;
interface Add {
  tag: AddTag;
  op0: Op;
  op1: Op;
}
export const add = (op0: any, op1: any): Add => ({
  tag: AddTag,
  op0,
  op1,
});

const SubTag = "SubTag";
type SubTag = typeof SubTag;
interface Sub {
  tag: SubTag;
  op0: Op;
  op1: Op;
}

export const sub = (op0: Op, op1: Op): Sub => ({
  tag: SubTag,
  op0,
  op1,
});

const MulTag = "MulTag";
type MulTag = typeof MulTag;
interface Mul {
  tag: MulTag;
  op0: Op;
  op1: Op;
}

export const mul = (op0: Op, op1: Op): Mul => ({
  tag: MulTag,
  op0,
  op1,
});

const DivTag = "DivTag";
type DivTag = typeof DivTag;
interface Div {
  tag: DivTag;
  op0: Op;
  op1: Op;
}

export const div = (op0: Op, op1: Op): Div => ({
  tag: DivTag,
  op0,
  op1,
});

export type Op = Constant | Negate | Add | Sub | Mul | Div;

// todo: write this as a folder for `cata`
// todo: write this a stack-safe way using `Eval`
export const evaluateNum = (op: Op): number => {
  switch (op.tag) {
    case ConstantTag:
      return op.value;
    case NegateTag:
      return -evaluateNum(op.op0);
    case AddTag:
      return evaluateNum(op.op0) + evaluateNum(op.op1);
    case SubTag:
      return evaluateNum(op.op0) - evaluateNum(op.op1);
    case MulTag:
      return evaluateNum(op.op0) * evaluateNum(op.op1);
    case DivTag:
      return evaluateNum(op.op0) / evaluateNum(op.op1);
    default:
      throw new Error(`Cannot evaluate op: ${JSON.stringify(op)}`);
  }
};

export const evaluateStr = (op: Op): string => {
  switch (op.tag) {
    case ConstantTag:
      return String(op.value);
    case NegateTag:
      return "-" + evaluateStr(op.op0);
    case AddTag:
      return "(" + evaluateStr(op.op0) + "+" + evaluateStr(op.op1) + ")";
    case SubTag:
      return "(" + evaluateStr(op.op0) + "-" + evaluateStr(op.op1) + ")";
    case MulTag:
      return "(" + evaluateStr(op.op0) + "*" + evaluateStr(op.op1) + ")";
    case DivTag:
      return "(" + evaluateStr(op.op0) + "/" + evaluateStr(op.op1) + ")";
    default:
      throw new Error(`Cannot evaluate op: ${JSON.stringify(op)}`);
  }
};

// todo: this is an extendable folder; add a `pow` operator and extend, then
//   wrap with a `fix` combinator
// todo: write this a stack-safe way using `Eval`
// todo: can a `cata` folder be extenable like this
export const evaluateNumF =
  (f: (op: Op) => number) =>
  (op: Op): number => {
    switch (op.tag) {
      case ConstantTag:
        return op.value;
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

export const evaluateStrF =
  (f: (op: Op) => string) =>
  (op: Op): string => {
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
