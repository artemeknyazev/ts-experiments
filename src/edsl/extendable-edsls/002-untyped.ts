// Command and algebra tags

const ConstTag = "Const";
type ConstTag = typeof ConstTag;

const NegTag = "Neg";
type NegTag = typeof NegTag;

const AddTag = "Add";
type AddTag = typeof AddTag;

const MulTag = "Mul";
type MulTag = typeof MulTag;

// Command types

interface Const {
  tag: ConstTag;
  a: any;
}

interface Neg {
  tag: NegTag;
  a: any;
}

interface Add {
  tag: AddTag;
  a: any;
  b: any;
}

interface Mul {
  tag: MulTag;
  a: any;
  b: any;
}

// Algebras, base and extended

type Op = Const | Neg | Add;

type OpExt = Mul | Op;

const cnst = (a: any): Const => ({ tag: ConstTag, a });

const neg = <A>(a: A): A | Neg => ({ tag: NegTag, a });

const add = <A, B>(a: A, b: B): A | B | Add => ({ tag: AddTag, a, b });

const mul = <A, B>(a: A, b: B): A | B | Mul => ({ tag: MulTag, a, b });

const seqBase = add(cnst(1), neg(cnst(2)));
const seqExt1 = mul(neg(cnst(1)), add(cnst(1), cnst(2)));
const seqExt2 = neg(mul(cnst(1), cnst(2)));

const evalBaseF =
  (f: (op: Op) => number) =>
  (op: Op): number => {
    switch (op.tag) {
      case ConstTag:
        return Number(op.a);
      case NegTag:
        return -f(op.a);
      case AddTag:
        return f(op.a) + f(op.b);
    }
  };

const evalExtF =
  (f: (op: OpExt) => number) =>
  (op: OpExt): number => {
    const def = evalBaseF(f);
    switch (op.tag) {
      case MulTag:
        return f(op.a) + f(op.b);
      default:
        return def(op);
    }
  };

const evalBase = (op: Op): number => evalBaseF(evalBase)(op);
const evalExt = (op: OpExt): number => evalExtF(evalExt)(op);

import { equal } from "assert";

equal(evalBase(seqBase), -1);
equal(evalExt(seqExt1), -3);
equal(evalExt(seqExt2), -2);
