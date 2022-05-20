import { mutating, workflow } from "./async-based";

it("Read-only step succeeds", async () => {
  expect.assertions(1);
  const value = 1;
  const readValue = () => Promise.resolve(value);
  const flow = workflow(async () => {
    const v = await readValue();
    expect(v).toEqual(value);
  });
  await flow();
});

it("Mutating not compensatable step succeeds", async () => {
  expect.assertions(2);
  const prevValue = 1;
  const newValue = 2;
  let value = prevValue;
  const writeValue = (x: number) => Promise.resolve(void (value = x));
  const flow = workflow(async (ctx) => {
    await mutating(ctx, () => writeValue(newValue));
  });
  await flow();
  expect(value).not.toEqual(prevValue);
  expect(value).toEqual(newValue);
});

it("Mutating compensatable step succeeds", async () => {
  expect.assertions(2);
  const prevValue = 1;
  const newValue = 2;
  let value = prevValue;
  const writeValue = (x: number) => Promise.resolve(void (value = x));
  const flow = workflow(async (ctx) => {
    await mutating(
      ctx,
      () => writeValue(newValue),
      () => writeValue(prevValue)
    );
  });
  await flow();
  expect(value).not.toEqual(prevValue);
  expect(value).toEqual(newValue);
});

it("Read-only step is reverted on step error", async () => {
  expect.assertions(1);
  const value = 1;
  const readValue = () => Promise.resolve(value);
  const throwError = () => Promise.reject(new Error("test"));
  const flow = workflow(async () => {
    await readValue();
    await throwError;
  });
  try {
    await flow();
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
  const flow = workflow(async (ctx) => {
    await mutating(ctx, () => writeValue(newValue));
    await throwError();
  });
  try {
    await flow();
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
  const flow = workflow(async (ctx) => {
    await mutating(
      ctx,
      () => writeValue(newValue),
      () => writeValue(prevValue)
    );
    await throwError();
  });
  try {
    await flow();
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
  const flow = workflow(async (ctx) => {
    await mutating(
      ctx,
      () => writeValue(newValue),
      () => writeValue(prevValue)
    );
    try {
      await throwError();
    } catch (e) {
      expect(e).toEqual(new Error("test"));
    }
  });
  await flow();
  expect(value).toEqual(newValue);
});

it("Throwing an exception in an empty workflow does nothing", async () => {
  expect.assertions(1);
  const flow = workflow(async () => {
    throw new Error("test");
  });
  try {
    await flow();
  } catch (e) {
    expect(e).toEqual(new Error("test"));
  }
});

it.only("Throwing an exception after mutating compensatable step reverts workflow", async () => {
  expect.assertions(2);
  const prevValue = 1;
  const newValue = 2;
  let value = prevValue;
  const writeValue = (x: number) => Promise.resolve(void (value = x));
  const flow = workflow(async (ctx) => {
    await mutating(
      ctx,
      () => writeValue(newValue),
      () => writeValue(prevValue)
    );
    throw new Error("test");
  });
  try {
    await flow();
  } catch (e) {
    expect(e).toEqual(new Error("test"));
  }
  expect(value).toEqual(prevValue);
});

// todo: more tests capturing an order of computations (see `workflow` internals)
