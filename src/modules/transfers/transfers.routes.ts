import { Router } from "express";
import { getSupabase } from "../../shared/config/supabase";

const transfersRouter = Router();
const supabase = getSupabase();

transfersRouter.get("/", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("transfers")
      .select("*, from_account:accounts!transfers_from_account_id_fkey(*), to_account:accounts!transfers_to_account_id_fkey(*)")
      .eq("user_id", req.user!.id)
      .order("occurred_at", { ascending: false });

    if (error) throw error;
    return res.json(data ?? []);
  } catch (error) {
    return next(error);
  }
});

transfersRouter.post("/", async (req, res, next) => {
  try {
    const { fromAccountId, toAccountId, amount, description, occurredAt } = req.body as {
      fromAccountId: string;
      toAccountId: string;
      amount: number;
      description?: string;
      occurredAt: string;
    };

    if (!fromAccountId || !toAccountId || amount === undefined || !occurredAt) {
      return res.status(400).json({ message: "fromAccountId, toAccountId, amount and occurredAt are required" });
    }

    if (fromAccountId === toAccountId) {
      return res.status(400).json({ message: "Accounts must be different" });
    }

    const { data: accounts, error: accountError } = await supabase
      .from("accounts")
      .select("id")
      .eq("user_id", req.user!.id)
      .in("id", [fromAccountId, toAccountId]);

    if (accountError) throw accountError;
    if ((accounts ?? []).length !== 2) {
      return res.status(400).json({ message: "Invalid accountId(s)" });
    }

    const { data, error } = await supabase
      .from("transfers")
      .insert({
        user_id: req.user!.id,
        from_account_id: fromAccountId,
        to_account_id: toAccountId,
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

transfersRouter.delete("/:id", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("transfers")
      .delete()
      .eq("id", req.params.id)
      .eq("user_id", req.user!.id)
      .select("id")
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: "Transfer not found" });

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export { transfersRouter };
