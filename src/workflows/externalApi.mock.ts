export interface ExternalAPI {
  /**
   * A read-only effectful async computation
   * @param key
   */
  readString: (key: string) => Promise<string | undefined>;

  /**
   * A reversible effectful async computation
   * @param key
   * @param value
   */
  writeString: (key: string, value: string) => Promise<void>;

  /**
   * A reversible effectful async computation
   * @param key
   */
  deleteString: (key: string) => Promise<void>;

  /**
   * An irreversible effectful async computation
   * @param data
   */
  sendMessage: (data: unknown) => Promise<void>;

  pollMessages: () => Promise<unknown[]>;
}

export const externalAPI = (): ExternalAPI => {
  const state: Record<string, string> = {};
  const messages: unknown[] = [];

  const readString: ExternalAPI["readString"] = (key) =>
    Promise.resolve(state[key]);

  const writeString: ExternalAPI["writeString"] = (key, value) =>
    Promise.resolve(void (state[key] = value));

  const deleteString: ExternalAPI["deleteString"] = (key) =>
    Promise.resolve(void delete state[key]);

  const sendMessage: ExternalAPI["sendMessage"] = (data) =>
    Promise.resolve(void messages.push(data));

  const pollMessages: ExternalAPI["pollMessages"] = () =>
    Promise.resolve([...messages]);

  return {
    readString,

    writeString,
    deleteString,
    sendMessage,
    pollMessages,
  };
};
