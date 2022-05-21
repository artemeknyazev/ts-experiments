import { mutating, pivot, readOnly, run, Workflow } from "./generator-based";

describe("Single-step workflows", () => {
  it("Read-only step succeeds", async () => {
    expect.assertions(1);
    const value = 1;
    const readValue = () => Promise.resolve(value);
    const workflow = function* (): Workflow {
      const v = yield readOnly(() => readValue());
      expect(v).toEqual(value);
    };
    await run(workflow());
  });

  it("Pivot step succeeds", async () => {
    expect.assertions(2);
    const prevValue = 1;
    const newValue = 2;
    let value = prevValue;
    const writeValue = (x: number) => Promise.resolve(void (value = x));
    const workflow = function* (): Workflow {
      yield pivot(() => writeValue(newValue));
    };
    await run(workflow());
    expect(value).not.toEqual(prevValue);
    expect(value).toEqual(newValue);
  });

  it("Mutating step succeeds", async () => {
    expect.assertions(2);
    const prevValue = 1;
    const newValue = 2;
    let value = prevValue;
    const writeValue = (x: number) => Promise.resolve(void (value = x));
    const workflow = function* (): Workflow {
      yield mutating(
        () => writeValue(newValue),
        () => writeValue(prevValue)
      );
    };
    await run(workflow());
    expect(value).not.toEqual(prevValue);
    expect(value).toEqual(newValue);
  });

  it("Read-only step is compensated on step error", async () => {
    expect.assertions(2);
    const value = 1;
    const readValue = () => Promise.resolve(value);
    const throwError = () => Promise.reject(new Error("test"));
    const workflow = function* (): Workflow {
      yield readOnly(() => readValue());
      yield readOnly(throwError);
    };
    try {
      await run(workflow());
    } catch (e) {
      expect(e).toEqual(new Error("test"));
    }
    expect(value).toEqual(1);
  });

  it("Pivot step is not compensated on step error", async () => {
    expect.assertions(2);
    const throwError = () => Promise.reject(new Error("test"));
    const prevValue = 1;
    const newValue = 2;
    let value = prevValue;
    const writeValue = (x: number) => Promise.resolve(void (value = x));
    const workflow = function* (): Workflow {
      yield pivot(() => writeValue(newValue));
      yield readOnly(throwError);
    };
    try {
      await run(workflow());
    } catch (e) {
      expect(e).toEqual(new Error("test"));
    }
    expect(value).toEqual(newValue);
  });

  it("Mutating step is compensated on step error", async () => {
    expect.assertions(2);
    const throwError = () => Promise.reject(new Error("test"));
    const prevValue = 1;
    const newValue = 2;
    let value = prevValue;
    const writeValue = (x: number) => Promise.resolve(void (value = x));
    const workflow = function* (): Workflow {
      yield mutating(
        () => writeValue(newValue),
        () => writeValue(prevValue)
      );
      yield readOnly(throwError);
    };
    try {
      await run(workflow());
    } catch (e) {
      expect(e).toEqual(new Error("test"));
    }
    expect(value).toEqual(prevValue);
  });
});

describe("Workflows and exceptions", () => {
  it("Catching an async exception inside workflow doesn't revert it", async () => {
    expect.assertions(2);
    const throwError = () => Promise.reject(new Error("test"));
    const prevValue = 1;
    const newValue = 2;
    let value = prevValue;
    const writeValue = (x: number) => Promise.resolve(void (value = x));
    const workflow = function* (): Workflow {
      yield mutating(
        () => writeValue(newValue),
        () => writeValue(prevValue)
      );
      try {
        yield readOnly(throwError);
      } catch (e) {
        expect(e).toEqual(new Error("test"));
      }
    };
    await run(workflow());
    expect(value).toEqual(newValue);
  });

  it("Catching a sync exception of the mutating step inside workflow doesn't revert it", async () => {
    const prevA = "a";
    const newA = "aa";
    const prevB = "b";
    let a = prevA;
    let b = prevB;
    const writeA = (x: string) => Promise.resolve(void (a = x));
    const writeB = (x: string) => Promise.resolve(void (b = x));
    const workflow = function* (): Workflow {
      yield mutating(
        () => writeA(newA),
        () => writeA(prevA)
      );
      try {
        yield mutating(
          () => {
            throw new Error("test");
          },
          () => writeB(prevB)
        );
      } catch (e) {
        expect(e).toEqual(new Error("test"));
      }
    };
    await run(workflow());
    expect(a).toEqual(newA);
    expect(b).toEqual(prevB);
  });

  it("Catching an async exception of the mutating step inside workflow doesn't revert it", async () => {
    const prevA = "a";
    const newA = "aa";
    const prevB = "b";
    let a = prevA;
    let b = prevB;
    const writeA = (x: string) => Promise.resolve(void (a = x));
    const writeB = (x: string) => Promise.resolve(void (b = x));
    const throwError = () => Promise.reject(new Error("test"));
    const workflow = function* (): Workflow {
      yield mutating(
        () => writeA(newA),
        () => writeA(prevA)
      );
      try {
        yield mutating(
          () => throwError(),
          () => writeB(prevB)
        );
      } catch (e) {
        expect(e).toEqual(new Error("test"));
      }
    };
    await run(workflow());
    expect(a).toEqual(newA);
    expect(b).toEqual(prevB);
  });

  it("Workflow step where exception is caught manually is not reverted when the whole workflow is reverted", async () => {
    const prevA = "a";
    const newA = "aa";
    const prevB = "b";
    const newB = "bb";
    const someB1 = "bbb";
    const someB2 = "bbbB";
    let a = prevA;
    let b = prevB;
    const writeA = (x: string) => Promise.resolve(void (a = x));
    const writeB = (x: string) => Promise.resolve(void (b = x));
    const throwError = (m: string = "test") => Promise.reject(new Error(m));
    const workflow = function* (): Workflow {
      yield mutating(
        () => writeA(newA),
        () => writeA(prevA)
      );
      try {
        yield mutating(
          () => throwError("test1"),
          () => writeB(someB1)
        );
      } catch (e) {
        expect(e).toEqual(new Error("test1"));
      }
      yield mutating(
        () => writeB(newB),
        () => writeB(someB2)
      );
      throw new Error("test2");
    };
    try {
      await run(workflow());
    } catch (e) {
      expect(e).toEqual(new Error("test2"));
    }
    expect(a).toEqual(prevA);
    expect(b).toEqual(someB2);
  });

  it("Throwing an exception in an empty workflow does nothing", async () => {
    expect.assertions(1);
    const workflow = function* (): Workflow {
      throw new Error("test");
    };
    try {
      await run(workflow());
    } catch (e) {
      expect(e).toEqual(new Error("test"));
    }
  });

  it("Throwing an exception after a mutating step reverts workflow", async () => {
    expect.assertions(2);
    const prevValue = 1;
    const newValue = 2;
    let value = prevValue;
    const writeValue = (x: number) => Promise.resolve(void (value = x));
    const workflow = function* (): Workflow {
      yield mutating(
        () => writeValue(newValue),
        () => writeValue(prevValue)
      );
      throw new Error("test");
    };
    try {
      await run(workflow());
    } catch (e) {
      expect(e).toEqual(new Error("test"));
    }
    expect(value).toEqual(prevValue);
  });

  it("Throwing an exception after a pivot step does not revert workflow", async () => {
    expect.assertions(2);
    const prevValue = 1;
    const newValue = 2;
    let value = prevValue;
    const writeValue = (x: number) => Promise.resolve(void (value = x));
    const workflow = function* (): Workflow {
      yield pivot(() => writeValue(newValue));
      throw new Error("test");
    };
    try {
      await run(workflow());
    } catch (e) {
      expect(e).toEqual(new Error("test"));
    }
    expect(value).toEqual(newValue);
  });
});

describe("Multi-step workflows", () => {
  it("Workflow is compensated if no pivots, the last operation is compensatable, and an error happened after it", async () => {
    const prevA = "a";
    const newA = "aa";
    const prevB = "b";
    const newB = "bb";
    let a = prevA;
    let b = prevB;
    const writeA = (x: string) => Promise.resolve(void (a = x));
    const writeB = (x: string) => Promise.resolve(void (b = x));
    const flow = function* (): Workflow {
      yield mutating(
        () => writeA(newA),
        () => writeA(prevA)
      );
      yield mutating(
        () => writeB(newB),
        () => writeB(prevB)
      );
      throw new Error("test");
    };
    try {
      await flow();
    } catch (e) {
      expect(e).toEqual(new Error("test"));
    }
    expect(a).toEqual(prevA);
    expect(b).toEqual(prevB);
  });

  it("Workflow is compensated if no pivots, the last operation is compensatable, and an error happened during it", async () => {
    const prevA = "a";
    const newA = "aa";
    const prevB = "b";
    let a = prevA;
    let b = prevB;
    const writeA = (x: string) => Promise.resolve(void (a = x));
    const writeB = (x: string) => Promise.resolve(void (b = x));
    const flow = function* (): Workflow {
      yield mutating(
        () => writeA(newA),
        () => writeA(prevA)
      );
      yield mutating(
        () => {
          throw new Error("test");
        },
        () => writeB(prevB)
      );
    };
    try {
      await flow();
    } catch (e) {
      expect(e).toEqual(new Error("test"));
    }
    expect(a).toEqual(prevA);
    expect(b).toEqual(prevB);
  });

  it("Workflow is not compensated if one pivot, the last operation is compensatable, and an error happened after it", async () => {
    const prevA = "a";
    const newA = "aa";
    const prevB = "b";
    const newB = "bb";
    let a = prevA;
    let b = prevB;
    const writeA = (x: string) => Promise.resolve(void (a = x));
    const writeB = (x: string) => Promise.resolve(void (b = x));
    const flow = function* (): Workflow {
      yield pivot(() => writeA(newA));
      yield mutating(
        () => writeB(newB),
        () => writeB(prevB)
      );
      throw new Error("test");
    };
    try {
      await flow();
    } catch (e) {
      expect(e).toEqual(new Error("test"));
    }
    expect(a).toEqual(prevA);
    expect(b).toEqual(prevB);
  });

  it("Workflow is not compensated if one pivot, the last operation is pivot, and error happened after it", async () => {
    const prevA = "a";
    const newA = "aa";
    const prevB = "b";
    const newB = "bb";
    let a = prevA;
    let b = prevB;
    const writeA = (x: string) => Promise.resolve(void (a = x));
    const writeB = (x: string) => Promise.resolve(void (b = x));
    const flow = function* (): Workflow {
      yield pivot(() => writeA(newA));
      yield pivot(() => writeB(newB));
      throw new Error("test");
    };
    try {
      await flow();
    } catch (e) {
      expect(e).toEqual(new Error("test"));
    }
    expect(a).toEqual(prevA);
    expect(b).toEqual(prevB);
  });

  it("Workflow is not compensated if one pivot, the last operation is compensatable, and an error happened during it", async () => {
    const prevA = "a";
    const newA = "aa";
    const prevB = "b";
    let a = prevA;
    let b = prevB;
    const writeA = (x: string) => Promise.resolve(void (a = x));
    const writeB = (x: string) => Promise.resolve(void (b = x));
    const flow = function* (): Workflow {
      yield pivot(() => writeA(newA));
      yield mutating(
        () => {
          throw new Error("test");
        },
        () => writeB(prevB)
      );
    };
    try {
      await flow();
    } catch (e) {
      expect(e).toEqual(new Error("test"));
    }
    expect(a).toEqual(prevA);
    expect(b).toEqual(prevB);
  });

  it("Workflow is not compensated if one pivot, the last operation is pivot, and an error happened after it", async () => {
    const prevA = "a";
    const newA = "aa";
    const prevB = "b";
    const newB = "bb";
    let a = prevA;
    let b = prevB;
    const writeA = (x: string) => Promise.resolve(void (a = x));
    const writeB = (x: string) => Promise.resolve(void (b = x));
    const workflow = function* (): Workflow {
      yield mutating(
        () => writeA(newA),
        () => writeA(prevA)
      );
      yield pivot(() => writeB(newB));
      throw new Error("test");
    };
    try {
      await run(workflow());
    } catch (e) {
      expect(e).toEqual(new Error("test"));
    }
    expect(a).toEqual(newA);
    expect(b).toEqual(newB);
  });

  it("Workflow is compensated if one pivot, the last operation is pivot, and an error happened during it", async () => {
    const prevA = "a";
    const newA = "aa";
    const prevB = "b";
    let a = prevA;
    let b = prevB;
    const writeA = (x: string) => Promise.resolve(void (a = x));
    const flow = function* (): Workflow {
      yield mutating(
        () => writeA(newA),
        () => writeA(prevA)
      );
      yield pivot(() => {
        throw new Error("test");
      });
    };
    try {
      await flow();
    } catch (e) {
      expect(e).toEqual(new Error("test"));
    }
    expect(a).toEqual(prevA);
    expect(b).toEqual(prevB);
  });

  it("Workflow is not compensated if two pivots, the last operation is pivot, and an error happened after it", async () => {
    const prevA = "a";
    const newA = "aa";
    const prevB = "b";
    const newB = "bb";
    let a = prevA;
    let b = prevB;
    const writeA = (x: string) => Promise.resolve(void (a = x));
    const writeB = (x: string) => Promise.resolve(void (b = x));
    const flow = function* (): Workflow {
      yield pivot(() => writeA(newA));
      yield pivot(() => writeB(newB));
      throw new Error("test");
    };
    try {
      await flow();
    } catch (e) {
      expect(e).toEqual(new Error("test"));
    }
    expect(a).toEqual(prevA);
    expect(b).toEqual(prevB);
  });

  it("Workflow is not compensated if two pivots, the last operation is pivot, and an error happened during it", async () => {
    const prevA = "a";
    const newA = "aa";
    const prevB = "b";
    let a = prevA;
    let b = prevB;
    const writeA = (x: string) => Promise.resolve(void (a = x));
    const flow = function* (): Workflow {
      yield pivot(() => writeA(newA));
      yield pivot(() => {
        throw new Error("test");
      });
      throw new Error("test");
    };
    try {
      await flow();
    } catch (e) {
      expect(e).toEqual(new Error("test"));
    }
    expect(a).toEqual(prevA);
    expect(b).toEqual(prevB);
  });
});
