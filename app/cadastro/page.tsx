"use client";

/** RF01 — Cadastro de usuário com nome, e-mail, telefone e senha. */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Marca } from "@/components/Marca";
import { useApp } from "@/lib/store";
import { mascaraTelefone } from "@/lib/utils";

export default function Cadastro() {
  const router = useRouter();
  const { cadastrar } = useApp();
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    senha: "",
    confirmar: "",
  });
  const [erro, setErro] = useState("");

  const set = (campo: keyof typeof form, valor: string) =>
    setForm((f) => ({ ...f, [campo]: valor }));

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (form.senha !== form.confirmar) return setErro("As senhas não conferem.");
    if (form.senha.length < 6)
      return setErro("A senha deve ter pelo menos 6 caracteres.");
    const r = await cadastrar(form);
    if (r.ok) router.push("/home");
    else setErro(r.erro);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Marca largura={240} />
          <h1 className="text-xl font-bold">Criar conta</h1>
        </div>

        <form onSubmit={enviar} className="pm-card p-6">
          <div className="mb-3">
            <label className="pm-label">Nome completo</label>
            <input
              className="pm-input"
              required
              value={form.nome}
              onChange={(e) => set("nome", e.target.value)}
              placeholder="Digite seu nome completo"
            />
          </div>
          <div className="mb-3">
            <label className="pm-label">E-mail</label>
            <input
              className="pm-input"
              type="email"
              required
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="seu@email.com"
            />
          </div>
          <div className="mb-3">
            <label className="pm-label">Telefone</label>
            <input
              className="pm-input"
              value={form.telefone}
              onChange={(e) => set("telefone", mascaraTelefone(e.target.value))}
              placeholder="(00) 00000-0000"
            />
          </div>
          <div className="mb-3">
            <label className="pm-label">Senha</label>
            <input
              className="pm-input"
              type="password"
              required
              value={form.senha}
              onChange={(e) => set("senha", e.target.value)}
              placeholder="mínimo 6 caracteres"
            />
          </div>
          <div className="mb-4">
            <label className="pm-label">Confirmar senha</label>
            <input
              className="pm-input"
              type="password"
              required
              value={form.confirmar}
              onChange={(e) => set("confirmar", e.target.value)}
              placeholder="repita a senha"
            />
          </div>

          {erro && (
            <p className="mb-3 rounded-lg border border-[color:var(--pm-danger)]/40 bg-[color:var(--pm-danger)]/10 px-3 py-2 text-xs text-[color:var(--pm-danger)]">
              {erro}
            </p>
          )}

          <button className="pm-btn pm-btn-primary w-full">
            <UserPlus size={16} /> CADASTRAR
          </button>
          <Link href="/login" className="pm-btn pm-btn-ghost mt-2 w-full">
            <ArrowLeft size={16} /> Voltar ao login
          </Link>
        </form>
      </div>
    </main>
  );
}
