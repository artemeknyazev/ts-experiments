import { DatabaseF } from "./db";

export * from "./db";

export const ProgramFURI = "ProgramF";
export type ProgramFURI = typeof ProgramFURI;

export type ProgramF<A> = DatabaseF<A>;

declare module "fp-ts/lib/HKT" {
  interface URItoKind<A> {
    [ProgramFURI]: ProgramF<A>;
  }
}
