import { Kind, URIS } from "fp-ts/HKT";
import { Monad1 } from "fp-ts/Monad";

import { liftMBinary, liftMUnary, liftMUnaryS, postponeM } from "../../utils";
import * as Ev from "../../deferred-computations/Eval";
import Eval = Ev.Eval;
import {
  BaseInterpreter,
  ExtInterpreter,
  baseInterpreterNum,
  baseInterpreterStr,
  extInterpreterNum,
  extInterpreterStr,
} from "./004-interactions";
import {
  ConstTag,
  NegTag,
  AddTag,
  MulTag,
  BaseTags,
  ExtTags,
  FixTerm,
  TagToTerm,
  TermTags,
  unfix,
} from "./003-fix";

// Manually lifted tagless interpreters

export const baseInterpreterNumEval: BaseInterpreter<Eval<number>> = {
  cnst: liftMUnaryS(Ev.Monad)(baseInterpreterNum.cnst),
  neg: liftMUnary(Ev.Monad)(baseInterpreterNum.neg),
  add: liftMBinary(Ev.Monad)(baseInterpreterNum.add),
};

export const extInterpreterNumEval: ExtInterpreter<Eval<number>> = {
  ...baseInterpreterNumEval,
  mul: liftMBinary(Ev.Monad)(extInterpreterNum.mul),
};

// Automatically lifted tagless interpreters

export const baseInterpreterLiftM =
  <F extends URIS>(M: Monad1<F>) =>
  <A>(int: BaseInterpreter<A>): BaseInterpreter<Kind<F, A>> => ({
    cnst: liftMUnaryS(M)(int.cnst),
    neg: liftMUnary(M)(int.neg),
    add: liftMBinary(M)(int.add),
  });

export const extInterpreterLiftM =
  <F extends URIS>(M: Monad1<F>) =>
  <A>(int: ExtInterpreter<A>): ExtInterpreter<Kind<F, A>> => ({
    ...baseInterpreterLiftM<F>(M)<A>(int),
    mul: liftMBinary(M)(int.mul),
  });

export const baseInterpreterStrEval = baseInterpreterLiftM(Ev.Monad)(
  baseInterpreterStr
);

export const extInterpreterStrEval = extInterpreterLiftM(Ev.Monad)(
  extInterpreterStr
);

// Tagged lifting interpreter creators

export const evalBaseFTM_1 = <F extends URIS, A>(
  M: Monad1<F>,
  T: BaseInterpreter<A>
) => {
  return <G extends TermTags>(f: (fa: FixTerm<G>) => Kind<F, A>) =>
    (op: TagToTerm<BaseTags, FixTerm<G>>): Kind<F, A> => {
      switch (op.tag) {
        case ConstTag:
          // Descriptor contains elementary result -- transform it and wrap
          return M.of(T.cnst(op.a));
        case NegTag: {
          // Descriptor contains one dependency -- need to lazily evaluate it
          // Step 1: postpone evaluation using a monad:
          const fa = M.chain(M.of(undefined), () => f(op.a));
          // Step 2: calculate using a tagless interpreter
          return M.map(fa, T.neg);
        }
        case AddTag: {
          // Descriptor contains two dependencies -- lazily evaluate both using
          // the steps 1-2 above and chain it so that binary function can get
          // both results
          const fa = M.chain(M.of(undefined), () => f(op.a));
          const fb = M.chain(M.of(undefined), () => f(op.b));
          return M.chain(fa, (a) => M.map(fb, (b) => T.add(a, b)));
        }
      }
    };
};

// Too wordy -- let's extract dependency postponing

export const evalBaseFTM_2 = <F extends URIS, A>(
  M: Monad1<F>,
  T: BaseInterpreter<A>
) => {
  const p = postponeM(M);

  return <G extends TermTags>(f: (fa: FixTerm<G>) => Kind<F, A>) =>
    (op: TagToTerm<BaseTags, FixTerm<G>>): Kind<F, A> => {
      const pf = p(f);
      switch (op.tag) {
        case ConstTag:
          return M.of(T.cnst(op.a));
        case NegTag:
          return M.map(pf(op.a), T.neg);
        case AddTag:
          return M.chain(pf(op.a), (a) => M.map(pf(op.b), (b) => T.add(a, b)));
      }
    };
};

// Still not ideal -- let's use lifted interpreters

export const evalBaseFTM = <F extends URIS, A>(
  M: Monad1<F>,
  T: BaseInterpreter<A>
) => {
  const TM = baseInterpreterLiftM(M)(T);
  const p = postponeM(M);

  return <G extends TermTags>(f: (fa: FixTerm<G>) => Kind<F, A>) =>
    (op: TagToTerm<BaseTags, FixTerm<G>>): Kind<F, A> => {
      const pf = p(f);
      switch (op.tag) {
        case ConstTag:
          return TM.cnst(op.a);
        case NegTag:
          return TM.neg(pf(op.a));
        case AddTag:
          return TM.add(pf(op.a), pf(op.b));
      }
    };
};

export const evalExtFTM = <F extends URIS, A>(
  M: Monad1<F>,
  T: ExtInterpreter<A>
) => {
  const TM = extInterpreterLiftM(M)(T);
  const p = postponeM(M);
  const evalBaseF = evalBaseFTM(M, T);

  return <G extends TermTags>(f: (fa: FixTerm<G>) => Kind<F, A>) =>
    (op: TagToTerm<ExtTags, FixTerm<G>>): Kind<F, A> => {
      const pf = p(f);
      switch (op.tag) {
        case MulTag:
          return TM.mul(pf(op.a), pf(op.b));
        default:
          return evalBaseF(f)(op);
      }
    };
};

const evalBaseNumF = evalBaseFTM(Ev.Monad, baseInterpreterNum);
const evalBaseStrF = evalBaseFTM(Ev.Monad, baseInterpreterStr);
const evalExtNumF = evalExtFTM(Ev.Monad, extInterpreterNum);
const evalExtStrF = evalExtFTM(Ev.Monad, extInterpreterStr);

export const evalBaseNum = (op: FixTerm<BaseTags>): Eval<number> =>
  evalBaseNumF(evalBaseNum)(unfix(op));
export const evalBaseStr = (op: FixTerm<BaseTags>): Eval<string> =>
  evalBaseStrF(evalBaseStr)(unfix(op));
export const evalExtNum = (op: FixTerm<ExtTags>): Eval<number> =>
  evalExtNumF(evalExtNum)(unfix(op));
export const evalExtStr = (op: FixTerm<ExtTags>): Eval<string> =>
  evalExtStrF(evalExtStr)(unfix(op));
