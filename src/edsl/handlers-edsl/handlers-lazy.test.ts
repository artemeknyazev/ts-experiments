import { pipe } from "fp-ts/function";
import { Do } from "fp-ts-contrib/Do";

import {
  Handler,
  handlers,
  Handlers,
  StoreClient,
  Transform,
  chain,
  Monad,
} from "./handlers-lazy";

class Store implements StoreClient<any> {
  private _map: Map<string, any> = new Map();

  getValue(key: string) {
    return this._map.get(key);
  }

  setValue(key: string, value: any) {
    this._map.set(key, value);
    return value;
  }
}

class TransformN implements Transform {
  transform(a: number) {
    return a * 2;
  }
}

function checkExample1(
  example1: (H: Handlers<number>) => Handler<number, number>
) {
  it("example 1", () => {
    const client = new Store();
    client.setValue("a", 1);

    const H = handlers<number>({ transform: new TransformN() });

    const r = example1(H)({ client });

    expect(r).toBe(2);
    expect(client.getValue("a")).toBe(2);
  });
}

function checkExample2(
  example2: (H: Handlers<number>) => Handler<number, number>
) {
  it("example 2", () => {
    const client = new Store();
    client.setValue("a", 1);
    client.setValue("b", 2);

    const H = handlers<number>({ transform: new TransformN() });

    const r = example2(H)({ client });

    expect(r).toBe(3);
    expect(client.getValue("a")).toBe(1);
    expect(client.getValue("b")).toBe(2);
    expect(client.getValue("ab")).toBe(3);
  });
}

function checkExample3(
  example3: (H: Handlers<string>) => Handler<string, number>
) {
  it("example 3", () => {
    const client = new Store();
    client.setValue("a", "1");
    client.setValue("b", "2");

    const H = handlers<string>({ transform: new TransformN() });

    const r = example3(H)({ client });

    expect(r).toBe(4);
    expect(client.getValue("a")).toBe("1");
    expect(client.getValue("b")).toBe("2");
    expect(client.getValue("ab")).toBe("4");
  });
}

describe("manual chaining", () => {
  const example1 =
    (H: Handlers<number>): Handler<number, number> =>
    (deps) => {
      const a = H.getValue("a")(deps);
      return H.setValue("a", a + 1)(deps);
    };

  checkExample1(example1);

  const example2 =
    (H: Handlers<number>): Handler<number, number> =>
    (deps) => {
      const a = H.getValue("a")(deps);
      const b = H.getValue("b")(deps);
      return H.setValue("ab", a + b)(deps);
    };

  checkExample2(example2);
});

describe("semi-manual chaining", () => {
  const example1 = (H: Handlers<number>): Handler<number, number> =>
    pipe(
      H.getValue("a"),
      chain((a) => H.setValue("a", a + 1))
    );

  checkExample1(example1);

  const example2 = (H: Handlers<number>): Handler<number, number> =>
    pipe(
      H.getValue("a"),
      chain((a) =>
        pipe(
          H.getValue("b"),
          chain((b) => H.setValue("ab", a + b))
        )
      )
    );

  checkExample2(example2);
});

describe("do-chaining", () => {
  const example1 = (H: Handlers<number>): Handler<number, number> =>
    Do(Monad)
      .bind("a", H.getValue("a"))
      .bindL("r", ({ a }) => H.setValue("a", a + 1))
      .return(({ r }) => r);

  checkExample1(example1);

  const example2 = (H: Handlers<number>): Handler<number, number> =>
    Do(Monad)
      .bind("a", H.getValue("a"))
      .bind("b", H.getValue("b"))
      .bindL("r", ({ a, b }) => H.setValue("ab", a + b))
      .return(({ r }) => r);

  checkExample2(example2);

  const example3 = (H: Handlers<string>): Handler<string, number> =>
    Do(Monad)
      .bind("a", H.getValue("a"))
      .bind("b", H.getValue("b"))
      .bindL("ta", ({ a }) => H.transformValue(Number(a)))
      .letL("r", ({ ta, b }) => ta + Number(b))
      .doL(({ r }) => H.setValue("ab", String(r)))
      .return(({ r }) => r);

  checkExample3(example3);
});
