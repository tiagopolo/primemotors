# Guia: colocar o Prime Motors no ar de graça

Este guia leva o sistema da sua máquina até a internet, com **front-end, API e banco de dados** funcionando, usando apenas serviços gratuitos:

| Parte | Serviço gratuito | Para que serve |
|---|---|---|
| Código-fonte | **GitHub** | Guardar o projeto e conectar à Netlify |
| Sistema + API | **Netlify (plano Free)** | Publicar o site e as rotas `app/api` |
| Banco de dados | **Supabase (plano Free)** | PostgreSQL gratuito na nuvem |

Tempo estimado: 1 a 2 horas na primeira vez.

---

## Antes de começar

Você precisa de:

- **Node.js 20.9 ou superior** (teste com `node -v`)
- **Git** instalado (teste com `git --version`)
- Conta no **GitHub** e conta na **Netlify** (pode entrar com a conta do GitHub)
- Conta no **Supabase** (pode entrar com GitHub)

> Antes de publicar, confirme no seu computador que o sistema roda (Passo 1).

---

## Passo 1 — Testar o sistema na sua máquina

1. Abra o terminal na pasta do projeto:

```bash
cd "D:\01_FACULDADE\ENGENHARIA DE SOFTWARE\4ª BIMESTRE\04-sistema-primemotors"
```

2. Instale as dependências:

```bash
npm install
```

3. Suba o servidor de desenvolvimento:

```bash
npm run dev
```

4. Abra `http://localhost:3000` no navegador e entre com `admin@primemotors.com` / `admin123`.

Se a página abrir, o sistema está pronto para o próximo passo. Sem um `.env.local` configurado, o sistema roda no **modo arquivo** (`.data/db.json`) — funciona normalmente, só não é o banco de verdade ainda.

---

## Passo 2 — Criar o banco de dados no Supabase

1. Acesse **supabase.com** e crie a conta (dá pra entrar com GitHub).
2. Clique em **New Project**.
3. Escolha a organização, dê um nome ao projeto (ex.: `primemotors`), crie uma **senha do banco** e **copie-a agora** — ela só aparece uma vez, e vai pra string de conexão.
4. Escolha a região mais próxima do Brasil (ex.: `South America (São Paulo)`) e clique em **Create new project**.
5. Espere o projeto terminar de provisionar (1 a 2 minutos).

### 2.1 Criar as tabelas e os dados iniciais

1. No menu lateral do projeto, abra **SQL Editor** → **New query**.
2. Abra o arquivo `db/schema.sql` do projeto, copie **todo** o conteúdo e cole no editor.
3. Clique em **Run**.
4. Confirme: no menu **Table Editor**, devem aparecer as tabelas `usuario`, `veiculo`, `compra`, `pagamento` e as demais; a tabela `veiculo` deve ter 6 linhas.

> Diferente do MySQL, não precisa criar o banco antes — o Supabase já dá um banco Postgres pronto pra cada projeto, e o script roda direto nele.

### 2.2 Pegar a string de conexão

1. No menu lateral, vá em **Project Settings → Database**.
2. Em **Connection string**, escolha a aba **Transaction pooler** (porta `6543`) — funciona melhor com hospedagem serverless como a Netlify do que a conexão direta (porta `5432`).
3. Copie a string, que tem este formato:
   ```
   postgresql://postgres.SEU_PROJETO:[SUA-SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
   ```
4. Troque `[SUA-SENHA]` pela senha do banco que você criou no Passo 2. Se ela tiver caracteres como `@`, `#` ou `%`, troque-os pela versão codificada na URL (`@` vira `%40`, `#` vira `%23`, `%` vira `%25`).

### 2.3 Testar a conexão a partir do seu computador

1. Na pasta do projeto, crie o arquivo `.env.local` (copie o `.env.example` e renomeie). Preencha:

```bash
DATABASE_URL="postgresql://postgres.SEU_PROJETO:SUA_SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"
DATABASE_SSL="true"
```

2. Reinicie o `npm run dev` (Ctrl+C e rode de novo; o `.env.local` só é lido na inicialização).
3. Abra `http://localhost:3000/api/veiculos` no navegador. Você deve ver a lista com os 6 veículos em JSON.
4. Entre no sistema com `admin@primemotors.com` / `admin123`. Se der "E-mail ou senha inválidos", confirme se o `schema.sql` foi executado por completo (Passo 2.1).

---

## Passo 3 — Enviar o código para o GitHub

> Faça o `git init` **dentro da pasta `04-sistema-primemotors`**, e não na pasta pai. Assim o repositório começa no `package.json`, que a Netlify precisa encontrar na raiz.

1. Crie um repositório vazio no GitHub, por exemplo `primemotors`. Não marque "Add a README".
2. No terminal, dentro da pasta do projeto:

```bash
git init
```

```bash
git add .
```

```bash
git commit -m "Prime Motors - versão para apresentação"
```

```bash
git branch -M main
```

```bash
git remote add origin https://github.com/SEU-USUARIO/primemotors.git
```

```bash
git push -u origin main
```

3. Confirme no GitHub que `.env.local` **não** apareceu na lista de arquivos. Ele deve ficar de fora (o `.gitignore` já cuida disso). As senhas nunca devem ir para o GitHub.

---

## Passo 4 — Publicar na Netlify

1. Acesse **netlify.com** e entre com a conta do GitHub.
2. Clique em **Add new site → Import an existing project** e escolha o repositório `primemotors`.
3. A Netlify detecta o Next.js sozinha e já preenche:
   - **Build command**: `next build`
   - **Publish directory**: deixe o que a Netlify sugerir (ela usa o plugin oficial do Next.js por baixo dos panos)
4. Antes de publicar, abra **Add environment variables** e cadastre:

| Key | Value |
|---|---|
| `DATABASE_URL` | a mesma string do `.env.local` |
| `DATABASE_SSL` | `true` |

5. Clique em **Deploy primemotors** e espere terminar (2 a 4 minutos).
6. A Netlify mostra um endereço, como `https://primemotors.netlify.app` (dá pra trocar esse nome em **Site configuration → Change site name**).

### 4.1 Conferir a publicação

1. Abra `https://SEU-ENDERECO.netlify.app/api/veiculos`. Deve aparecer a lista de veículos.
2. Abra `https://SEU-ENDERECO.netlify.app/login` e entre com `admin@primemotors.com` / `admin123`.
3. Faça uma compra de teste completa (retirada, pagamento com cartão). Depois confira no **Table Editor** do Supabase que a compra apareceu na tabela `compra` e que o veículo ficou com `status = 'vendido'`.

> Para a apresentação, use outros veículos ou apague a compra de teste no Table Editor, para o estoque começar do jeito que você quer mostrar.

---

## Passo 5 — Atualizações depois de publicar

Sempre que alterar o código:

```bash
git add .
```

```bash
git commit -m "descreva a mudança"
```

```bash
git push
```

A Netlify publica a nova versão sozinha.

Se mudar o **banco** (por exemplo, um novo campo em `schema.sql`), execute a alteração no SQL Editor do Supabase; o `git push` não altera o banco.

---

## Limites do plano gratuito (leia antes da apresentação)

- **Netlify Free:** 100 GB de banda e 300 minutos de build por mês — não é um problema pra um projeto de faculdade, mas evite ficar fazendo dezenas de deploys seguidos no dia da apresentação.
- **Supabase Free:** o projeto **pausa sozinho depois de 7 dias sem uso**. Se for apresentar alguns dias depois de configurar, entre no painel do Supabase um pouco antes e clique em **Restore project** se ele aparecer pausado — reativar leva menos de 2 minutos. Também há um limite de 500 MB de banco, bem acima do que este projeto usa.
- **Tempo de resposta:** a primeira requisição depois de um tempo parado pode demorar mais (tanto a função da Netlify quanto o banco do Supabase "esquentam" de novo).

---

## Plano B (para não depender da internet no dia)

Leve o sistema rodando no seu notebook:

1. Mantenha `.env.local` apontando para o Supabase (ou para um PostgreSQL local, se o grupo preferir instalar um banco na máquina).
2. Rode `npm run build` e depois `npm start` antes da apresentação, para validar que a versão de produção sobe.
3. Tenha o endereço da Netlify anotado, mas considere o notebook como a opção principal se a rede da sala estiver instável.

---

## Checklist final (seção 12 do seminário)

**Aplicação**

- [ ] O sistema inicia corretamente (`npm run dev` ou endereço da Netlify)
- [ ] Todas as dependências estão instaladas (`npm install` rodado no notebook)
- [ ] O banco está funcionando (`/api/veiculos` responde com a lista)
- [ ] As principais funcionalidades funcionam: login, estoque, compra, comprovante, cadastro de veículo
- [ ] Os dados para demonstração estão cadastrados (6 veículos e os usuários de teste)
- [ ] Não há erro que impeça a demonstração (teste uma compra completa antes do dia)
- [ ] Conferiu no painel do Supabase que o projeto não está pausado

**Apresentação**

- [ ] Todos os integrantes sabem explicar o projeto
- [ ] Todos sabem explicar a própria participação (seção 8 do seminário)
- [ ] Todos participam da apresentação
- [ ] As principais telas serão demonstradas
- [ ] A linguagem (TypeScript/Node.js) será apresentada
- [ ] As principais tecnologias serão apresentadas (Next.js, React, pg, PostgreSQL/Supabase, Netlify)
- [ ] O grupo está preparado para perguntas (ver `docs/DOCUMENTACAO.md`, seção 13 e 15)

**Entregas (seção 11 do seminário)**

- [ ] Aplicação desenvolvida e publicada
- [ ] Código-fonte no GitHub
- [ ] Banco de dados e scripts (`db/schema.sql`)
- [ ] Documentação atualizada (`docs/DOCUMENTACAO.md`)
- [ ] Apresentação em slides mostrando a aplicação funcionando
- [ ] Aplicação preparada para demonstração (endereço da Netlify anotado e plano B pronto)
