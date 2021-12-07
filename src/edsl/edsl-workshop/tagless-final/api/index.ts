import { URIS } from "fp-ts/HKT";
import { Monad1 } from "fp-ts/Monad";

import { Db, getInstanceFor as dbGetInstanceFor } from "./db";

type Methods<F extends URIS> = Db<F>;

export type Program<F extends URIS> = Methods<F> & Monad1<F>;

export const getInstanceFor = <F extends URIS>(P: Program<F>): Methods<F> => ({
  ...dbGetInstanceFor(P),
});
