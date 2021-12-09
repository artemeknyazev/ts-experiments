namespace TM002 {
  /**
   * A tuple can be inferred using a spread-operator in (at least) two ways:
   * - `A extends [infer head, ...infer tail]`
   * - `A extends [infer ...init, infer last]`
   *
   * Here, we did't count `[infer first, infer second, infer ...rest]` and similar.
   *
   * In comparison, string literal inference `S extends \`${infer p}${infer s}\``
   * produces only:
   * - one leftmost symbol for `p` (if any)
   * - empty string (if input is an empty string) or one or multiple symbols for `s`
   *
   * Currently (TS 4.4.4) there's no equivalent spread-operator for strings
   */

  /**
   * Return tuple's first element
   *
   * @example
   * ```
   * TupleHead<[]> = never
   * TupleHead<[1]> = 1
   * TupleHead<[1, 2, 3]> = 1
   * ```
   */
  export type TupleHead<T extends any[]> = T extends [infer head, ...infer _]
    ? head
    : never;

  /**
   * Return all tuple's elements except the first one
   *
   * @example
   * ```
   * TupleTail<[]> = never
   * TupleTail<[1]> = []
   * TupleTail<[1, 2, 3]> = [2, 3]
   * ```
   */
  export type TupleTail<T extends any[]> = T extends [infer _, ...infer tail]
    ? tail
    : never;

  /**
   * Return all tuple's elements except the last one
   *
   * @example
   * ```
   * TupleTail<[]> = never
   * TupleTail<[1]> = []
   * TupleTail<[1, 2, 3]> = [1, 2]
   * ```
   */
  export type TupleInit<T extends any[]> = T extends [...infer init, infer _]
    ? init
    : never;

  /**
   * Return tuple's last element
   *
   * @example
   * ```
   * TupleTail<[]> = never
   * TupleTail<[1]> = 1
   * TupleTail<[1, 2, 3]> = 3
   * ```
   */
  export type TupleLast<T extends any[]> = T extends [...infer _, infer last]
    ? last
    : never;

  /**
   * Returns string literal's first symbol
   *
   * @example
   * ```
   * StringHead<''> = never
   * StringHead<'a'> = 'a'
   * StringHead<'abc'> = 'a'
   * ```
   */
  export type StringHead<S extends string> = S extends `${infer head}${infer _}`
    ? head
    : never;

  /**
   * Returns all string literal's symbols except first
   *
   * @example
   * ```
   * StringTail<''> = never
   * StringTail<'a'> = ''
   * StringTail<'abc'> = 'bc'
   * ```
   */
  export type StringTail<S extends string> = S extends `${infer _}${infer tail}`
    ? tail
    : never;
}
