import {z} from "zod"
import { Hono } from "hono";
import { eq,and,inArray } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";

import { db } from "@/db/drizzle";
import { accounts, insertAccountSchema } from "@/db/schema";

import { v4 as uuidv4 } from "uuid";


//import { HTTPException } from "hono/http-exception";

// add auth for get accounts,

const app = new Hono()
  .get("/", async (c) => {
    //const auth = getAuth(c)
    // if(!auth) {return c.json({error:"unauthorized",401})}
    // with httpexception throw new HTTPException(401,{res:c.json({error:"Unauthorized"},401)})
    const data = await db
      .select({
        id: accounts.id,
        name: accounts.name,
      })
      .from(accounts);
    //.where(eq(accounts.userId,auth.userId))
    return c.json({ data });
  })
  .post(
    "/",
    zValidator(
      "json",
      insertAccountSchema.pick({
        name: true,
      })
    ),
    async (c) => {
      // implement auth
      const values = c.req.valid("json");
      // if(!auth) {return c.json({error:"Unauthorized"},401)}
      const [data] = await db
        .insert(accounts)
        .values({
          id: uuidv4(),
          userId: "1",
          ...values,
        })
        .returning();
      return c.json({data});
    }
  ).post(
    "/bulk-delete",
    zValidator("json",
      // add middleware
      z.object({
      ids: z.array(z.string())
    })),
    async (c) => {
      //const auth = getAuth(c)
      
      const values = c.req.valid("json");

      /* if(!auth.userId) {
      return c.json({error:"Unauthorized"},401)}
      
      */ 
      
      const data = await db
        .delete(accounts)
        .where(
          and(
            eq(
              accounts.userId,"1"
            ),
            inArray(accounts.id,values.ids)
          )
        ).returning({
          id:accounts.id
        })

      return c.json({ data });
    }
  )

export default app;
