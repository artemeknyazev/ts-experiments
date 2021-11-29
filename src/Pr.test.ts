import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { ap, chain, flatten, map, of, Pr, then, unwrap, wrap } from "./Pr";
import { fact as factRef, fib as fibRef, resolveNext } from "./utils";

it("of (sync) - unwrap", (done) => {
  const n = 1;
  pipe(
    of(n),
    unwrap((a) => {
      expect(a).toBe(n);
      done();
    })
  );
});

it("of (sync) - then - unwrap", (done) => {
  const n = 1;
  pipe(
    of(n),
    then((n) => of(String(n))),
    unwrap((a) => {
      expect(a).toBe(String(a));
      done();
    })
  );
});

it("of (async) - unwrap", (done) => {
  const n = 1;
  pipe(
    wrap(resolveNext(n)),
    unwrap((a) => {
      expect(a).toBe(n);
      done();
    })
  );
});

it("of (async) - then - unwrap", (done) => {
  const n = 1;
  pipe(
    wrap(resolveNext(n)),
    then((n) => of(String(n))),
    unwrap((a) => {
      expect(a).toBe(String(a));
      done();
    })
  );
});

it("map", (done) => {
  const n = 1;
  pipe(
    of(n),
    map(String),
    unwrap((a) => {
      expect(a).toBe(String(a));
      done();
    })
  );
});

it("ap", (done) => {
  const n = 1;
  pipe(
    of(String),
    ap(of(n)),
    unwrap((a) => {
      expect(a).toBe(String(a));
      done();
    })
  );
});

it("chain", (done) => {
  const n = 1;
  const f = (n: number) => of(n + 1);
  pipe(
    of(n),
    chain(f),
    unwrap((a) => {
      expect(a).toBe(2);
      done();
    })
  );
});

it("flatten", (done) => {
  const n = 1;
  pipe(
    of(of(n)),
    flatten,
    unwrap((a) => {
      expect(a).toBe(n);
      done();
    })
  );
});

it("factorial", (done) => {
  const fact_ = (n: number): Pr<Pr<number>> =>
    n > 1
      ? wrap(() =>
          pipe(
            fact_(n - 1),
            flatten,
            map((x) => x * n)
          )
        )
      : of(of(1));
  const fact = (n: number): Pr<number> => flatten(fact_(n));

  pipe(
    fact(10),
    unwrap((a) => {
      expect(a).toBe(factRef(10));
      done();
    })
  );
});

it("factorial tail recursive", (done) => {
  // Next call should be deferred, so it is `wrap`'ed, but this requires
  // - flattening `fact_`'s result before doing further calculations
  // - wrapping twice results of non-recursive cases
  const fact_ = (n: number, acc: number): Pr<Pr<number>> =>
    n > 1 ? wrap(() => flatten(fact_(n - 1, n * acc))) : of(of(acc));
  const fact = (n: number): Pr<number> => flatten(fact_(n, 1));

  const n = 10;
  pipe(
    fact(n),
    unwrap((a) => {
      expect(a).toBe(factRef(n));
      done();
    })
  );
});

it("adder", (done) => {
  const adder_ = (n: number, acc: number): Pr<Pr<number>> =>
    n > 1 ? wrap(() => flatten(adder_(n - 1, acc + 1))) : of(of(acc));
  const adder = (n: number): Pr<number> => flatten(adder_(n, 0));

  const n = 2 ** 16;
  pipe(
    adder(n),
    unwrap((a) => {
      expect(a).toBe(n - 1);
      done();
    })
  );
});

it("fibonacci", (done) => {
  const fib_ = (n: number): Pr<Pr<number>> =>
    n === 0 || n === 1
      ? of(of(1))
      : wrap(() =>
          pipe(
            fib_(n - 1),
            flatten,
            then((x) =>
              pipe(
                fib_(n - 2),
                flatten,
                then((y) => of(x + y))
              )
            )
          )
        );

  const fib = (n: number): Pr<number> => flatten(fib_(n));

  const n = 7;
  pipe(
    fib(n),
    unwrap((a) => {
      expect(a).toBe(fibRef(n));
      done();
    })
  );
});

it("even-odd", (done) => {
  const even_ = (n: number): Pr<Pr<boolean>> =>
    n === 0 ? of(of(true)) : wrap(() => flatten(odd_(n - 1)));
  const odd_ = (n: number): Pr<Pr<boolean>> =>
    n === 0 ? of(of(false)) : wrap(() => flatten(even_(n - 1)));
  const even = (n: number) => flatten(even_(n));

  pipe(
    even(2 ** 16),
    unwrap((a) => {
      expect(a).toBe(true);
      done();
    })
  );
});

it("ackerman", (done) => {
  const ack_ = (m: number, n: number): Pr<Pr<number>> =>
    m === 0
      ? of(of(n + 1))
      : n === 0
      ? wrap(() => flatten(ack_(m - 1, 1)))
      : wrap(() =>
          pipe(
            ack_(m, n - 1),
            flatten,
            then((x) => pipe(ack_(m - 1, x), flatten))
          )
        );
  const ack = (m: number, n: number): Pr<number> => flatten(ack_(m, n));

  pipe(
    ack(2, 1),
    unwrap((a) => {
      expect(a).toBe(5);
      done();
    })
  );
});

it("mutual recursion of functions of different signatures", (done) => {
  const f_ = (n: number): Pr<Pr<number>> =>
    n > 0
      ? wrap(() =>
          pipe(
            g_(n, n % 3 === 0),
            flatten,
            map(
              O.match(
                () => n - 2,
                (x) => x - 1
              )
            )
          )
        )
      : of(of(1));
  const g_ = (n: number, b: boolean): Pr<Pr<O.Option<number>>> =>
    n > 0
      ? b
        ? of(of(O.none))
        : wrap(() => pipe(f_(n - 1), flatten, map(O.some)))
      : of(of(O.some(0)));
  const f = (n: number) => flatten(f_(n));

  pipe(
    f(9),
    unwrap((a) => {
      expect(a).toBe(7);
      done();
    })
  );
});
