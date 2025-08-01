import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertBankAccountSchema, insertTransactionSchema, insertSplitExpenseSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Bank Account routes
  app.post("/api/accounts", requireAuth, async (req, res, next) => {
    try {
      const validatedData = insertBankAccountSchema.parse(req.body);
      const account = await storage.createBankAccount(req.user!.id, validatedData);
      res.status(201).json(account);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/accounts", requireAuth, async (req, res, next) => {
    try {
      const accounts = await storage.getBankAccountsByUserId(req.user!.id);
      res.json(accounts);
    } catch (error) {
      next(error);
    }
  });

  // Transaction routes
  app.post("/api/transactions", requireAuth, async (req, res, next) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      
      // Verify that the account belongs to the current user
      const account = await storage.getBankAccount(validatedData.accountId);
      if (!account || account.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied to this account" });
      }

      const transaction = await storage.createTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/transactions", requireAuth, async (req, res, next) => {
    try {
      const transactions = await storage.getTransactionsByUserId(req.user!.id);
      res.json(transactions);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/accounts/:accountId/transactions", requireAuth, async (req, res, next) => {
    try {
      const { accountId } = req.params;
      
      // Verify that the account belongs to the current user
      const account = await storage.getBankAccount(accountId);
      if (!account || account.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied to this account" });
      }

      const transactions = await storage.getTransactionsByAccountId(accountId);
      res.json(transactions);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/transactions/:id", requireAuth, async (req, res, next) => {
    try {
      const { id } = req.params;
      await storage.deleteTransaction(id);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });

  // Split Expense routes
  app.post("/api/split-expense", requireAuth, async (req, res, next) => {
    try {
      const { participants, ...expenseData } = req.body;
      const validatedExpenseData = insertSplitExpenseSchema.parse(expenseData);
      
      // Create split expense
      const splitExpense = await storage.createSplitExpense(req.user!.id, validatedExpenseData);
      
      // Calculate equal split
      const participantNames = participants.split(',').map((name) => name.trim());
      const shareAmount = (parseFloat(validatedExpenseData.amount) / participantNames.length).toFixed(2);
      
      const splitParticipants = participantNames.map((name) => ({
        name,
        shareAmount,
      }));
      
      // Create participants
      await storage.createSplitParticipants(splitExpense.id, splitParticipants);
      
      // Return the complete split with calculations
      const result = {
        ...splitExpense,
        participants: splitParticipants,
        calculations: {
          totalAmount: parseFloat(validatedExpenseData.amount),
          sharePerPerson: parseFloat(shareAmount),
          owedToPayer: participantNames
            .filter(name => name !== validatedExpenseData.payerName)
            .map(name => ({
              name,
              amount: parseFloat(shareAmount)
            }))
        }
      };
      
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/split-history", requireAuth, async (req, res, next) => {
    try {
      const splitExpenses = await storage.getSplitExpensesByUserId(req.user!.id);
      res.json(splitExpenses);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/split-history/:id", requireAuth, async (req, res, next) => {
    try {
      const { id } = req.params;
      const validatedData = insertSplitExpenseSchema.partial().parse(req.body);
      await storage.updateSplitExpense(id, validatedData);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/split-history/:id", requireAuth, async (req, res, next) => {
    try {
      const { id } = req.params;
      await storage.deleteSplitExpense(id);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
