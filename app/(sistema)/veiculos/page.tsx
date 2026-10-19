"use client";

/** RF03 — Listagem de todos os veículos disponíveis. Tela "Veículos em Estoque". */

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Calendar,
  ChevronRight,
  DollarSign,
  Gauge,
  PlusCircle,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { dataBR, km, moeda } from "@/lib/utils";
import { CarroArte } from "@/components/CarroArte";
import { Titulo } from "@/components/Layout";
import type { StatusVeiculo } from "@/lib/types";

const FILTROS: { valor: StatusVeiculo | "todos"; rotulo: string }[] = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "disponivel", rotulo: "Disponíveis" },
  { valor: "vendido", rotulo: "Vendidos" },
];

export default function Veiculos() {
  const { usuario, veiculos } = useApp();
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<StatusVeiculo | "todos">("todos");
  const [ordem, setOrdem] = useState<"recentes" | "menor" | "maior">("recentes");

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const filtrada = veiculos.filter((v) => {
      const casaBusca =
        !termo ||
        `${v.marca} ${v.modelo} ${v.ano} ${v.cor}`.toLowerCase().includes(termo);
      const casaFiltro = filtro === "todos" || v.status === filtro;
      return casaBusca && casaFiltro;
    });
    if (ordem === "menor") return [...filtrada].sort((a, b) => a.preco - b.preco);
    if (ordem === "maior") return [...filtrada].sort((a, b) => b.preco - a.preco);
    // "Mais recentes": disponíveis primeiro (pela data de cadastro), depois os
    // vendidos, ordenados pela data da venda — sem isso, um carro vendido há
    // meses podia aparecer entre os disponíveis mais novos.
    return [...filtrada].sort((a, b) => {
      if (a.status === "vendido" && b.status !== "vendido") return 1;
      if (b.status === "vendido" && a.status !== "vendido") return -1;
      if (a.status === "vendido" && b.status === "vendido") {
        return (b.vendidoEm ?? b.criadoEm).localeCompare(a.vendidoEm ?? a.criadoEm);
      }
      return b.criadoEm.localeCompare(a.criadoEm);
    });
  }, [veiculos, busca, filtro, ordem]);

  return (
    <>
      <div className="mb-4 flex items-start justify-between gap-3">
        <Titulo titulo="Veículos em Estoque" subtitulo="Gerencie os veículos cadastrados" />
        {usuario?.perfil === "admin" && (
          <Link
            href="/cadastrar"
            className="pm-btn pm-btn-primary pm-glow shrink-0 whitespace-nowrap"
          >
            <PlusCircle size={18} /> Cadastrar veículo
          </Link>
        )}
      </div>

      <div className="pm-card mb-4 p-3">
        <div className="flex items-center gap-2">
          <Search size={18} className="text-[color:var(--pm-muted)]" />
          <input
            className="pm-input border-0 bg-transparent p-0 focus:shadow-none"
            placeholder="Buscar veículo..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <SlidersHorizontal size={18} className="text-[color:var(--pm-primary-2)]" />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {FILTROS.map((f) => (
            <button
              key={f.valor}
              onClick={() => setFiltro(f.valor)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                filtro === f.valor
                  ? "border-transparent bg-[color:var(--pm-primary)] text-white"
                  : "border-[color:var(--pm-border)] text-[color:var(--pm-muted)]"
              }`}
            >
              {f.rotulo}
            </button>
          ))}
          <select
            value={ordem}
            onChange={(e) => setOrdem(e.target.value as typeof ordem)}
            className="ml-auto rounded-full border border-[color:var(--pm-border)] bg-[color:var(--pm-bg-2)] px-3 py-1 text-xs"
          >
            <option value="recentes">Mais recentes</option>
            <option value="menor">Menor preço</option>
            <option value="maior">Maior preço</option>
          </select>
        </div>
      </div>

      <ul className="space-y-3">
        {lista.map((v) => (
          <li key={v.id} className="pm-card p-3">
            <div className="flex gap-3">
              <div className="w-36 shrink-0">
                {v.fotos.length > 0 ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={v.fotos[0]}
                    alt={`${v.marca} ${v.modelo}`}
                    className="h-[92px] w-full rounded-xl object-contain"
                  />
                ) : (
                  <CarroArte cor={v.cardCor} carroceria={v.carroceria} altura={92} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="truncate text-sm font-bold">
                    {v.marca} {v.modelo} {v.ano}
                  </h3>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                      v.status === "disponivel"
                        ? "bg-[color:var(--pm-success)]/20 text-[color:var(--pm-success)]"
                        : "bg-[color:var(--pm-danger)]/20 text-[color:var(--pm-danger)]"
                    }`}
                  >
                    {v.status}
                  </span>
                </div>
                {v.status === "vendido" && (
                  <p className="mt-0.5 text-[10px] text-[color:var(--pm-muted)]">
                    Vendido em {dataBR(v.vendidoEm ?? v.criadoEm)}
                  </p>
                )}
                <div className="mt-1.5 space-y-1 text-[11px] text-[color:var(--pm-muted)]">
                  <p className="flex items-center gap-1.5">
                    <Calendar size={12} /> Ano <span className="ml-auto text-[color:var(--pm-text)]">{v.ano}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Gauge size={12} /> Quilometragem{" "}
                    <span className="ml-auto text-[color:var(--pm-text)]">
                      {km(v.quilometragem)} · novo
                    </span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <DollarSign size={12} /> Preço{" "}
                    <span className="ml-auto font-bold text-[color:var(--pm-primary-2)]">
                      {moeda(v.preco)}
                    </span>
                  </p>
                </div>
                <Link
                  href={`/veiculos/${v.id}`}
                  className="pm-btn pm-btn-primary mt-2 w-full py-1.5 text-xs"
                >
                  Ver Detalhes <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {lista.length === 0 && (
        <p className="pm-card p-8 text-center text-sm text-[color:var(--pm-muted)]">
          Nenhum veículo encontrado para esse filtro.
        </p>
      )}
    </>
  );
}
