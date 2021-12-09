namespace TM001 {
  // [A] extends [B] - see https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types
  export type Equal<A, B> = [A] extends [B]
    ? [B] extends [A]
      ? true
      : false
    : false;

  // For string literals length is not calculated at compile time
  export type EqualLengthString<A extends string, B extends string> = Equal<
    A["length"],
    B["length"]
  >;

  // Always true because A['length'] is number not known at compile time
  export type C0 = EqualLengthString<"a", "bc">;

  export type EqualLengthTuple<A extends any[], B extends any[]> = Equal<
    A["length"],
    B["length"]
  >;

  // Can be calculated for tuples with lengths known at compile time
  export type C1 = EqualLengthTuple<[1], [2, 3]>;

  // Tuple length can be used to emulate compile time integer calculation,
  // see https://github.com/no-day/fp-ts-sized-vectors/blob/main/src/index.ts#L253
}
