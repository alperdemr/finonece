// import { z } from "zod";
// import { Hono } from "hono";
// import { parse, subDays } from "date-fns";
// import { eq, and, inArray } from "drizzle-orm";
// import { zValidator } from "@hono/zod-validator";

// import { db } from "@/db/drizzle";
// import { transactions, insertTransactionSchema } from "@/db/schema";

// import { v4 as uuidv4 } from "uuid";

// //import { HTTPException } from "hono/http-exception";

// // add auth for get categories,

// const app = new Hono()
//   .get(
//     "/",
//     zValidator(
//       "query",
//       z.object({
//         from: z.string().optional(),
//         to: z.string().optional(),
//         accountId: z.string().optional(),
//       })
//     ),
//     async (c) => {
//       //const auth = getAuth(c)
//       const { from, to, accountId } = c.req.valid("query");
//       // if(!auth) {return c.json({error:"unauthorized",401})}
//       // with httpexception throw new HTTPException(401,{res:c.json({error:"Unauthorized"},401)})
//       const defaultTo = new Date();
//       const defaultFrom = subDays(defaultTo, 30);

//       const startDate = from ? parse()
//       const data = await db
//         .select({
//           id: categories.id,
//           name: categories.name,
//         })
//         .from(categories);
//       //.where(eq(accounts.userId,auth.userId))
//       return c.json({ data });
//     }
//   )
//   .get(
//     "/:id",
//     zValidator(
//       "param",
//       z.object({
//         id: z.string().optional(),
//       })
//     ),
//     // add auth
//     async (c) => {
//       //const auth = getAuth(c)
//       const { id } = c.req.valid("param");
//       if (!id) {
//         return c.json({ error: "Missing id" }, 400);
//       }
//       /* if(!auth.userId) {
//     return c.json({error:"Unauthorized"},401)
//   }
//     */
//       const [data] = await db
//         .select({
//           id: categories.id,
//           name: categories.name,
//         })
//         .from(categories)
//         .where(and(eq(categories.userId, "1"), eq(categories.id, id)));
//       if (!data) {
//         return c.json({ error: "Not found" }, 404);
//       }
//       return c.json({ data });
//     }
//   )
//   .post(
//     "/",
//     zValidator(
//       "json",
//       insertCategorySchema.pick({
//         name: true,
//       })
//     ),
//     async (c) => {
//       // implement auth
//       const values = c.req.valid("json");
//       // if(!auth) {return c.json({error:"Unauthorized"},401)}
//       const [data] = await db
//         .insert(categories)
//         .values({
//           id: uuidv4(),
//           userId: "1",
//           ...values,
//         })
//         .returning();
//       return c.json({ data });
//     }
//   )
//   .post(
//     "/bulk-delete",
//     zValidator(
//       "json",
//       // add middleware
//       z.object({
//         ids: z.array(z.string()),
//       })
//     ),
//     async (c) => {
//       //const auth = getAuth(c)

//       const values = c.req.valid("json");

//       /* if(!auth.userId) {
//       return c.json({error:"Unauthorized"},401)}
      
//       */

//       const data = await db
//         .delete(categories)
//         .where(
//           and(eq(categories.userId, "1"), inArray(categories.id, values.ids))
//         )
//         .returning({
//           id: categories.id,
//         });

//       return c.json({ data });
//     }
//   )
//   .patch(
//     "/:id",
//     zValidator(
//       "param",
//       z.object({
//         id: z.string().optional(),
//       })
//     ),
//     zValidator(
//       "json",
//       insertCategorySchema.pick({
//         name: true,
//       })
//     ),
//     async (c) => {
//       //const auth = getAuth(c)
//       const { id } = c.req.valid("param");
//       const values = c.req.valid("json");

//       if (!id) {
//         return c.json({ error: "Missing id" }, 400);
//       }
//       // if(!auth) {return c.json({error:"unauthorized",401})}
//       const [data] = await db
//         .update(categories)
//         .set(values)
//         .where(and(eq(categories.userId, "1"), eq(categories.id, id)))
//         .returning();

//       if (!data) {
//         return c.json({ error: "Not found" }, 404);
//       }

//       return c.json({ data });
//     }
//   )
//   .delete(
//     "/:id",
//     zValidator(
//       "param",
//       z.object({
//         id: z.string().optional(),
//       })
//     ),
//     async (c) => {
//       //const auth = getAuth(c)
//       const { id } = c.req.valid("param");

//       if (!id) {
//         return c.json({ error: "Missing id" }, 400);
//       }
//       // if(!auth) {return c.json({error:"unauthorized",401})}
//       const [data] = await db
//         .delete(categories)
//         .where(and(eq(categories.userId, "1"), eq(categories.id, id)))
//         .returning({
//           id: categories.id,
//         });

//       if (!data) {
//         return c.json({ error: "Not found" }, 404);
//       }

//       return c.json({ data });
//     }
//   );

// export default app;
