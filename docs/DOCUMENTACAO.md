# Prime Motors — Documentação do Projeto

Documentação exigida no **Seminário — 4º Bimestre (Desenvolvimento e Apresentação do Projeto)**, seção 10. Os itens seguem a ordem do enunciado.

---

## 1. Nome do projeto

**Prime Motors** — plataforma web de concessionária para exibição, compra e agendamento de retirada ou entrega de veículos **zero km**.

## 2. Integrantes

| Integrante | Apresenta | Participação no desenvolvimento |
|---|---|---|
| Tiago Marson Polo | Abertura e o projeto (nome, problema, objetivo e público-alvo) | Front-end, API e banco de dados |
| Anthonny Gabriel Ribeiro | Funcionalidades e demonstração do sistema | Telas do cliente e fluxo de compra |
| Vinicius Braga dos Reis | Linguagem de programação e tecnologias utilizadas | Modelagem e diagramas do projeto |
| Joaby Dantas dos Santos | Trechos de código e conclusão | Documentação e hospedagem do sistema |

> Divisão sugerida pelo grupo, a mesma usada no slide 10 da apresentação (`Seminario-Prime-Motors.pptx`). O seminário avalia a participação individualmente (seção 8) — ajustem se a divisão real do grupo for diferente.

## 3. Problema

Concessionárias que atendem por telefone, mensagens e planilhas têm dificuldade para divulgar o estoque, registrar interesse, reservar veículos e controlar pagamento e entrega. Isso gera demora, erros de cadastro, perda de vendas e pouca rastreabilidade.

## 4. Objetivo

Centralizar em um único sistema o fluxo de venda: consulta do estoque, escolha do veículo, definição de retirada ou entrega, pagamento, comprovante e baixa do veículo no estoque.

## 5. Requisitos

**Funcionais (RF01–RF18)**

| Código | Requisito |
|---|---|
| RF01 | Cadastro de usuários com nome, e-mail, telefone e senha |
| RF02 | Login para usuários cadastrados |
| RF03 | Listar os veículos disponíveis |
| RF04 | Exibir os detalhes completos do veículo |
| RF05 | Iniciar a compra de um veículo |
| RF06 | Solicitar os dados do cliente para concluir a compra |
| RF07 | Escolher entre retirada na loja e entrega no endereço |
| RF08 | Calcular o frete quando a modalidade for entrega |
| RF09 | Escolher data e horário |
| RF10 | Escolher a forma de pagamento: boleto, PIX ou cartão |
| RF11 | Gerar boleto quando essa forma for escolhida |
| RF12 | Exibir os dados do PIX |
| RF13 | Informar os dados do cartão de crédito |
| RF14 | Registrar o status do pagamento |
| RF15 | Gerar comprovante após a confirmação do pagamento |
| RF16 | Administrador cadastra, edita e remove veículos |
| RF17 | Administrador acompanha pedidos e pagamentos |
| RF18 | Veículo vendido sai do estoque disponível |

**Não funcionais (RNF01–RNF08)**: interface responsiva (computador e celular); tempo de carregamento adequado; senha guardada com hash (RNF03); consistência dos dados; facilidade de manutenção; controle de acesso entre cliente e administrador (RNF07); clareza visual do status do pedido.

**Regras de negócio (RN01–RN12)**: só usuário cadastrado conclui compra (RN01); cada compra tem exatamente um veículo (RN02); veículo vendido não fica disponível (RN03); entrega exige endereço completo (RN04); retirada exige data e horário (RN05); agendamento pertence a uma compra (RN06); uma compra tem um pagamento (RN07); comprovante só após confirmação (RN08); total = veículo + frete quando houver entrega (RN09); só o administrador cadastra ou remove veículos (RN10); histórico de status (RN11); frete depende do endereço (RN12).

## 6. Principais funcionalidades

- Cadastro e login (cliente e administrador)
- Estoque com busca, filtro por status e ordenação por preço
- Ficha técnica do veículo com galeria de fotos
- Cadastro, edição e remoção de veículos (somente administrador)
- Fluxo de compra: retirada ou entrega, frete calculado por UF/CEP, agendamento e pagamento
- Comprovante com código e histórico de status
- Painel com indicadores e gráfico de vendas
- Relatórios com exportação em CSV
- Configurações de perfil

## 7. Linguagem utilizada

**TypeScript** (executado em **Node.js**), usado tanto no front-end (React) quanto na API.

- **Por que foi escolhida:** é a linguagem da stack web moderna; o mesmo idioma no front e no back reduz erros de tipo entre as partes e simplifica a integração.
- **Principais características:** tipagem estática, interfaces e tipos para os modelos de dados, compilação antes da execução e grande ecossistema de bibliotecas.
- **Como foi usada:** os tipos de `lib/types.ts` (Usuario, Veiculo, Compra etc.) são compartilhados pelas telas, pelas rotas da API e pela camada de banco.

## 8. Tecnologias utilizadas

| Tecnologia | Uso |
|---|---|
| Next.js 16 (App Router) | Páginas do sistema e rotas da API (`app/api`) |
| React 19 | Componentes e telas |
| Tailwind CSS 4 | Estilo visual |
| lucide-react | Ícones |
| pg (node-postgres) | Driver de conexão com o PostgreSQL |
| PostgreSQL (Supabase Free) | Banco de dados em produção |
| Netlify | Hospedagem do sistema e da API |
| GitHub | Código-fonte e integração com a Netlify |

## 9. Banco de dados

PostgreSQL (hospedado no Supabase), com as tabelas do modelo de dados: `usuario`, `veiculo`, `imagem_veiculo`, `opcional_veiculo`, `compra`, `pagamento`, `entrega`, `retirada`, `agendamento`, `comprovante` e `historico_compra`.

- Script de criação e dados iniciais: `db/schema.sql`
- Chaves estrangeiras garantem que uma compra sempre aponte para um usuário e um veículo (RN01, RN02).
- A coluna `compra.dados` guarda o pedido completo em `JSONB` (o tipo binário de JSON do Postgres, indexável); as colunas ao lado servem para consultas e relatórios.
- Consultas prontas para a apresentação estão no fim de `db/schema.sql`.
- O driver `pg` devolve `JSONB` já como objeto JavaScript e `TIMESTAMPTZ` como `Date` — a camada `lib/db.ts` trata os dois casos (ver item 13, "Dificuldades encontradas").

## 10. Arquitetura da aplicação

```
 Navegador (React / Next.js)
   app/ (telas)  ──►  lib/store.tsx  (estado e chamadas à API)
                              │
                              ▼  fetch("/api/...")
                    app/api/*  (rotas da API — regras de negócio)
                              │
                              ▼
                    lib/db.ts  (camada de acesso ao banco)
                              │
                 ┌────────────┴────────────┐
                 ▼                         ▼
      PostgreSQL / Supabase       .data/db.json (somente desenvolvimento)
```

- **Front-end:** telas em `app/`, componentes em `components/`.
- **Integração:** `lib/store.tsx` chama a API; as telas não acessam o banco diretamente.
- **API:** rotas em `app/api/` — veículos, compras, usuários e autenticação.
- **Banco:** `lib/db.ts` usa PostgreSQL (via `pg`) quando `DATABASE_URL` está definida; sem ela, usa um arquivo local.

Rotas da API:

| Método | Rota | Função |
|---|---|---|
| GET / POST | `/api/veiculos` | Lista ou cadastra/atualiza veículo |
| GET / PUT / DELETE | `/api/veiculos/[id]` | Detalhe, edição ou remoção |
| GET / POST | `/api/compras` | Lista pedidos ou inicia compra |
| GET / PATCH | `/api/compras/[id]` | Detalhe ou atualização do pedido |
| GET / POST | `/api/usuarios` | Lista ou cadastra usuário |
| PUT | `/api/usuarios/[id]` | Atualiza dados do usuário |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/recuperar` | Verifica e-mail para recuperação de senha |

## 11. Principais telas

1. Login (`/login`) — inclui acesso como visitante
2. Cadastro (`/cadastro`)
3. Recuperação de senha (`/recuperar-senha`)
4. Home com indicadores (`/home`)
5. Estoque (`/veiculos`)
6. Detalhe do veículo (`/veiculos/[id]`)
7. Cadastrar/editar veículo (`/cadastrar`) — somente administrador
8. Finalizar compra (`/comprar/[id]`)
9. Comprovante (`/comprovante/[id]`)
10. Relatórios (`/relatorios`)
11. Configurações (`/configuracoes`)

## 12. Descrição das funcionalidades

- **Login (RF02, RNF07):** a senha é comparada no servidor com o hash guardado. O administrador vê as ações de cadastro; o cliente, não.
- **Estoque (RF03, RF04):** a lista vem da API; a ficha técnica traz motor, potência, câmbio, opcionais e fotos.
- **Compra (RF05 a RF09, RN01, RN02):** o cliente escolhe retirada ou entrega. Na entrega, o frete é calculado a partir da UF e do CEP informados (RN12). O servidor recalcula o total (veículo + frete) a cada alteração do pedido (RN09).
- **Pagamento (RF10 a RF14, RN07):** PIX mostra a chave; boleto gera a linha digitável; cartão guarda apenas os quatro últimos dígitos (RNF03).
- **Conclusão (RF15, RF18, RN03, RN08):** ao confirmar, o pedido vira "concluída", o comprovante é emitido uma única vez e o veículo sai do estoque.
- **Estoque administrativo (RF16, RN10):** o administrador cadastra, edita e remove veículos. Um veículo que já tem pedido não pode ser removido (409), para preservar o histórico de vendas.
- **Histórico (RN11):** toda mudança de status é registrada com data e hora.

## 13. Dificuldades encontradas

- **Front sem banco:** a primeira versão guardava tudo no `localStorage` do navegador, sem persistência real.
- **Fotos grandes:** as imagens são guardadas em base64. Isso exigiu trocar a coluna de texto por `TEXT` (sem limite prático de tamanho) e reduzir as fotos no navegador antes de enviar.
- **Limite de requisição na hospedagem gratuita:** boa parte das hospedagens serverless limita o corpo de cada requisição a poucos MB.
- **Ambiente de execução:** no Windows, o PowerShell bloqueava scripts do `npm`; foi necessário liberar a execução para o usuário atual.
- **Integração das telas:** as funções do contexto passaram a ser assíncronas, e cada tela precisou esperar a resposta do servidor.
- **Sessão sem token:** a API ainda não valida identidade em cada chamada, o que é uma limitação conhecida (ver item 15).
- **Driver do banco devolve os tipos prontos:** tanto o JSON (coluna `compra.dados`, `JSONB` no Postgres) quanto a data (`TIMESTAMPTZ`) já chegam convertidos pelo driver `pg` — um objeto JavaScript e um `Date`, não texto. O código original fazia `JSON.parse` em cima do valor como se fosse sempre string, e quebrava com "not valid JSON" toda vez que uma compra era concluída. A correção: só chamar `JSON.parse` quando o valor realmente vier como string, e registrar um parser (`pg.types.setTypeParser`) para a data já sair como string ISO 8601, no formato que o resto do app espera.

## 14. Soluções adotadas

- Camada `lib/db.ts` com dois modos (PostgreSQL ou arquivo), para desenvolver sem banco e publicar com PostgreSQL sem mudar as rotas.
- Regras de negócio no servidor (total, comprovante, veículo vendido, bloqueio de venda repetida).
- Colunas, `CHECK` e chaves estrangeiras no banco para garantir consistência (RNF05).
- Estoque e pedidos recarregados da API após cada alteração, para as telas sempre refletirem o banco.
- Hospedagem gratuita: Netlify (sistema e API) e Supabase Free (PostgreSQL). Passo a passo em `docs/GUIA-HOSPEDAGEM.md`.

## 15. Conclusão

O Prime Motors sai do protótipo e passa a ser uma aplicação funcional: as telas consomem uma API própria, que grava em um banco PostgreSQL e aplica as regras de negócio do levantamento de requisitos.

**Limitações conhecidas (e próximos passos):**

- A função de hash de senha (`lib/utils.ts`) é didática. Em produção, usar bcrypt ou argon2 no servidor.
- A API não exige token de autenticação; o próximo passo é emitir um token no login e validá-lo nas rotas de administrador.
- O envio de e-mail na recuperação de senha não foi implementado.
- O pagamento é simulado; não há integração com gateway real.
