import { z } from "zod";
import { Hono } from "hono";
import { parse, subDays } from "date-fns";
import { eq, and, inArray, gte, lte, desc, sql } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";

import { db } from "@/db/drizzle";
import {
  transactions,
  insertTransactionSchema,
  categories,
  bankAccounts,
} from "@/db/schema";

import { v4 as uuidv4 } from "uuid";

import { verifyAuth } from "@hono/auth-js";

//import { HTTPException } from "hono/http-exception";

// add auth for get categories,

const app = new Hono()
  .get(
    "/",
    verifyAuth(),
    zValidator(
      "query",
      z.object({
        from: z.string().optional(),
        to: z.string().optional(),
        accountId: z.string().optional(),
      })
    ),
    async (c) => {
      const auth = c.get("authUser");
      const { from, to, accountId } = c.req.valid("query");
      if (!auth.token?.id) {
        return c.json({ error: "unauthorized" }, 401);
      }

      const defaultTo = new Date();
      const defaultFrom = subDays(defaultTo, 30);

      const startDate = from
        ? parse(from, "yyyy-MM-dd", new Date())
        : defaultFrom;

      const endDate = to
        ? parse(to, "yyyy-MM-dd", new Date())
        : defaultTo;

      const data = await db
        .select({
          id: transactions.id,
          date: transactions.date,
          category: categories.name,
          categoryId: transactions.categoryId,
          payee: transactions.payee,
          amount: transactions.amount,
          notes: transactions.notes,
          bankAccount: bankAccounts.name,
          accountId: transactions.accountId,
        })
        .from(transactions)
        .innerJoin(bankAccounts, eq(transactions.accountId, bankAccounts.id))
        .leftJoin(categories, eq(transactions.categoryId, categories.id))
        .where(
          and(
            accountId ? eq(transactions.accountId, accountId) : undefined,
            eq(bankAccounts.userId, auth.token.id),
            gte(transactions.date, startDate),
            lte(transactions.date, endDate)
          )
        )
        .orderBy(desc(transactions.date));
      if (!data || data.length === 0) {
        return c.json({ error: "No data" }, 400);
      }
      return c.json({ data });
    }
  )
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
      const { id } = c.req.valid("param");
      if (!id) {
        return c.json({ error: "Missing id" }, 400);
      }
      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const [data] = await db
        .select({
          id: transactions.id,
          date: transactions.date,
          categoryId: transactions.categoryId,
          payee: transactions.payee,
          amount: transactions.amount,
          notes: transactions.notes,
          accountId: transactions.accountId,
        })
        .from(transactions)
        .innerJoin(bankAccounts, eq(transactions.accountId, bankAccounts.id))
        .where(
          and(eq(transactions.id, id), eq(bankAccounts.userId, auth.token.id))
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
      insertTransactionSchema.omit({
        id: true,
      })
    ),
    async (c) => {
      const auth = c.get("authUser");
      const values = c.req.valid("json");
      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      const [data] = await db
        .insert(transactions)
        .values({
          id: uuidv4(),
          ...values,
        })
        .returning();
      return c.json({ data });
    }
  )
  .post(
    "/bulk-create",
    verifyAuth(),
    zValidator(
      "json",
      z.array(
        insertTransactionSchema.omit({
          id: true,
        })
      )
    ),
    async (c) => {
      const auth = c.get("authUser");
      const values = c.req.valid("json");

      if (!auth.token?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const data = await db
        .insert(transactions)
        .values(
          values.map((value) => ({
            id: uuidv4(),
            ...value,
          }))
        )
        .returning();

      return c.json({ data });
    }
  )
  .post(
    "/bulk-delete",
    verifyAuth(),
    zValidator(
      "json",
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

      const transactionsToDelete = db.$with("transactions_to_delete").as(
        db
          .select({
            id: transactions.id,
          })
          .from(transactions)
          .innerJoin(bankAccounts, eq(transactions.accountId, bankAccounts.id))
          .where(
            and(
              inArray(transactions.id, values.ids),
              eq(bankAccounts.userId, auth.token.id)
            )
          )
      );

      const data = await db
        .with(transactionsToDelete)
        .delete(transactions)
        .where(
          inArray(
            transactions.id,
            sql`(select id from ${transactionsToDelete})`
          )
        )
        .returning({
          id: transactions.id,
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
      insertTransactionSchema.omit({
        id: true,
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

      const transactionsToUpdate = db.$with("transactions_to_update").as(
        db
          .select({
            id: transactions.id,
          })
          .from(transactions)
          .innerJoin(bankAccounts, eq(transactions.accountId, bankAccounts.id))
          .where(
            and(
              eq(transactions.id, id),
              eq(bankAccounts.userId, auth.token?.id)
            )
          )
      );

      const [data] = await db
        .with(transactionsToUpdate)
        .update(transactions)
        .set(values)
        .where(
          inArray(
            transactions.id,
            sql`(select id from ${transactionsToUpdate})`
          )
        )
        .returning();

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({ data });
    }
  )
  .delete(
    "/:id",
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
        return c.json({ error: "Unauthorized" }, 401);
      }

      const transactionsToDelete = db.$with("transactions_to_delete").as(
        db
          .select({
            id: transactions.id,
          })
          .from(transactions)
          .innerJoin(bankAccounts, eq(transactions.accountId, bankAccounts.id))
          .where(
            and(
              eq(transactions.id, id),
              eq(bankAccounts.userId, auth.token?.id)
            )
          )
      );

      const [data] = await db
        .with(transactionsToDelete)
        .delete(transactions)
        .where(
          inArray(
            transactions.id,
            sql`(select id from ${transactionsToDelete})`
          )
        )
        .returning({
          id: transactions.id,
        });

      if (!data) {
        return c.json({ error: "Not found" }, 404);
      }

      return c.json({ data });
    }
  );

export default app;
