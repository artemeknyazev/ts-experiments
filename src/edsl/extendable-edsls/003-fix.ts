// Interface containing all terms for the eDSL, both existing and new

export interface Terms<A> {}

export type TermTags = keyof Terms<any>;

export type TagToTerm<F extends TermTags, A> = F extends TermTags
  ? Terms<A>[F]
  : never;

// Recursive type wrapper

export interface FixTerm<F extends TermTags> {
  value: TagToTerm<F, FixTerm<F>>;
}

export const fix = <F extends TermTags>(
  a: TagToTerm<F, FixTerm<F>>
): FixTerm<F> => ({
  value: a,
});

export const unfix = <F extends TermTags>(
  fa: FixTerm<F>
): TagToTerm<F, FixTerm<F>> => fa.value;

// Commands

export const ConstTag = "Const";
export type ConstTag = typeof ConstTag;

export interface Const {
  tag: ConstTag;
  a: any;
}

export interface Terms<A> {
  [ConstTag]: Const;
}

export const cnst = (a: any): FixTerm<ConstTag> => fix({ tag: ConstTag, a });

export const NegTag = "Neg";
export type NegTag = typeof NegTag;

interface Neg<A> {
  tag: NegTag;
  a: A;
}

export interface Terms<A> {
  [NegTag]: Neg<A>;
}

export const neg = <A extends TermTags>(a: FixTerm<A>): FixTerm<NegTag | A> =>
  fix({ tag: NegTag, a });

export const AddTag = "Add";
export type AddTag = typeof AddTag;

export interface Add<A> {
  tag: AddTag;
  a: A;
  b: A;
}

export interface Terms<A> {
  [AddTag]: Add<A>;
}

export const add = <A extends TermTags, B extends TermTags>(
  a: FixTerm<A>,
  b: FixTerm<B>
): FixTerm<AddTag | A | B> => fix({ tag: AddTag, a, b });

export const MulTag = "Mul";
export type MulTag = typeof MulTag;

interface Mul<A> {
  tag: MulTag;
  a: A;
  b: A;
}

export interface Terms<A> {
  [MulTag]: Mul<A>;
}

export const mul = <A extends TermTags, B extends TermTags>(
  a: FixTerm<A>,
  b: FixTerm<B>
): FixTerm<MulTag | A | B> => fix({ tag: MulTag, a, b });

export type BaseTags = ConstTag | NegTag | AddTag;
export type ExtTags = MulTag | BaseTags;

const seqBase: FixTerm<BaseTags> = add(cnst(1), neg(cnst(2)));
const seqExt1: FixTerm<ExtTags> = mul(neg(cnst(1)), add(cnst(1), cnst(2)));
const seqExt2: FixTerm<ExtTags> = neg(mul(cnst(1), cnst(2)));

const evalBaseF =
  <F extends TermTags>(f: (fa: FixTerm<F>) => number) =>
  (op: TagToTerm<BaseTags, FixTerm<F>>): number => {
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
  <F extends TermTags>(f: (fa: FixTerm<F>) => number) =>
  (op: TagToTerm<ExtTags, FixTerm<F>>): number => {
    const def = evalBaseF<F>(f);
    switch (op.tag) {
      case MulTag:
        return f(op.a) + f(op.b);
      default:
        return def(op);
    }
  };

const evalBase = (op: FixTerm<BaseTags>): number =>
  evalBaseF(evalBase)(unfix(op));

const evalExt = (op: FixTerm<ExtTags>): number => evalExtF(evalExt)(unfix(op));

import { equal } from "assert";

equal(evalBase(seqBase), -1);
equal(evalExt(seqExt1), -3);
equal(evalExt(seqExt2), -2);
