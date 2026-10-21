# SoD — Validador de Perfil & Gerador de Importa VAR

> **In English:** A Next.js app that reconciles permission profiles between the TOTVS RM ERP and the VAR catalog. It matches functionalities automatically (exact, code-normalized and fuzzy/Levenshtein), lets analysts fix the remaining links by hand, and exports a CSV for import into VAR. Built with Next.js, TypeScript, shadcn/ui, Drizzle ORM, PostgreSQL (Neon) and Vitest. **Live:** [sod-theta.vercel.app](https://sod-theta.vercel.app)

Aplicação Next.js (App Router) + shadcn/ui para conciliação de funcionalidades entre o TOTVS RM e o catálogo do VAR, com matching automático (exato, normalizado por código e fuzzy/Levenshtein), edição manual de vínculos e exportação para CSV.

## Stack

- [Next.js](https://nextjs.org/) (App Router, React 19)
- [shadcn/ui](https://ui.shadcn.com/) (Radix UI + Tailwind CSS)
- TypeScript
- [Auth.js](https://authjs.dev/) (login por usuário e senha) + Drizzle ORM / Neon Postgres

## Estrutura de pastas

```
src/
  app/                    # rotas do App Router: app, /login, /perfil, /admin/usuarios, APIs
  auth.ts, auth.config.ts # Auth.js (Credentials); auth.config é a metade usada no middleware
  components/
    auth/                 # login, menu do usuário, contexto do usuário logado
    admin/                # gestão de usuários, troca de senha, tabela de atividades
    ui/                   # primitivos shadcn/ui (button, input, table, dialog, ...)
    validator/             # componentes de domínio (header, tabs, tabelas, modal)
  data/                   # catálogo do VAR e texto de exemplo do RM
  hooks/                  # use-profile-validator: estado e orquestração da tela
  lib/                    # normalização, matching, import/export, regras de usuário, notas SoD
    server/               # só servidor: sessão/permissões, log de atividades
  types/                  # tipos compartilhados (VarCatalogItem, ComparisonRow, ...)
```

## Rodando localmente

Crie um `.env.local` com:

```bash
DATABASE_URL="postgres://..."      # Neon
AUTH_SECRET="..."                  # openssl rand -base64 33
AUTH_TRUST_HOST=true               # só fora da Vercel
```

```bash
npm install
npm run db:push                    # cria/atualiza as tabelas
ADMIN_USERNAME=admin ADMIN_PASSWORD='uma-senha-forte' ADMIN_FULL_NAME='Administrador' \
  npm run db:seed:admin            # primeiro admin (não faz nada se já houver um)
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Acesso

Não há auto-cadastro: o admin cria as contas em **Gerenciar usuários** (menu do usuário).

| | Usuário | Admin |
|---|---|---|
| Validador, Analisador SoD, Comparador, consultar o Dicionário do VAR | ✓ | ✓ |
| Ver o próprio histórico e trocar a própria senha (**Meu perfil**) | ✓ | ✓ |
| Importar a planilha da Base VAR / editar o Dicionário | | ✓ |
| Curadoria da matriz SoD | | ✓ |
| Gerenciar usuários e ver o histórico de todos | | ✓ |

Desativar um usuário derruba a sessão dele na próxima requisição.
