/**
 * /api/compras/[id]
 * GET   — dados do pedido e do comprovante (RF15)
 * PATCH — atualiza status, pagamento, entrega ou agendamento (RF14 / RN11)
 */

import { NextResponse } from "next/server";
import { compras, veiculos } from "@/lib/db";
import type { Compra } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const c = await compras.buscar(id);
  if (!c) return NextResponse.json({ erro: "Compra não encontrada" }, { status: 404 });
  return NextResponse.json(c);
}

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const atual = await compras.buscar(id);
  if (!atual) return NextResponse.json({ erro: "Compra não encontrada" }, { status: 404 });

  const patch = (await req.json()) as Partial<Compra>;
  const nova: Compra = { ...atual, ...patch, id };

  // RN09 — o total é recalculado no servidor (veículo + frete quando há entrega)
  const frete = nova.modalidade === "entrega" ? (nova.valorFrete ?? 0) : 0;
  nova.valorFrete = frete;
  nova.valorTotal = atual.valorVeiculo + frete;

  // RN11 — registra o histórico sempre que o status muda
  if (patch.status && patch.status !== atual.status) {
    nova.historico = [
      ...atual.historico,
      { status: patch.status, em: new Date().toISOString() },
    ];
  }

  if (nova.status === "concluida") {
    // RN08 — comprovante só ao concluir (emitido uma única vez)
    if (!nova.comprovante) {
      nova.comprovante = {
        codigo: `PM-${nova.id.slice(-6).toUpperCase()}`,
        emitidoEm: new Date().toISOString(),
      };
    }
    // RF18 / RN03 — o veículo sai do estoque (operação idempotente)
    await veiculos.marcarVendido(nova.veiculoId);
  }

  return NextResponse.json(await compras.salvar(nova));
}
