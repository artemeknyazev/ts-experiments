// -----------------------------------------------------------------------------
// Command and algebra types
// -----------------------------------------------------------------------------

// Command tags

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
  a: Op;
}

interface Add {
  tag: AddTag;
  a: Op;
  b: Op;
}

interface Mul {
  tag: MulTag;
  a: OpExt;
  b: OpExt;
}

// Algebras, base and extended

type Op = Const | Neg | Add;

// Extended algebra use base algebra as a sum type variant
type OpExt = Mul | Op;

// -----------------------------------------------------------------------------
// Operations implementation
// -----------------------------------------------------------------------------

const cnst = (a: any): Const => ({ tag: ConstTag, a });

const neg = (a: Op): Neg => ({ tag: NegTag, a });

const add = (a: Op, b: Op): Add => ({ tag: AddTag, a, b });

const mul = (a: OpExt, b: OpExt): Mul => ({ tag: MulTag, a, b });

// -----------------------------------------------------------------------------
// Interpreters implementation
// -----------------------------------------------------------------------------

/**
 * This is a self-referencing evaluator for the `Op` algebra. It is **not
 * extendable** because a call from an extending evaluator for `OpExt` to this
 * one results in cycling inside this evaluator and not evaluating command from
 * the extended algebra `OpExt`
 */
const evalBase_ = (op: Op): number => {
  switch (op.tag) {
    case ConstTag:
      return Number(op.a);
    case NegTag:
      return -evalBase_(op.a);
    case AddTag:
      return evalBase_(op.a) + evalBase_(op.b);
  }
};

/**
 * This is an **extendable evaluator** for the base `Op` algebra. `f` parameter
 * allows us to recurse back to any extending evaluator. However, `evalOpF`
 * assumes that `f` receives only a base `Op` algebra, and not a potentially
 * extended one
 */
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

/**
 * This is an evaluator for the extended `OpExt` algebra`. `f` parameter is
 * passed down to the extended from `Op` algebra evaluator. It typechecks
 * because `OpExt` algebra is a sum type with `Op` as one of the sum type
 * variants
 */
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

/**
 * `evalOpF` and `evalOpExtF` have actual evaluators as their fixed point,
 * meaning `evalOpF(evalOp) ~ evalOp` and `evalOpExtF(evalOpExt) = evalOpExt`.
 *
 * To get the actual evaluator we can either use a `fix` combinator for
 * computing a fixed point of a function, or self reference result, as described
 * below (because JS allows us to reference a function from inside itself by
 * allowing to reference the name of a function before the implementation is
 * described).
 */
const evalBase = (op: Op): number => evalBaseF(evalBase)(op);
const evalExt = (op: OpExt): number => evalExtF(evalExt)(op);

// -----------------------------------------------------------------------------
// Experiments
// -----------------------------------------------------------------------------

import { equal } from "assert";

/**
 * A sequence of operations in a base algebra, typechecks
 */
const seqBase = add(cnst(1), neg(cnst(2)));
equal(evalBase(seqBase), -1);

/**
 * An operation in an extended algebra, receiving operations from both base and extended algebras
 */
const seqExt1 = mul(neg(cnst(1)), add(cnst(1), cnst(2)));
equal(evalExt(seqExt1), -3);

/**
 * An operation in a base algebra receiving an operation in an extended one,
 * doesn't typecheck because types are different
 */ // @ts-expect-error
const seqExt2 = neg(mul(cnst(1), cnst(2)));

/**
 * The problem is that operations of the base algebra can't accepts commands
 * from the extended algebra
 */
