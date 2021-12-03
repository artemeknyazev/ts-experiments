import { genAddOneTree, testSequenceExt } from "./tagged.test";
import {
  evaluateNumTagless,
  evaluateStrTagless,
  evaluateStrEvalTagless,
  evaluateNumEvalTagless,
  evaluateExtStrTaglessExtF,
  evaluateExtStrTaglessExtFM,
} from "./transformations";
import { evaluateExtStr, evaluateNum, evaluateStr } from "./tagged";

describe("tagged arithmetics from tagless", () => {
  it("equivalence", () => {
    for (let n = 1; n < 100; n++) {
      const op = genAddOneTree(n);
      const rNum = evaluateNum(op);
      const rStr = evaluateStr(op);
      const rNumTagless = evaluateNumTagless(op);
      const rStrTagless = evaluateStrTagless(op);
      const rNumEvalTagless = evaluateNumEvalTagless(op).value;
      const rStrEvalTagless = evaluateStrEvalTagless(op).value;

      expect(rNumTagless).toBe(rNum);
      expect(rStrTagless).toBe(rStr);
      expect(rNumEvalTagless).toBe(rNum);
      expect(rStrEvalTagless).toBe(rStr);
    }

    const rExtStr = evaluateExtStr(testSequenceExt);
    const rExtTaglesss = evaluateExtStrTaglessExtF(testSequenceExt);
    const rExtEvalTagless = evaluateExtStrTaglessExtFM(testSequenceExt).value;
    expect(rExtTaglesss).toBe(rExtStr);
    expect(rExtEvalTagless).toBe(rExtStr);
  });

  it("stack safety", () => {
    const n = 2 ** 16;
    const op = genAddOneTree<any>(n);

    expect(() => {
      evaluateNumTagless(op);
    }).toThrow();

    expect(() => {
      evaluateStrTagless(op);
    }).toThrow();

    expect(() => {
      expect(evaluateNumEvalTagless(op).value).toBe(n);
    }).not.toThrow();

    expect(() => {
      evaluateStrEvalTagless(op).value;
    }).not.toThrow();
  });
});
