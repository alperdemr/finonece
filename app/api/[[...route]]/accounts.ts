import { z } from "zod";
import { Hono } from "hono";
import { eq, and, inArray } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { verifyAuth } from "@hono/auth-js";

import { db } from "@/db/drizzle";
import { bankAccounts, insertBankAccountSchema } from "@/db/schema";

import { v4 as uuidv4 } from "uuid";

//import { HTTPException } from "hono/http-exception";

// add auth for get accounts,

const app = new Hono()
  .get("/", verifyAuth(), async (c) => {
    const auth = c.get("authUser");
    if (!auth.token?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const data = await db
      .select({
        id: bankAccounts.id,
        name: bankAccounts.name,
      })
      .from(bankAccounts);
    //.where(eq(accounts.userId,auth.userId))
    return c.json({ data });
  })
  .get(
    "/:id",
    verifyAuth(),
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      })
    ),
    // add auth
    async (c) => {
      const auth = c.get("authUser");
      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      const { id } = c.req.valid("param");
      if (!id) {
        return c.json({ error: "Missing id" }, 400);
      }

      const [data] = await db
        .select({
          id: bankAccounts.id,
          name: bankAccounts.name,
        })
        .from(bankAccounts)
        .where(
          and(eq(bankAccounts.userId, auth.token.id), eq(bankAccounts.id, id))
        );
      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }
      return c.json({ data });
    }
  )
  .post(
    "/",
    verifyAuth(),
    zValidator(
      "json",
      insertBankAccountSchema.pick({
        name: true,
      })
    ),
    async (c) => {
      const auth = c.get("authUser");
      const values = c.req.valid("json");
      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      const [data] = await db
        .insert(bankAccounts)
        .values({
          id: uuidv4(),
          userId: auth.token.id,
          ...values,
        })
        .returning();
      return c.json({ data });
    }
  )
  .post(
    "/bulk-delete",
    verifyAuth(),
    zValidator(
      "json",
      // add middleware
      z.object({
        ids: z.array(z.string()),
      })
    ),
    async (c) => {
      const auth = c.get("authUser");

      const values = c.req.valid("json");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const data = await db
        .delete(bankAccounts)
        .where(
          and(
            eq(bankAccounts.userId, auth.token.id),
            inArray(bankAccounts.id, values.ids)
          )
        )
        .returning({
          id: bankAccounts.id,
        });

      return c.json({ data });
    }
  )
  .patch(
    "/:id",
    verifyAuth(),
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      })
    ),
    zValidator(
      "json",
      insertBankAccountSchema.pick({
        name: true,
      })
    ),
    async (c) => {
      const auth = c.get("authUser");
      const { id } = c.req.valid("param");
      const values = c.req.valid("json");

      if (!id) {
        return c.json({ error: "Missing id" }, 400);
      }
      if (!auth.token?.id) {
        return c.json({ error: "unauthorized" }, 401);
      }
      const [data] = await db
        .update(bankAccounts)
        .set(values)
        .where(and(eq(bankAccounts.userId, auth.token.id), eq(bankAccounts.id, id)))
        .returning();

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({ data });
    }
  )
  .delete(
    "/:id",
    verifyAuth(),
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      })
    ),
    async (c) => {
      const auth = c.get("authUser");
      const { id } = c.req.valid("param");

      if (!id) {
        return c.json({ error: "Missing id" }, 400);
      }
      if (!auth.token?.id) {
        return c.json({ error: "unauthorized" }, 401);
      }
      const [data] = await db
        .delete(bankAccounts)
        .where(and(eq(bankAccounts.userId, auth.token.id), eq(bankAccounts.id, id)))
        .returning({
          id: bankAccounts.id,
        });

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({ data });
    }
  );

export default app;
