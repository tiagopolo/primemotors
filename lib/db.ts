/**
 * Camada de acesso ao banco de dados.
 *
 * Funciona em dois modos:
 *  1. PostgreSQL / Supabase — quando a variável DATABASE_URL estiver definida
 *     no .env.local. Usa o driver pg (npm install pg).
 *  2. Arquivo — modo de desenvolvimento, sem banco. Os dados ficam em
 *              .data/db.json na raiz do projeto, com o mesmo formato das tabelas.
 *
 * As rotas em app/api usam apenas as funções exportadas aqui, então trocar de
 * modo não exige alterar nenhuma rota nem nenhuma tela.
 */

import { promises as fs } from "fs";
import path from "path";
import { Pool, types } from "pg";
import type { Compra, Usuario, Veiculo } from "./types";
import { USUARIOS_INICIAIS, VEICULOS_INICIAIS } from "./seed";

export const USANDO_POSTGRES = Boolean(process.env.DATABASE_URL);

// O driver pg devolve TIMESTAMPTZ (oid 1184) como objeto Date por padrão.
// O resto do app espera string ISO 8601 (ver lib/types.ts: criadoEm: string),
// então registramos um parser que já devolve a data pronta nesse formato —
// assim nenhuma rota precisa se preocupar com o tipo de retorno do banco.
types.setTypeParser(1184, (valor) => new Date(valor).toISOString());

/* ------------------------------------------------------------------ */
/* Modo arquivo (.data/db.json)                                        */
/* ------------------------------------------------------------------ */

const ARQUIVO = path.join(process.cwd(), ".data", "db.json");

interface Banco {
  usuarios: Usuario[];
  veiculos: Veiculo[];
  compras: Compra[];
}

async function lerArquivo(): Promise<Banco> {
  try {
    const bruto = await fs.readFile(ARQUIVO, "utf-8");
    return JSON.parse(bruto) as Banco;
  } catch {
    const inicial: Banco = {
      usuarios: USUARIOS_INICIAIS,
      veiculos: VEICULOS_INICIAIS,
      compras: [],
    };
    await gravarArquivo(inicial);
    return inicial;
  }
}

async function gravarArquivo(banco: Banco) {
  await fs.mkdir(path.dirname(ARQUIVO), { recursive: true });
  await fs.writeFile(ARQUIVO, JSON.stringify(banco, null, 2), "utf-8");
}

/* ------------------------------------------------------------------ */
/* Modo PostgreSQL (Supabase)                                          */
/* ------------------------------------------------------------------ */

let pool: Pool | null = null;

/**
 * Cria (uma única vez) o pool de conexões do Postgres.
 * Em serverless (Netlify Functions) o limite é baixo: poucas conexões por
 * instância — por isso max fica pequeno.
 */
function conexao(): Pool {
  if (pool) return pool;
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    // o Supabase sempre exige conexão criptografada (TLS); rejectUnauthorized
    // false porque o certificado do pooler do Supabase é autoassinado
    ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  });
  return pool;
}

/** Valores aceitos como parâmetros de consulta pelo pg. */
type Valor = string | number | boolean | null | Date;

/**
 * Executa uma consulta (SELECT, INSERT, UPDATE ou DELETE) e devolve as linhas.
 * Os parâmetros usam $1, $2, ... (sintaxe do Postgres), não "?" como no MySQL.
 */
export async function consultar<T>(sql: string, valores: Valor[] = []): Promise<T[]> {
  const c = conexao();
  const resultado = await c.query(sql, valores);
  return resultado.rows as T[];
}

/** Executa INSERT / UPDATE / DELETE quando não precisa das linhas de volta. */
export async function executar(sql: string, valores: Valor[] = []) {
  const c = conexao();
  return c.query(sql, valores);
}

/* ------------------------------------------------------------------ */
/* Repositório de veículos — RF03, RF04, RF16, RF18                    */
/* ------------------------------------------------------------------ */

function linhaParaVeiculo(l: Record<string, unknown>): Veiculo {
  return {
    id: String(l.id),
    modelo: String(l.modelo),
    marca: String(l.marca),
    ano: Number(l.ano),
    quilometragem: 0,
    preco: Number(l.preco),
    cor: String(l.cor ?? ""),
    cambio: l.cambio as Veiculo["cambio"],
    combustivel: l.combustivel as Veiculo["combustivel"],
    carroceria: String(l.carroceria ?? ""),
    motor: String(l.motor ?? ""),
    potencia: String(l.potencia ?? ""),
    descricao: String(l.descricao ?? ""),
    opcionais: l.opcionais ? String(l.opcionais).split("|").filter(Boolean) : [],
    fotos: l.fotos ? String(l.fotos).split("|").filter(Boolean) : [],
    status: l.status as Veiculo["status"],
    cardCor: String(l.card_cor ?? "#1f6fff"),
    criadoEm: String(l.criado_em ?? new Date().toISOString()),
  };
}

export const veiculos = {
  async listar(): Promise<Veiculo[]> {
    if (USANDO_POSTGRES) {
      const linhas = await consultar<Record<string, unknown>>(
        "SELECT * FROM veiculo ORDER BY criado_em DESC",
      );
      return linhas.map(linhaParaVeiculo);
    }
    return (await lerArquivo()).veiculos;
  },

  async buscar(id: string): Promise<Veiculo | null> {
    if (USANDO_POSTGRES) {
      const linhas = await consultar<Record<string, unknown>>(
        "SELECT * FROM veiculo WHERE id = $1",
        [id],
      );
      return linhas[0] ? linhaParaVeiculo(linhas[0]) : null;
    }
    return (await lerArquivo()).veiculos.find((v) => v.id === id) ?? null;
  },

  async salvar(v: Veiculo): Promise<Veiculo> {
    if (USANDO_POSTGRES) {
      await executar(
        `INSERT INTO veiculo
           (id, marca, modelo, ano, quilometragem, preco, cor, cambio, combustivel,
            carroceria, motor, potencia, descricao, opcionais, fotos, status, card_cor, criado_em)
         VALUES ($1,$2,$3,$4,0,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,now())
         ON CONFLICT (id) DO UPDATE SET
           marca=EXCLUDED.marca, modelo=EXCLUDED.modelo, ano=EXCLUDED.ano,
           preco=EXCLUDED.preco, cor=EXCLUDED.cor, cambio=EXCLUDED.cambio,
           combustivel=EXCLUDED.combustivel, carroceria=EXCLUDED.carroceria,
           motor=EXCLUDED.motor, potencia=EXCLUDED.potencia, descricao=EXCLUDED.descricao,
           opcionais=EXCLUDED.opcionais, fotos=EXCLUDED.fotos, status=EXCLUDED.status,
           card_cor=EXCLUDED.card_cor`,
        [
          v.id, v.marca, v.modelo, v.ano, v.preco, v.cor, v.cambio, v.combustivel,
          v.carroceria, v.motor, v.potencia, v.descricao,
          v.opcionais.join("|"), v.fotos.join("|"), v.status, v.cardCor,
        ],
      );
      return v;
    }
    const banco = await lerArquivo();
    const i = banco.veiculos.findIndex((x) => x.id === v.id);
    if (i >= 0) banco.veiculos[i] = v;
    else banco.veiculos.unshift(v);
    await gravarArquivo(banco);
    return v;
  },

  async remover(id: string): Promise<void> {
    if (USANDO_POSTGRES) {
      await executar("DELETE FROM veiculo WHERE id = $1", [id]);
      return;
    }
    const banco = await lerArquivo();
    banco.veiculos = banco.veiculos.filter((v) => v.id !== id);
    await gravarArquivo(banco);
  },

  /** RF18 / RN03 — o veículo sai do estoque disponível após a venda. */
  async marcarVendido(id: string): Promise<void> {
    if (USANDO_POSTGRES) {
      await executar("UPDATE veiculo SET status = 'vendido' WHERE id = $1", [id]);
      return;
    }
    const banco = await lerArquivo();
    banco.veiculos = banco.veiculos.map((v) =>
      v.id === id ? { ...v, status: "vendido" } : v,
    );
    await gravarArquivo(banco);
  },
};

/* ------------------------------------------------------------------ */
/* Repositório de usuários — RF01, RF02                                */
/* ------------------------------------------------------------------ */

export const usuarios = {
  async listar(): Promise<Usuario[]> {
    if (USANDO_POSTGRES) {
      // No Postgres, um alias sem aspas vira minúsculo (senhaHash -> senhahash).
      // As aspas duplas preservam o camelCase que o tipo Usuario espera.
      return consultar<Usuario>(
        `SELECT id, nome, email, telefone,
                senha_hash AS "senhaHash", perfil, criado_em AS "criadoEm"
           FROM usuario`,
      );
    }
    return (await lerArquivo()).usuarios;
  },

  async porEmail(email: string): Promise<Usuario | null> {
    const lista = await usuarios.listar();
    return lista.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
  },

  async criar(u: Usuario): Promise<Usuario> {
    if (USANDO_POSTGRES) {
      await executar(
        `INSERT INTO usuario (id, nome, email, telefone, senha_hash, perfil, criado_em)
         VALUES ($1,$2,$3,$4,$5,$6,now())`,
        [u.id, u.nome, u.email, u.telefone, u.senhaHash, u.perfil],
      );
      return u;
    }
    const banco = await lerArquivo();
    banco.usuarios.push(u);
    await gravarArquivo(banco);
    return u;
  },

  /** RF01 — o usuário altera nome, e-mail e telefone pela tela de Configurações. */
  async atualizar(id: string, dados: Pick<Usuario, "nome" | "email" | "telefone">): Promise<void> {
    if (USANDO_POSTGRES) {
      await executar(
        "UPDATE usuario SET nome = $1, email = $2, telefone = $3 WHERE id = $4",
        [dados.nome, dados.email, dados.telefone, id],
      );
      return;
    }
    const banco = await lerArquivo();
    banco.usuarios = banco.usuarios.map((u) => (u.id === id ? { ...u, ...dados } : u));
    await gravarArquivo(banco);
  },
};

/* ------------------------------------------------------------------ */
/* Repositório de compras — RF05 a RF15, RF17                          */
/* ------------------------------------------------------------------ */

export const compras = {
  async listar(): Promise<Compra[]> {
    if (USANDO_POSTGRES) {
      const linhas = await consultar<Record<string, unknown>>(
        "SELECT id, dados FROM compra ORDER BY criada_em DESC",
      );
      // A coluna "dados" é JSONB: o driver pg já devolve um objeto
      // JavaScript, não uma string (o mesmo valeria para JSON no MySQL com
      // mysql2). JSON.parse(String(...)) viraria JSON.parse("[object
      // Object]") e quebraria com "not valid JSON" — por isso só convertemos
      // quando realmente vier como texto.
      return linhas.map((l) =>
        (typeof l.dados === "string" ? JSON.parse(l.dados) : l.dados) as Compra,
      );
    }
    return (await lerArquivo()).compras;
  },

  async buscar(id: string): Promise<Compra | null> {
    const lista = await compras.listar();
    return lista.find((c) => c.id === id) ?? null;
  },

  async salvar(c: Compra): Promise<Compra> {
    if (USANDO_POSTGRES) {
      await executar(
        `INSERT INTO compra (id, usuario_id, veiculo_id, valor_total, status, dados, criada_em)
         VALUES ($1,$2,$3,$4,$5,$6,now())
         ON CONFLICT (id) DO UPDATE SET
           valor_total=EXCLUDED.valor_total, status=EXCLUDED.status, dados=EXCLUDED.dados`,
        [c.id, c.usuarioId, c.veiculoId, c.valorTotal, c.status, JSON.stringify(c)],
      );
      return c;
    }
    const banco = await lerArquivo();
    const i = banco.compras.findIndex((x) => x.id === c.id);
    if (i >= 0) banco.compras[i] = c;
    else banco.compras.unshift(c);
    await gravarArquivo(banco);
    return c;
  },
};
