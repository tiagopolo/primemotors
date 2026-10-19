# Prime Motors — Sistema de Compra de Veículos

Trabalho de **Engenharia de Software — 4º Bimestre**
Curso de Análise e Desenvolvimento de Sistemas (ADS1)

**Grupo:** Tiago Marson Polo · Anthonny Gabriel Ribeiro · Vinicius Braga dos Reis ·
Joaby Dantas dos Santos

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js |
| Framework | Next.js 16 (App Router) + React 19 |
| Linguagem | TypeScript |
| Estilo | Tailwind CSS v4 + design system próprio (`app/globals.css`) |
| Ícones | lucide-react |
| Persistência | PostgreSQL (Supabase) via `pg` (`lib/db.ts`, `db/schema.sql`) — sem `DATABASE_URL`, cai para arquivo local (`.data/db.json`), sem precisar de banco |

---

## Como rodar

```bash
npm install
npm run dev
```

Acesse <http://localhost:3000>.

Por padrão roda sem banco (modo arquivo). Para usar PostgreSQL de verdade (Supabase), copie
`.env.example` para `.env.local`, preencha `DATABASE_URL` e rode `db/schema.sql` no banco — veja
`docs/GUIA-HOSPEDAGEM.md` para o passo a passo completo (local e na nuvem, com Netlify).

### Usuários de teste

| Perfil | E-mail | Senha |
|---|---|---|
| Administrador | admin@primemotors.com | admin123 |
| Cliente | cliente@primemotors.com | cliente123 |

Há também o botão **Acessar como visitante** na tela de login.

---

## Estrutura de pastas

```
app/
  layout.tsx              layout raiz + AppProvider
  page.tsx                rota "/" -> decide entre login e home
  login/                  RF02
  cadastro/               RF01
  recuperar-senha/        recuperacao de senha
  (sistema)/              rotas autenticadas (header + bottom nav)
    layout.tsx            controle de acesso - RNF07
    home/                 dashboard com indicadores
    veiculos/             RF03 - listagem do estoque
    veiculos/[id]/        RF04 - detalhe do veiculo
    cadastrar/            RF16 / RN10 - CRUD de veiculos (admin)
    comprar/[id]/         RF05-RF14 - finalizar compra
    comprovante/[id]/     RF15 - comprovante emitido
    relatorios/           RF17 - acompanhamento de vendas
    configuracoes/        perfil, seguranca, preferencias
components/
  Layout.tsx              Cabecalho, NavegacaoInferior, Titulo, Secao
  Marca.tsx               logo Prime Motors em SVG
  CarroArte.tsx           ilustracao vetorial do veiculo
  GraficoLinha.tsx        grafico de linha em SVG puro
lib/
  types.ts                entidades do modelo de dados
  seed.ts                 dados iniciais (usuarios, veiculos, serie historica)
  store.tsx               Context API + localStorage (camada de dados)
  utils.ts                mascaras, formatacao, hash, calculo de frete
```

---

## Rastreabilidade dos requisitos

### Requisitos funcionais

| RF | Descrição | Onde está implementado |
|---|---|---|
| RF01 | Cadastro de usuário | `app/cadastro/page.tsx` · `store.cadastrar()` |
| RF02 | Login | `app/login/page.tsx` · `store.entrar()` |
| RF03 | Listar veículos disponíveis | `app/(sistema)/veiculos/page.tsx` |
| RF04 | Detalhes do veículo | `app/(sistema)/veiculos/[id]/page.tsx` |
| RF05 | Iniciar compra | `store.criarCompra()` |
| RF06 | Dados do cliente na compra | seção "Dados pessoais" em `comprar/[id]` |
| RF07 | Retirada na loja ou entrega | seletor de modalidade em `comprar/[id]` |
| RF08 | Cálculo automático do frete | `utils.calcularFrete()` |
| RF09 | Calendário de data e horário | seção "Agendar atendimento" |
| RF10 | Escolha da forma de pagamento | seção "Forma de pagamento" |
| RF11 | Geração de boleto | `utils.gerarLinhaDigitavel()` |
| RF12 | Dados para PIX/TED | `utils.CHAVE_PIX` |
| RF13 | Dados do cartão de crédito | formulário de cartão em `comprar/[id]` |
| RF14 | Registro do status do pagamento | `store.registrarPagamento()` |
| RF15 | Geração do comprovante | `store.confirmarCompra()` · `comprovante/[id]` |
| RF16 | Admin cadastra/edita/remove veículo | `app/(sistema)/cadastrar/page.tsx` |
| RF17 | Admin gerencia pedidos | `app/(sistema)/relatorios/page.tsx` |
| RF18 | Veículo passa a "vendido" | `store.confirmarCompra()` |

### Requisitos não funcionais

| RNF | Como foi atendido |
|---|---|
| RNF01 | Layout responsivo mobile-first com Tailwind |
| RNF02 | Renderização leve, sem imagens pesadas (ilustrações SVG) |
| RNF03 | Senha nunca é armazenada em texto puro — `utils.hashSenha()` |
| RNF04 | Estado persistido em `localStorage`, sobrevive ao recarregar |
| RNF05 | IDs únicos (`utils.uid`) evitam duplicidade |
| RNF06 | Camada de dados isolada em `lib/store.tsx` — trocar por API/PostgreSQL não afeta as telas |
| RNF07 | `app/(sistema)/layout.tsx` bloqueia acesso sem sessão; telas de admin checam o perfil |
| RNF08 | Status do pedido e histórico exibidos no comprovante |

### Regras de negócio

| RN | Onde é aplicada |
|---|---|
| RN01 | Só há compra com sessão ativa (`criarCompra` exige `usuario`) |
| RN02 | `Compra.veiculoId` — exatamente um veículo por compra |
| RN03 | `criarCompra` recusa veículo vendido; `confirmarCompra` marca como vendido |
| RN04 | Validação exige endereço completo quando a modalidade é entrega |
| RN05 | Validação exige data do agendamento |
| RN06 | `Compra.agendamento` pertence à compra |
| RN07 | `Compra.pagamento` — um pagamento por compra |
| RN08 | Comprovante só é criado dentro de `confirmarCompra` |
| RN09 | `valorTotal = valorVeiculo + valorFrete` |
| RN10 | Tela de cadastro bloqueia perfis não-admin |
| RN11 | `Compra.historico` registra cada mudança de status |
| RN12 | `calcularFrete(uf, cep)` depende do endereço |

---

## Banco de dados

Toda a leitura e escrita passa por `lib/store.tsx`, que conversa com as rotas em
`app/api/`. Essas rotas usam `lib/db.ts`, que grava em PostgreSQL (Supabase)
quando `DATABASE_URL` está definida, ou em `.data/db.json` quando não está.
As tabelas ficam em `db/schema.sql`. Veja `docs/GUIA-HOSPEDAGEM.md` para
colocar o sistema no ar com Netlify + Supabase.
