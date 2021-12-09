export interface Terms<A> {}

export type TermTags = keyof Terms<any>;

export type TagToTerm<F extends TermTags, A> = F extends TermTags
  ? Terms<A>[F]
  : never;

export interface Types {}

export type TypeTags = keyof Types;

export type TagToType<F extends TypeTags> = F extends TypeTags
  ? Types[F]
  : never;

// Recursive type wrapper

class FixTerm<F extends TermTags, R extends TypeTags> {
  readonly ret!: R; // return type of the first wrapped command
  constructor(readonly value: TagToTerm<F, FixTerm<F, TypeTags>>) {}
}

export const fix = <F extends TermTags, R extends TypeTags>(
  a: TagToTerm<F, FixTerm<F, TypeTags>>
): FixTerm<F, R> => new FixTerm<F, R>(a);

export const unfix = <F extends TermTags, R extends TypeTags>(
  fa: FixTerm<F, R>
): TagToTerm<F, FixTerm<F, TypeTags>> => fa.value;

// Return types

const StringTag = "String";
type StrTag = typeof StringTag;

const NumberTag = "Number";
type NumTag = typeof NumberTag;

export interface Types {
  [StringTag]: string;
  [NumberTag]: number;
}

// Commands

export const ConstNumTag = "ConstNum";
export type ConstNumTag = typeof ConstNumTag;

export class ConstNum {
  readonly tag: ConstNumTag = ConstNumTag;
  readonly ret!: NumTag;
  constructor(readonly a: any) {}
}

export interface Terms<A> {
  [ConstNumTag]: ConstNum;
}

export const constNum = (a: any): FixTerm<ConstNumTag, NumTag> =>
  fix(new ConstNum(a));

export const ConstStrTag = "ConstStr";
export type ConstStrTag = typeof ConstStrTag;

export class ConstStr {
  tag: ConstStrTag = ConstStrTag;
  readonly ret!: StrTag;
  constructor(readonly a: any) {}
}

export interface Terms<A> {
  [ConstStrTag]: ConstStr;
}

export const constStr = (a: any): FixTerm<ConstStrTag, StrTag> =>
  fix(new ConstStr(a));

export const NumToStrTag = "NumToStr";
export type NumToStrTag = typeof NumToStrTag;

export class NumToStr<A> {
  tag: NumToStrTag = NumToStrTag;
  readonly ret!: StrTag;
  readonly reta!: NumTag;
  constructor(readonly a: A) {}
}

export interface Terms<A> {
  [NumToStrTag]: NumToStr<A>;
}

export const numToStr = <F extends TermTags>(
  a: FixTerm<F, NumTag>
): FixTerm<NumToStrTag | F, StrTag> => fix(new NumToStr(a));

export const StrToNumTag = "StrToNum";
export type StrToNumTag = typeof StrToNumTag;

export class StrToNum<A> {
  tag: StrToNumTag = StrToNumTag;
  readonly ret!: NumTag;
  readonly reta!: StrTag;
  constructor(readonly a: A) {}
}

export interface Terms<A> {
  [StrToNumTag]: StrToNum<A>;
}

export const strToNum = <F extends TermTags>(
  a: FixTerm<F, StrTag>
): FixTerm<StrToNumTag | F, NumTag> => fix(new StrToNum(a));

export const ConcatTag = "Concat";
export type ConcatTag = typeof ConcatTag;

export class Concat<A> {
  readonly tag: ConcatTag = ConcatTag;
  readonly ret!: StrTag;
  readonly reta!: StrTag;
  readonly retb!: StrTag;
  constructor(readonly a: A, readonly b: A) {}
}

export interface Terms<A> {
  [ConcatTag]: Concat<A>;
}

export const concat = <F extends TermTags, G extends TermTags>(
  a: FixTerm<F, StrTag>,
  b: FixTerm<G, StrTag>
): FixTerm<ConcatTag | F | G, StrTag> =>
  fix(new Concat<FixTerm<F | G, StrTag>>(a, b));

export const SuccTag = "Succ";
export type SuccTag = typeof SuccTag;

export class Succ<A> {
  readonly tag: SuccTag = SuccTag;
  readonly ret!: NumTag;
  readonly reta!: NumTag;
  constructor(readonly a: A) {}
}

export interface Terms<A> {
  [SuccTag]: Succ<A>;
}

export const succ = <F extends TermTags>(
  a: FixTerm<F, NumTag>
): FixTerm<SuccTag | F, NumTag> => fix(new Succ(a));

type BinOp<H extends TermTags> = TagToTerm<H, any> extends infer Term
  ? Term extends {
      ret?: TypeTags;
      reta?: TypeTags;
      retb?: TypeTags;
    }
    ? <F extends TermTags, G extends TermTags>(
        a: FixTerm<F, Exclude<Term["reta"], undefined>>,
        b: FixTerm<G, Exclude<Term["retb"], undefined>>
      ) => FixTerm<H | F | G, Exclude<Term["ret"], undefined>>
    : never
  : never;

export const AddTag = "Add";
export type AddTag = typeof AddTag;

export interface Add<A> {
  tag: AddTag;
  ret?: NumTag;
  reta?: NumTag;
  retb?: NumTag;
  a: A;
  b: A;
}

export interface Terms<A> {
  [AddTag]: Add<A>;
}

export const add: BinOp<AddTag> = (a, b) => fix({ tag: AddTag, a, b });

export const RepeatTag = "Repeat";
export type RepeatTag = typeof RepeatTag;

export interface Repeat<A> {
  tag: RepeatTag;
  ret?: StrTag;
  reta?: StrTag;
  retb?: NumTag;
  a: A;
  b: A;
}

export interface Terms<A> {
  [RepeatTag]: Repeat<A>;
}

export const repeat: BinOp<RepeatTag> = (a, b) => fix({ tag: RepeatTag, a, b });

type BaseTags =
  | ConstNumTag
  | ConstStrTag
  | NumToStrTag
  | StrToNumTag
  | ConcatTag
  | SuccTag;
type ExtTags = AddTag | RepeatTag | BaseTags;

// Example term sequences

export const e001 = add(constNum(1), succ(constNum(2)));
export const e002 = concat(constStr("1"), concat(constStr("2"), constStr("3")));
export const e003 = succ(add(strToNum(e002), e001));
export const e004 = concat(constStr("a"), numToStr(succ(constNum(1))));

// Tagless algebras

interface BaseInterpreterTagged {
  constNum: (a: any) => FixTerm<ConstNumTag, NumTag>;
  constStr: (a: any) => FixTerm<ConstStrTag, StrTag>;
  numToStr: <F extends TermTags>(
    a: FixTerm<F, NumTag>
  ) => FixTerm<NumToStrTag | F, StrTag>;
  strToNum: <F extends TermTags>(
    a: FixTerm<F, StrTag>
  ) => FixTerm<StrToNumTag | F, NumTag>;
  concat: <F extends TermTags, G extends TermTags>(
    a: FixTerm<F, StrTag>,
    b: FixTerm<G, StrTag>
  ) => FixTerm<ConcatTag | F | G, StrTag>;
  succ: <F extends TermTags>(
    a: FixTerm<F, NumTag>
  ) => FixTerm<SuccTag | F, NumTag>;
}

interface ExtInterpreterTagged {
  add: BinOp<AddTag>;
  repeat: BinOp<RepeatTag>;
}

export const baseInterpreterTagged: BaseInterpreterTagged = {
  constNum,
  constStr,
  numToStr,
  strToNum,
  concat,
  succ,
};

export const extInterpreterTagged: ExtInterpreterTagged = {
  ...baseInterpreterTagged,
  add,
  repeat,
};

export interface BaseInterpreter<TNumber, TString> {
  constNum: (a: any) => TNumber;
  constStr: (a: any) => TString;
  numToStr: (a: TNumber) => TString;
  strToNum: (a: TString) => TNumber;
  concat: (a: TString, b: TString) => TString;
  succ: (a: TNumber) => TNumber;
}

export interface ExtInterpreter<TNumber, TString>
  extends BaseInterpreter<TNumber, TString> {
  add: (a: TNumber, b: TNumber) => TNumber;
  repeat: (a: TString, b: TNumber) => TString;
}

export const baseInterpreterCalc: BaseInterpreter<number, string> = {
  constNum: Number,
  constStr: String,
  numToStr: String,
  strToNum: Number,
  concat: (a, b) => a + b,
  succ: (a) => a + 1,
};

export const extInterpreterCalc: ExtInterpreter<number, string> = {
  ...baseInterpreterCalc,
  add: (a, b) => a + b,
  repeat: (a, b) => {
    let r = "";
    for (; b > 0; b--) r += a;
    return r;
  },
};

export const baseInterpreterStr: BaseInterpreter<string, string> = {
  constNum: (a) => `Number(${Number(a)})`,
  constStr: (a) => `String(${String(a)})`,
  numToStr: (a) => `ToString(${a})`,
  strToNum: (a) => `ToNumber(${a})`,
  concat: (a, b) => `${a} ++ ${b}`,
  succ: (a) => `Succ(${a})`,
};

export const extInterpreterStr: ExtInterpreter<string, string> = {
  ...baseInterpreterStr,
  add: (a, b) => `Add(${a}, ${b})`,
  repeat: (a, b) => `Repeat(${a}, ${b})`,
};

// This is not an ideal approach because of `any`. For any descriptor depending
// on calculations of it's operands return type of `f` depends on that operand's
// descriptor tag. The issue is that we have unary and binary functions -- for
// unary ones `f`'s return type is just a return type of it's descriptor
// operand; for binary ones it's return type is either a sum type of return
// types of operand descriptors, or a generic type depending on `f`'s operand
// descriptor tag. But `F` is a sum type of all commands used in an expression
// (due to our extensibility approach) and this sum is passed down, so we can't
// actually discern what to return

export const evalBaseFT = <TNumber, TString>(
  T: BaseInterpreter<TNumber, TString>
) => {
  return <F extends TermTags>(f: (fa: FixTerm<F, TypeTags>) => any) =>
    (op: TagToTerm<BaseTags, FixTerm<F, TypeTags>>): any => {
      switch (op.tag) {
        case ConstNumTag:
          return T.constNum(op.a);
        case ConstStrTag:
          return T.constStr(op.a);
        case NumToStrTag:
          return T.numToStr(f(op.a));
        case StrToNumTag:
          return T.strToNum(f(op.a));
        case ConcatTag:
          return T.concat(f(op.a), f(op.b));
        case SuccTag:
          return T.succ(f(op.a));
      }
    };
};

export const evalExtFT = <TNumber, TString>(
  T: ExtInterpreter<TNumber, TString>
) => {
  const d = evalBaseFT<TNumber, TString>(T);
  return <F extends TermTags>(f: (fa: FixTerm<F, TypeTags>) => any) =>
    (op: TagToTerm<ExtTags, FixTerm<F, TypeTags>>): any => {
      const def = d(f);
      switch (op.tag) {
        case AddTag:
          return T.add(f(op.a), f(op.b));
        case RepeatTag:
          return T.repeat(f(op.a), f(op.b));
        default:
          return def(op);
      }
    };
};

const evalBaseCalcF = evalBaseFT(baseInterpreterCalc);
export const evalBaseCalc = <R extends TypeTags>(
  op: FixTerm<BaseTags, R>
): TagToType<R> => evalBaseCalcF(evalBaseCalc)(unfix(op));

const evalExtCalcF = evalExtFT(extInterpreterCalc);
export const evalExtCalc = <R extends TypeTags>(
  op: FixTerm<ExtTags, R>
): TagToType<R> => evalExtCalcF(evalExtCalc)(unfix(op));

const evalBaseStrF = evalBaseFT(baseInterpreterStr);
export const evalBaseStr = <R extends TypeTags>(
  op: FixTerm<BaseTags, R>
): TagToType<R> => evalBaseStrF(evalBaseStr)(unfix(op));

const evalExtStrF = evalExtFT(extInterpreterStr);
export const evalExtStr = <R extends TypeTags>(
  op: FixTerm<ExtTags, R>
): TagToType<R> => evalExtStrF(evalExtStr)(unfix(op));

// todo: lifters for tagless interpreters

// todo: lifting tagged interpreters
