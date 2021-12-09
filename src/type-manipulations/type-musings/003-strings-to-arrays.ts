namespace TM003 {
  /**
   * String literal inference can be used to convert a string literal
   * into a symbol tuple of an arbitrary length
   */

  export type String2Array_<
    S extends string,
    A extends string[]
  > = S extends `${infer p}${infer s}` ? String2Array_<s, [...A, p]> : A;
  export type String2Array<S extends string> = String2Array_<S, []>;

  export type P00 = String2Array<"">;

  export type Array2String_<A extends string[], S extends string> = A extends [
    infer head,
    ...infer tail
  ]
    ? head extends string
      ? tail extends string[]
        ? Array2String_<tail, `${S}${head}`>
        : never
      : never
    : S;
  export type Array2String<A extends string[]> = Array2String_<A, "">;

  export type P01 = Array2String<["a", "b"]>;
}
