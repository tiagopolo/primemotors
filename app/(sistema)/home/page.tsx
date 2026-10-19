"use client";

/**
 * Tela 3 do protótipo — Dashboard inicial.
 *
 * RNF07 — o conteúdo muda por perfil: o administrador vê os indicadores do
 * negócio (faturamento, clientes, propostas); o cliente vê o estoque e as
 * próprias compras, sem números que são da concessionária.
 */

import Link from "next/link";
import {
  BadgeDollarSign,
  Car,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Users,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { VENDAS_MENSAIS } from "@/lib/seed";
import { dataHoraBR, moeda } from "@/lib/utils";
import { CarroArte } from "@/components/CarroArte";
import { GraficoLinha } from "@/components/GraficoLinha";

function Kpi({
  Icone,
  rotulo,
  valor,
  variacao,
  positivo = true,
}: {
  Icone: React.ComponentType<{ size?: number; className?: string }>;
  rotulo: string;
  valor: string;
  variacao: string;
  positivo?: boolean;
}) {
  return (
    <div className="pm-card p-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-md bg-[color:var(--pm-primary)]/20 p-1.5">
          <Icone size={14} className="text-[color:var(--pm-primary-2)]" />
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--pm-muted)]">
          {rotulo}
        </span>
      </div>
      <p className="text-xl font-extrabold">{valor}</p>
      <p
        className={`text-[10px] ${
          positivo
            ? "text-[color:var(--pm-success)]"
            : "text-[color:var(--pm-danger)]"
        }`}
      >
        {variacao}{" "}
        <span className="text-[color:var(--pm-muted)]">
          em relação ao mês anterior
        </span>
      </p>
    </div>
  );
}

export default function Home() {
  const { usuario, veiculos, compras } = useApp();
  const disponiveis = veiculos.filter((v) => v.status === "disponivel");
  const recentes = [...veiculos]
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
    .slice(0, 3);

  if (usuario?.perfil !== "admin") {
    return <HomeCliente nome={usuario?.nome} disponiveis={disponiveis} recentes={recentes} compras={compras} usuarioId={usuario?.id} />;
  }

  const faturamentoMes = compras
    .filter((c) => c.status === "concluida")
    .reduce((s, c) => s + c.valorTotal, 0);

  return (
    <>
      <div className="mb-5">
        <h1 className="text-2xl font-bold">
          Olá, {usuario?.nome.split(" ")[0]}! 👋
        </h1>
        <p className="text-sm text-[color:var(--pm-muted)]">
          Bem-vindo de volta ao sistema Prime Motors
        </p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <Kpi Icone={Car} rotulo="Veículos" valor={String(veiculos.length)} variacao="+12%" />
        <Kpi Icone={Users} rotulo="Clientes" valor="587" variacao="+8%" />
        <Kpi
          Icone={BadgeDollarSign}
          rotulo="Vendas do mês"
          valor={moeda(faturamentoMes || 1250000)}
          variacao="+18%"
        />
        <Kpi Icone={FileText} rotulo="Propostas" valor="42" variacao="-5%" positivo={false} />
      </div>

      <section className="pm-card mb-4 p-4">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-[color:var(--pm-muted)]">
          Vendas dos últimos 6 meses
        </h2>
        <GraficoLinha dados={VENDAS_MENSAIS.slice(0, 6)} campo="faturamento" />
      </section>

      <VeiculosRecentes recentes={recentes} disponiveis={disponiveis.length} />
    </>
  );
}

/** Home do cliente: estoque em destaque e as próprias compras, sem dados do negócio. */
function HomeCliente({
  nome,
  disponiveis,
  recentes,
  compras,
  usuarioId,
}: {
  nome?: string;
  disponiveis: ReturnType<typeof useApp>["veiculos"];
  recentes: ReturnType<typeof useApp>["veiculos"];
  compras: ReturnType<typeof useApp>["compras"];
  usuarioId?: string;
}) {
  const minhasCompras = compras
    .filter((c) => c.usuarioId === usuarioId)
    .slice(0, 5);

  return (
    <>
      <div className="mb-5">
        <h1 className="text-2xl font-bold">Olá, {nome?.split(" ")[0]}! 👋</h1>
        <p className="text-sm text-[color:var(--pm-muted)]">
          {disponiveis.length} veículo(s) disponível(is) para você conhecer
        </p>
      </div>

      <section className="pm-card mb-4 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wide text-[color:var(--pm-muted)]">
            Minhas compras
          </h2>
          {minhasCompras.length > 0 && (
            <Link href="/configuracoes" className="text-xs font-semibold text-[color:var(--pm-primary-2)]">
              Ver tudo
            </Link>
          )}
        </div>
        {minhasCompras.length === 0 ? (
          <p className="text-xs text-[color:var(--pm-muted)]">
            Você ainda não iniciou nenhuma compra. Escolha um veículo no estoque
            para começar.
          </p>
        ) : (
          <ul className="space-y-2 text-xs">
            {minhasCompras.map((c) => (
              <li key={c.id}>
                <Link
                  href={c.status === "concluida" ? `/comprovante/${c.id}` : `/comprar/${c.veiculoId}`}
                  className="flex items-center gap-2 rounded-lg border border-[color:var(--pm-border)] p-2 hover:bg-[color:var(--pm-surface-2)]"
                >
                  {c.status === "concluida" ? (
                    <CheckCircle2 size={14} className="text-[color:var(--pm-success)]" />
                  ) : (
                    <Clock size={14} className="text-[color:var(--pm-primary-2)]" />
                  )}
                  <span className="min-w-0 flex-1 truncate font-semibold">
                    {c.veiculoDescricao}
                  </span>
                  <span className="text-[color:var(--pm-muted)]">{dataHoraBR(c.criadaEm)}</span>
                  <ChevronRight size={14} className="text-[color:var(--pm-muted)]" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <VeiculosRecentes recentes={recentes} disponiveis={disponiveis.length} />
    </>
  );
}

function VeiculosRecentes({
  recentes,
  disponiveis,
}: {
  recentes: ReturnType<typeof useApp>["veiculos"];
  disponiveis: number;
}) {
  return (
    <section className="pm-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wide text-[color:var(--pm-muted)]">
          Veículos recentes
        </h2>
        <Link
          href="/veiculos"
          className="text-xs font-semibold text-[color:var(--pm-primary-2)]"
        >
          Ver todos
        </Link>
      </div>
      <ul className="space-y-2">
        {recentes.map((v) => (
          <li key={v.id}>
            <Link
              href={`/veiculos/${v.id}`}
              className="flex items-center gap-3 rounded-xl border border-[color:var(--pm-border)] p-2 hover:bg-[color:var(--pm-surface-2)]"
            >
              <div className="w-24 shrink-0">
                {v.fotos.length > 0 ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={v.fotos[0]}
                    alt={`${v.marca} ${v.modelo}`}
                    className="h-12 w-full rounded-xl object-contain"
                  />
                ) : (
                  <CarroArte cor={v.cardCor} carroceria={v.carroceria} altura={48} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {v.marca} {v.modelo} {v.ano}
                </p>
                <p className="text-[11px] text-[color:var(--pm-muted)]">
                  {v.cor} · {v.quilometragem.toLocaleString("pt-BR")} km
                </p>
              </div>
              <p className="text-sm font-bold text-[color:var(--pm-primary-2)]">
                {moeda(v.preco)}
              </p>
              <ChevronRight size={16} className="text-[color:var(--pm-muted)]" />
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-center text-[11px] text-[color:var(--pm-muted)]">
        {disponiveis} veículo(s) disponível(is) no estoque
      </p>
    </section>
  );
}
