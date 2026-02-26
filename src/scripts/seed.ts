import { supabase } from "../shared/config/supabase";
import bcrypt from "bcrypt";

const defaultCategories = [
  { name: "Salario", type: "INCOME", color: "#1f8f4a" },
  { name: "Freelance", type: "INCOME", color: "#3aa357" },
  { name: "Investimentos", type: "INCOME", color: "#59c36a" },
  { name: "Moradia", type: "EXPENSE", color: "#d74c4c" },
  { name: "Transporte", type: "EXPENSE", color: "#ef7b45" },
  { name: "Alimentacao", type: "EXPENSE", color: "#f4a340" },
  { name: "Saude", type: "EXPENSE", color: "#d96ac1" },
  { name: "Lazer", type: "EXPENSE", color: "#5b8def" }
];

async function seedCategoriesForUser(userId: string) {
  for (const category of defaultCategories) {
    const { data: existing, error: existingError } = await supabase
      .from("categories")
      .select("id")
      .eq("user_id", userId)
      .eq("name", category.name)
      .eq("type", category.type)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing) {
      const { error } = await supabase
        .from("categories")
        .update({ color: category.color, is_default: true })
        .eq("id", existing.id);

      if (error) throw error;
      continue;
    }

    const { error } = await supabase.from("categories").insert({
      user_id: userId,
      name: category.name,
      type: category.type,
      color: category.color,
      is_default: true
    });

    if (error) throw error;
  }
}

async function main() {
  const { data: users, error: usersError } = await supabase.from("users").select("id");
  if (usersError) throw usersError;

  if (!(users ?? []).length && process.env.SEED_CREATE_DEMO === "true") {
    const passwordHash = await bcrypt.hash("123456", 10);
    const { data: demoUser, error: demoError } = await supabase
      .from("users")
      .insert({
        name: "Demo User",
        email: "demo@finance.local",
        password_hash: passwordHash
      })
      .select("id")
      .single();

    if (demoError) throw demoError;

    await supabase.from("accounts").insert([
      {
        user_id: demoUser.id,
        name: "Conta Corrente",
        type: "CHECKING",
        initial_balance: 3500
      },
      {
        user_id: demoUser.id,
        name: "Carteira",
        type: "CASH",
        initial_balance: 200
      }
    ]);

    await seedCategoriesForUser(demoUser.id);
    console.log("Demo user created: demo@finance.local / 123456");
    return;
  }

  for (const user of users ?? []) {
    await seedCategoriesForUser(user.id);
  }

  console.log(`Seed completed for ${(users ?? []).length} existing users.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});