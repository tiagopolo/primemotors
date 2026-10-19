"use client";

/** Tela de Relatórios — RF17 (acompanhamento de pedidos) e RNF08. */

import { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Car,
  DollarSign,
  Download,
  FileText,
  ShieldAlert,
  Users,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { VENDAS_MENSAIS } from "@/lib/seed";
import { dataHoraBR, moeda } from "@/lib/utils";
import { GraficoLinha } from "@/components/GraficoLinha";
import { Titulo } from "@/components/Layout";

export default function Relatorios() {
  const { usuario, veiculos, compras } = useApp();
  const [periodo, setPeriodo] = useState<"mes" | "ano">("mes");

  // RF17 / RNF07 — relatório de vendas é informação da concessionária,
  // só o administrador acompanha pedidos e pagamentos.
  if (usuario?.perfil !== "admin") {
    return (
      <div className="pm-card p-8 text-center">
        <ShieldAlert
          size={36}
          className="mx-auto mb-3 text-[color:var(--pm-danger)]"
        />
        <p className="text-sm font-semibold">Acesso restrito</p>
        <p className="mt-1 text-xs text-[color:var(--pm-muted)]">
          Somente o administrador acompanha os relatórios da concessionária
          (RF17). Entre com <strong>admin@primemotors.com</strong>.
        </p>
      </div>
    );
  }

  const concluidas = compras.filter((c) => c.status === "concluida");
  const faturamento = concluidas.reduce((s, c) => s + c.valorTotal, 0);
  const ticket = concluidas.length ? faturamento / concluidas.length : 0;
  const serie = periodo === "mes" ? VENDAS_MENSAIS.slice(6) : VENDAS_MENSAIS;

  const maisVendidos = [...veiculos]
    .sort((a, b) => b.preco - a.preco)
    .slice(0, 3);

  function exportarCsv() {
    const linhas = [
      ["codigo", "veiculo", "total", "modalidade", "status", "data"],
      ...compras.map((c) => [
        c.comprovante?.codigo ?? c.id,
        c.veiculoDescricao,
        String(c.valorTotal),
        c.modalidade,
        c.status,
        c.criadaEm,
      ]),
    ];
    const csv = linhas.map((l) => l.join(";")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "relatorio-primemotors.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="mb-4 flex items-start justify-between gap-3">
        <Titulo
          titulo="Relatórios"
          subtitulo="Acompanhe o desempenho da concessionária"
        />
        <select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value as typeof periodo)}
          className="rounded-lg border border-[color:var(--pm-border)] bg-[color:var(--pm-bg-2)] px-3 py-1.5 text-xs"
        >
          <option value="mes">Últimos 6 meses</option>
          <option value="ano">Últimos 12 meses</option>
        </select>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <Card
          Icone={Car}
          rotulo="Veículos vendidos"
          valor={String(concluidas.length || 125)}
          variacao="↑ 12%"
        />
        <Card
          Icone={DollarSign}
          rotulo="Faturamento"
          valor={moeda(faturamento || 8450000)}
          variacao="↑ 18%"
        />
        <Card Icone={Users} rotulo="Clientes" valor="587" variacao="↑ 8%" />
        <Card
          Icone={BarChart3}
          rotulo="Ticket médio"
          valor={moeda(ticket || 67600)}
          variacao="↑ 5%"
        />
      </div>

      <section className="pm-card mb-4 p-4">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-[color:var(--pm-muted)]">
          Vendas por mês
        </h2>
        <GraficoLinha dados={serie} campo="vendas" />
      </section>

      <section className="pm-card mb-4 p-4">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-[color:var(--pm-muted)]">
          Veículos de maior valor no estoque
        </h2>
        <ul className="space-y-2">
          {maisVendidos.map((v) => (
            <li key={v.id}>
              <Link
                href={`/veiculos/${v.id}`}
                className="flex items-center gap-2 text-xs"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: v.cardCor }}
                />
                <span className="font-semibold">
                  {v.marca} {v.modelo}
                </span>
                <span className="ml-auto text-[color:var(--pm-primary-2)]">
                  {moeda(v.preco)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="pm-card mb-4 p-4">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-[color:var(--pm-muted)]">
          Últimas vendas registradas
        </h2>
        {compras.length === 0 ? (
          <p className="text-xs text-[color:var(--pm-muted)]">
            Nenhuma compra registrada ainda. Conclua uma compra para ver os dados
            aqui.
          </p>
        ) : (
          <ul className="space-y-2 text-xs">
            {compras.slice(0, 6).map((c) => (
              <li key={c.id} className="flex items-center gap-2">
                <FileText size={14} className="text-[color:var(--pm-primary-2)]" />
                <span className="min-w-0 flex-1 truncate font-semibold">
                  {c.veiculoDescricao}
                </span>
                <span className="text-[color:var(--pm-muted)]">
                  {dataHoraBR(c.criadaEm)}
                </span>
                <span className="font-bold text-[color:var(--pm-primary-2)]">
                  {moeda(c.valorTotal)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <button onClick={exportarCsv} className="pm-btn pm-btn-primary mb-4 w-full">
        <Download size={16} /> Exportar relatório (CSV)
      </button>
    </>
  );
}

function Card({
  Icone,
  rotulo,
  valor,
  variacao,
}: {
  Icone: React.ComponentType<{ size?: number; className?: string }>;
  rotulo: string;
  valor: string;
  variacao: string;
}) {
  return (
    <div className="pm-card p-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-md bg-[color:var(--pm-primary)]/20 p-1.5">
          <Icone size={14} className="text-[color:var(--pm-primary-2)]" />
        </span>
        <span className="text-[10px] font-bold uppercase text-[color:var(--pm-muted)]">
          {rotulo}
        </span>
      </div>
      <p className="text-lg font-extrabold">{valor}</p>
      <p className="text-[10px] text-[color:var(--pm-success)]">
        {variacao}{" "}
        <span className="text-[color:var(--pm-muted)]">vs mês anterior</span>
      </p>
    </div>
  );
}
