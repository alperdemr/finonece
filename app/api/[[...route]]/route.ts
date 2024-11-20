import { Hono, Context } from "hono";
import { handle } from "hono/vercel";
import { AuthConfig, initAuthConfig } from "@hono/auth-js";

import authConfig from "@/auth.config";

import users from "./users";
import accounts from "./accounts";
import categories from "./categories";
import transactions from "./transactions";

export const runtime = "nodejs";

function getAuthConfig(c: Context): AuthConfig {
  return {
    secret: process.env.AUTH_SECRET,
    ...authConfig,
  };
}

const app = new Hono().basePath("/api");

app.use("*", initAuthConfig(getAuthConfig));

// app.onError((err, c) => {
//   if (err instanceof HTTPException) {
//     return err.getResponse();
//   }
//   return c.json({ error: "Internal error" },500);
// });

const routes = app
  .route("/users", users)
  .route("/accounts", accounts)
  .route("/categories", categories)
  .route("/transactions", transactions);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;
