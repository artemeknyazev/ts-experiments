# Type Manipulations

## 1. `tuple` to `union` conversion

From [here:](https://github.com/microsoft/TypeScript/issues/13298#issuecomment-423385929)

```typescript
[3, 1, 2][number]; // => 1 | 2 | 3
// or
const as = ["A", "B", "C"];
type A = typeof as[number]; // 'A' | 'B' | 'C
```

## 2. `union` to `tuple` conversion

[Here](https://stackoverflow.com/a/55128956) and [here.](https://github.com/microsoft/TypeScript/issues/13298#issuecomment-885980381) Not recommended.
