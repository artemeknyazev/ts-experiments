namespace TM004 {
  type Equals<A, B> = [A] extends [B]
    ? [B] extends [A]
      ? true
      : false
    : false;

  // These are not-strict versions allowing to pass `boolean` type
  // instead of boolean type literal into it
  export namespace NotStrict {
    type Not<A extends boolean> = [A] extends [true] ? false : true;

    type And<A extends boolean, B extends boolean> = [A] extends [true]
      ? [B] extends [true]
        ? true
        : false
      : false;

    type Or<A extends boolean, B extends boolean> = [A] extends [true]
      ? true
      : [B] extends [true]
      ? true
      : false;

    // Tests
    export const NotB: Equals<Not<boolean>, true> = true;
    export const NotT: Equals<Not<true>, false> = true;
    export const NotF: Equals<Not<false>, true> = true;

    export const AndBT: Equals<And<boolean, true>, false> = true;
    export const AndBF: Equals<And<boolean, false>, false> = true;
    export const AndTB: Equals<And<true, boolean>, false> = true;
    export const AndFB: Equals<And<false, boolean>, false> = true;

    export const AndTT: Equals<And<true, true>, true> = true;
    export const AndTF: Equals<And<true, false>, false> = true;
    export const AndFT: Equals<And<false, true>, false> = true;
    export const AndFF: Equals<And<false, false>, false> = true;

    export const OrBT: Equals<Or<boolean, true>, true> = true;
    export const OrBF: Equals<Or<boolean, false>, false> = true;
    export const OrTB: Equals<Or<true, boolean>, true> = true;
    export const OrFB: Equals<Or<false, boolean>, false> = true;

    export const OrTT: Equals<Or<true, true>, true> = true;
    export const OrTF: Equals<Or<true, false>, true> = true;
    export const OrFT: Equals<Or<false, true>, true> = true;
    export const OrFF: Equals<Or<false, false>, false> = true;
  }

  // These are strict versions returning `never` when `boolean` is passed
  export namespace Strict {
    type Not<A extends boolean> = [A] extends [true]
      ? false
      : [A] extends [false]
      ? true
      : never;

    type And<A extends boolean, B extends boolean> = [A] extends [true]
      ? [B] extends [true]
        ? true
        : [B] extends [false]
        ? false
        : never
      : [A] extends [false]
      ? [B] extends [true]
        ? false
        : [B] extends [false]
        ? false
        : never
      : never;

    type Or<A extends boolean, B extends boolean> = [A] extends [true]
      ? [B] extends [true]
        ? true
        : [B] extends [false]
        ? true
        : never
      : [A] extends [false]
      ? [B] extends [true]
        ? true
        : [B] extends [false]
        ? false
        : never
      : never;

    // Tests
    export const NotB: Equals<Not<boolean>, never> = true;
    export const NotT: Equals<Not<true>, false> = true;
    export const NotF: Equals<Not<false>, true> = true;

    export const AndBT: Equals<And<boolean, true>, never> = true;
    export const AndBF: Equals<And<boolean, false>, never> = true;
    export const AndTB: Equals<And<true, boolean>, never> = true;
    export const AndFB: Equals<And<false, boolean>, never> = true;

    export const AndTT: Equals<And<true, true>, true> = true;
    export const AndTF: Equals<And<true, false>, false> = true;
    export const AndFT: Equals<And<false, true>, false> = true;
    export const AndFF: Equals<And<false, false>, false> = true;

    export const OrBT: Equals<Or<boolean, true>, never> = true;
    export const OrBF: Equals<Or<boolean, false>, never> = true;
    export const OrTB: Equals<Or<true, boolean>, never> = true;
    export const OrFB: Equals<Or<false, boolean>, never> = true;

    export const OrTT: Equals<Or<true, true>, true> = true;
    export const OrTF: Equals<Or<true, false>, true> = true;
    export const OrFT: Equals<Or<false, true>, true> = true;
    export const OrFF: Equals<Or<false, false>, false> = true;
  }
}
