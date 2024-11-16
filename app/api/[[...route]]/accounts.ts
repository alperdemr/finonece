import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { eq } from "drizzle-orm";

import { accounts } from "@/db/schema";
//import { HTTPException } from "hono/http-exception";


// add auth for get accounts,

const app = new Hono().get("/", async (c) => {
  //const auth = getAuth(c)
  // if(!auth) {return c.json({error:"unauthorized",401})}
  // with httpexception throw new HTTPException(401,{res:c.json({error:"Unauthorized"},401)})
  const data = await db
    .select({
      id: accounts.id,
      name: accounts.name,
    })
    .from(accounts)
    //.where(eq(accounts.userId,auth.userId))
  return c.json({ data });
});

export default app;
