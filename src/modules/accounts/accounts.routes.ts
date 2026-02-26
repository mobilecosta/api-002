import { Router } from "express";
import { supabase } from "../../shared/config/supabase";

const accountsRouter = Router();

accountsRouter.get("/", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", req.user!.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return res.json(data ?? []);
  } catch (error) {
    return next(error);
  }
});

accountsRouter.post("/", async (req, res, next) => {
  try {
    const { name, type, initialBalance, isActive } = req.body as {
      name: string;
      type?: string;
      initialBalance?: number;
      isActive?: boolean;
    };

    if (!name) {
      return res.status(400).json({ message: "name is required" });
    }

    const { data, error } = await supabase
      .from("accounts")
      .insert({
        user_id: req.user!.id,
        name,
        type: type ?? "CHECKING",
        initial_balance: initialBalance ?? 0,
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

accountsRouter.put("/:id", async (req, res, next) => {
  try {
    const payload = req.body as {
      name?: string;
      type?: string;
      initialBalance?: number;
      isActive?: boolean;
    };

    const { data, error } = await supabase
      .from("accounts")
      .update({
        name: payload.name,
        type: payload.type,
        initial_balance: payload.initialBalance,
        is_active: payload.isActive
      })
      .eq("id", req.params.id)
      .eq("user_id", req.user!.id)
      .select("*")
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: "Account not found" });

    return res.json(data);
  } catch (error) {
    return next(error);
  }
});

accountsRouter.delete("/:id", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("accounts")
      .delete()
      .eq("id", req.params.id)
      .eq("user_id", req.user!.id)
      .select("id")
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: "Account not found" });

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export { accountsRouter };