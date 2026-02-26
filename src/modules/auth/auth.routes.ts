import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../shared/config/env";
import { supabase } from "../../shared/config/supabase";

const authRouter = Router();

authRouter.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body as { name: string; email: string; password: string };

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }

    const { data: existing, error: existingError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { data: user, error } = await supabase
      .from("users")
      .insert({ name, email, password_hash: passwordHash })
      .select("id,name,email")
      .single();

    if (error) {
      throw error;
    }

    return res.status(201).json(user);
  } catch (error) {
    return next(error);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id,name,email,password_hash")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ email: user.email }, env.JWT_SECRET, {
      subject: user.id,
      expiresIn: "1d"
    });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    return next(error);
  }
});

export { authRouter };