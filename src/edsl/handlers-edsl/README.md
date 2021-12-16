# Handlers eDSL

Musings on eDSLs that have both creation-time and execution-time dependencies (e.g. DB operations that require a connection/client/transaction object for each operation).

## [`handlers-lazy.ts`](/src/edsl/handlers-edsl/handlers-lazy.ts)

- Handler is some delayed operation that has dependencies upon creation (`HandlerDependenciesBefore`) and upon execution of a handler sequence (`HandlerDependenciesAfter<A>`)
- Handlers are represented as a tagless algebra `Handlers<A>` with algebra creator `handlers`
- Each handler is described and implemented in it's own namespace -- grouping closely related things together simplifies understanding
- Handlers typed as `(<...deps before>) => (<...handler params>) => (<...deps after>) => <result>` can be combined into programs of type `(handlers) => (<...program params>) => (<...deps after>) => <result>`
- Handlers described this way conform to a `Monad` interface, allowing us to describe programs not only manually (see `manual chaining` section in tests), but also semi-manually, using `of`, `chain` and `map` operations, or using a `Do`-notation (see `semi-manual chaining` and `do-chaining` sections)

## TODO

- [ ] Try rewriting with `Reader` monad? `ReaderTask`, `ReaderTaskEither`?
