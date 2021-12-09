namespace TM008 {
  export type Equals<A, B> = [A] extends [B]
    ? [B] extends [A]
      ? true
      : false
    : false;

  type And<A extends boolean, B extends boolean> = [A] extends [true]
    ? [B] extends [true]
      ? true
      : false
    : false;

  type StringContainsOnly<
    S extends string,
    Chars
  > = S extends `${infer Head}${infer Tail}`
    ? And<
        [Head] extends [Chars] ? true : false,
        StringContainsOnly<Tail, Chars>
      >
    : true;

  type IsDecString<S extends string> = StringContainsOnly<S, Dec>;

  const Dec0 = "0";
  const Dec1 = "1";
  const Dec2 = "2";
  const Dec3 = "3";
  const Dec4 = "4";
  const Dec5 = "5";
  const Dec6 = "6";
  const Dec7 = "7";
  const Dec8 = "8";
  const Dec9 = "9";

  type Dec0 = typeof Dec0;
  type Dec1 = typeof Dec1;
  type Dec2 = typeof Dec2;
  type Dec3 = typeof Dec3;
  type Dec4 = typeof Dec4;
  type Dec5 = typeof Dec5;
  type Dec6 = typeof Dec6;
  type Dec7 = typeof Dec7;
  type Dec8 = typeof Dec8;
  type Dec9 = typeof Dec9;
  type Dec =
    | Dec0
    | Dec1
    | Dec2
    | Dec3
    | Dec4
    | Dec5
    | Dec6
    | Dec7
    | Dec8
    | Dec9;

  type Add<A, B> = A extends any[]
    ? B extends any[]
      ? [...A, ...B]
      : never
    : never;

  type Mul10<A> = A extends any[]
    ? [...A, ...A, ...A, ...A, ...A, ...A, ...A, ...A, ...A, ...A]
    : never;

  interface Dec2Mul<A> {
    [Dec0]: A extends any[] ? [] : never;
    [Dec1]: A extends any[] ? [...A] : never;
    [Dec2]: A extends any[] ? [...A, ...A] : never;
    [Dec3]: A extends any[] ? [...A, ...A, ...A] : never;
    [Dec4]: A extends any[] ? [...A, ...A, ...A, ...A] : never;
    [Dec5]: A extends any[] ? [...A, ...A, ...A, ...A, ...A] : never;
    [Dec6]: A extends any[] ? [...A, ...A, ...A, ...A, ...A, ...A] : never;
    [Dec7]: A extends any[]
      ? [...A, ...A, ...A, ...A, ...A, ...A, ...A]
      : never;
    [Dec8]: A extends any[]
      ? [...A, ...A, ...A, ...A, ...A, ...A, ...A, ...A]
      : never;
    [Dec9]: A extends any[]
      ? [...A, ...A, ...A, ...A, ...A, ...A, ...A, ...A, ...A]
      : never;
  }

  interface Dec2A {
    [Dec0]: [];
    [Dec1]: [any];
    [Dec2]: [any, any];
    [Dec3]: [any, any, any];
    [Dec4]: [any, any, any, any];
    [Dec5]: [any, any, any, any, any];
    [Dec6]: [any, any, any, any, any, any];
    [Dec7]: [any, any, any, any, any, any, any];
    [Dec8]: [any, any, any, any, any, any, any, any];
    [Dec9]: [any, any, any, any, any, any, any, any, any];
  }

  type MulByDec<D, A> = D extends Dec ? Dec2Mul<A>[D] : never;

  type Dec2Num_<S extends string> = S extends `${infer Head}${infer Tail}`
    ? Tail extends ""
      ? [Dec2A[Head extends Dec ? Head : never], Dec2A[Dec1]]
      : Dec2Num_<Tail> extends [infer PrevResult, infer PrevPos]
      ? [
          Add<
            MulByDec<Head extends Dec ? Head : never, Mul10<PrevPos>>,
            PrevResult extends any[] ? PrevResult : never
          >,
          Mul10<PrevPos>
        ]
      : never
    : never;

  type Dec2Num<S extends string> = IsDecString<S> extends true
    ? Dec2Num_<S>[0]["length"]
    : never;

  export namespace Dec2NumTests {
    // Non-numerical symbols
    export const _w01: Equals<Dec2Num<"a">, never> = true;
    export const _w02: Equals<Dec2Num<"10x">, never> = true;

    // Good inputs
    export const _001: Equals<Dec2Num<"">, never> = true;
    export const _002: Equals<Dec2Num<"0">, 0> = true;
    export const _003: Equals<Dec2Num<"1">, 1> = true;
    export const _004: Equals<Dec2Num<"0005">, 5> = true;
    export const _005: Equals<Dec2Num<"12">, 12> = true;
    export const _006: Equals<Dec2Num<"427">, 427> = true;
    export const _007: Equals<Dec2Num<"8705">, 8705> = true;

    // Max parsable number is 9999 because underlying tuple
    // representation supports only tuples of length up to 9999
    export const _008: Equals<Dec2Num<"9999">, 9999> = true;
  }
}
