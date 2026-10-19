/**
 * /api/veiculos/[id]
 * GET    — detalhes do veículo (RF04)
 * PUT    — edita o veículo (RF16)
 * DELETE — remove do estoque (RF16 / RN10)
 */

import { NextResponse } from "next/server";
import { compras, veiculos } from "@/lib/db";
import type { Veiculo } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const v = await veiculos.buscar(id);
  if (!v) return NextResponse.json({ erro: "Veículo não encontrado" }, { status: 404 });
  return NextResponse.json(v);
}

export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params;
  const atual = await veiculos.buscar(id);
  if (!atual) return NextResponse.json({ erro: "Veículo não encontrado" }, { status: 404 });
  const patch = (await req.json()) as Partial<Veiculo>;
  const salvo = await veiculos.salvar({ ...atual, ...patch, id, quilometragem: 0 });
  return NextResponse.json(salvo);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  // um veículo que já tem pedido não pode sumir do histórico de vendas (RN01)
  const pedidos = await compras.listar();
  if (pedidos.some((c) => c.veiculoId === id)) {
    return NextResponse.json(
      { erro: "Este veículo possui pedidos e não pode ser removido." },
      { status: 409 },
    );
  }
  await veiculos.remover(id);
  return NextResponse.json({ ok: true });
}
