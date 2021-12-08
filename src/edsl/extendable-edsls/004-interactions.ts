import {
  unfix,
  cnst,
  neg,
  add,
  mul,
  ConstTag,
  NegTag,
  AddTag,
  MulTag,
  BaseTags,
  ExtTags,
  TermTags,
  FixTerm,
  TagToTerm,
} from "./003-fix";

// Tagless interpreters to construct a tagged representation of calculations

interface BaseInterpreterTagged {
  cnst: (a: any) => FixTerm<ConstTag>;
  neg: <A extends TermTags>(a: FixTerm<A>) => FixTerm<NegTag | A>;
  add: <A extends TermTags, B extends TermTags>(
    a: FixTerm<A>,
    b: FixTerm<B>
  ) => FixTerm<AddTag | A | B>;
}

interface ExtInterpreterTagged extends BaseInterpreterTagged {
  mul: <A extends TermTags, B extends TermTags>(
    a: FixTerm<A>,
    b: FixTerm<B>
  ) => FixTerm<MulTag | A | B>;
}

export const baseInterpreterTagged: BaseInterpreterTagged = {
  cnst,
  neg,
  add,
};

export const extInterpreterTagged: ExtInterpreterTagged = {
  ...baseInterpreterTagged,
  mul,
};

// Tagless interpreters to be used inside tagged interpreters

export interface BaseInterpreter<A> {
  cnst: (a: any) => A;
  neg: (a: A) => A;
  add: (a: A, b: A) => A;
}

export interface ExtInterpreter<A> extends BaseInterpreter<A> {
  mul: (a: A, b: A) => A;
}

export const baseInterpreterNum: BaseInterpreter<number> = {
  cnst: Number,
  neg: (a) => -a,
  add: (a, b) => a + b,
};

export const extInterpreterNum: ExtInterpreter<number> = {
  ...baseInterpreterNum,
  mul: (a, b) => a * b,
};

export const baseInterpreterStr: BaseInterpreter<string> = {
  cnst: String,
  neg: (a) => "-" + a,
  add: (a, b) => "(" + a + "+" + b + ")",
};

export const extInterpreterStr: ExtInterpreter<string> = {
  ...baseInterpreterStr,
  mul: (a, b) => "(" + a + "*" + b + ")",
};

// Tagged interpreter creators

const evalBaseFT = <A>(T: BaseInterpreter<A>) => {
  return <F extends TermTags>(f: (fa: FixTerm<F>) => A) =>
    (op: TagToTerm<BaseTags, FixTerm<F>>): A => {
      switch (op.tag) {
        case ConstTag:
          return T.cnst(op.a);
        case NegTag:
          return T.neg(f(op.a));
        case AddTag:
          return T.add(f(op.a), f(op.b));
      }
    };
};

const evalExtFT = <A>(T: ExtInterpreter<A>) => {
  const d = evalBaseFT<A>(T);

  return <F extends TermTags>(f: (fa: FixTerm<F>) => A) =>
    (op: TagToTerm<ExtTags, FixTerm<F>>): A => {
      const def = d<F>(f);
      switch (op.tag) {
        case MulTag:
          return T.mul(f(op.a), f(op.b));
        default:
          return def(op);
      }
    };
};

// Tagged interpreters using tagless ones

const evalBaseNumF = evalBaseFT(baseInterpreterNum);
export const evalBaseNum = (op: FixTerm<BaseTags>): number =>
  evalBaseNumF(evalBaseNum)(unfix(op));

const evalBaseStrF = evalBaseFT(baseInterpreterStr);
export const evalBaseStr = (op: FixTerm<BaseTags>): string =>
  evalBaseStrF(evalBaseStr)(unfix(op));

const evalExtNumF = evalExtFT(extInterpreterNum);
export const evalExtNum = (op: FixTerm<ExtTags>): number =>
  evalExtNumF(evalExtNum)(unfix(op));

const evalExtStrF = evalExtFT(extInterpreterStr);
export const evalExtStr = (op: FixTerm<ExtTags>): string =>
  evalExtStrF(evalExtStr)(unfix(op));
