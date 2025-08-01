import { sql } from "drizzle-orm";
import { pgTable, varchar, text, decimal, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bankAccounts = pgTable("bank_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull().default("savings"),
  balance: decimal("balance", { precision: 12, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountId: varchar("account_id").notNull().references(() => bankAccounts.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  type: text("type").notNull(), // 'credit' or 'debit'
  description: text("description").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const splitExpenses = pgTable("split_expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  payerName: text("payer_name").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const splitParticipants = pgTable("split_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  expenseId: varchar("expense_id").notNull().references(() => splitExpenses.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  shareAmount: decimal("share_amount", { precision: 12, scale: 2 }).notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  bankAccounts: many(bankAccounts),
  splitExpenses: many(splitExpenses),
}));

export const bankAccountsRelations = relations(bankAccounts, ({ one, many }) => ({
  user: one(users, {
    fields: [bankAccounts.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  account: one(bankAccounts, {
    fields: [transactions.accountId],
    references: [bankAccounts.id],
  }),
}));

export const splitExpensesRelations = relations(splitExpenses, ({ one, many }) => ({
  user: one(users, {
    fields: [splitExpenses.userId],
    references: [users.id],
  }),
  participants: many(splitParticipants),
}));

export const splitParticipantsRelations = relations(splitParticipants, ({ one }) => ({
  expense: one(splitExpenses, {
    fields: [splitParticipants.expenseId],
    references: [splitExpenses.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  fullName: true,
});

export const insertBankAccountSchema = createInsertSchema(bankAccounts).pick({
  name: true,
  type: true,
  balance: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  accountId: true,
  amount: true,
  type: true,
  description: true,
});

export const insertSplitExpenseSchema = createInsertSchema(splitExpenses).pick({
  payerName: true,
  amount: true,
  description: true,
});

export const insertSplitParticipantSchema = createInsertSchema(splitParticipants).pick({
  name: true,
  shareAmount: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type BankAccount = typeof bankAccounts.$inferSelect;
export type InsertBankAccount = z.infer<typeof insertBankAccountSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type SplitExpense = typeof splitExpenses.$inferSelect;
export type InsertSplitExpense = z.infer<typeof insertSplitExpenseSchema>;
export type SplitParticipant = typeof splitParticipants.$inferSelect;
export type InsertSplitParticipant = z.infer<typeof insertSplitParticipantSchema>;
