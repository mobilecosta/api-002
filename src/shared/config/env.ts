import dotenv from "dotenv";

dotenv.config();

const required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "JWT_SECRET"];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

export const env = {
  PORT: Number(process.env.PORT ?? 3000),
  SUPABASE_URL: process.env.SUPABASE_URL as string,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  FRONT_URL: process.env.FRONT_URL ?? "*"
};