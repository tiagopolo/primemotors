"use client";

/**
 * Tela "Minhas Compras" — RF17.
 * Lista os pedidos do cliente autenticado e dá acesso ao andamento/extrato
 * de cada um (reaproveita a tela de comprovante, que já mostra o histórico
 * de status, o pagamento e a entrega/retirada do pedido).
 *
 * Esta tela nunca mostra opção de cancelamento — cancelar uma venda é só
 * do administrador, na tela "Vendas" (app/(sistema)/vendas).
 */

import Link from "next/link";
import { useMemo } from "react";
import { ChevronRight, Receipt } from "lucide-react";
import { useApp } from "@/lib/store";
import { dataBR, moedaCheia } from "@/lib/utils";
import { Titulo } from "@/components/Layout";
import type { StatusCompra } from "@/lib/types";

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
  const { usuario, compras } = useApp();

  const minhas = useMemo(
    () =>
      compras
        .filter((c) => c.usuarioId === usuario?.id)
        .sort((a, b) => b.criadaEm.localeCompare(a.criadaEm)),
    [compras, usuario],
  );

  return (
    <>
      <Titulo
        titulo="Minhas Compras"
        subtitulo="Acompanhe o andamento e o extrato dos seus pedidos"
      />

      <ul className="space-y-3">
        {minhas.map((c) => (
          <li key={c.id} className="pm-card p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold">{c.veiculoDescricao}</h3>
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
          </li>
        ))}
      </ul>

      {minhas.length === 0 && (
        <p className="pm-card p-8 text-center text-sm text-[color:var(--pm-muted)]">
          Você ainda não tem nenhuma compra. Escolha um veículo em Estoque para começar.
        </p>
      )}
    </>
  );
}
