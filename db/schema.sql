-- =====================================================================
-- PRIME MOTORS — esquema do banco de dados (PostgreSQL / Supabase)
-- Trabalho de Engenharia de Software — ADS1
--
-- Como executar no Supabase:
--   1. No painel do projeto, abra SQL Editor -> New query
--   2. Cole este arquivo inteiro
--   3. Clique em Run
--
-- O Supabase já cria o banco pra você (schema "public", dentro do projeto) —
-- por isso este script não tem CREATE DATABASE nem USE, diferente de um
-- script MySQL. É só colar e rodar.
-- =====================================================================

-- ---------------------------------------------------------------------
-- usuario — RF01, RF02, RNF03, RNF07
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuario (
  id          VARCHAR(40)  NOT NULL PRIMARY KEY,
  nome        VARCHAR(120) NOT NULL,
  email       VARCHAR(160) NOT NULL UNIQUE,
  telefone    VARCHAR(20),
  senha_hash  VARCHAR(120) NOT NULL,
  perfil      VARCHAR(10)  NOT NULL DEFAULT 'cliente'
              CHECK (perfil IN ('cliente', 'admin')),
  criado_em   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- veiculo — RF03, RF04, RF16, RF18
-- Nesta versão a concessionária trabalha só com 0 km.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS veiculo (
  id             VARCHAR(40)   NOT NULL PRIMARY KEY,
  marca          VARCHAR(60)   NOT NULL,
  modelo         VARCHAR(80)   NOT NULL,
  ano            SMALLINT      NOT NULL,
  quilometragem  INTEGER       NOT NULL DEFAULT 0,
  preco          DECIMAL(12,2) NOT NULL,
  cor            VARCHAR(60),
  cambio         VARCHAR(12)   NOT NULL DEFAULT 'Automático'
                 CHECK (cambio IN ('Automático', 'Manual', 'CVT')),
  combustivel    VARCHAR(12)   NOT NULL DEFAULT 'Flex'
                 CHECK (combustivel IN ('Flex', 'Gasolina', 'Diesel', 'Elétrico', 'Híbrido')),
  carroceria     VARCHAR(40),
  motor          VARCHAR(60),
  potencia       VARCHAR(30),
  descricao      TEXT,
  -- listas simples separadas por | (o DER "puro" usaria tabelas filhas,
  -- ver imagem_veiculo e opcional_veiculo abaixo)
  opcionais      TEXT,
  -- fotos em base64 (data URL) somam centenas de KB: por isso TEXT, sem
  -- limite prático de tamanho (equivalente ao LONGTEXT do MySQL)
  fotos          TEXT,
  status         VARCHAR(12)   NOT NULL DEFAULT 'disponivel'
                 CHECK (status IN ('disponivel', 'reservado', 'vendido')),
  card_cor       VARCHAR(9)    NOT NULL DEFAULT '#1f6fff',
  criado_em      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CONSTRAINT chk_zero_km CHECK (quilometragem = 0)
);

CREATE INDEX IF NOT EXISTS idx_veiculo_status ON veiculo (status);

-- Opção normalizada para as fotos (usada se o professor pedir 3FN)
CREATE TABLE IF NOT EXISTS imagem_veiculo (
  id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  veiculo_id VARCHAR(40)  NOT NULL REFERENCES veiculo (id) ON DELETE CASCADE,
  url        VARCHAR(255) NOT NULL,
  ordem      SMALLINT     NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS opcional_veiculo (
  id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  veiculo_id VARCHAR(40)  NOT NULL REFERENCES veiculo (id) ON DELETE CASCADE,
  descricao  VARCHAR(120) NOT NULL
);

-- ---------------------------------------------------------------------
-- compra — RF05, RF06, RN01, RN02, RN09, RN11
-- A coluna dados guarda o JSON completo do pedido, o que mantém a API
-- simples; as colunas ao lado existem para consultas e relatórios.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS compra (
  id          VARCHAR(40)   NOT NULL PRIMARY KEY,
  usuario_id  VARCHAR(40)   NOT NULL REFERENCES usuario (id),
  veiculo_id  VARCHAR(40)   NOT NULL REFERENCES veiculo (id),
  valor_total DECIMAL(12,2) NOT NULL,
  status      VARCHAR(20)   NOT NULL DEFAULT 'iniciada'
              CHECK (status IN ('iniciada', 'aguardando_pagamento', 'paga', 'agendada', 'concluida')),
  -- JSONB (não JSON): o Postgres guarda em formato binário indexável; é o
  -- tipo recomendado pelo próprio Supabase para colunas de JSON.
  dados       JSONB         NOT NULL,
  criada_em   TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_compra_status ON compra (status);

-- ---------------------------------------------------------------------
-- pagamento — RF10 a RF14, RN07 (um pagamento por compra)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pagamento (
  id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  compra_id       VARCHAR(40) NOT NULL UNIQUE REFERENCES compra (id) ON DELETE CASCADE,
  forma           VARCHAR(10) NOT NULL CHECK (forma IN ('pix', 'boleto', 'cartao')),
  valor           DECIMAL(12,2) NOT NULL,
  status          VARCHAR(12) NOT NULL DEFAULT 'pendente'
                  CHECK (status IN ('pendente', 'aguardando', 'confirmado')),
  linha_digitavel VARCHAR(80),
  chave_pix       VARCHAR(60),
  cartao_final    CHAR(4),
  nome_cartao     VARCHAR(120),
  data_pagamento  TIMESTAMPTZ
);

-- ---------------------------------------------------------------------
-- entrega — RF07, RF08, RN04, RN12
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS entrega (
  id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  compra_id   VARCHAR(40) NOT NULL UNIQUE REFERENCES compra (id) ON DELETE CASCADE,
  cep         CHAR(9)      NOT NULL,
  rua         VARCHAR(160) NOT NULL,
  numero      VARCHAR(15)  NOT NULL,
  cidade      VARCHAR(120) NOT NULL,
  uf          CHAR(2)      NOT NULL,
  valor_frete DECIMAL(10,2) NOT NULL DEFAULT 0
);

-- ---------------------------------------------------------------------
-- retirada — RF07, RN05
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS retirada (
  id        INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  compra_id VARCHAR(40)  NOT NULL UNIQUE REFERENCES compra (id) ON DELETE CASCADE,
  unidade   VARCHAR(120) NOT NULL,
  endereco  VARCHAR(200) NOT NULL
);

-- ---------------------------------------------------------------------
-- agendamento — RF09, RN06
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agendamento (
  id        INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  compra_id VARCHAR(40) NOT NULL UNIQUE REFERENCES compra (id) ON DELETE CASCADE,
  data      DATE        NOT NULL,
  horario   TIME        NOT NULL
);

-- ---------------------------------------------------------------------
-- comprovante — RF15, RN08
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comprovante (
  id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  compra_id  VARCHAR(40) NOT NULL UNIQUE REFERENCES compra (id) ON DELETE CASCADE,
  codigo     VARCHAR(30) NOT NULL UNIQUE,
  emitido_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- historico_compra — RN11 (rastreabilidade dos status)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS historico_compra (
  id        INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  compra_id VARCHAR(40) NOT NULL REFERENCES compra (id) ON DELETE CASCADE,
  status    VARCHAR(20) NOT NULL
            CHECK (status IN ('iniciada', 'aguardando_pagamento', 'paga', 'agendada', 'concluida')),
  em        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- Dados iniciais (mesmos do lib/seed.ts)
-- Os hashes abaixo foram calculados pela própria função hashSenha()
-- (lib/utils.ts) a partir das senhas de teste combinadas com o grupo.
-- =====================================================================
INSERT INTO usuario (id, nome, email, telefone, senha_hash, perfil) VALUES
  ('usr_admin',     'Tiago Marson Polo',        'admin@primemotors.com',   '(44) 99999-9999', 'pm$f5505c1f', 'admin'),
  ('usr_cliente',   'Anthonny Gabriel Ribeiro', 'cliente@primemotors.com', '(44) 98888-1010', 'pm$319b164b', 'cliente'),
  ('usr_visitante', 'Visitante',                'visitante@primemotors.com', '',               'pm$1505',    'cliente')
ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome, senha_hash = EXCLUDED.senha_hash;

INSERT INTO veiculo
  (id, marca, modelo, ano, preco, cor, cambio, combustivel, carroceria, motor, potencia, descricao, fotos, status, card_cor)
VALUES
  ('vei_001','Toyota','Corolla XEI',2026,129900,'Branco Pérola','CVT','Flex','Sedã','2.0 Dynamic Force','177 cv',
   'Sedã completo zero quilômetro.','/veiculos/sf/corolla-1.png|/veiculos/sf/corolla-3.png','disponivel','#cfd6e6'),
  ('vei_002','Lamborghini','Revuelto',2026,6990000,'Laranja Arancio','Automático','Híbrido','Cupê','V12 6.5L','1.015 cv',
   'O ápice da engenharia, zero quilômetro.','/veiculos/sf/revuelto-2.png|/veiculos/revuelto-1.jpg','disponivel','#ff6a1f'),
  ('vei_003','BYD','Seal',2026,129900,'Azul Atlântico','Automático','Elétrico','Sedã','Elétrico AWD','530 cv',
   'Sedã elétrico zero quilômetro.','/veiculos/seal-1.webp|/veiculos/seal-2.webp','disponivel','#1f6fff'),
  ('vei_004','Volvo','EX30',2026,249900,'Cinza Vapour','Automático','Elétrico','SUV','Elétrico Single Motor','272 cv',
   'SUV elétrico compacto zero quilômetro.','/veiculos/ex30-1.jpg|/veiculos/ex30-2.jpg','disponivel','#9aa4b2'),
  ('vei_005','Toyota','Hilux SRX',2026,329900,'Prata Metálico','Automático','Diesel','Picape','2.8 Turbo Diesel','204 cv',
   'Picape 4x4 zero quilômetro.','/veiculos/sf/hilux-1.png|/veiculos/hilux-2.jpg','disponivel','#b9c0cc'),
  ('vei_006','Jeep','Compass Limited',2026,168900,'Preto Carbon','Automático','Flex','SUV','1.3 Turbo T270','185 cv',
   'SUV familiar zero quilômetro.','/veiculos/compass-1.jpg|/veiculos/compass-2.jpg','disponivel','#2b2f36')
ON CONFLICT (id) DO UPDATE SET preco = EXCLUDED.preco;

-- =====================================================================
-- Consultas úteis para a apresentação
-- =====================================================================

-- Estoque disponível (RF03)
-- SELECT marca, modelo, ano, preco FROM veiculo WHERE status = 'disponivel';

-- Faturamento por mês (tela de Relatórios)
-- SELECT TO_CHAR(criada_em, 'YYYY-MM') AS mes,
--        COUNT(*) AS vendas,
--        SUM(valor_total) AS faturamento
--   FROM compra WHERE status = 'concluida'
--  GROUP BY mes ORDER BY mes;

-- Pedidos com pagamento e agendamento (RF17)
-- SELECT c.id, u.nome, v.marca, v.modelo, c.status,
--        p.forma, p.status AS pagamento, a.data, a.horario
--   FROM compra c
--   JOIN usuario u ON u.id = c.usuario_id
--   JOIN veiculo v ON v.id = c.veiculo_id
--   LEFT JOIN pagamento   p ON p.compra_id = c.id
--   LEFT JOIN agendamento a ON a.compra_id = c.id
--  ORDER BY c.criada_em DESC;
