"use client";

/** Tela 2 do protótipo — Recuperação de senha. */

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, Lock, Send } from "lucide-react";
import { Marca } from "@/components/Marca";
import { useApp } from "@/lib/store";

export default function RecuperarSenha() {
  const { recuperarSenha } = useApp();
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    const r = await recuperarSenha(email);
    if (r.ok) setEnviado(true);
    else setErro(r.erro);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Marca largura={240} />
        </div>

        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="pm-glow flex h-20 w-20 items-center justify-center rounded-full bg-[color:var(--pm-primary)]">
            <Lock size={32} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Recuperação de Senha</h1>
            <p className="mt-1 text-xs text-[color:var(--pm-muted)]">
              Informe seu e-mail cadastrado para receber as instruções de
              redefinição.
            </p>
          </div>
        </div>

        {enviado ? (
          <div className="pm-card p-6 text-center">
            <CheckCircle2
              size={40}
              className="mx-auto mb-3 text-[color:var(--pm-success)]"
            />
            <p className="text-sm font-semibold">Link enviado!</p>
            <p className="mt-1 text-xs text-[color:var(--pm-muted)]">
              Enviamos as instruções para <strong>{email}</strong>.
            </p>
            <Link href="/login" className="pm-btn pm-btn-primary mt-5 w-full">
              <ArrowLeft size={16} /> Voltar ao login
            </Link>
          </div>
        ) : (
          <form onSubmit={enviar} className="pm-card p-6">
            <label className="pm-label">E-mail</label>
            <input
              className="pm-input"
              type="email"
              required
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {erro && (
              <p className="mt-3 rounded-lg border border-[color:var(--pm-danger)]/40 bg-[color:var(--pm-danger)]/10 px-3 py-2 text-xs text-[color:var(--pm-danger)]">
                {erro}
              </p>
            )}
            <button className="pm-btn pm-btn-primary mt-5 w-full">
              <Send size={16} /> ENVIAR LINK DE RECUPERAÇÃO
            </button>
            <Link href="/login" className="pm-btn pm-btn-ghost mt-2 w-full">
              <ArrowLeft size={16} /> Voltar ao Login
            </Link>
          </form>
        )}
      </div>
    </main>
  );
}
