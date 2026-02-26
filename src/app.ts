import cors from "cors";
import express from "express";
import { authRouter } from "./modules/auth/auth.routes";
import { accountsRouter } from "./modules/accounts/accounts.routes";
import { categoriesRouter } from "./modules/categories/categories.routes";
import { transactionsRouter } from "./modules/transactions/transactions.routes";
import { cardsRouter } from "./modules/cards/cards.routes";
import { goalsRouter } from "./modules/goals/goals.routes";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes";
import { transfersRouter } from "./modules/transfers/transfers.routes";
import { authMiddleware } from "./shared/middlewares/auth.middleware";
import { errorMiddleware } from "./shared/middlewares/error.middleware";
import { env, getMissingEnvVars } from "./shared/config/env";

const app = express();

app.use(
  cors({
    origin: env.FRONT_URL === "*" ? true : env.FRONT_URL,
    credentials: true
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  const missingEnv = getMissingEnvVars();
  res.status(missingEnv.length ? 503 : 200).json({ ok: missingEnv.length === 0, missingEnv });
});

app.use("/auth", authRouter);

app.use(authMiddleware);
app.use("/accounts", accountsRouter);
app.use("/categories", categoriesRouter);
app.use("/transactions", transactionsRouter);
app.use("/transfers", transfersRouter);
app.use("/cards", cardsRouter);
app.use("/goals", goalsRouter);
app.use("/dashboard", dashboardRouter);

app.use(errorMiddleware);

export { app };
