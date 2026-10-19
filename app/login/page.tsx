"use client";

/** RF02 — Login de usuários cadastrados. Tela 1 do protótipo. */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogIn, Lock, Mail, UserCheck, UserPlus } from "lucide-react";
import { Marca } from "@/components/Marca";
import { useApp } from "@/lib/store";

export default function Login() {
  const router = useRouter();
  const { entrar, entrarComoVisitante } = useApp();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const r = await entrar(email, senha);
    if (r.ok) router.push("/home");
    else setErro(r.erro);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(700px 400px at 20% 10%, #1d6ef533, transparent), radial-gradient(600px 400px at 80% 90%, #00d1ff22, transparent)",
        }}
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Marca largura={300} />
          <div>
            <h1 className="text-xl font-bold">Bem-vindo!</h1>
            <p className="text-sm text-[color:var(--pm-muted)]">
              Faça login para acessar o sistema
            </p>
          </div>
        </div>

        <form onSubmit={enviar} className="pm-card relative mt-8 p-6 pt-10">
          {/* avatar sobreposto ao topo do card, como no protótipo */}
          <div className="pm-glow absolute -top-7 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border-4 border-[color:var(--pm-bg)] bg-[color:var(--pm-primary)]">
            <UserCheck size={24} />
          </div>

          <div className="mb-4">
            <label className="pm-label" htmlFor="email">
              <Mail size={12} className="mr-1 inline" /> E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              className="pm-input"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-2">
            <label className="pm-label" htmlFor="senha">
              <Lock size={12} className="mr-1 inline" /> Senha
            </label>
            <input
              id="senha"
              type="password"
              required
              className="pm-input"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          <div className="mb-4 flex justify-end">
            <Link
              href="/recuperar-senha"
              className="text-xs font-semibold text-[color:var(--pm-primary-2)] hover:underline"
            >
              Esqueceu sua senha?
            </Link>
          </div>

          {erro && (
            <p className="mb-3 rounded-lg border border-[color:var(--pm-danger)]/40 bg-[color:var(--pm-danger)]/10 px-3 py-2 text-xs text-[color:var(--pm-danger)]">
              {erro}
            </p>
          )}

          <button type="submit" className="pm-btn pm-btn-primary w-full">
            <LogIn size={16} /> ENTRAR
          </button>

          <div className="my-4 flex items-center gap-3 text-[10px] text-[color:var(--pm-muted)]">
            <span className="h-px flex-1 bg-[color:var(--pm-border)]" />
            OU
            <span className="h-px flex-1 bg-[color:var(--pm-border)]" />
          </div>

          <button
            type="button"
            onClick={() => {
              entrarComoVisitante();
              router.push("/home");
            }}
            className="pm-btn pm-btn-ghost w-full"
          >
            <UserCheck size={16} /> Acessar como visitante
          </button>

          <Link
            href="/cadastro"
            className="pm-btn pm-btn-ghost mt-2 w-full"
          >
            <UserPlus size={16} /> Criar conta
          </Link>
        </form>
      </div>
    </main>
  );
}
