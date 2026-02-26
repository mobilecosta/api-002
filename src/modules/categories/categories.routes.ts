import { Router } from "express";
import { supabase } from "../../shared/config/supabase";

const categoriesRouter = Router();

categoriesRouter.get("/", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", req.user!.id)
      .order("type")
      .order("name");

    if (error) throw error;
    return res.json(data ?? []);
  } catch (error) {
    return next(error);
  }
});

categoriesRouter.post("/", async (req, res, next) => {
  try {
    const { name, type, color } = req.body as { name: string; type: string; color?: string };

    if (!name || !type) {
      return res.status(400).json({ message: "name and type are required" });
    }

    const { data, error } = await supabase
      .from("categories")
      .insert({ user_id: req.user!.id, name, type, color })
      .select("*")
      .single();

    if (error) throw error;
    return res.status(201).json(data);
  } catch (error) {
    return next(error);
  }
});

categoriesRouter.put("/:id", async (req, res, next) => {
  try {
    const { name, type, color } = req.body as { name?: string; type?: string; color?: string };

    const { data, error } = await supabase
      .from("categories")
      .update({ name, type, color })
      .eq("id", req.params.id)
      .eq("user_id", req.user!.id)
      .select("*")
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: "Category not found" });

    return res.json(data);
  } catch (error) {
    return next(error);
  }
});

categoriesRouter.delete("/:id", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .delete()
      .eq("id", req.params.id)
      .eq("user_id", req.user!.id)
      .select("id")
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: "Category not found" });

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export { categoriesRouter };