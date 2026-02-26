import { Router } from "express";
import { getSupabase } from "../../shared/config/supabase";

const transactionsRouter = Router();
const supabase = getSupabase();

transactionsRouter.get("/", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("*, accounts(*), categories(*)")
      .eq("user_id", req.user!.id)
      .order("occurred_at", { ascending: false });

    if (error) throw error;
    return res.json(data ?? []);
  } catch (error) {
    return next(error);
  }
});

transactionsRouter.post("/", async (req, res, next) => {
  try {
    const { accountId, categoryId, type, amount, description, occurredAt } = req.body as {
      accountId: string;
      categoryId: string;
      type: string;
      amount: number;
      description?: string;
      occurredAt: string;
    };

    if (!accountId || !categoryId || !type || amount === undefined || !occurredAt) {
      return res.status(400).json({ message: "accountId, categoryId, type, amount and occurredAt are required" });
    }

    const [{ data: account }, { data: category }] = await Promise.all([
      supabase.from("accounts").select("id").eq("id", accountId).eq("user_id", req.user!.id).maybeSingle(),
      supabase.from("categories").select("id,type").eq("id", categoryId).eq("user_id", req.user!.id).maybeSingle()
    ]);

    if (!account || !category) {
      return res.status(400).json({ message: "Invalid accountId or categoryId" });
    }

    if (category.type !== type) {
      return res.status(400).json({ message: "Category type must match transaction type" });
    }

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        user_id: req.user!.id,
        account_id: accountId,
        category_id: categoryId,
        type,
        amount,
        description,
        occurred_at: occurredAt
      })
      .select("*")
      .single();

    if (error) throw error;
    return res.status(201).json(data);
  } catch (error) {
    return next(error);
  }
});

transactionsRouter.put("/:id", async (req, res, next) => {
  try {
    const { accountId, categoryId, type, amount, description, occurredAt } = req.body as {
      accountId?: string;
      categoryId?: string;
      type?: string;
      amount?: number;
      description?: string;
      occurredAt?: string;
    };

    const { data: current, error: currentError } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", req.params.id)
      .eq("user_id", req.user!.id)
      .maybeSingle();

    if (currentError) throw currentError;
    if (!current) return res.status(404).json({ message: "Transaction not found" });

    const nextAccountId = accountId ?? current.account_id;
    const nextCategoryId = categoryId ?? current.category_id;
    const nextType = type ?? current.type;

    const [{ data: account }, { data: category }] = await Promise.all([
      supabase.from("accounts").select("id").eq("id", nextAccountId).eq("user_id", req.user!.id).maybeSingle(),
      supabase.from("categories").select("id,type").eq("id", nextCategoryId).eq("user_id", req.user!.id).maybeSingle()
    ]);

    if (!account || !category || category.type !== nextType) {
      return res.status(400).json({ message: "Invalid account/category or type mismatch" });
    }

    const { data, error } = await supabase
      .from("transactions")
      .update({
        account_id: accountId,
        category_id: categoryId,
        type,
        amount,
        description,
        occurred_at: occurredAt
      })
      .eq("id", req.params.id)
      .eq("user_id", req.user!.id)
      .select("*")
      .single();

    if (error) throw error;
    return res.json(data);
  } catch (error) {
    return next(error);
  }
});

transactionsRouter.delete("/:id", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", req.params.id)
      .eq("user_id", req.user!.id)
      .select("id")
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: "Transaction not found" });

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export { transactionsRouter };
