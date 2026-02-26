import { Router } from "express";
import { supabase } from "../../shared/config/supabase";

const dashboardRouter = Router();

const toNumber = (value: unknown): number => Number(value ?? 0);

const monthKey = (date: Date): string => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

dashboardRouter.get("/overview", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [{ data: accounts, error: accountError }, { data: transactions, error: txError }, { data: categories, error: catError }] =
      await Promise.all([
        supabase.from("accounts").select("initial_balance").eq("user_id", userId),
        supabase
          .from("transactions")
          .select("amount,type,occurred_at,category_id")
          .eq("user_id", userId)
          .gte("occurred_at", sixMonthsAgo.toISOString()),
        supabase.from("categories").select("id,name,color").eq("user_id", userId)
      ]);

    if (accountError) throw accountError;
    if (txError) throw txError;
    if (catError) throw catError;

    const allTransactions = transactions ?? [];
    const monthTransactions = allTransactions.filter((item) => {
      const occurredAt = new Date(item.occurred_at);
      return occurredAt >= monthStart && occurredAt < nextMonthStart;
    });

    const monthIncome = monthTransactions
      .filter((item) => item.type === "INCOME")
      .reduce((sum, item) => sum + toNumber(item.amount), 0);

    const monthExpense = monthTransactions
      .filter((item) => item.type === "EXPENSE")
      .reduce((sum, item) => sum + toNumber(item.amount), 0);

    const incomeAllTime = allTransactions
      .filter((item) => item.type === "INCOME")
      .reduce((sum, item) => sum + toNumber(item.amount), 0);

    const expenseAllTime = allTransactions
      .filter((item) => item.type === "EXPENSE")
      .reduce((sum, item) => sum + toNumber(item.amount), 0);

    const categoryMap = new Map((categories ?? []).map((item) => [item.id, item]));
    const expensesByCategoryMap = new Map<string, number>();

    for (const item of monthTransactions) {
      if (item.type !== "EXPENSE") continue;
      const current = expensesByCategoryMap.get(item.category_id) ?? 0;
      expensesByCategoryMap.set(item.category_id, current + toNumber(item.amount));
    }

    const expensesByCategory = [...expensesByCategoryMap.entries()].map(([categoryId, amount]) => ({
      categoryId,
      categoryName: categoryMap.get(categoryId)?.name ?? "Unknown",
      color: categoryMap.get(categoryId)?.color ?? null,
      amount
    }));

    const evolutionMap = new Map<string, { month: string; income: number; expense: number }>();
    for (let i = 0; i < 6; i += 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = monthKey(d);
      evolutionMap.set(key, { month: key, income: 0, expense: 0 });
    }

    for (const item of allTransactions) {
      const key = monthKey(new Date(item.occurred_at));
      const bucket = evolutionMap.get(key);
      if (!bucket) continue;
      if (item.type === "INCOME") {
        bucket.income += toNumber(item.amount);
      } else {
        bucket.expense += toNumber(item.amount);
      }
    }

    const monthlyEvolution = [...evolutionMap.values()].sort((a, b) => a.month.localeCompare(b.month));
    const initialBalance = (accounts ?? []).reduce((sum, item) => sum + toNumber(item.initial_balance), 0);

    return res.json({
      totalBalance: initialBalance + incomeAllTime - expenseAllTime,
      monthIncome,
      monthExpense,
      expensesByCategory,
      monthlyEvolution
    });
  } catch (error) {
    return next(error);
  }
});

export { dashboardRouter };