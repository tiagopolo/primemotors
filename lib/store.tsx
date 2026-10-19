"use client";

/**
 * Camada de dados do front-end.
 *
 * Os dados vêm da API (app/api/*), que grava no PostgreSQL (Supabase) — ou em .data/db.json
 * quando DATABASE_URL não está definida. O contexto mantém uma cópia para as
 * telas; cada alteração é enviada à API e a cópia é atualizada com a resposta
 * do servidor. As telas só precisam esperar (await) as funções que gravam.
 *
 * Preferências de tela (notificações, e-mails) ficam só no navegador, pois
 * não são dados de negócio.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  Compra,
  Modalidade,
  Pagamento,
  StatusCompra,
  Usuario,
  Veiculo,
} from "./types";
import { uid } from "./utils";

const CHAVE_SESSAO = "primemotors:sessao";
const CHAVE_PREFERENCIAS = "primemotors:preferencias";

type Preferencias = { notificacoes: boolean; emails: boolean };
type Resultado = { ok: true } | { ok: false; erro: string };
type Resposta<T> = { ok: true; dados: T } | { ok: false; erro: string };

/** Usuário sem o hash da senha, como a API devolve. */
type UsuarioPublico = Omit<Usuario, "senhaHash">;

const PREFERENCIAS_PADRAO: Preferencias = { notificacoes: true, emails: false };

/** Chamada à API com tratamento único de erro. */
async function pedir<T>(url: string, init?: RequestInit): Promise<Resposta<T>> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: { "Content-Type": "application/json" },
    });
    const corpo = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, erro: (corpo as { erro?: string }).erro ?? `Erro ${res.status}` };
    }
    return { ok: true, dados: corpo as T };
  } catch {
    return { ok: false, erro: "Não foi possível conectar ao servidor." };
  }
}

/** Lê um valor do localStorage; devolve null se não existir ou estiver corrompido. */
function lerLocal<T>(chave: string): T | null {
  try {
    const bruto = window.localStorage.getItem(chave);
    return bruto ? (JSON.parse(bruto) as T) : null;
  } catch {
    return null;
  }
}

/** Associa o usuário da API à sessão local (sem a senha). */
const comoUsuario = (u: UsuarioPublico): Usuario => ({ ...u, senhaHash: "" });

interface Ctx {
  pronto: boolean;
  usuario: Usuario | null;
  veiculos: Veiculo[];
  compras: Compra[];
  preferencias: Preferencias;
  // autenticação (RF01, RF02)
  entrar: (email: string, senha: string) => Promise<Resultado>;
  entrarComoVisitante: () => void;
  cadastrar: (dados: {
    nome: string;
    email: string;
    telefone: string;
    senha: string;
  }) => Promise<Resultado>;
  sair: () => void;
  recuperarSenha: (email: string) => Promise<Resultado>;
  atualizarPerfil: (dados: Partial<Usuario>) => Promise<Resultado>;
  setPreferencias: (p: Partial<Preferencias>) => void;
  // estoque (RF16, RN10)
  salvarVeiculo: (v: Veiculo) => Promise<Resultado>;
  removerVeiculo: (id: string) => Promise<Resultado>;
  buscarVeiculo: (id: string) => Veiculo | undefined;
  // compras (RF05 ... RF18)
  criarCompra: (veiculoId: string, modalidade: Modalidade) => Promise<Compra | null>;
  atualizarCompra: (id: string, patch: Partial<Compra>) => Promise<Compra | null>;
  registrarPagamento: (compraId: string, pagamento: Pagamento) => Promise<Compra | null>;
  confirmarCompra: (compraId: string) => Promise<Compra | null>;
  /** Só o administrador cancela uma venda concluída; o veículo volta ao estoque. */
  cancelarVenda: (compraId: string) => Promise<Resultado>;
  buscarCompra: (id: string) => Compra | undefined;
}

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [preferencias, setPreferenciasEstado] = useState<Preferencias>(PREFERENCIAS_PADRAO);
  const [pronto, setPronto] = useState(false);

  /** Recarrega estoque e pedidos do servidor. */
  const sincronizar = useCallback(async () => {
    const [v, c] = await Promise.all([
      pedir<Veiculo[]>("/api/veiculos"),
      pedir<Compra[]>("/api/compras"),
    ]);
    if (v.ok) setVeiculos(v.dados);
    if (c.ok) setCompras(c.dados);
  }, []);

  /** Atualiza uma compra na cópia local com a resposta do servidor. */
  const trocarCompra = useCallback((c: Compra) => {
    setCompras((atuais) =>
      atuais.some((x) => x.id === c.id)
        ? atuais.map((x) => (x.id === c.id ? c : x))
        : [c, ...atuais],
    );
  }, []);

  const guardarSessao = useCallback((u: Usuario | null) => {
    setUsuario(u);
    try {
      if (u) window.localStorage.setItem(CHAVE_SESSAO, JSON.stringify(u));
      else window.localStorage.removeItem(CHAVE_SESSAO);
    } catch {
      /* navegador sem localStorage (modo privado): a sessão vale só nesta aba */
    }
  }, []);

  // carga inicial: sessão, preferências e dados da API
  useEffect(() => {
    async function iniciar() {
      const sessao = lerLocal<Usuario>(CHAVE_SESSAO);
      const prefs = lerLocal<Partial<Preferencias>>(CHAVE_PREFERENCIAS);
      if (sessao) setUsuario(sessao);
      if (prefs) setPreferenciasEstado({ ...PREFERENCIAS_PADRAO, ...prefs });
      await sincronizar();
      setPronto(true);
    }
    iniciar();
  }, [sincronizar]);

  /** RF01 / RF02 — login pela API; a senha é comparada no servidor. */
  const entrar = useCallback<Ctx["entrar"]>(
    async (email, senha) => {
      const r = await pedir<{ usuario: UsuarioPublico }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, senha }),
      });
      if (!r.ok) return r;
      guardarSessao(comoUsuario(r.dados.usuario));
      return { ok: true };
    },
    [guardarSessao],
  );

  /** Visitante navega e compra como usuário técnico do banco (ver seed/schema). */
  const entrarComoVisitante = useCallback(() => {
    guardarSessao({
      id: "usr_visitante",
      nome: "Visitante",
      email: "visitante@primemotors.com",
      telefone: "",
      senhaHash: "",
      perfil: "cliente",
      criadoEm: new Date().toISOString(),
    });
  }, [guardarSessao]);

  /** RF01 */
  const cadastrar = useCallback<Ctx["cadastrar"]>(
    async (dados) => {
      if (!dados.nome || !dados.email || !dados.senha)
        return { ok: false, erro: "Preencha nome, e-mail e senha." };
      const r = await pedir<UsuarioPublico>("/api/usuarios", {
        method: "POST",
        body: JSON.stringify(dados),
      });
      if (!r.ok) return r;
      guardarSessao(comoUsuario(r.dados));
      return { ok: true };
    },
    [guardarSessao],
  );

  const sair = useCallback(() => guardarSessao(null), [guardarSessao]);

  /** RF02 — confirma que o e-mail existe (o envio do e-mail fica para a próxima etapa). */
  const recuperarSenha = useCallback<Ctx["recuperarSenha"]>(async (email) => {
    const r = await pedir<{ ok: true }>("/api/auth/recuperar", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    return r.ok ? { ok: true } : r;
  }, []);

  const atualizarPerfil = useCallback<Ctx["atualizarPerfil"]>(
    async (dados) => {
      if (!usuario) return { ok: false, erro: "Entre novamente para alterar seus dados." };
      const r = await pedir<UsuarioPublico>(`/api/usuarios/${usuario.id}`, {
        method: "PUT",
        body: JSON.stringify({
          nome: dados.nome ?? usuario.nome,
          email: dados.email ?? usuario.email,
          telefone: dados.telefone ?? usuario.telefone,
        }),
      });
      if (!r.ok) return r;
      guardarSessao(comoUsuario(r.dados));
      return { ok: true };
    },
    [usuario, guardarSessao],
  );

  const setPreferencias = useCallback((p: Partial<Preferencias>) => {
    setPreferenciasEstado((atuais) => ({ ...atuais, ...p }));
  }, []);

  // as preferências são guardadas no navegador a cada alteração
  useEffect(() => {
    if (!pronto) return;
    try {
      window.localStorage.setItem(CHAVE_PREFERENCIAS, JSON.stringify(preferencias));
    } catch {
      /* sem localStorage: as preferências valem só nesta sessão */
    }
  }, [preferencias, pronto]);

  /** RF16 / RN10 — cadastro e edição (a API faz upsert pelo id). */
  const salvarVeiculo = useCallback<Ctx["salvarVeiculo"]>(async (v) => {
    const r = await pedir<Veiculo>("/api/veiculos", {
      method: "POST",
      body: JSON.stringify(v),
    });
    if (!r.ok) return r;
    await sincronizar();
    return { ok: true };
  }, [sincronizar]);

  const removerVeiculo = useCallback<Ctx["removerVeiculo"]>(
    async (id) => {
      const r = await pedir<{ ok: true }>(`/api/veiculos/${id}`, { method: "DELETE" });
      if (!r.ok) return r;
      await sincronizar();
      return { ok: true };
    },
    [sincronizar],
  );

  const buscarVeiculo = useCallback(
    (id: string) => veiculos.find((v) => v.id === id),
    [veiculos],
  );

  /** RF05 / RN01 / RN02 — inicia o pedido no servidor. */
  const criarCompra = useCallback<Ctx["criarCompra"]>(
    async (veiculoId, modalidade) => {
      const veiculo = veiculos.find((v) => v.id === veiculoId);
      if (!veiculo || !usuario) return null;
      if (veiculo.status === "vendido") return null; // RN03
      const agora = new Date().toISOString();
      const compra: Compra = {
        id: uid("cmp"),
        usuarioId: usuario.id,
        veiculoId,
        veiculoDescricao: `${veiculo.marca} ${veiculo.modelo} ${veiculo.ano}`,
        valorVeiculo: veiculo.preco,
        valorFrete: 0,
        valorTotal: veiculo.preco,
        modalidade,
        status: "iniciada",
        historico: [{ status: "iniciada", em: agora }],
        criadaEm: agora,
      };
      const r = await pedir<Compra>("/api/compras", {
        method: "POST",
        body: JSON.stringify(compra),
      });
      if (!r.ok) return null;
      trocarCompra(r.dados);
      return r.dados;
    },
    [veiculos, usuario, trocarCompra],
  );

  /** Atualiza campos do pedido (entrega, retirada, agendamento). */
  const atualizarCompra = useCallback<Ctx["atualizarCompra"]>(
    async (id, patch) => {
      const r = await pedir<Compra>(`/api/compras/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      if (!r.ok) return null;
      trocarCompra(r.dados);
      return r.dados;
    },
    [trocarCompra],
  );

  /** RF14 — o status acompanha o pagamento (RN11 registra a mudança). */
  const registrarPagamento = useCallback<Ctx["registrarPagamento"]>(
    async (compraId, pagamento) => {
      const r = await pedir<Compra>(`/api/compras/${compraId}`, {
        method: "PATCH",
        body: JSON.stringify({
          pagamento,
          status: pagamento.status === "confirmado" ? "paga" : "aguardando_pagamento",
        }),
      });
      if (!r.ok) return null;
      trocarCompra(r.dados);
      return r.dados;
    },
    [trocarCompra],
  );

  /**
   * RF15 / RF18 / RN03 / RN08 — conclui a compra.
   * Lê a compra do servidor (e não da cópia local) porque a cópia pode estar
   * desatualizada logo após registrarPagamento.
   */
  const confirmarCompra = useCallback<Ctx["confirmarCompra"]>(
    async (compraId) => {
      const atual = await pedir<Compra>(`/api/compras/${compraId}`);
      if (!atual.ok) return null;
      const r = await pedir<Compra>(`/api/compras/${compraId}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: "concluida",
          pagamento: atual.dados.pagamento
            ? { ...atual.dados.pagamento, status: "confirmado", dataPagamento: new Date().toISOString() }
            : undefined,
        } satisfies Partial<Compra> & { status: StatusCompra }),
      });
      if (!r.ok) return null;
      trocarCompra(r.dados);
      await sincronizar(); // o veículo passou a "vendido" no servidor (RN03)
      return r.dados;
    },
    [trocarCompra, sincronizar],
  );

  /**
   * Cancelamento de venda (pedido do professor) — só o administrador cancela,
   * e só uma venda já concluída; o servidor devolve o veículo ao estoque.
   */
  const cancelarVenda = useCallback<Ctx["cancelarVenda"]>(
    async (compraId) => {
      if (usuario?.perfil !== "admin") {
        return { ok: false, erro: "Somente o administrador cancela uma venda." };
      }
      const r = await pedir<Compra>(`/api/compras/${compraId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "cancelada" } satisfies Partial<Compra> & {
          status: StatusCompra;
        }),
      });
      if (!r.ok) return r;
      trocarCompra(r.dados);
      await sincronizar(); // o veículo voltou a "disponivel" no servidor
      return { ok: true };
    },
    [usuario, trocarCompra, sincronizar],
  );

  const buscarCompra = useCallback(
    (id: string) => compras.find((c) => c.id === id),
    [compras],
  );

  const valor = useMemo<Ctx>(
    () => ({
      pronto,
      usuario,
      veiculos,
      compras,
      preferencias,
      entrar,
      entrarComoVisitante,
      cadastrar,
      sair,
      recuperarSenha,
      atualizarPerfil,
      setPreferencias,
      salvarVeiculo,
      removerVeiculo,
      buscarVeiculo,
      criarCompra,
      atualizarCompra,
      registrarPagamento,
      confirmarCompra,
      cancelarVenda,
      buscarCompra,
    }),
    [
      pronto, usuario, veiculos, compras, preferencias, entrar, entrarComoVisitante,
      cadastrar, sair, recuperarSenha, atualizarPerfil, setPreferencias, salvarVeiculo,
      removerVeiculo, buscarVeiculo, criarCompra, atualizarCompra, registrarPagamento,
      confirmarCompra, cancelarVenda, buscarCompra,
    ],
  );

  return <AppCtx.Provider value={valor}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp precisa estar dentro de <AppProvider>");
  return ctx;
}
