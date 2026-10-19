/**
 * /api/auth/recuperar — RF02 (recuperação de senha)
 * Verifica se o e-mail está cadastrado. O envio do e-mail fica para a
 * próxima etapa: nesta versão didática só confirmamos a existência da conta.
 */

import { NextResponse } from "next/server";
import { usuarios } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as { email?: string };
    if (!email) {
      return NextResponse.json({ erro: "Informe o e-mail." }, { status: 400 });
    }
    const u = await usuarios.porEmail(email);
    if (!u) {
      return NextResponse.json(
        { erro: "E-mail não encontrado." },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { erro: "Falha na recuperação", detalhe: String(e) },
      { status: 500 },
    );
  }
}
