"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { Marca } from "@/components/Marca";

/** Rota raiz: decide entre login e home conforme a sessão (RNF07). */
export default function Raiz() {
  const router = useRouter();
  const { pronto, usuario } = useApp();

  useEffect(() => {
    if (!pronto) return;
    router.replace(usuario ? "/home" : "/login");
  }, [pronto, usuario, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Marca largura={260} />
      <p className="text-sm text-[color:var(--pm-muted)]">Carregando sistema…</p>
    </main>
  );
}
