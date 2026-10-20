"use client";

/** RF04 — Detalhes completos do veículo selecionado. */

import Link from "next/link";
import { use, useState } from "react";
import {
  Armchair,
  Calendar,
  Fuel,
  Gauge,
  MessageCircle,
  Palette,
  Pencil,
  Settings2,
  ShoppingCart,
  Trash2,
  User,
  Zap,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { km, moeda } from "@/lib/utils";
import { CarroArte } from "@/components/CarroArte";
import { useRouter } from "next/navigation";

function Spec({
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
      <Icone size={15} className="shrink-0 text-[color:var(--pm-primary-2)]" />
      <div className="min-w-0">
        <p className="text-[9px] uppercase tracking-wide text-[color:var(--pm-muted)]">
          {rotulo}
        </p>
        <p className="truncate text-[11px] font-semibold">{valor}</p>
      </div>
    </div>
  );
}

export default function DetalheVeiculo({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { buscarVeiculo, removerVeiculo, usuario } = useApp();
  const veiculo = buscarVeiculo(id);
  const [fotoAtiva, setFotoAtiva] = useState(0);

  if (!veiculo) {
    return (
      <p className="pm-card p-8 text-center text-sm text-[color:var(--pm-muted)]">
        Veículo não encontrado.
      </p>
    );
  }

  const admin = usuario?.perfil === "admin";

  return (
    <>
      <div className="pm-card mb-4 overflow-hidden p-4">
        {veiculo.fotos.length > 0 ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={veiculo.fotos[Math.min(fotoAtiva, veiculo.fotos.length - 1)]}
              alt={`${veiculo.marca} ${veiculo.modelo}`}
              className="h-56 w-full rounded-xl object-contain"
            />
            {veiculo.fotos.length > 1 && (
              <ul className="mt-2 flex gap-2 overflow-x-auto">
                {veiculo.fotos.map((foto, i) => (
                  <li key={i}>
                    <button
                      onClick={() => setFotoAtiva(i)}
                      className={`overflow-hidden rounded-lg border-2 transition-colors ${
                        i === fotoAtiva
                          ? "border-[color:var(--pm-primary)]"
                          : "border-transparent"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={foto}
                        alt={`Miniatura ${i + 1}`}
                        className="h-14 w-20 object-contain"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <CarroArte cor={veiculo.cardCor} carroceria={veiculo.carroceria} altura={190} />
        )}

        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">
              {veiculo.marca} {veiculo.modelo}
            </h1>
            <p className="text-xs text-[color:var(--pm-muted)]">
              {veiculo.carroceria} · {veiculo.cor}
            </p>
          </div>
          <div className="text-right">
            <span className="rounded-full bg-[color:var(--pm-primary)] px-2 py-0.5 text-[10px] font-bold">
              {veiculo.ano}
            </span>
            <p className="mt-1 text-lg font-extrabold text-[color:var(--pm-primary-2)]">
              {moeda(veiculo.preco)}
            </p>
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-[color:var(--pm-muted)]">
          {veiculo.descricao}
        </p>
      </div>

      <div className="pm-card mb-4 grid grid-cols-2 gap-3 p-4 sm:grid-cols-3">
        <Spec Icone={Calendar} rotulo="Ano" valor={String(veiculo.ano)} />
        <Spec Icone={Fuel} rotulo="Combustível" valor={veiculo.combustivel} />
        <Spec Icone={Gauge} rotulo="Quilometragem" valor={km(veiculo.quilometragem)} />
        <Spec Icone={Settings2} rotulo="Transmissão" valor={veiculo.cambio} />
        <Spec Icone={Zap} rotulo="Motor" valor={veiculo.motor} />
        <Spec Icone={Zap} rotulo="Potência" valor={veiculo.potencia} />
        <Spec Icone={Palette} rotulo="Cor" valor={veiculo.cor} />
        <Spec Icone={Armchair} rotulo="Carroceria" valor={veiculo.carroceria} />
        <Spec Icone={User} rotulo="Condição" valor="Zero km — novo" />
      </div>

      {veiculo.opcionais.length > 0 && (
        <div className="pm-card mb-4 p-4">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-[color:var(--pm-muted)]">
            Opcionais
          </h2>
          <div className="flex flex-wrap gap-2">
            {veiculo.opcionais.map((o) => (
              <span
                key={o}
                className="rounded-full border border-[color:var(--pm-border)] px-3 py-1 text-[11px]"
              >
                {o}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {veiculo.status === "disponivel" ? (
          <Link
            href={`/comprar/${veiculo.id}`}
            className="pm-btn pm-btn-primary w-full"
          >
            <ShoppingCart size={18} /> Comprar
          </Link>
        ) : (
          <button disabled className="pm-btn pm-btn-ghost w-full">
            Veículo vendido
          </button>
        )}

        <a
          href={`https://wa.me/5544999999999?text=${encodeURIComponent(
            `Olá! Tenho interesse no ${veiculo.marca} ${veiculo.modelo} ${veiculo.ano}.`,
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="pm-btn pm-btn-success w-full"
        >
          <MessageCircle size={18} /> Atendimento via WhatsApp
        </a>

        {/* RN10 — apenas o administrador edita ou remove o estoque */}
        {admin && (
          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/cadastrar?id=${veiculo.id}`}
              className="pm-btn pm-btn-ghost"
            >
              <Pencil size={16} /> Editar
            </Link>
            <button
              onClick={async () => {
                if (confirm("Remover este veículo do estoque?")) {
                  const r = await removerVeiculo(veiculo.id);
                  if (!r.ok) return alert(r.erro);
                  router.push("/veiculos");
                }
              }}
              className="pm-btn pm-btn-ghost text-[color:var(--pm-danger)]"
            >
              <Trash2 size={16} /> Remover
            </button>
          </div>
        )}
      </div>
    </>
  );
}
