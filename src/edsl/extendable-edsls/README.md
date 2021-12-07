# Extendable eDSLs

The purpose of this project is to explore how to implement extendable algebras with their extendable interpreters using a tagged style (i.e. by explicitly defining a set of commands and operators constructing these commands).

- [x] demonstrate an extensibility problem with a sum type of commands -- [`001-simple-sum.ts`](/src/edsl/extendable-edsls/001-simple-sum.ts)
- [x] an approach with untyped internal commands -- [`002-untyped.ts`](/src/edsl/extendable-edsls/002-untyped.ts)
- [x] and approach with type `FixTerm` allowing to represent a recursive type without explicitly specifying types for internal recursive fields (see `Fix` type reference below) -- [`003-fix.ts`](/src/edsl/extendable-edsls/003-fix.ts)
- [ ] interactions between tagged and tagless algebras
- [ ] stack safe interpretation using interpreters that lift a tagless algebra into a monad
- [ ] multitype algebras -- define parameter types for the algebra, allowing operations to receive commands of different types and return any one of the defined types; these parameters are "free", meaning that actual types are substituted only inside an interpreter -- how to implement?

## References

- `Fix` type - [in Haskell,](https://en.wikibooks.org/wiki/Haskell/Fix_and_recursion) [here,](https://github.com/gcanti/recursion-schemes-ts/blob/master/src/index.ts) and [here](https://github.com/YBogomolov/ts-recursion-schemes-playground/blob/master/src/types/fix.ts).
- O. Kiselyov's ["Typed Tagless Final Interpreters"](https://okmij.org/ftp/tagless-final/course/lecture.pdf) lecture notes -- first few pages describe a tagged approach along with some useful references, e.g. W. Swierstra's paper ["Data types a la carte"](http://www.cs.ru.nl/~W.Swierstra/Publications/DataTypesALaCarte.pdf)
