/**
 * /api/compras
 * GET  — lista os pedidos (RF17)
 * POST — grava a compra; se vier com status "concluida", emite o comprovante
 *        e marca o veículo como vendido (RF15 / RF18 / RN03 / RN08)
 */

import { NextResponse } from "next/server";
import { compras, veiculos } from "@/lib/db";
import type { Compra } from "@/lib/types";

export async function GET() {
  try {
    return NextResponse.json(await compras.listar());
  } catch (e) {
    return NextResponse.json(
      { erro: "Falha ao listar compras", detalhe: String(e) },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const c = (await req.json()) as Compra;

    // RN02 — uma compra sempre aponta para exatamente um veículo
    if (!c?.id || !c.usuarioId || !c.veiculoId) {
      return NextResponse.json(
        { erro: "Informe id, usuarioId e veiculoId." },
        { status: 400 },
      );
    }

    const veiculo = await veiculos.buscar(c.veiculoId);
    if (!veiculo) {
      return NextResponse.json({ erro: "Veículo inexistente" }, { status: 404 });
    }
    // RN03 — veículo vendido não pode ser comprado de novo
    if (veiculo.status === "vendido" && c.status !== "concluida") {
      return NextResponse.json(
        { erro: "Este veículo já foi vendido." },
        { status: 409 },
      );
    }

    // RN09 — total = valor do veículo + frete quando houver entrega
    const frete = c.modalidade === "entrega" ? (c.valorFrete ?? 0) : 0;
    const compra: Compra = {
      ...c,
      valorVeiculo: veiculo.preco,
      valorFrete: frete,
      valorTotal: veiculo.preco + frete,
    };

    // RN08 — comprovante somente após a confirmação
    if (compra.status === "concluida" && !compra.comprovante) {
      compra.comprovante = {
        codigo: `PM-${compra.id.slice(-6).toUpperCase()}`,
        emitidoEm: new Date().toISOString(),
      };
    }

    const salva = await compras.salvar(compra);

    // RF18 — o veículo passa a vendido
    if (compra.status === "concluida") {
      await veiculos.marcarVendido(compra.veiculoId);
    }

    return NextResponse.json(salva, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { erro: "Falha ao salvar compra", detalhe: String(e) },
      { status: 500 },
    );
  }
}
