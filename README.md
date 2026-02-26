# API 002 - Controle Financeiro (Supabase Client)

Backend Node.js + Express usando `@supabase/supabase-js` (sem conexão direta via driver PostgreSQL no runtime), com JWT próprio e multi-tenant por `user_id`.

## Stack
- Node.js + TypeScript
- Express
- Supabase JS Client (DB via API Supabase)
- bcrypt + jsonwebtoken
- Deploy serverless na Vercel

## Estrutura
```txt
src/
  modules/
  shared/
  scripts/
  app.ts
  server.ts
supabase/
  migrations/
vercel.json
```

## Variáveis de ambiente
Crie `.env`:
```env
SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="service-role-key"
JWT_SECRET="change-me"
FRONT_URL="http://localhost:4200"
SEED_CREATE_DEMO="false"
```

## Scripts
```bash
npm run dev
npm run build
npm run start
npm run seed
npm run migration:new
npm run migration:up
npm run migration:list
npm run vercel-build
```

## Migrations (alternativa ao Prisma)
O schema agora é versionado com **Supabase CLI SQL migrations** em `supabase/migrations/*.sql`.

Fluxo local:
1. Criar migration: `npm run migration:new -- add_new_table`
2. Editar SQL em `supabase/migrations/...sql`
3. Aplicar: `npm run migration:up`
4. Commitar SQL junto com código

Fluxo produção:
- Executar `supabase db push` no pipeline (GitHub Actions/CI) antes do deploy da API.
- Não editar schema manualmente no painel.

## GitHub Actions Secrets
Você precisa cadastrar no GitHub repo `api-002` (`Settings > Secrets and variables > Actions`) estes secrets:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_DB_PASSWORD`
- `SUPABASE_PROJECT_REF`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Seed
- `npm run seed`
- Cria categorias padrão por usuário
- `SEED_CREATE_DEMO=true` cria usuário demo opcional
- Seed não roda automaticamente em produção

## Auth
- `POST /auth/register`
- `POST /auth/login`
- JWT próprio no backend
- Middleware injeta `req.user.id`

## Dashboard
`GET /dashboard/overview`
```json
{
  "totalBalance": 0,
  "monthIncome": 0,
  "monthExpense": 0,
  "expensesByCategory": [],
  "monthlyEvolution": []
}
```

## Deploy Vercel
- `vercel.json` roteia tudo para `src/server.ts`
- Sem `app.listen()`
- `vercel-build` apenas compila (`npm run build`)
- Rode migrations via Supabase CLI no pipeline de CI
