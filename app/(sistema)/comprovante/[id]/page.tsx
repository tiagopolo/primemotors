"use client";

/** RF15 / RN08 — Comprovante gerado após a confirmação do pagamento. */

import Link from "next/link";
import { use, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  Home,
  MapPin,
  Printer,
  Store,
  XCircle,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { dataBR, dataHoraBR, moedaCheia } from "@/lib/utils";

const ROTULO_STATUS: Record<string, string> = {
  iniciada: "Iniciada",
  aguardando_pagamento: "Aguardando pagamento",
  paga: "Paga",
  agendada: "Agendada",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

export default function ComprovantePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { usuario, buscarCompra, cancelarVenda } = useApp();
  const compra = buscarCompra(id);
  const [cancelando, setCancelando] = useState(false);
  const [erro, setErro] = useState("");

  if (!compra) {
    return (
      <p className="pm-card p-8 text-center text-sm text-[color:var(--pm-muted)]">
        Compra não encontrada.
      </p>
    );
  }

  async function cancelar() {
    if (!confirm("Cancelar esta venda? O veículo volta para o estoque.")) return;
    setErro("");
    setCancelando(true);
    const r = await cancelarVenda(compra!.id);
    setCancelando(false);
    if (!r.ok) setErro(r.erro);
  }

  return (
    <>
      <div className="pm-card mb-4 p-6 text-center">
        {compra.status === "cancelada" ? (
          <XCircle size={48} className="mx-auto mb-3 text-[color:var(--pm-danger)]" />
        ) : (
          <CheckCircle2
            size={48}
            className={`mx-auto mb-3 ${
              compra.status === "concluida"
                ? "text-[color:var(--pm-success)]"
                : "text-[color:var(--pm-primary-2)]"
            }`}
          />
        )}
        <h1 className="text-xl font-bold">
          {compra.status === "cancelada"
            ? "Venda cancelada"
            : compra.status === "concluida"
              ? "Compra confirmada!"
              : `Pedido ${ROTULO_STATUS[compra.status] ?? compra.status}`}
        </h1>
        {compra.status === "cancelada" && (
          <p className="mt-1 text-xs text-[color:var(--pm-muted)]">
            O veículo voltou a ficar disponível no estoque.
          </p>
        )}
        {compra.comprovante ? (
          <p className="mt-1 text-xs text-[color:var(--pm-muted)]">
            Comprovante{" "}
            <strong className="text-[color:var(--pm-primary-2)]">
              {compra.comprovante.codigo}
            </strong>{" "}
            · emitido em {dataHoraBR(compra.comprovante.emitidoEm)}
          </p>
        ) : (
          <p className="mt-1 text-xs text-[color:var(--pm-muted)]">
            O comprovante é emitido assim que o pedido é concluído.
          </p>
        )}
      </div>

      <div className="pm-card mb-4 p-4 text-xs">
        <h2 className="mb-3 text-sm font-bold">Dados do pedido</h2>
        <dl className="space-y-2">
          <Linha rotulo="Veículo" valor={compra.veiculoDescricao} />
          <Linha rotulo="Valor do veículo" valor={moedaCheia(compra.valorVeiculo)} />
          <Linha rotulo="Frete" valor={moedaCheia(compra.valorFrete)} />
          <Linha
            rotulo="Total pago"
            valor={moedaCheia(compra.valorTotal)}
            destaque
          />
          <Linha
            rotulo="Status"
            valor={ROTULO_STATUS[compra.status] ?? compra.status}
          />
        </dl>
      </div>

      {compra.pagamento && (
        <div className="pm-card mb-4 p-4 text-xs">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
            <CreditCard size={16} className="text-[color:var(--pm-primary-2)]" />
            Pagamento
          </h2>
          <dl className="space-y-2">
            <Linha
              rotulo="Forma"
              valor={compra.pagamento.forma.toUpperCase()}
            />
            <Linha
              rotulo="Situação"
              valor={
                compra.pagamento.status === "confirmado"
                  ? "Confirmado"
                  : "Aguardando"
              }
            />
            {compra.pagamento.cartaoFinal && (
              <Linha
                rotulo="Cartão"
                valor={`**** **** **** ${compra.pagamento.cartaoFinal}`}
              />
            )}
            {compra.pagamento.chavePix && (
              <Linha rotulo="Chave PIX" valor={compra.pagamento.chavePix} />
            )}
            {compra.pagamento.linhaDigitavel && (
              <div>
                <p className="text-[color:var(--pm-muted)]">Linha digitável</p>
                <p className="mt-1 break-all font-mono text-[10px]">
                  {compra.pagamento.linhaDigitavel}
                </p>
              </div>
            )}
          </dl>
        </div>
      )}

      <div className="pm-card mb-4 p-4 text-xs">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
          {compra.modalidade === "retirada" ? (
            <Store size={16} className="text-[color:var(--pm-primary-2)]" />
          ) : (
            <MapPin size={16} className="text-[color:var(--pm-primary-2)]" />
          )}
          {compra.modalidade === "retirada" ? "Retirada na loja" : "Entrega"}
        </h2>
        {compra.retirada && (
          <>
            <p className="font-semibold">{compra.retirada.unidade}</p>
            <p className="text-[color:var(--pm-muted)]">{compra.retirada.endereco}</p>
          </>
        )}
        {compra.entrega && (
          <p className="text-[color:var(--pm-muted)]">
            {compra.entrega.rua}, {compra.entrega.numero} — {compra.entrega.cidade}/
            {compra.entrega.uf} · CEP {compra.entrega.cep}
          </p>
        )}
        {compra.agendamento && (
          <p className="mt-2 flex items-center gap-1.5">
            <CalendarClock size={14} className="text-[color:var(--pm-primary-2)]" />
            {dataBR(compra.agendamento.data)} às {compra.agendamento.horario}
          </p>
        )}
      </div>

      {/* RN11 — histórico de status */}
      <div className="pm-card mb-4 p-4 text-xs">
        <h2 className="mb-3 text-sm font-bold">Histórico do pedido</h2>
        <ol className="space-y-2">
          {compra.historico.map((h, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[color:var(--pm-primary-2)]" />
              <span className="font-semibold">
                {ROTULO_STATUS[h.status] ?? h.status}
              </span>
              <span className="ml-auto text-[color:var(--pm-muted)]">
                {dataHoraBR(h.em)}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {erro && (
        <p className="pm-card mb-4 p-3 text-center text-xs font-semibold text-[color:var(--pm-danger)]">
          {erro}
        </p>
      )}

      {/* Só o administrador cancela, e só uma venda já concluída */}
      {usuario?.perfil === "admin" && compra.status === "concluida" && (
        <button
          onClick={cancelar}
          disabled={cancelando}
          className="pm-btn pm-btn-ghost mb-2 w-full text-[color:var(--pm-danger)]"
        >
          <AlertTriangle size={16} />
          {cancelando ? "Cancelando…" : "Cancelar venda"}
        </button>
      )}

      <div className="grid grid-cols-2 gap-2 pb-4">
        <button onClick={() => window.print()} className="pm-btn pm-btn-ghost">
          <Printer size={16} /> Imprimir
        </button>
        <Link href="/home" className="pm-btn pm-btn-primary">
          <Home size={16} /> Voltar ao início
        </Link>
      </div>
    </>
  );
}

function Linha({
  rotulo,
  valor,
  destaque,
}: {
  rotulo: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-[color:var(--pm-muted)]">{rotulo}</dt>
      <dd
        className={
          destaque
            ? "font-extrabold text-[color:var(--pm-primary-2)]"
            : "font-semibold"
        }
      >
        {valor}
      </dd>
    </div>
  );
}
