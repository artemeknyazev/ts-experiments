import {
  Op,
  cnst,
  neg,
  add,
  sub,
  mul,
  div,
  pow,
  evaluateNum,
  evaluateStr,
  evaluateNumEval,
  evaluateStrEval,
  evaluateExtStr,
  evaluateExtStrEval,
} from "./arithmetics-tagged";

// todo: write this as an unfolder for `ana`
const genAddMulTree = <A>(n: number, m: number): Op<A> => {
  if (n <= m) return cnst(n);

  for (let d = m; d > 1; d--) {
    if (n % d === 0) {
      return mul(cnst(d), genAddMulTree(n / d, m));
    }
  }

  let a = Math.floor(n / 2);
  let b = n - a;
  return add(genAddMulTree(a, m), genAddMulTree(b, m));
};

// todo: write this as an unfolder for `ana`
const genAddOneTree = <A>(n: number): Op<A> => {
  let op: Op<A> = cnst(1);
  for (let m = n - 1; m > 0; m--) {
    op = add(cnst(1), op);
  }
  return op;
};

const testSequence = div(
  mul(cnst(15), neg(sub(cnst(7), mul(cnst(4), cnst(4))))),
  add(cnst(2), cnst(3))
);

// todo: fix types to allow extended functions to be used with the base ones
const testSequenceExt = div(
  // @ts-ignore
  add(mul(cnst(5), cnst(7)), pow(cnst(2), cnst(3))),
  sub(div(cnst(15), cnst(5)), mul(cnst(2), cnst(5)))
);

describe("tagged arithmetics", () => {
  it("evaluateNum for provided op sequence", () => {
    expect(evaluateNum(testSequence)).toBe(27);
  });

  it("evaluateNum for generated op sequence", () => {
    for (let n = 1; n <= 100; n++)
      expect(evaluateNum(genAddMulTree(n, 9))).toBe(n);
  });

  it("evaluateStr for provided op sequence", () => {
    expect(evaluateStr(testSequence)).toBe("((15*-(7-(4*4)))/(2+3))");
  });

  it("evaluateExtStr for provided op sequence", () => {
    expect(evaluateExtStr(testSequenceExt)).toBe(
      "((([5]*[7])+[2]^[3])/(([15]/[5])-([2]*[5])))"
    );
  });

  it("evaluateExtStrEval for provided op sequence", () => {
    expect(evaluateExtStrEval(testSequenceExt).value).toBe(
      "((([5]*[7])+[2]^[3])/(([15]/[5])-([2]*[5])))"
    );
  });

  it("stack safe versions", () => {
    const n = 2 ** 16;
    const op = genAddOneTree(n);

    expect(() => {
      evaluateNum(op);
    }).toThrow();

    expect(() => {
      evaluateStr(op);
    }).toThrow();

    expect(() => {
      expect(evaluateNumEval(op).value).toBe(n);
    }).not.toThrow();

    expect(() => {
      evaluateStrEval(op).value;
    }).not.toThrow();
  });
});
