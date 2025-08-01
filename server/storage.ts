import { 
  users, 
  bankAccounts, 
  transactions, 
  splitExpenses, 
  splitParticipants,
  type User, 
  type InsertUser,
  type BankAccount,
  type InsertBankAccount,
  type Transaction,
  type InsertTransaction,
  type SplitExpense,
  type InsertSplitExpense,
  type SplitParticipant,
  type InsertSplitParticipant
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Bank account methods
  createBankAccount(userId: string, account: InsertBankAccount): Promise<BankAccount>;
  getBankAccountsByUserId(userId: string): Promise<BankAccount[]>;
  getBankAccount(id: string): Promise<BankAccount | undefined>;
  updateBankAccountBalance(accountId: string, newBalance: string): Promise<void>;
  
  // Transaction methods
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByAccountId(accountId: string): Promise<Transaction[]>;
  getTransactionsByUserId(userId: string): Promise<(Transaction & { accountName: string })[]>;
  deleteTransaction(id: string): Promise<void>;
  
  // Split expense methods
  createSplitExpense(userId: string, expense: InsertSplitExpense): Promise<SplitExpense>;
  createSplitParticipants(expenseId: string, participants: InsertSplitParticipant[]): Promise<SplitParticipant[]>;
  getSplitExpensesByUserId(userId: string): Promise<(SplitExpense & { participants: SplitParticipant[] })[]>;
  updateSplitExpense(id: string, expense: Partial<InsertSplitExpense>): Promise<void>;
  deleteSplitExpense(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createBankAccount(userId: string, account: InsertBankAccount): Promise<BankAccount> {
    const [bankAccount] = await db
      .insert(bankAccounts)
      .values({ ...account, userId })
      .returning();
    return bankAccount;
  }

  async getBankAccountsByUserId(userId: string): Promise<BankAccount[]> {
    return await db
      .select()
      .from(bankAccounts)
      .where(eq(bankAccounts.userId, userId))
      .orderBy(desc(bankAccounts.createdAt));
  }

  async getBankAccount(id: string): Promise<BankAccount | undefined> {
    const [account] = await db.select().from(bankAccounts).where(eq(bankAccounts.id, id));
    return account || undefined;
  }

  async updateBankAccountBalance(accountId: string, newBalance: string): Promise<void> {
    await db
      .update(bankAccounts)
      .set({ balance: newBalance })
      .where(eq(bankAccounts.id, accountId));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();

    // Update account balance
    const account = await this.getBankAccount(transaction.accountId);
    if (account) {
      const currentBalance = parseFloat(account.balance);
      const transactionAmount = parseFloat(transaction.amount);
      const newBalance = transaction.type === 'credit' 
        ? currentBalance + transactionAmount 
        : currentBalance - transactionAmount;
      
      await this.updateBankAccountBalance(transaction.accountId, newBalance.toString());
    }

    return newTransaction;
  }

  async getTransactionsByAccountId(accountId: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.accountId, accountId))
      .orderBy(desc(transactions.date));
  }

  async getTransactionsByUserId(userId: string): Promise<(Transaction & { accountName: string })[]> {
    const result = await db
      .select({
        id: transactions.id,
        accountId: transactions.accountId,
        amount: transactions.amount,
        type: transactions.type,
        description: transactions.description,
        date: transactions.date,
        createdAt: transactions.createdAt,
        accountName: bankAccounts.name,
      })
      .from(transactions)
      .innerJoin(bankAccounts, eq(transactions.accountId, bankAccounts.id))
      .where(eq(bankAccounts.userId, userId))
      .orderBy(desc(transactions.date));

    return result;
  }

  async deleteTransaction(id: string): Promise<void> {
    await db.delete(transactions).where(eq(transactions.id, id));
  }

  async createSplitExpense(userId: string, expense: InsertSplitExpense): Promise<SplitExpense> {
    const [splitExpense] = await db
      .insert(splitExpenses)
      .values({ ...expense, userId })
      .returning();
    return splitExpense;
  }

  async createSplitParticipants(expenseId: string, participants: InsertSplitParticipant[]): Promise<SplitParticipant[]> {
    const participantsWithExpenseId = participants.map(p => ({ ...p, expenseId }));
    return await db
      .insert(splitParticipants)
      .values(participantsWithExpenseId)
      .returning();
  }

  async getSplitExpensesByUserId(userId: string): Promise<(SplitExpense & { participants: SplitParticipant[] })[]> {
    const expenses = await db
      .select()
      .from(splitExpenses)
      .where(eq(splitExpenses.userId, userId))
      .orderBy(desc(splitExpenses.date));

    const expensesWithParticipants = await Promise.all(
      expenses.map(async (expense) => {
        const participants = await db
          .select()
          .from(splitParticipants)
          .where(eq(splitParticipants.expenseId, expense.id));
        return { ...expense, participants };
      })
    );

    return expensesWithParticipants;
  }

  async updateSplitExpense(id: string, expense: Partial<InsertSplitExpense>): Promise<void> {
    await db
      .update(splitExpenses)
      .set(expense)
      .where(eq(splitExpenses.id, id));
  }

  async deleteSplitExpense(id: string): Promise<void> {
    await db.delete(splitExpenses).where(eq(splitExpenses.id, id));
  }
}

export const storage = new DatabaseStorage();
