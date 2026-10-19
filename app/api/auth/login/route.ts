/**
 * /api/auth/login — RF02
 * Compara o hash da senha informada com o hash guardado (RNF03).
 */

import { NextResponse } from "next/server";
import { usuarios } from "@/lib/db";
import { hashSenha } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const { email, senha } = (await req.json()) as {
      email?: string;
      senha?: string;
    };

    if (!email || !senha) {
      return NextResponse.json(
        { erro: "Informe e-mail e senha." },
        { status: 400 },
      );
    }

    const u = await usuarios.porEmail(email);
    if (!u || u.senhaHash !== hashSenha(senha)) {
      // mensagem genérica de propósito: não revela se o e-mail existe
      return NextResponse.json(
        { erro: "E-mail ou senha inválidos." },
        { status: 401 },
      );
    }

    const { senhaHash: _senhaHash, ...seguro } = u;
    return NextResponse.json({ usuario: seguro });
  } catch (e) {
    return NextResponse.json(
      { erro: "Falha na autenticação", detalhe: String(e) },
      { status: 500 },
    );
  }
}
