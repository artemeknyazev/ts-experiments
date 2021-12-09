namespace TM005 {
  /**
   * Comparison between type literals and types, including a structural
   * one for tuples and structs
   *
   * *Note:* `[A] extends [B]` - see https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types
   *
   * *Side note:* `extends` is a one-directional relation similar to 'includes'.
   * One can build `Eq` and `Ord` typeclasses using it over a set of types
   *
   * @example
   * ```
   * // TODO: move to tests
   *
   * // A type literal is only equal to itself
   * Equal<'', 'a'> = false
   * Equal<'abc', 'abc'> = true
   * Equal<true, true> = true
   * Equal<true, false> = false
   * Equal<1,2> = false
   * Equal<10,10> = true
   *
   * // A type is only equal to itself
   * Equal<'abc', string> = false
   * Equal<string, string> = true
   * Equal<true, boolean> = false
   * Equal<boolean, boolean> = true
   * Equal<1, number> = false
   * Equal<number, number> = true
   *
   * // Structural equality
   * Equal<[], []> = true
   * Equal<[], [1]> = false
   * Equal<{}, {}> = true
   * Equal<{a: 2}, {a: 1}> = false
   * Equal<{a:1, c: 2}, {a: 1, c: 2}> = true
   * Equal<[{a: 1}, {b: 2}], [{a: 1}, {b: 2}]> = true
   * ```
   */
  type Equal<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;

  // For string literals length is not calculated at compile time
  type EqualLengthStringNotWorking<A extends string, B extends string> = Equal<
    A["length"],
    B["length"]
  >;

  // TODO: move to tests
  // Always true because A['length'] is number not known at compile time
  export type A0 = EqualLengthStringNotWorking<"a", "bc">;

  /**
   * Compare tuples lengths
   */
  type EqualLengthTupleNaive<A extends any[], B extends any[]> = Equal<
    A["length"],
    B["length"]
  >;

  // TODO: move to tests
  // Can be calculated for tuples with lengths known at compile time
  export type A1 = EqualLengthTupleNaive<[], []>; // true
  export type A2 = EqualLengthTupleNaive<[], [1]>; // false
  export type A3 = EqualLengthTupleNaive<[1, 2, 3], ["a", "b", "c"]>; // true
  export type A4 = EqualLengthTupleNaive<any[], any[]>; // true, but this is an arbitrary length array

  /**
   * Tuple length can be used to emulate compile time integer calculation,
   * see https://github.com/no-day/fp-ts-sized-vectors/blob/main/src/index.ts#L253
   */

  // Recursive versions

  type EqualLengthTupleRecursive<A extends any[], B extends any[]> = A extends [
    unknown,
    ...infer TailA
  ]
    ? B extends [unknown, ...infer TailB]
      ? TailA extends any[] // inference currently doesn't interact with type constraints
        ? TailB extends any[]
          ? EqualLengthTupleRecursive<TailA, TailB>
          : never
        : never
      : false
    : B extends [unknown, ...unknown[]]
    ? false
    : true;

  // TODO: move to tests
  export type A5 = EqualLengthTupleRecursive<[], [1]>;

  type EqualLengthStringRecursive<
    A extends string,
    B extends string
  > = A extends `${infer _HeadA}${infer TailA}`
    ? B extends `${infer _HeadB}${infer TailB}`
      ? TailA extends string // inference currently doesn't interact with type constraints
        ? TailB extends string
          ? EqualLengthStringRecursive<TailA, TailB>
          : never
        : never
      : false
    : B extends `${infer _HeadB}${infer _TailB}`
    ? false
    : true;

  // TODO: move to tests
  export type A6 = EqualLengthStringRecursive<"123", "1231">;

  // Abstracted recursive version

  export type HeadTailString<T extends string> =
    T extends `${infer Head}${infer Tail}` ? [Head, Tail] : never;

  export type HeadTailTuple<T extends any[]> = T extends [
    infer Head,
    ...infer Tail
  ]
    ? [Head, Tail]
    : never;

  // Note: `never` is used both for error (default) case
  // and for 'cannot infer' (empty array or string) case,
  // resulting in possible error miss
  export type HeadTailAny<T extends string | any[]> = T extends string
    ? HeadTailString<T>
    : T extends any[]
    ? HeadTailTuple<T>
    : never;

  // Evaluates to [unknown, unknown], so we need to either
  // - check `T extends never` first
  // - or to check `Head` and `Tail` for `unknown`
  export type TestNeverInference<T = never> = T extends [infer Head, infer Tail]
    ? [Head, Tail]
    : never;

  export type EqualLengthRecursive<
    A extends T,
    B extends T,
    T extends string | any[] = string | any[]
  > = HeadTailAny<A> extends never
    ? HeadTailAny<B> extends never
      ? true
      : false
    : HeadTailAny<B> extends never
    ? false
    : HeadTailAny<A> extends [unknown, infer TailA]
    ? HeadTailAny<B> extends [unknown, infer TailB]
      ? TailA extends T
        ? TailB extends T
          ? EqualLengthRecursive<TailA, TailB>
          : never
        : never
      : never
    : never;

  // TODO: move to tests
  export type _2 = EqualLengthRecursive<[1], [2]>;
}
