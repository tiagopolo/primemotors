"use client";

/** Tela de Configurações — perfil, segurança, preferências e suporte. */

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  ChevronRight,
  Database,
  HeadphonesIcon,
  KeyRound,
  LogOut,
  Mail,
  Monitor,
  Moon,
  Pencil,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { mascaraTelefone } from "@/lib/utils";
import { Secao, Titulo } from "@/components/Layout";

function Interruptor({
  ligado,
  aoAlternar,
}: {
  ligado: boolean;
  aoAlternar: () => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={ligado}
      onClick={aoAlternar}
      className={`relative h-6 w-11 rounded-full transition-colors ${
        ligado ? "bg-[color:var(--pm-primary)]" : "bg-[color:var(--pm-border)]"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
          ligado ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

export default function Configuracoes() {
  const router = useRouter();
  const { usuario, atualizarPerfil, preferencias, setPreferencias, sair } = useApp();
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({
    nome: usuario?.nome ?? "",
    email: usuario?.email ?? "",
    telefone: usuario?.telefone ?? "",
  });

  async function salvar() {
    const r = await atualizarPerfil(form);
    if (!r.ok) return alert(r.erro);
    setEditando(false);
  }

  return (
    <>
      <Titulo titulo="Configurações" subtitulo="Gerencie sua conta e preferências" />

      <section className="pm-card mb-4 flex items-center gap-3 p-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--pm-surface-2)]">
          <User size={26} className="text-[color:var(--pm-primary-2)]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{usuario?.nome}</p>
          <p className="text-[11px] text-[color:var(--pm-muted)]">
            {usuario?.perfil === "admin" ? "Administrador" : "Cliente"}
          </p>
        </div>
      </section>

      <Secao
        titulo="Dados da Conta"
        Icone={User}
        acao={
          <button
            onClick={() => (editando ? salvar() : setEditando(true))}
            className="flex items-center gap-1 rounded-full border border-[color:var(--pm-primary)] px-3 py-1 text-[11px] font-semibold text-[color:var(--pm-primary-2)]"
          >
            <Pencil size={12} /> {editando ? "Salvar" : "Editar Dados"}
          </button>
        }
      >
        {editando ? (
          <div className="space-y-2">
            <input
              className="pm-input"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />
            <input
              className="pm-input"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              className="pm-input"
              value={form.telefone}
              onChange={(e) =>
                setForm({ ...form, telefone: mascaraTelefone(e.target.value) })
              }
            />
          </div>
        ) : (
          <dl className="space-y-2 text-xs">
            <ItemDado Icone={User} rotulo="Nome" valor={usuario?.nome ?? "—"} />
            <ItemDado Icone={Mail} rotulo="E-mail" valor={usuario?.email ?? "—"} />
            <ItemDado
              Icone={Phone}
              rotulo="Telefone"
              valor={usuario?.telefone || "—"}
            />
          </dl>
        )}
      </Secao>

      <Secao titulo="Segurança" Icone={ShieldCheck}>
        <ul className="divide-y divide-[color:var(--pm-border)] text-xs">
          {[
            { Icone: KeyRound, rotulo: "Alterar Senha" },
            { Icone: ShieldCheck, rotulo: "Autenticação em 2 Fatores" },
            { Icone: Monitor, rotulo: "Sessões Ativas" },
          ].map(({ Icone, rotulo }) => (
            <li key={rotulo}>
              <button className="flex w-full items-center gap-2 py-2.5 text-left">
                <Icone size={15} className="text-[color:var(--pm-muted)]" />
                {rotulo}
                <ChevronRight size={15} className="ml-auto text-[color:var(--pm-muted)]" />
              </button>
            </li>
          ))}
        </ul>
      </Secao>

      <Secao titulo="Preferências" Icone={Bell}>
        <ul className="space-y-3 text-xs">
          <li className="flex items-center gap-2">
            <Moon size={15} className="text-[color:var(--pm-muted)]" />
            Modo Escuro
            <span className="ml-auto">
              <Interruptor ligado aoAlternar={() => {}} />
            </span>
          </li>
          <li className="flex items-center gap-2">
            <Bell size={15} className="text-[color:var(--pm-muted)]" />
            Notificações
            <span className="ml-auto">
              <Interruptor
                ligado={preferencias.notificacoes}
                aoAlternar={() =>
                  setPreferencias({ notificacoes: !preferencias.notificacoes })
                }
              />
            </span>
          </li>
          <li className="flex items-center gap-2">
            <Mail size={15} className="text-[color:var(--pm-muted)]" />
            Receber E-mails
            <span className="ml-auto">
              <Interruptor
                ligado={preferencias.emails}
                aoAlternar={() => setPreferencias({ emails: !preferencias.emails })}
              />
            </span>
          </li>
        </ul>
      </Secao>

      <Secao titulo="Sistema" Icone={Database}>
        <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
          <div>
            <p className="text-[color:var(--pm-muted)]">Versão</p>
            <p className="font-bold">PM v1.0.0</p>
          </div>
          <div>
            <p className="text-[color:var(--pm-muted)]">Última atualização</p>
            <p className="font-bold">{new Date().toLocaleDateString("pt-BR")}</p>
          </div>
          <div>
            <p className="text-[color:var(--pm-muted)]">Armazenamento</p>
            <p className="font-bold">localStorage</p>
          </div>
        </div>
      </Secao>

      <Secao titulo="Suporte" Icone={HeadphonesIcon}>
        <div className="grid grid-cols-2 gap-2">
          <a
            href="https://wa.me/5544999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="pm-btn pm-btn-success py-1.5 text-xs"
          >
            Falar com Suporte
          </a>
          <button className="pm-btn pm-btn-ghost py-1.5 text-xs">
            Abrir Central de Ajuda
          </button>
        </div>
      </Secao>

      <button
        onClick={() => {
          sair();
          router.push("/login");
        }}
        className="pm-btn mb-4 w-full text-[color:var(--pm-danger)]"
      >
        <LogOut size={16} /> Sair da Conta
      </button>
    </>
  );
}

function ItemDado({
  Icone,
  rotulo,
  valor,
}: {
  Icone: React.ComponentType<{ size?: number; className?: string }>;
  rotulo: string;
  valor: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icone size={14} className="text-[color:var(--pm-muted)]" />
      <dt className="text-[color:var(--pm-muted)]">{rotulo}</dt>
      <dd className="ml-auto font-semibold">{valor}</dd>
    </div>
  );
}
