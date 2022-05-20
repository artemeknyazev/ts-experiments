import { mutating, readOnly, run, Workflow } from "./generator-based";

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

it("Mutating not compensatable step succeeds", async () => {
  expect.assertions(2);
  const prevValue = 1;
  const newValue = 2;
  let value = prevValue;
  const writeValue = (x: number) => Promise.resolve(void (value = x));
  const workflow = function* (): Workflow {
    yield mutating(() => writeValue(newValue));
  };
  await run(workflow());
  expect(value).not.toEqual(prevValue);
  expect(value).toEqual(newValue);
});

it("Mutating compensatable step succeeds", async () => {
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

it("Read-only step is reverted on step error", async () => {
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

it("Mutating not compensatable step is not reverted on step error", async () => {
  expect.assertions(2);
  const throwError = () => Promise.reject(new Error("test"));
  const prevValue = 1;
  const newValue = 2;
  let value = prevValue;
  const writeValue = (x: number) => Promise.resolve(void (value = x));
  const workflow = function* (): Workflow {
    yield mutating(() => writeValue(newValue));
    yield readOnly(throwError);
  };
  try {
    await run(workflow());
  } catch (e) {
    expect(e).toEqual(new Error("test"));
  }
  expect(value).toEqual(newValue);
});

it("Mutating compensatable step is reverted on step error", async () => {
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

it("Catching an external exception inside workflow doesn't revert it", async () => {
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

it("Throwing an exception after mutating compensatable step reverts workflow", async () => {
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
