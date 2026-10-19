# API — Prime Motors

Camada de backend do sistema. Todas as rotas ficam em `app/api/` e conversam com
o banco através de `lib/db.ts`.

## Endpoints

| Método | Rota | O que faz | Requisito |
|---|---|---|---|
| GET | `/api/veiculos` | lista o estoque | RF03 |
| POST | `/api/veiculos` | cadastra ou atualiza veículo | RF16 |
| GET | `/api/veiculos/[id]` | detalhes do veículo | RF04 |
| PUT | `/api/veiculos/[id]` | edita o veículo | RF16 |
| DELETE | `/api/veiculos/[id]` | remove do estoque | RF16 / RN10 |
| GET | `/api/compras` | lista pedidos | RF17 |
| POST | `/api/compras` | grava a compra, emite comprovante e marca vendido | RF05, RF15, RF18 |
| GET | `/api/compras/[id]` | dados do pedido | RF15 |
| PATCH | `/api/compras/[id]` | atualiza status / pagamento | RF14, RN11 |
| GET | `/api/usuarios` | lista usuários (sem senha) | — |
| POST | `/api/usuarios` | cadastro | RF01 |
| POST | `/api/auth/login` | autenticação | RF02 |

## Dois modos de funcionamento

`lib/db.ts` escolhe o modo pela variável `DATABASE_URL`:

**Sem `DATABASE_URL`** (padrão) — grava em `.data/db.json`. Serve para
desenvolver e apresentar sem configurar PostgreSQL. Já funciona agora.

**Com `DATABASE_URL`** — usa PostgreSQL (Supabase). Para ativar:

```bash
npm install pg
```

1. No SQL Editor do Supabase, execute `db/schema.sql` (cria as tabelas e os
   dados iniciais no banco Postgres do projeto).
2. Copie `.env.example` para `.env.local` e preencha com a connection string
   do projeto Supabase (ver `docs/GUIA-HOSPEDAGEM.md`).
3. Reinicie o `npm run dev`.

Nenhuma rota muda entre os dois modos.

## Testando

Com o servidor rodando:

```bash
curl http://localhost:3000/api/veiculos

curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"SEU_EMAIL\",\"senha\":\"SUA_SENHA\"}"
```

(No PowerShell, troque `^` por `` ` `` ou use `Invoke-RestMethod`.)

Ou abra <http://localhost:3000/api/veiculos> direto no navegador.

## Ligando as telas na API

Hoje as telas leem de `lib/store.tsx` (Context + localStorage). Para passarem a
usar a API, basta trocar o corpo das funções do store por `fetch`:

```ts
// antes
const salvarVeiculo = (v: Veiculo) => setDb(...);

// depois
const salvarVeiculo = async (v: Veiculo) => {
  await fetch("/api/veiculos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(v),
  });
  await recarregar();
};
```

Nenhum componente de tela precisa ser alterado.
