import { Router } from "express";
import { getSupabase } from "../../shared/config/supabase";

const goalsRouter = Router();
const supabase = getSupabase();

goalsRouter.get("/", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", req.user!.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return res.json(data ?? []);
  } catch (error) {
    return next(error);
  }
});

goalsRouter.post("/", async (req, res, next) => {
  try {
    const { name, targetAmount, currentAmount, targetDate, status } = req.body as {
      name: string;
      targetAmount: number;
      currentAmount?: number;
      targetDate?: string;
      status?: string;
    };

    if (!name || targetAmount === undefined) {
      return res.status(400).json({ message: "name and targetAmount are required" });
    }

    const { data, error } = await supabase
      .from("goals")
      .insert({
        user_id: req.user!.id,
        name,
        target_amount: targetAmount,
        current_amount: currentAmount ?? 0,
        target_date: targetDate,
        status: status ?? "ACTIVE"
      })
      .select("*")
      .single();

    if (error) throw error;
    return res.status(201).json(data);
  } catch (error) {
    return next(error);
  }
});

goalsRouter.put("/:id", async (req, res, next) => {
  try {
    const { name, targetAmount, currentAmount, targetDate, status } = req.body;

    const { data, error } = await supabase
      .from("goals")
      .update({
        name,
        target_amount: targetAmount,
        current_amount: currentAmount,
        target_date: targetDate,
        status
      })
      .eq("id", req.params.id)
      .eq("user_id", req.user!.id)
      .select("*")
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: "Goal not found" });

    return res.json(data);
  } catch (error) {
    return next(error);
  }
});

goalsRouter.delete("/:id", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("goals")
      .delete()
      .eq("id", req.params.id)
      .eq("user_id", req.user!.id)
      .select("id")
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: "Goal not found" });

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export { goalsRouter };
