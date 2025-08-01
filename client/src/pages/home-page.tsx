import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBankAccountSchema, insertTransactionSchema, insertSplitExpenseSchema } from "@shared/schema";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Plus, 
  Building2, 
  ArrowUpRight,
  ArrowDownRight,
  LogOut,
  CreditCard,
  History,
  Calculator,
  Edit,
  Trash2
} from "lucide-react";
import { format } from "date-fns";

type BankAccountFormData = z.infer<typeof insertBankAccountSchema>;
type TransactionFormData = z.infer<typeof insertTransactionSchema>;
type SplitExpenseFormData = z.infer<typeof insertSplitExpenseSchema> & { participants: string };

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<"dashboard" | "accounts" | "transactions" | "split">("dashboard");
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isAddSplitOpen, setIsAddSplitOpen] = useState(false);

  // Queries
  const { data: accounts = [] } = useQuery({
    queryKey: ["/api/accounts"],
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["/api/transactions"],
  });

  const { data: splitExpenses = [] } = useQuery({
    queryKey: ["/api/split-history"],
  });

  // Forms
  const accountForm = useForm<BankAccountFormData>({
    resolver: zodResolver(insertBankAccountSchema),
    defaultValues: {
      name: "",
      type: "savings",
      balance: "0",
    },
  });

  const transactionForm = useForm<TransactionFormData>({
    resolver: zodResolver(insertTransactionSchema),
    defaultValues: {
      accountId: "",
      amount: "",
      type: "debit",
      description: "",
    },
  });

  const splitForm = useForm<SplitExpenseFormData>({
    resolver: zodResolver(insertSplitExpenseSchema.extend({ participants: z.string().min(1) })),
    defaultValues: {
      payerName: "",
      amount: "",
      description: "",
      participants: "",
    },
  });

  // Mutations
  const createAccountMutation = useMutation({
    mutationFn: async (data: BankAccountFormData) => {
      const res = await apiRequest("POST", "/api/accounts", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      setIsAddAccountOpen(false);
      accountForm.reset();
      toast({ title: "Account created successfully!" });
    },
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (data: TransactionFormData) => {
      const res = await apiRequest("POST", "/api/transactions", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      setIsAddTransactionOpen(false);
      transactionForm.reset();
      toast({ title: "Transaction added successfully!" });
    },
  });

  const createSplitMutation = useMutation({
    mutationFn: async (data: SplitExpenseFormData) => {
      const res = await apiRequest("POST", "/api/split-expense", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/split-history"] });
      setIsAddSplitOpen(false);
      splitForm.reset();
      toast({ title: "Split expense created successfully!" });
    },
  });

  // Calculate dashboard stats
  const totalBalance = accounts.reduce((sum: number, account: any) => sum + parseFloat(account.balance || "0"), 0);
  const monthlyIncome = transactions
    .filter((t: any) => t.type === "credit")
    .reduce((sum: number, t: any) => sum + parseFloat(t.amount || "0"), 0);
  const monthlyExpenses = transactions
    .filter((t: any) => t.type === "debit")
    .reduce((sum: number, t: any) => sum + parseFloat(t.amount || "0"), 0);
  const totalSplitExpenses = splitExpenses.reduce((sum: number, expense: any) => sum + parseFloat(expense.amount || "0"), 0);

  const recentTransactions = transactions.slice(0, 5);

  const renderDashboard = () => (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600">Overview of your financial activities</p>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Balance</p>
                  <p className="text-2xl font-mono font-bold text-gray-900">₹{totalBalance.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                  <Wallet className="text-success h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Monthly Income</p>
                  <p className="text-2xl font-mono font-bold text-gray-900">₹{monthlyIncome.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="text-primary h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Monthly Expenses</p>
                  <p className="text-2xl font-mono font-bold text-gray-900">₹{monthlyExpenses.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
                  <TrendingDown className="text-warning h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Split Expenses</p>
                  <p className="text-2xl font-mono font-bold text-gray-900">₹{totalSplitExpenses.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="text-purple-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Transactions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No transactions yet</p>
              ) : (
                <div className="space-y-4">
                  {recentTransactions.map((transaction: any) => (
                    <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                          transaction.type === 'credit' ? 'bg-success/10' : 'bg-gray-100'
                        }`}>
                          {transaction.type === 'credit' ? (
                            <ArrowUpRight className="text-success h-5 w-5" />
                          ) : (
                            <ArrowDownRight className="text-gray-600 h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-500">{transaction.accountName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-mono font-medium ${
                          transaction.type === 'credit' ? 'text-success' : 'text-red-600'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                        </p>
                        <p className="text-sm text-gray-500">{format(new Date(transaction.date), 'MMM dd')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => setIsAddTransactionOpen(true)}
                className="w-full justify-start bg-primary/10 text-primary hover:bg-primary/20"
                variant="ghost"
              >
                <Plus className="mr-3 h-4 w-4" />
                Add Transaction
              </Button>
              <Button
                onClick={() => setIsAddAccountOpen(true)}
                className="w-full justify-start bg-success/10 text-success hover:bg-success/20"
                variant="ghost"
              >
                <Building2 className="mr-3 h-4 w-4" />
                Add Bank Account
              </Button>
              <Button
                onClick={() => setIsAddSplitOpen(true)}
                className="w-full justify-start bg-purple-50 text-purple-700 hover:bg-purple-100"
                variant="ghost"
              >
                <Users className="mr-3 h-4 w-4" />
                Split Expense
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderAccounts = () => (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Bank Accounts</h2>
            <p className="text-gray-600">Manage your bank accounts and balances</p>
          </div>
          <Button onClick={() => setIsAddAccountOpen(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account: any, index) => (
            <Card key={account.id} className="overflow-hidden">
              <div className={`p-6 text-white ${
                index % 3 === 0 ? 'bg-gradient-to-r from-primary to-primary/80' :
                index % 3 === 1 ? 'bg-gradient-to-r from-success to-success/80' :
                'bg-gradient-to-r from-purple-500 to-purple-600'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{account.name}</h3>
                    <p className="text-white/80 text-sm capitalize">{account.type} Account</p>
                  </div>
                  <Building2 className="h-8 w-8 text-white/60" />
                </div>
                <div className="mt-4">
                  <p className="text-white/80 text-sm">Current Balance</p>
                  <p className="text-2xl font-mono font-bold">₹{parseFloat(account.balance).toFixed(2)}</p>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Created</span>
                  <span>{format(new Date(account.createdAt), 'MMM dd, yyyy')}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    transactionForm.setValue("accountId", account.id);
                    setIsAddTransactionOpen(true);
                  }}
                >
                  Add Transaction
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTransactions = () => (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Transactions</h2>
            <p className="text-gray-600">View and manage your transaction history</p>
          </div>
          <Button onClick={() => setIsAddTransactionOpen(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction: any) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(transaction.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                            transaction.type === 'credit' ? 'bg-success/10' : 'bg-gray-100'
                          }`}>
                            {transaction.type === 'credit' ? (
                              <ArrowUpRight className="text-success h-4 w-4" />
                            ) : (
                              <ArrowDownRight className="text-gray-600 h-4 w-4" />
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{transaction.description}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.accountName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.type === 'credit' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type === 'credit' ? 'Credit' : 'Debit'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium">
                        <span className={transaction.type === 'credit' ? 'text-success' : 'text-red-600'}>
                          {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSplitExpenses = () => (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Split Expenses</h2>
            <p className="text-gray-600">Manage group expenses and calculate splits</p>
          </div>
          <Button onClick={() => setIsAddSplitOpen(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Add Split Expense
          </Button>
        </div>

        <div className="space-y-4">
          {splitExpenses.map((expense: any) => (
            <Card key={expense.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">{expense.description}</h4>
                    <p className="text-sm text-gray-600">{format(new Date(expense.date), 'MMMM dd, yyyy')}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-mono font-bold text-gray-900">₹{expense.amount}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Paid by:</p>
                    <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                      <span className="font-medium text-success-800">{expense.payerName}</span>
                      <span className="text-success-600 ml-2">paid ₹{expense.amount}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Split between:</p>
                    <div className="space-y-2">
                      {expense.participants?.map((participant: any, index: number) => (
                        <div key={index} className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-lg p-2">
                          <span className="text-gray-900">{participant.name}</span>
                          <span className="font-mono font-medium text-gray-700">₹{participant.shareAmount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Who owes whom:</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {expense.participants
                      ?.filter((p: any) => p.name !== expense.payerName)
                      .map((participant: any, index: number) => (
                        <div key={index} className="bg-warning/10 border border-warning/20 rounded-lg p-2 text-center">
                          <span className="text-warning-800 text-sm">
                            {participant.name} owes {expense.payerName} ₹{participant.shareAmount}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Wallet className="text-primary text-2xl mr-3" />
                <h1 className="text-xl font-bold text-gray-900">Finance Tracker</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.fullName}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                className="text-gray-400 hover:text-gray-600"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex flex-col w-64 bg-white border-r border-gray-200">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <nav className="mt-5 flex-1 px-2 space-y-1">
                <button
                  onClick={() => setActiveView("dashboard")}
                  className={`w-full flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeView === "dashboard"
                      ? "text-primary bg-primary/10"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <CreditCard className="mr-3 h-4 w-4" />
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveView("accounts")}
                  className={`w-full flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeView === "accounts"
                      ? "text-primary bg-primary/10"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Building2 className="mr-3 h-4 w-4" />
                  Bank Accounts
                </button>
                <button
                  onClick={() => setActiveView("transactions")}
                  className={`w-full flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeView === "transactions"
                      ? "text-primary bg-primary/10"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <History className="mr-3 h-4 w-4" />
                  Transactions
                </button>
                <button
                  onClick={() => setActiveView("split")}
                  className={`w-full flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeView === "split"
                      ? "text-primary bg-primary/10"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Users className="mr-3 h-4 w-4" />
                  Split Expenses
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            {activeView === "dashboard" && renderDashboard()}
            {activeView === "accounts" && renderAccounts()}
            {activeView === "transactions" && renderTransactions()}
            {activeView === "split" && renderSplitExpenses()}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => setActiveView("dashboard")}
            className={`flex flex-col items-center py-2 px-1 transition-colors ${
              activeView === "dashboard" ? "text-primary" : "text-gray-400"
            }`}
          >
            <CreditCard className="h-5 w-5" />
            <span className="text-xs mt-1">Dashboard</span>
          </button>
          <button
            onClick={() => setActiveView("accounts")}
            className={`flex flex-col items-center py-2 px-1 transition-colors ${
              activeView === "accounts" ? "text-primary" : "text-gray-400"
            }`}
          >
            <Building2 className="h-5 w-5" />
            <span className="text-xs mt-1">Accounts</span>
          </button>
          <button
            onClick={() => setActiveView("transactions")}
            className={`flex flex-col items-center py-2 px-1 transition-colors ${
              activeView === "transactions" ? "text-primary" : "text-gray-400"
            }`}
          >
            <History className="h-5 w-5" />
            <span className="text-xs mt-1">Transactions</span>
          </button>
          <button
            onClick={() => setActiveView("split")}
            className={`flex flex-col items-center py-2 px-1 transition-colors ${
              activeView === "split" ? "text-primary" : "text-gray-400"
            }`}
          >
            <Users className="h-5 w-5" />
            <span className="text-xs mt-1">Split</span>
          </button>
        </div>
      </div>

      {/* Add Account Modal */}
      <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Bank Account</DialogTitle>
          </DialogHeader>
          <form onSubmit={accountForm.handleSubmit((data) => createAccountMutation.mutate(data))} className="space-y-4">
            <div>
              <Label>Account Name</Label>
              <Input
                {...accountForm.register("name")}
                placeholder="e.g., HDFC Savings"
              />
            </div>
            <div>
              <Label>Account Type</Label>
              <Select onValueChange={(value) => accountForm.setValue("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="current">Current</SelectItem>
                  <SelectItem value="credit">Credit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Initial Balance</Label>
              <Input
                {...accountForm.register("balance")}
                type="number"
                step="0.01"
                placeholder="0.00"
              />
            </div>
            <Button
              type="submit"
              disabled={createAccountMutation.isPending}
              className="w-full"
            >
              {createAccountMutation.isPending ? "Creating..." : "Create Account"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Transaction Modal */}
      <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
          </DialogHeader>
          <form onSubmit={transactionForm.handleSubmit((data) => createTransactionMutation.mutate(data))} className="space-y-4">
            <div>
              <Label>Account</Label>
              <Select onValueChange={(value) => transactionForm.setValue("accountId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account: any) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type</Label>
              <Select onValueChange={(value) => transactionForm.setValue("type", value as "credit" | "debit")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">Credit (Income)</SelectItem>
                  <SelectItem value="debit">Debit (Expense)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount</Label>
              <Input
                {...transactionForm.register("amount")}
                type="number"
                step="0.01"
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                {...transactionForm.register("description")}
                placeholder="Transaction description"
              />
            </div>
            <Button
              type="submit"
              disabled={createTransactionMutation.isPending}
              className="w-full"
            >
              {createTransactionMutation.isPending ? "Adding..." : "Add Transaction"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Split Expense Modal */}
      <Dialog open={isAddSplitOpen} onOpenChange={setIsAddSplitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Split Expense</DialogTitle>
          </DialogHeader>
          <form onSubmit={splitForm.handleSubmit((data) => createSplitMutation.mutate(data))} className="space-y-4">
            <div>
              <Label>Description</Label>
              <Input
                {...splitForm.register("description")}
                placeholder="e.g., Dinner at Restaurant"
              />
            </div>
            <div>
              <Label>Total Amount</Label>
              <Input
                {...splitForm.register("amount")}
                type="number"
                step="0.01"
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Who Paid?</Label>
              <Input
                {...splitForm.register("payerName")}
                placeholder="Payer's name"
              />
            </div>
            <div>
              <Label>Participants (comma-separated)</Label>
              <Textarea
                {...splitForm.register("participants")}
                placeholder="John, Jane, Bob, Alice"
                className="min-h-[80px]"
              />
            </div>
            <Button
              type="submit"
              disabled={createSplitMutation.isPending}
              className="w-full"
            >
              {createSplitMutation.isPending ? "Creating..." : "Create Split"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
