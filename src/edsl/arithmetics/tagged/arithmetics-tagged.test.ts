import {
  cnst,
  neg,
  add,
  sub,
  mul,
  div,
  evaluateNum,
  evaluateStr,
  Op,
} from "./arithmetics-tagged";

// todo: write this as an unfolder for `ana`
const genAddMulTree = (n: number, m: number): Op => {
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
const genAddOneTree = (n: number): Op => {
  let op: Op = cnst(1);
  for (let m = n - 1; m > 0; m--) {
    op = add(cnst(1), op);
  }
  return op;
};

const testSequence = div(
  mul(cnst(15), neg(sub(cnst(7), mul(cnst(4), cnst(4))))),
  add(cnst(2), cnst(3))
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

  it.skip("stack safe versions", () => {
    const op = genAddOneTree(2 ** 16);

    expect(() => {
      evaluateNum(op);
    }).toThrow();

    expect(() => {
      evaluateStr(op);
    }).toThrow();

    expect(() => {
      throw new Error("stack-safe evaluateNum not implemented");
    }).not.toThrow();

    expect(() => {
      throw new Error("stack-safe evaluateStr not implemented");
    }).not.toThrow();
  });
});
