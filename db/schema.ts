import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { pgTable, text, integer, timestamp, primaryKey, boolean } from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters"

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  password: text("password"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] })
  ]
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    primaryKey({ columns: [verificationToken.identifier, verificationToken.token] })
  ]
);

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => [
    primaryKey({ columns: [authenticator.userId, authenticator.credentialID] })
  ]
);

// The rest of your schema remains unchanged since they don't use the third parameter
export const bankAccounts = pgTable("bank_accounts", {
  id: text("id").primaryKey(),
  plaidId: text("plaid_id"),
  name: text("name").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

// Relations and remaining code stays the same
export const bankAccountsRelations = relations(bankAccounts, ({ many, one }) => ({
  transactions: many(transactions),
  user: one(users, {
    fields: [bankAccounts.userId],
    references: [users.id],
  }),
}));

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  plaidId: text("plaid_id"),
  name: text("name").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const categoriesRelations = relations(categories, ({ many, one }) => ({
  transactions: many(transactions),
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
}));  

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  amount: integer("amount").notNull(),
  payee: text("payee").notNull(),
  notes: text("notes"),
  date: timestamp("date", { mode: "date" }).notNull(),
  accountId: text("account_id")
    .references(() => bankAccounts.id, {
      onDelete: "cascade",
    })
    .notNull(),
  categoryId: text("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  account: one(bankAccounts, {
    fields: [transactions.accountId],
    references: [bankAccounts.id],
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
}));

export const insertBankAccountSchema = createInsertSchema(bankAccounts);
export const insertCategorySchema = createInsertSchema(categories);
export const insertTransactionSchema = createInsertSchema(transactions, {
  date: z.coerce.date(),
});