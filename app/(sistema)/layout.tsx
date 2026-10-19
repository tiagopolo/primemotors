"use client";

/**
 * Layout das rotas internas.
 * Faz o controle de acesso (RNF07): sem sessão, volta para o login.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Cabecalho, NavegacaoInferior } from "@/components/Layout";
import { useApp } from "@/lib/store";

export default function LayoutSistema({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { pronto, usuario } = useApp();

  useEffect(() => {
    if (pronto && !usuario) router.replace("/login");
  }, [pronto, usuario, router]);

  if (!pronto || !usuario) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-[color:var(--pm-muted)]">
        Carregando…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Cabecalho />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-5">
        {children}
      </main>
      <NavegacaoInferior />
    </div>
  );
}
