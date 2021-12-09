namespace TM006 {
  // Help routines
  type Equals<A, B> = [A] extends [B]
    ? [B] extends [A]
      ? true
      : false
    : false;
  type And<A extends boolean, B extends boolean> = [A] extends [true]
    ? [B] extends [true]
      ? true
      : false
    : false;

  // Bit types

  // Use strings to:
  // a) infer string literal type
  // b) use these constants as keys for operator tables
  const Bit0 = "0";
  const Bit1 = "1";

  type Bit0 = typeof Bit0;
  type Bit1 = typeof Bit1;
  type Bit = Bit0 | Bit1;

  // For `add` operator over `Bit` set we can
  // - either produce a function that uses `extends` and `?:`
  //   condition operators, but it's a long and error prone way
  // - or produce a table with all possible results and
  //   acquire the required one based on incoming tuple

  // `add` operator over `Bit` set produces only one result value
  // We can either write a wrapping type that also uses a carry bit
  // and outputs a new carry bit, or factor it in a table

  // left: Bit -> right: Bit -> carry: Bit -> [result: Bit, newCarry: Bit]
  type AddBitTable = {
    [Bit0]: {
      [Bit0]: {
        [Bit0]: [Bit0, Bit0];
        [Bit1]: [Bit1, Bit0];
      };
      [Bit1]: {
        [Bit0]: [Bit1, Bit0];
        [Bit1]: [Bit0, Bit1];
      };
    };
    [Bit1]: {
      [Bit0]: {
        [Bit0]: [Bit1, Bit0];
        [Bit1]: [Bit0, Bit1];
      };
      [Bit1]: {
        [Bit0]: [Bit0, Bit1];
        [Bit1]: [Bit1, Bit1];
      };
    };
  };

  /**
   * Adds two bits together using a carry bit
   * ```
   * (left: Bit, right: Bit, carry: Bit = Bit0) ->
   *   [result: Bit, newCarry: Bit]
   * ```
   *
   * @example
   * ```
   * AddBit<Bit0, Bit1> = [Bit1, Bit0]
   * AddBit<Bit1, Bit0, Bit1> = [Bit0, Bit1]
   * ```
   *
   */
  type AddBit<
    Left extends Bit,
    Right extends Bit,
    Carry extends Bit = Bit0
  > = AddBitTable[Left][Right][Carry];

  export namespace AddBitTests {
    export const AddBit000: Equals<
      AddBit<Bit0, Bit0, Bit0>,
      [Bit0, Bit0]
    > = true;
    export const AddBit010: Equals<
      AddBit<Bit0, Bit1, Bit0>,
      [Bit1, Bit0]
    > = true;
    export const AddBit100: Equals<
      AddBit<Bit1, Bit0, Bit0>,
      [Bit1, Bit0]
    > = true;
    export const AddBit110: Equals<
      AddBit<Bit1, Bit1, Bit0>,
      [Bit0, Bit1]
    > = true;
    export const AddBit001: Equals<
      AddBit<Bit0, Bit0, Bit1>,
      [Bit1, Bit0]
    > = true;
    export const AddBit011: Equals<
      AddBit<Bit0, Bit1, Bit1>,
      [Bit0, Bit1]
    > = true;
    export const AddBit101: Equals<
      AddBit<Bit1, Bit0, Bit1>,
      [Bit0, Bit1]
    > = true;
    export const AddBit111: Equals<
      AddBit<Bit1, Bit1, Bit1>,
      [Bit1, Bit1]
    > = true;
  }

  /**
   * Recursive part of AddBits routine
   *
   * Assumes `Left` and `Right` strings are of the same length
   *
   * ```
   * '' -> '' -> ['', Bit0]
   * `${lm}${lr}` -> `${rm}${rr}` ->
   *   [`${rh}${rt}`, rc] where
   *     [rt, tc] = AddBits_ lr rr,
   *     [rh, rc] = AddBit lm rm tc
   * ```
   */
  type AddBits_<
    Left extends string,
    Right extends string
  > = Left extends `${infer LeftHead}${infer LeftTail}`
    ? Right extends `${infer RightHead}${infer RightTail}`
      ? AddBits_<
          [LeftTail] extends [string] ? LeftTail : never,
          [RightTail] extends [string] ? RightTail : never
        > extends [infer ResultTail, infer TailCarry]
        ? AddBit<
            [LeftHead] extends [Bit] ? LeftHead : never,
            [RightHead] extends [Bit] ? RightHead : never,
            [TailCarry] extends [Bit] ? TailCarry : never
          > extends [infer ResultHead, infer NewResultCarry]
          ? [
              `${[ResultHead] extends [string] ? ResultHead : never}${[
                ResultTail
              ] extends [string]
                ? ResultTail
                : never}`,
              NewResultCarry
            ]
          : never
        : never
      : ["", Bit0]
    : ["", Bit0];

  /**
   * Recursively compares lengths of two strings
   *
   * @example
   * ```
   * EqualLengthString<'',''> = true
   * EqualLengthString<'abc','aa'> = false
   * ```
   */
  type EqualLengthString<
    A extends string,
    B extends string
  > = A extends `${infer _1}${infer TailA}`
    ? B extends `${infer _2}${infer TailB}`
      ? EqualLengthString<
          TailA extends string ? TailA : never,
          TailB extends string ? TailB : never
        >
      : false
    : B extends `${infer _3}${infer _4}`
    ? false
    : true;

  export namespace EqualLengthStringTests {
    // Equal length
    export const _00: Equals<EqualLengthString<"", "">, true> = true;
    export const _11: Equals<EqualLengthString<"a", "b">, true> = true;
    export const _22: Equals<EqualLengthString<"aa", "bc">, true> = true;
    // Not equal length
    export const _01: Equals<EqualLengthString<"", "a">, false> = true;
    export const _02: Equals<EqualLengthString<"", "ab">, false> = true;
    export const _10: Equals<EqualLengthString<"a", "">, false> = true;
    export const _20: Equals<EqualLengthString<"ab", "">, false> = true;
    export const _21: Equals<EqualLengthString<"ab", "c">, false> = true;
    export const _12: Equals<EqualLengthString<"a", "bc">, false> = true;
  }

  /**
   * Ensures string contains only specified set of symbols
   * `Chars` should be specified as a sum type of one character strings
   * An empty string is assumed to contain anything
   *
   * @example
   * ```
   * Equals<'', '1' | '2' | '3'> = true
   * Equals<'abc', '1' | '2' | '3'> = false
   * Equals<'010001', '0' | '1'> = true
   * ```
   */
  type StringContainsOnly<
    S extends string,
    Chars
  > = S extends `${infer Head}${infer Tail}`
    ? And<
        [Head] extends [Chars] ? true : false,
        StringContainsOnly<Tail, Chars>
      >
    : true;
  // StringContainsOnly test
  export const sco1: Equals<
    StringContainsOnly<"", "1" | "2" | "3">,
    true
  > = true;
  export const sco2: Equals<
    StringContainsOnly<"abc", "1" | "2" | "3">,
    false
  > = true;
  export const sco3: Equals<
    StringContainsOnly<"1231321", "1" | "2" | "3">,
    true
  > = true;
  export const sco4: Equals<
    StringContainsOnly<"010001", "0" | "1">,
    true
  > = true;
  /**
   * Ensures a string contains only `'0' | '1'` symbols
   */
  type IsBitString<S extends string> = StringContainsOnly<S, Bit>;
  /**
   * Adds two numbers in bit representation
   *
   * Two incoming strings are checked to
   * - be of equal lengths
   * - contain only `'0' | '1'` symbols
   *
   * Resulting number has the same string length
   */
  type AddBits<Left extends string, Right extends string> = And<
    EqualLengthString<Left, Right>,
    And<IsBitString<Left>, IsBitString<Right>>
  > extends true
    ? AddBits_<Left, Right>[0]
    : never;

  export namespace AddBitsTests {
    // Wrong length
    export const ab001: Equals<AddBits<"", "1">, never> = true;
    export const ab002: Equals<AddBits<"01001", "111">, never> = true;

    // Not bit strings
    export const ab003: Equals<AddBits<"123", "1">, never> = true;
    export const ab004: Equals<AddBits<"1", "1543">, never> = true;

    // Valid inputs
    export const ab005: Equals<AddBits<"0", "0">, "0"> = true;
    export const ab006: Equals<AddBits<"0", "1">, "1"> = true;
    export const ab007: Equals<AddBits<"1", "0">, "1"> = true;
    export const ab008: Equals<AddBits<"1", "1">, "0"> = true;

    export const ab009: Equals<AddBits<"00", "00">, "00"> = true;
    export const ab010: Equals<AddBits<"00", "01">, "01"> = true;
    export const ab011: Equals<AddBits<"00", "10">, "10"> = true;
    export const ab012: Equals<AddBits<"00", "11">, "11"> = true;
    export const ab013: Equals<AddBits<"01", "00">, "01"> = true;
    export const ab014: Equals<AddBits<"01", "01">, "10"> = true;
    export const ab015: Equals<AddBits<"01", "10">, "11"> = true;
    export const ab016: Equals<AddBits<"01", "11">, "00"> = true;
    export const ab017: Equals<AddBits<"10", "00">, "10"> = true;
    export const ab018: Equals<AddBits<"10", "01">, "11"> = true;
    export const ab019: Equals<AddBits<"10", "10">, "00"> = true;
    export const ab020: Equals<AddBits<"10", "11">, "01"> = true;
    export const ab021: Equals<AddBits<"11", "00">, "11"> = true;
    export const ab022: Equals<AddBits<"11", "01">, "00"> = true;
    export const ab023: Equals<AddBits<"11", "10">, "01"> = true;
    export const ab024: Equals<AddBits<"11", "11">, "10"> = true;

    export const ab025: Equals<
      AddBits<"01111110", "00101010">,
      "10101000"
    > = true; // 126 + 42 = 168

    // Maximum 15 bits, after that compiler goes too deep
    type b = "000000000000000";
    // type b = '111111111111111';
    export const ab027: Equals<AddBits<b, b>, b> = true;
  }
}
