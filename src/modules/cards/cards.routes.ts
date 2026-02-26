import { Router } from "express";
import { supabase } from "../../shared/config/supabase";

const cardsRouter = Router();

cardsRouter.get("/", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("cards")
      .select("*, accounts(*)")
      .eq("user_id", req.user!.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return res.json(data ?? []);
  } catch (error) {
    return next(error);
  }
});

cardsRouter.post("/", async (req, res, next) => {
  try {
    const { name, type, accountId, lastFourDigits, limitAmount, dueDay, closingDay, isActive } = req.body as {
      name: string;
      type?: string;
      accountId?: string;
      lastFourDigits?: string;
      limitAmount?: number;
      dueDay?: number;
      closingDay?: number;
      isActive?: boolean;
    };

    if (!name) return res.status(400).json({ message: "name is required" });

    if (accountId) {
      const { data: account } = await supabase
        .from("accounts")
        .select("id")
        .eq("id", accountId)
        .eq("user_id", req.user!.id)
        .maybeSingle();

      if (!account) return res.status(400).json({ message: "Invalid accountId" });
    }

    const { data, error } = await supabase
      .from("cards")
      .insert({
        user_id: req.user!.id,
        account_id: accountId,
        name,
        type: type ?? "CREDIT",
        last_four_digits: lastFourDigits,
        limit_amount: limitAmount,
        due_day: dueDay,
        closing_day: closingDay,
        is_active: isActive ?? true
      })
      .select("*")
      .single();

    if (error) throw error;
    return res.status(201).json(data);
  } catch (error) {
    return next(error);
  }
});

cardsRouter.put("/:id", async (req, res, next) => {
  try {
    const { name, type, accountId, lastFourDigits, limitAmount, dueDay, closingDay, isActive } = req.body;

    if (accountId) {
      const { data: account } = await supabase
        .from("accounts")
        .select("id")
        .eq("id", accountId)
        .eq("user_id", req.user!.id)
        .maybeSingle();

      if (!account) return res.status(400).json({ message: "Invalid accountId" });
    }

    const { data, error } = await supabase
      .from("cards")
      .update({
        name,
        type,
        account_id: accountId,
        last_four_digits: lastFourDigits,
        limit_amount: limitAmount,
        due_day: dueDay,
        closing_day: closingDay,
        is_active: isActive
      })
      .eq("id", req.params.id)
      .eq("user_id", req.user!.id)
      .select("*")
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: "Card not found" });

    return res.json(data);
  } catch (error) {
    return next(error);
  }
});

cardsRouter.delete("/:id", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("cards")
      .delete()
      .eq("id", req.params.id)
      .eq("user_id", req.user!.id)
      .select("id")
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: "Card not found" });

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export { cardsRouter };