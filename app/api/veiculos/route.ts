/**
 * /api/veiculos
 * GET  — lista o estoque (RF03)
 * POST — cadastra ou atualiza um veículo (RF16)
 */

import { NextResponse } from "next/server";
import { veiculos } from "@/lib/db";
import type { Veiculo } from "@/lib/types";

export async function GET() {
  try {
    return NextResponse.json(await veiculos.listar());
  } catch (e) {
    return NextResponse.json(
      { erro: "Falha ao listar veículos", detalhe: String(e) },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const corpo = (await req.json()) as Veiculo;
    if (!corpo?.id || !corpo.marca || !corpo.modelo) {
      return NextResponse.json(
        { erro: "Informe pelo menos id, marca e modelo." },
        { status: 400 },
      );
    }
    const salvo = await veiculos.salvar({ ...corpo, quilometragem: 0 });
    return NextResponse.json(salvo, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { erro: "Falha ao salvar veículo", detalhe: String(e) },
      { status: 500 },
    );
  }
}
