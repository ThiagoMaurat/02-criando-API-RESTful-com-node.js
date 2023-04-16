import { app } from "./app";
import { env } from "./env";

app
  .listen({
    port: env.data.PORT,
  })
  .then(() => console.log("server is running "));
