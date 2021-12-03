import { Kind, URIS } from "fp-ts/HKT";
import { Monad1 } from "fp-ts/Monad";

import {
  liftMBinary,
  liftMUnary,
  liftMUnaryS,
  liftMUnaryAp,
} from "../../utils";
import * as Ev from "../../deferred-computations/Eval";
import {
  ConstantTag,
  NegateTag,
  AddTag,
  SubTag,
  MulTag,
  DivTag,
  Op,
  cnst,
  neg,
  add,
  sub,
  mul,
  div,
  PowTag,
  OpExt,
  pow,
} from "./tagged";
import {
  Arithmetics,
  ArithmeticsExt,
  arithmeticsInterpreterLiftM,
  arithmeticsInterpreterExtLiftM,
  interpreterNum,
  interpreterStr,
  interpreterExtNum,
  interpreterExtStr,
} from "./tagless";

import Eval = Ev.Eval;

// -----------------------------------------------------------------------------
// Transform tagless to tagged
// -----------------------------------------------------------------------------

export const getInterpreterTagged = <A>(): Arithmetics<Op<A>> => ({
  cnst,
  neg,
  add,
  sub,
  mul,
  div,
});

// -----------------------------------------------------------------------------
// Transform extended tagless to extended tagged
// -----------------------------------------------------------------------------

// @ts-ignore // todo: fix types!
export const getInterpreterExtTagged = <A>(): ArithmeticsExt<OpExt<A>> => ({
  ...getInterpreterTagged<A>(),
  pow,
});

// -----------------------------------------------------------------------------
// Evaluate tagged with tagless
// -----------------------------------------------------------------------------

/**
 * Not stack safe, not extendable evaluator using the tagless interpreter
 */
export const getEvaluateByTagless =
  <A>(T: Arithmetics<A>) =>
  (op: Op<A>): A => {
    const f = getEvaluateByTagless(T);
    switch (op.tag) {
      case ConstantTag:
        return T.cnst(op.value);
      case NegateTag:
        return T.neg(f(op.op0));
      case AddTag:
        return T.add(f(op.op0), f(op.op1));
      case SubTag:
        return T.sub(f(op.op0), f(op.op1));
      case MulTag:
        return T.mul(f(op.op0), f(op.op1));
      case DivTag:
        return T.div(f(op.op0), f(op.op1));
      default:
        throw new Error(`Cannot evaluate op: ${JSON.stringify(op)}`);
    }
  };

export const evaluateNumTagless = getEvaluateByTagless(interpreterNum);
export const evaluateStrTagless = getEvaluateByTagless(interpreterStr);

/**
 * Not stack safe, extendable evaluator creator using the tagless interpreter
 */
const getEvaluateByTaglessF =
  <A>(T: Arithmetics<A>) =>
  (f: (op: Op<A>) => A) =>
  (op: Op<A>): A => {
    switch (op.tag) {
      case ConstantTag:
        return T.cnst(op.value);
      case NegateTag:
        return T.neg(f(op.op0));
      case AddTag:
        return T.add(f(op.op0), f(op.op1));
      case SubTag:
        return T.sub(f(op.op0), f(op.op1));
      case MulTag:
        return T.mul(f(op.op0), f(op.op1));
      case DivTag:
        return T.div(f(op.op0), f(op.op1));
      default:
        throw new Error(`Cannot evaluate op: ${JSON.stringify(op)}`);
    }
  };

const evaluateNumTaglessF_ = getEvaluateByTaglessF(interpreterNum);
const evaluateStrTaglessF_ = getEvaluateByTaglessF(interpreterStr);
export const evaluateNumTaglessF = (op: Op<number>): number =>
  evaluateNumTaglessF_(evaluateNumTaglessF)(op);
export const evaluateStrTaglessF = (op: Op<string>): string =>
  evaluateStrTaglessF_(evaluateStrTaglessF)(op);

// @ts-ignore
const getEvaluateByTaglessFM_intermediate =
  <F extends URIS, A>(M: Monad1<F>, T: Arithmetics<A>) =>
  (f: (op: Op<A>) => Kind<F, A>) =>
  (op: Op<A>): Kind<F, A> => {
    switch (op.tag) {
      case ConstantTag:
        return liftMUnaryS<F, A>(M)(T.cnst)(op.value);
      // Everything below is similar to using an interpreter `T` lifted to
      // a monad `M`, but we can't use `f(op.op0)` directly as a parameter,
      // because it causes infinite recursion
      // To mitigate this, recursion must be postponed by wrapping a call to `f`
      // with argument `op.op0` to a monad `M` using `liftMUnaryAp`
      case NegateTag:
        return liftMUnary<F, A>(M)(T.neg)(
          liftMUnaryAp<F, Op<A>, A>(M)(f)(op.op0)
        );
      case AddTag:
        return liftMBinary<F, A>(M)(T.add)(
          liftMUnaryAp<F, Op<A>, A>(M)(f)(op.op0),
          liftMUnaryAp<F, Op<A>, A>(M)(f)(op.op1)
        );
      case SubTag:
        return liftMBinary<F, A>(M)(T.sub)(
          liftMUnaryAp<F, Op<A>, A>(M)(f)(op.op0),
          liftMUnaryAp<F, Op<A>, A>(M)(f)(op.op1)
        );
      case MulTag:
        return liftMBinary<F, A>(M)(T.mul)(
          liftMUnaryAp<F, Op<A>, A>(M)(f)(op.op0),
          liftMUnaryAp<F, Op<A>, A>(M)(f)(op.op1)
        );
      case DivTag:
        return liftMBinary<F, A>(M)(T.div)(
          liftMUnaryAp<F, Op<A>, A>(M)(f)(op.op0),
          liftMUnaryAp<F, Op<A>, A>(M)(f)(op.op1)
        );
      default:
        throw new Error(`Cannot evaluate op: ${JSON.stringify(op)}`);
    }
  };

// `getEvaluateByTaglessFM_intermediate` can be simplified by
// - lifting the whole `T` to monad `M` instead of using `liftM*(M)(T.smth)`
// - extracting common functions to top level and partially applying them there

/**
 * Stack safe, extendable evaluator creator using `Arithmetic` interpreter
 */
export const getEvaluateByTaglessFM = <F extends URIS, A>(
  M: Monad1<F>,
  T: Arithmetics<A>
) => {
  // Make all interpreter functions accept thunks to prevent immediate recursion
  const TF = arithmeticsInterpreterLiftM<F, A>(M)(T);
  // Lift calls to a unary function with a provided argument to a monad `M`
  const liftFOpM = liftMUnaryAp<F, Op<A>, A>(M);

  return (f: (op: Op<A>) => Kind<F, A>) =>
    (op: Op<A>): Kind<F, A> => {
      switch (op.tag) {
        case ConstantTag:
          return TF.cnst(op.value);
        case NegateTag:
          return TF.neg(liftFOpM(f)(op.op0));
        case AddTag:
          return TF.add(liftFOpM(f)(op.op0), liftFOpM(f)(op.op1));
        case SubTag:
          return TF.sub(liftFOpM(f)(op.op0), liftFOpM(f)(op.op1));
        case MulTag:
          return TF.mul(liftFOpM(f)(op.op0), liftFOpM(f)(op.op1));
        case DivTag:
          return TF.div(liftFOpM(f)(op.op0), liftFOpM(f)(op.op1));
        default:
          throw new Error(`Cannot evaluate op: ${JSON.stringify(op)}`);
      }
    };
};

const evaluateNumEvalTagless_ = getEvaluateByTaglessFM(
  Ev.Monad,
  interpreterNum
);
const evaluateStrEvalTagless_ = getEvaluateByTaglessFM(
  Ev.Monad,
  interpreterStr
);
export const evaluateNumEvalTagless = (op: Op<number>): Eval<number> =>
  evaluateNumEvalTagless_(evaluateNumEvalTagless)(op);
export const evaluateStrEvalTagless = (op: Op<string>): Eval<string> =>
  evaluateStrEvalTagless_(evaluateStrEvalTagless)(op);

// -----------------------------------------------------------------------------
// Evaluate extended tagged with extended tagless
// -----------------------------------------------------------------------------

export const getEvaluateExtByTaglessExtF = <A>(T: ArithmeticsExt<A>) => {
  const def = getEvaluateByTaglessF(T);

  return (f: (op: OpExt<A>) => A) =>
    (op: OpExt<A>): A => {
      switch (op.tag) {
        case PowTag:
          return T.pow(f(op.op0), f(op.op1));
        default:
          return def(f)(op);
      }
    };
};

const evaluateExtNumTaglessExtF_ =
  getEvaluateExtByTaglessExtF(interpreterExtNum);
const evaluateExtStrTaglessExtF_ =
  getEvaluateExtByTaglessExtF(interpreterExtStr);
export const evaluateExtNumTaglessExtF = (op: OpExt<number>): number =>
  evaluateExtNumTaglessExtF_(evaluateExtNumTaglessExtF)(op);
export const evaluateExtStrTaglessExtF = (op: OpExt<string>): string =>
  evaluateExtStrTaglessExtF_(evaluateExtStrTaglessExtF)(op);

export const getEvaluateExtByTaglessExtFM = <F extends URIS, A>(
  M: Monad1<F>,
  T: ArithmeticsExt<A>
) => {
  const TF = arithmeticsInterpreterExtLiftM<F, A>(M)(T);
  const liftFOpM = liftMUnaryAp<F, OpExt<A>, A>(M);
  const def = getEvaluateByTaglessFM(M, T);

  return (f: (op: OpExt<A>) => Kind<F, A>) =>
    (op: OpExt<A>): Kind<F, A> => {
      switch (op.tag) {
        case PowTag:
          return TF.pow(liftFOpM(f)(op.op0), liftFOpM(f)(op.op1));
        default:
          return def(f)(op);
      }
    };
};

const evaluateExtNumTaglessExtFM_ = getEvaluateExtByTaglessExtFM(
  Ev.Monad,
  interpreterExtNum
);
const evaluateExtStrTaglessExtFM_ = getEvaluateExtByTaglessExtFM(
  Ev.Monad,
  interpreterExtStr
);
export const evaluateExtNumTaglessExtFM = (op: OpExt<number>): Eval<number> =>
  evaluateExtNumTaglessExtFM_(evaluateExtNumTaglessExtFM)(op);
export const evaluateExtStrTaglessExtFM = (op: OpExt<string>): Eval<string> =>
  evaluateExtStrTaglessExtFM_(evaluateExtStrTaglessExtFM)(op);
