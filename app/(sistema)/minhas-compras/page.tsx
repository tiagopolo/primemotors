"use client";

/**
 * Tela "Compras" — RF17.
 *
 * Para o cliente: lista os próprios pedidos e dá acesso ao andamento/extrato
 * de cada um (reaproveita a tela de comprovante).
 *
 * Para o administrador: lista as compras de **todos os clientes**, com o
 * nome de quem comprou, busca por veículo/cliente e o cancelamento de
 * qualquer venda concluída direto na lista (RN13) — sem precisar entrar
 * pedido por pedido.
 */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ChevronRight, Receipt, Search } from "lucide-react";
import { useApp } from "@/lib/store";
import { dataBR, moedaCheia } from "@/lib/utils";
import { Titulo } from "@/components/Layout";
import type { Compra, StatusCompra } from "@/lib/types";

const ROTULO_STATUS: Record<StatusCompra, string> = {
  iniciada: "Iniciada",
  aguardando_pagamento: "Aguardando pagamento",
  paga: "Paga",
  agendada: "Agendada",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

const COR_STATUS: Record<StatusCompra, string> = {
  iniciada: "bg-[color:var(--pm-muted)]/20 text-[color:var(--pm-muted)]",
  aguardando_pagamento: "bg-[color:var(--pm-danger)]/20 text-[color:var(--pm-danger)]",
  paga: "bg-[color:var(--pm-primary)]/20 text-[color:var(--pm-primary-2)]",
  agendada: "bg-[color:var(--pm-primary)]/20 text-[color:var(--pm-primary-2)]",
  concluida: "bg-[color:var(--pm-success)]/20 text-[color:var(--pm-success)]",
  cancelada: "bg-[color:var(--pm-danger)]/20 text-[color:var(--pm-danger)]",
};

export default function MinhasCompras() {
  const { usuario, compras, cancelarVenda } = useApp();
  const admin = usuario?.perfil === "admin";
  const [nomesPorId, setNomesPorId] = useState<Record<string, string>>({});
  const [busca, setBusca] = useState("");
  const [cancelandoId, setCancelandoId] = useState<string | null>(null);
  const [erro, setErro] = useState("");

  // Só o admin vê a lista de todos os clientes; busca uma vez para
  // mostrar o nome de quem comprou em cada pedido.
  useEffect(() => {
    if (!admin) return;
    let cancelado = false;
    fetch("/api/usuarios")
      .then((r) => r.json())
      .then((lista: { id: string; nome: string }[]) => {
        if (cancelado) return;
        setNomesPorId(Object.fromEntries(lista.map((u) => [u.id, u.nome])));
      })
      .catch(() => {
        /* não é crítico: sem os nomes, a lista ainda funciona com o id */
      });
    return () => {
      cancelado = true;
    };
  }, [admin]);

  const lista = useMemo(() => {
    const base = admin ? compras : compras.filter((c) => c.usuarioId === usuario?.id);
    const termo = busca.trim().toLowerCase();
    const filtrada = termo
      ? base.filter((c) => {
          const cliente = nomesPorId[c.usuarioId] ?? "";
          return `${c.veiculoDescricao} ${cliente}`.toLowerCase().includes(termo);
        })
      : base;
    return [...filtrada].sort((a, b) => b.criadaEm.localeCompare(a.criadaEm));
  }, [compras, usuario, admin, busca, nomesPorId]);

  async function cancelar(c: Compra) {
    if (!confirm(`Cancelar a venda de ${c.veiculoDescricao}? O veículo volta para o estoque.`))
      return;
    setErro("");
    setCancelandoId(c.id);
    const r = await cancelarVenda(c.id);
    setCancelandoId(null);
    if (!r.ok) setErro(r.erro);
  }

  return (
    <>
      <Titulo
        titulo={admin ? "Compras dos Clientes" : "Minhas Compras"}
        subtitulo={
          admin
            ? "Acompanhe e, se precisar, cancele a venda de qualquer cliente"
            : "Acompanhe o andamento e o extrato dos seus pedidos"
        }
      />

      {admin && (
        <div className="pm-card mb-4 flex items-center gap-2 p-3">
          <Search size={18} className="text-[color:var(--pm-muted)]" />
          <input
            className="pm-input border-0 bg-transparent p-0 focus:shadow-none"
            placeholder="Buscar por veículo ou cliente..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      )}

      {erro && (
        <p className="pm-card mb-4 p-3 text-center text-xs font-semibold text-[color:var(--pm-danger)]">
          {erro}
        </p>
      )}

      <ul className="space-y-3">
        {lista.map((c) => (
          <li key={c.id} className="pm-card p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold">{c.veiculoDescricao}</h3>
                {admin && (
                  <p className="truncate text-[11px] font-semibold text-[color:var(--pm-primary-2)]">
                    {nomesPorId[c.usuarioId] ?? "Cliente"}
                  </p>
                )}
                <p className="mt-0.5 text-[11px] text-[color:var(--pm-muted)]">
                  Pedido em {dataBR(c.criadaEm)}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${COR_STATUS[c.status]}`}
              >
                {ROTULO_STATUS[c.status]}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-[color:var(--pm-muted)]">Total</span>
              <span className="font-extrabold text-[color:var(--pm-primary-2)]">
                {moedaCheia(c.valorTotal)}
              </span>
            </div>

            <Link
              href={`/comprovante/${c.id}`}
              className="pm-btn pm-btn-primary mt-2 w-full py-1.5 text-xs"
            >
              <Receipt size={14} /> Ver andamento / extrato <ChevronRight size={14} />
            </Link>

            {admin && c.status === "concluida" && (
              <button
                onClick={() => cancelar(c)}
                disabled={cancelandoId === c.id}
                className="pm-btn pm-btn-ghost mt-2 w-full py-1.5 text-xs text-[color:var(--pm-danger)]"
              >
                <AlertTriangle size={14} />
                {cancelandoId === c.id ? "Cancelando…" : "Cancelar venda"}
              </button>
            )}
          </li>
        ))}
      </ul>

      {lista.length === 0 && (
        <p className="pm-card p-8 text-center text-sm text-[color:var(--pm-muted)]">
          {admin
            ? "Nenhuma compra encontrada."
            : "Você ainda não tem nenhuma compra. Escolha um veículo em Estoque para começar."}
        </p>
      )}
    </>
  );
}
