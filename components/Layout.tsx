"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  BarChart3,
  Car,
  ChevronLeft,
  Home,
  LogOut,
  Menu,
  PlusCircle,
  Receipt,
  Settings,
  X,
} from "lucide-react";
import { Marca } from "./Marca";
import { useApp } from "@/lib/store";
import { dataHoraBR } from "@/lib/utils";
import type { StatusCompra } from "@/lib/types";

const ROTULO_STATUS: Record<StatusCompra, string> = {
  iniciada: "iniciado",
  aguardando_pagamento: "aguardando pagamento",
  paga: "com pagamento confirmado",
  agendada: "agendado",
  concluida: "concluído",
};

const NAV = [
  { href: "/home", rotulo: "Home", Icone: Home, somenteAdmin: false },
  { href: "/veiculos", rotulo: "Veículos", Icone: Car, somenteAdmin: false },
  { href: "/minhas-compras", rotulo: "Compras", Icone: Receipt, somenteAdmin: false },
  { href: "/cadastrar", rotulo: "Cadastro", Icone: PlusCircle, somenteAdmin: true },
  { href: "/relatorios", rotulo: "Relatórios", Icone: BarChart3, somenteAdmin: true },
  { href: "/configuracoes", rotulo: "Configurações", Icone: Settings, somenteAdmin: false },
];

/** RNF07 — cliente não vê os itens de administração no menu. */
function navParaPerfil(perfil: "cliente" | "admin" | undefined) {
  return NAV.filter((item) => !item.somenteAdmin || perfil === "admin");
}

export function Cabecalho({ voltar = false }: { voltar?: boolean }) {
  const router = useRouter();
  const { usuario, sair, compras } = useApp();
  const [menuAberto, setMenuAberto] = useState(false);
  const [notifAberto, setNotifAberto] = useState(false);

  /**
   * Notificações: para o cliente, cada mudança de status das próprias
   * compras (RN11); para o admin, o status mais recente de cada pedido.
   */
  const notificacoes =
    usuario?.perfil === "admin"
      ? [...compras]
          .map((c) => ({
            id: c.id,
            compraId: c.id,
            texto: `Pedido ${c.veiculoDescricao} está ${ROTULO_STATUS[c.status] ?? c.status}`,
            em: c.historico.at(-1)?.em ?? c.criadaEm,
          }))
          .sort((a, b) => b.em.localeCompare(a.em))
          .slice(0, 6)
      : compras
          .filter((c) => c.usuarioId === usuario?.id)
          .flatMap((c) =>
            c.historico.map((h) => ({
              id: `${c.id}-${h.status}-${h.em}`,
              compraId: c.id,
              texto: `Seu pedido ${c.veiculoDescricao} está ${ROTULO_STATUS[h.status] ?? h.status}`,
              em: h.em,
            })),
          )
          .sort((a, b) => b.em.localeCompare(a.em))
          .slice(0, 6);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[color:var(--pm-border)] bg-[color:var(--pm-bg)]/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          {voltar ? (
            <button
              onClick={() => router.back()}
              aria-label="Voltar"
              className="rounded-lg p-2 hover:bg-[color:var(--pm-surface-2)]"
            >
              <ChevronLeft size={22} />
            </button>
          ) : (
            <button
              onClick={() => setMenuAberto(true)}
              aria-label="Abrir menu"
              className="rounded-lg p-2 hover:bg-[color:var(--pm-surface-2)]"
            >
              <Menu size={22} />
            </button>
          )}

          <Marca largura={160} />

          <div className="relative">
            <button
              onClick={() => setNotifAberto((a) => !a)}
              aria-label="Notificações"
              className="relative rounded-lg p-2 hover:bg-[color:var(--pm-surface-2)]"
            >
              <Bell size={20} />
              {notificacoes.length > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[color:var(--pm-primary)] text-[10px] font-bold">
                  {notificacoes.length}
                </span>
              )}
            </button>

            {notifAberto && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setNotifAberto(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-[color:var(--pm-border)] bg-[color:var(--pm-bg-2)] p-2 shadow-xl">
                  <p className="pm-label px-2 py-1">Notificações</p>
                  {notificacoes.length === 0 ? (
                    <p className="px-2 py-4 text-center text-xs text-[color:var(--pm-muted)]">
                      Nenhuma notificação por enquanto.
                    </p>
                  ) : (
                    <ul className="max-h-80 space-y-1 overflow-y-auto">
                      {notificacoes.map((n) => (
                        <li key={n.id}>
                          <button
                            onClick={() => {
                              setNotifAberto(false);
                              router.push(`/comprovante/${n.compraId}`);
                            }}
                            className="flex w-full flex-col items-start gap-0.5 rounded-lg px-2 py-2 text-left text-xs hover:bg-[color:var(--pm-surface-2)]"
                          >
                            <span className="font-semibold">{n.texto}</span>
                            <span className="text-[10px] text-[color:var(--pm-muted)]">
                              {dataHoraBR(n.em)}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {menuAberto && (
        <div
          className="fixed inset-0 z-50 bg-black/60"
          onClick={() => setMenuAberto(false)}
        >
          <nav
            className="h-full w-72 border-r border-[color:var(--pm-border)] bg-[color:var(--pm-bg-2)] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <Marca largura={150} />
              <button onClick={() => setMenuAberto(false)} aria-label="Fechar">
                <X size={20} />
              </button>
            </div>
            <p className="pm-label">Navegação</p>
            <ul className="space-y-1">
              {navParaPerfil(usuario?.perfil).map(({ href, rotulo, Icone }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setMenuAberto(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-[color:var(--pm-surface-2)]"
                  >
                    <Icone size={18} className="text-[color:var(--pm-primary-2)]" />
                    {rotulo}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t border-[color:var(--pm-border)] pt-4">
              <p className="text-sm font-semibold">{usuario?.nome}</p>
              <p className="text-xs text-[color:var(--pm-muted)]">
                {usuario?.perfil === "admin" ? "Administrador" : "Cliente"}
              </p>
              <button
                onClick={() => {
                  sair();
                  router.push("/login");
                }}
                className="mt-3 flex items-center gap-2 text-sm font-semibold text-[color:var(--pm-danger)]"
              >
                <LogOut size={16} /> Sair da conta
              </button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

export function NavegacaoInferior() {
  const caminho = usePathname();
  const { usuario } = useApp();
  return (
    <nav className="sticky bottom-0 z-30 border-t border-[color:var(--pm-border)] bg-[color:var(--pm-bg-2)]/95 backdrop-blur">
      <ul className="mx-auto flex max-w-5xl items-stretch justify-between px-2">
        {navParaPerfil(usuario?.perfil).map(({ href, rotulo, Icone }) => {
          const ativo = caminho.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                  ativo
                    ? "text-[color:var(--pm-primary-2)]"
                    : "text-[color:var(--pm-muted)]"
                }`}
              >
                <Icone size={20} />
                {rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function Titulo({
  titulo,
  subtitulo,
}: {
  titulo: string;
  subtitulo?: string;
}) {
  return (
    <div className="mb-4">
      <h1 className="text-2xl font-bold">{titulo}</h1>
      {subtitulo && (
        <p className="text-sm text-[color:var(--pm-muted)]">{subtitulo}</p>
      )}
    </div>
  );
}

export function Secao({
  titulo,
  Icone,
  children,
  acao,
}: {
  titulo: string;
  Icone?: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
  acao?: React.ReactNode;
}) {
  return (
    <section className="pm-card mb-4 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icone && (
            <span className="rounded-md bg-[color:var(--pm-primary)]/20 p-1.5">
              <Icone size={16} className="text-[color:var(--pm-primary-2)]" />
            </span>
          )}
          <h2 className="text-sm font-bold">{titulo}</h2>
        </div>
        {acao}
      </div>
      {children}
    </section>
  );
}
