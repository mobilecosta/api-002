import dotenv from "dotenv";

dotenv.config();

const required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "JWT_SECRET"] as const;

export const env = {
  PORT: Number(process.env.PORT ?? 3000),
  SUPABASE_URL: process.env.SUPABASE_URL ?? "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  JWT_SECRET: process.env.JWT_SECRET ?? "",
  FRONT_URL: process.env.FRONT_URL ?? "*"
};

export const getMissingEnvVars = (): string[] =>
  required.filter((key) => !process.env[key]);
