import { knex as setupKenex, Knex } from "knex";
import { env } from "./env";

export const config: Knex.Config = {
  client: "sqlite",
  connection: {
    filename: env.data.DATABASE_URL,
  },
  useNullAsDefault: true,
  migrations: {
    extension: "ts",
    directory: "./db/migrations",
  },
};

export const knex = setupKenex(config);
