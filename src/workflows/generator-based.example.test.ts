import {
  mutating,
  readOnly,
  run,
  Mutating,
  ReadOnly,
  Workflow,
} from "./generator-based";
import { externalAPI, ExternalAPI } from "./externalApi.mock";

/* Flow-wrapped API */

export interface FlowAPI {
  /* Read-only */
  readString(key: string): ReadOnly<string | undefined>;

  /* Mutating */
  createString(key: string, value: string): Mutating<void>;
  writeString(key: string, value: string, prevValue: string): Mutating<void>;
  deleteString(key: string, prevValue: string): Mutating<void>;
  sendMessage(data: unknown): Mutating<void>;
}

export const flowAPI = (api: ExternalAPI): FlowAPI => {
  /* Read-only */
  const readString: FlowAPI["readString"] = (key) =>
    readOnly(() => api.readString(key));

  /* Mutating */
  const createString: FlowAPI["createString"] = (key, value) =>
    mutating(
      () => api.writeString(key, value),
      () => api.deleteString(key)
    );

  const writeString: FlowAPI["writeString"] = (key, value, prevValue) =>
    mutating(
      () => api.writeString(key, value),
      () => api.writeString(key, prevValue)
    );

  const deleteString: FlowAPI["deleteString"] = (key, prevValue) =>
    mutating(
      () => api.deleteString(key),
      () => api.writeString(key, prevValue)
    );

  const sendMessage: FlowAPI["sendMessage"] = (data) =>
    mutating(() => api.sendMessage(data));

  return {
    readString,

    createString,
    writeString,
    deleteString,
    sendMessage,
  };
};

/* Example flows */

export const combineValuesWorkflow = (api: FlowAPI) =>
  function* (keyLeft: string, keyRight: string, keyNew: string): Workflow {
    const valueLeft: string = yield api.readString(keyLeft);
    if (!valueLeft) {
      yield api.sendMessage({ payload: "Not found" });
      return;
    }
    const valueRight: string = yield api.readString(keyRight);
    if (!valueRight) {
      yield api.sendMessage({ payload: "Not found" });
      return;
    }

    const valueNew: string = valueLeft + valueRight;
    yield api.deleteString(keyLeft, valueLeft);
    yield api.deleteString(keyRight, valueRight);
    yield api.createString(keyNew, valueNew);
    yield api.sendMessage({ payload: "Created" });
  };

/* Tests */

const keyLeft: string = "a";
const valueLeft: string = "va";
const keyRight: string = "b";
const valueRight: string = "vb";
const keyNew: string = "c";

it("Sends a 'Not found' message when left key is not found", async () => {
  expect.assertions(4);
  const eApi = externalAPI();
  const fApi = flowAPI(eApi);
  await run(combineValuesWorkflow(fApi)(keyLeft, keyRight, keyNew));
  expect(await eApi.readString(keyLeft)).toBe(undefined);
  expect(await eApi.readString(keyRight)).toBe(undefined);
  expect(await eApi.readString(keyNew)).toBe(undefined);
  expect(await eApi.pollMessages()).toEqual([{ payload: "Not found" }]);
});

it("Sends a 'Not found' message when right key is not found", async () => {
  expect.assertions(4);
  const eApi = externalAPI();
  await eApi.writeString(keyLeft, valueLeft);
  const fApi = flowAPI(eApi);
  await run(combineValuesWorkflow(fApi)(keyLeft, keyRight, keyNew));
  expect(await eApi.readString(keyLeft)).toBe(valueLeft);
  expect(await eApi.readString(keyRight)).toBe(undefined);
  expect(await eApi.readString(keyNew)).toBe(undefined);
  expect(await eApi.pollMessages()).toEqual([{ payload: "Not found" }]);
});

it("Computes when both keys are present", async () => {
  expect.assertions(4);
  const eApi = externalAPI();
  await eApi.writeString(keyLeft, valueLeft);
  await eApi.writeString(keyRight, valueRight);
  const fApi = flowAPI(eApi);
  await run(combineValuesWorkflow(fApi)(keyLeft, keyRight, keyNew));
  expect(await eApi.readString(keyLeft)).toBe(undefined);
  expect(await eApi.readString(keyRight)).toBe(undefined);
  expect(await eApi.readString(keyNew)).toBe(valueLeft + valueRight);
  expect(await eApi.pollMessages()).toEqual([{ payload: "Created" }]);
});

it("Does not revert when error happens after the workflow", async () => {
  expect.assertions(5);
  const eApi = externalAPI();
  await eApi.writeString(keyLeft, valueLeft);
  await eApi.writeString(keyRight, valueRight);
  const fApi = flowAPI(eApi);
  const workflow = function* () {
    yield* combineValuesWorkflow(fApi)(keyLeft, keyRight, keyNew);
    yield readOnly(() => Promise.reject(new Error("test")));
  };
  try {
    await run(workflow());
  } catch (e) {
    expect(e).toEqual(new Error("test"));
  }
  expect(await eApi.readString(keyLeft)).toBe(undefined);
  expect(await eApi.readString(keyRight)).toBe(undefined);
  expect(await eApi.readString(keyNew)).toBe(valueLeft + valueRight);
  expect(await eApi.pollMessages()).toEqual([{ payload: "Created" }]);
});

it("Reverts when sendMessage errors out", async () => {
  expect.assertions(5);
  const eApi = {
    ...externalAPI(),
    sendMessage: () => Promise.reject(new Error("test")),
  };
  await eApi.writeString(keyLeft, valueLeft);
  await eApi.writeString(keyRight, valueRight);
  const fApi = flowAPI(eApi);
  try {
    await run(combineValuesWorkflow(fApi)(keyLeft, keyRight, keyNew));
  } catch (e) {
    expect(e).toEqual(new Error("test"));
  }
  expect(await eApi.readString(keyLeft)).toBe(valueLeft);
  expect(await eApi.readString(keyRight)).toBe(valueRight);
  expect(await eApi.readString(keyNew)).toBe(undefined);
  expect(await eApi.pollMessages()).toEqual([]);
});
