/**
 * /api/usuarios
 * GET  — lista usuários (sem devolver o hash da senha — RNF03)
 * POST — cadastro de usuário (RF01)
 */

import { NextResponse } from "next/server";
import { usuarios } from "@/lib/db";
import { hashSenha, uid } from "@/lib/utils";
import type { Usuario } from "@/lib/types";

export async function GET() {
  const lista = await usuarios.listar();
  return NextResponse.json(
    lista.map(({ senhaHash: _senhaHash, ...resto }) => resto),
  );
}

export async function POST(req: Request) {
  try {
    const { nome, email, telefone, senha } = (await req.json()) as {
      nome?: string;
      email?: string;
      telefone?: string;
      senha?: string;
    };

    if (!nome || !email || !senha) {
      return NextResponse.json(
        { erro: "Informe nome, e-mail e senha." },
        { status: 400 },
      );
    }
    if (senha.length < 6) {
      return NextResponse.json(
        { erro: "A senha deve ter pelo menos 6 caracteres." },
        { status: 400 },
      );
    }
    if (await usuarios.porEmail(email)) {
      return NextResponse.json(
        { erro: "Este e-mail já está cadastrado." },
        { status: 409 },
      );
    }

    const novo: Usuario = {
      id: uid("usr"),
      nome,
      email,
      telefone: telefone ?? "",
      senhaHash: hashSenha(senha), // RNF03 — senha nunca em texto puro
      perfil: "cliente",
      criadoEm: new Date().toISOString(),
    };
    await usuarios.criar(novo);

    const { senhaHash: _senhaHash, ...seguro } = novo;
    return NextResponse.json(seguro, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { erro: "Falha ao cadastrar usuário", detalhe: String(e) },
      { status: 500 },
    );
  }
}
