import { Kind, URIS } from "fp-ts/HKT";

export interface Arithmetics<F extends URIS, A> {
  cnst: Cnst<F, A>;
  neg: Neg<F, A>;
  add: Add<F, A>;
  mul: Mul<F, A>;
}

export type Cnst<F extends URIS, A> = (a: any) => Kind<F, A>;

const cnst =
  <F extends URIS, A>(P: Arithmetics<F, A>): Cnst<F, A> =>
  (a) =>
    P.cnst(a);

type Neg<F extends URIS, A> = (op0: Kind<F, A>) => Kind<F, A>;

const neg =
  <F extends URIS, A>(P: Arithmetics<F, A>): Neg<F, A> =>
  (op0) =>
    P.neg(op0);

type Add<F extends URIS, A> = (op0: Kind<F, A>, op1: Kind<F, A>) => Kind<F, A>;

const add =
  <F extends URIS, A>(P: Arithmetics<F, A>): Add<F, A> =>
  (op0, op1) =>
    P.add(op0, op1);

type Mul<F extends URIS, A> = (op0: Kind<F, A>, op1: Kind<F, A>) => Kind<F, A>;

const mul =
  <F extends URIS, A>(P: Arithmetics<F, A>): Add<F, A> =>
  (op0, op1) =>
    P.mul(op0, op1);

export const getInstanceFor = <F extends URIS, A>(
  P: Arithmetics<F, A>
): Arithmetics<F, A> => ({
  cnst: cnst(P),
  neg: neg(P),
  add: add(P),
  mul: mul(P),
});
