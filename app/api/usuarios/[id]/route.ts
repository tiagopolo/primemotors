/**
 * /api/usuarios/[id]
 * PUT — atualiza nome, e-mail e telefone do próprio usuário (RF01)
 */

import { NextResponse } from "next/server";
import { usuarios } from "@/lib/db";
import type { Usuario } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const dados = (await req.json()) as Partial<Usuario>;

    if (!dados.nome || !dados.email) {
      return NextResponse.json(
        { erro: "Informe nome e e-mail." },
        { status: 400 },
      );
    }

    const lista = await usuarios.listar();
    if (!lista.some((u) => u.id === id)) {
      return NextResponse.json({ erro: "Usuário não encontrado" }, { status: 404 });
    }
    const outro = await usuarios.porEmail(dados.email);
    if (outro && outro.id !== id) {
      return NextResponse.json(
        { erro: "Este e-mail já está em uso." },
        { status: 409 },
      );
    }

    await usuarios.atualizar(id, {
      nome: dados.nome,
      email: dados.email,
      telefone: dados.telefone ?? "",
    });
    const atualizado = (await usuarios.listar()).find((u) => u.id === id)!;
    const { senhaHash: _senhaHash, ...seguro } = atualizado;
    return NextResponse.json(seguro);
  } catch (e) {
    return NextResponse.json(
      { erro: "Falha ao atualizar usuário", detalhe: String(e) },
      { status: 500 },
    );
  }
}
