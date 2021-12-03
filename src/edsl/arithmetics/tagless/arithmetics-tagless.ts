import { Kind, URIS } from "fp-ts/HKT";
import { Monad1 } from "fp-ts/Monad";
import { evolve } from "fp-ts/struct";

import * as Ev from "../../../deferred-computations/Eval";
import { liftMBinary, liftMUnary, liftMUnaryS } from "../../../utils";
import Eval = Ev.Eval;

// -----------------------------------------------------------------------------
// Base interpreter descriptor
// -----------------------------------------------------------------------------

export interface Arithmetics<A> {
  cnst: Cnst<A>;
  neg: Neg<A>;
  add: Add<A>;
  sub: Sub<A>;
  mul: Mul<A>;
  div: Div<A>;
}

export type Cnst<A> = (a: any) => A;

const cnst =
  <A>(P: Arithmetics<A>): Cnst<A> =>
  (a) =>
    P.cnst(a);

type Neg<A> = (op0: A) => A;

const neg =
  <A>(P: Arithmetics<A>): Neg<A> =>
  (op0) =>
    P.neg(op0);

type Add<A> = (op0: A, op1: A) => A;

const add =
  <A>(P: Arithmetics<A>): Add<A> =>
  (op0, op1) =>
    P.add(op0, op1);

type Sub<A> = (op0: A, op1: A) => A;

const sub =
  <A>(P: Arithmetics<A>): Sub<A> =>
  (op0, op1) =>
    P.sub(op0, op1);

type Mul<A> = (op0: A, op1: A) => A;

const mul =
  <A>(P: Arithmetics<A>): Mul<A> =>
  (op0, op1) =>
    P.mul(op0, op1);

type Div<A> = (op0: A, op1: A) => A;

const div =
  <A>(P: Arithmetics<A>): Div<A> =>
  (op0, op1) =>
    P.div(op0, op1);

export const getInstanceFor = <A>(P: Arithmetics<A>): Arithmetics<A> => ({
  cnst: cnst(P),
  neg: neg(P),
  add: add(P),
  sub: sub(P),
  mul: mul(P),
  div: div(P),
});

// -----------------------------------------------------------------------------
// Extended interpreter descriptor
// -----------------------------------------------------------------------------

export interface ArithmeticsExt<A> extends Arithmetics<A> {
  pow: Pow<A>;
}

type Pow<A> = (op0: A, op1: A) => A;

const pow =
  <A>(P: ArithmeticsExt<A>): Pow<A> =>
  (op0, op1) =>
    P.pow(op0, op1);

export const getInstanceExtFor = <A>(
  P: ArithmeticsExt<A>
): ArithmeticsExt<A> => ({
  ...getInstanceFor(P),
  pow: pow(P),
});

// -----------------------------------------------------------------------------
// Interpreter implementations
// -----------------------------------------------------------------------------

export const interpreterNum: Arithmetics<number> = {
  cnst: Number,
  neg: (a) => -a,
  add: (op0, op1) => op0 + op1,
  sub: (op0, op1) => op0 - op1,
  mul: (op0, op1) => op0 * op1,
  div: (op0, op1) => op0 / op1,
};

export const interpreterStr: Arithmetics<string> = {
  cnst: String,
  neg: (a) => "-" + a,
  add: (op0, op1) => "(" + op0 + "+" + op1 + ")",
  sub: (op0, op1) => "(" + op0 + "-" + op1 + ")",
  mul: (op0, op1) => "(" + op0 + "*" + op1 + ")",
  div: (op0, op1) => "(" + op0 + "/" + op1 + ")",
};

export const interpreterNumThunk: Arithmetics<() => number> = {
  cnst: (a) => () => Number(a),
  neg: (a) => () => -a(),
  add: (op0, op1) => () => op0() + op1(),
  sub: (op0, op1) => () => op0() + op1(),
  mul: (op0, op1) => () => op0() * op1(),
  div: (op0, op1) => () => op0() / op1(),
};

/**
 * Manually lifted interpreter
 */
export const interpreterNumEval: Arithmetics<Eval<number>> = {
  cnst: liftMUnaryS<Ev.URI, number>(Ev.Monad)(interpreterNum.cnst),
  neg: liftMUnary<Ev.URI, number>(Ev.Monad)(interpreterNum.neg),
  add: liftMBinary<Ev.URI, number>(Ev.Monad)(interpreterNum.add),
  sub: liftMBinary<Ev.URI, number>(Ev.Monad)(interpreterNum.sub),
  mul: liftMBinary<Ev.URI, number>(Ev.Monad)(interpreterNum.mul),
  div: liftMBinary<Ev.URI, number>(Ev.Monad)(interpreterNum.div),
};

/**
 * Lift `Arithmetics` interpreter into monad `M`
 */
const arithmeticsInterpreterLiftM = <F extends URIS, A>(
  M: Monad1<F>
): ((int: Arithmetics<A>) => Arithmetics<Kind<F, A>>) =>
  evolve({
    cnst: liftMUnaryS<F, A>(M),
    neg: liftMUnary<F, A>(M),
    add: liftMBinary<F, A>(M),
    sub: liftMBinary<F, A>(M),
    mul: liftMBinary<F, A>(M),
    div: liftMBinary<F, A>(M),
  });

/**
 * Automatically lifted interpreter
 */
export const interpreterStrEval: Arithmetics<Eval<string>> =
  arithmeticsInterpreterLiftM<Ev.URI, string>(Ev.Monad)(interpreterStr);
