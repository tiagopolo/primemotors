"use client";

/** RF16 / RN10 — Cadastro e edição de veículos (somente administrador). */

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Ban, Save, ShieldAlert } from "lucide-react";
import { useApp } from "@/lib/store";
import { uid } from "@/lib/utils";
import { CarroArte } from "@/components/CarroArte";
import { UploadFotos } from "@/components/UploadFotos";
import { Titulo } from "@/components/Layout";
import type { Veiculo } from "@/lib/types";

const CORES = [
  { nome: "Branco Pérola", hex: "#cfd6e6" },
  { nome: "Preto Carbon", hex: "#2b2f36" },
  { nome: "Prata Metálico", hex: "#b9c0cc" },
  { nome: "Azul Atlântico", hex: "#1f6fff" },
  { nome: "Vermelho Rubi", hex: "#d61f2f" },
  { nome: "Laranja Arancio", hex: "#ff6a1f" },
];

const vazio = (): Veiculo => ({
  id: uid("vei"),
  modelo: "",
  marca: "",
  ano: new Date().getFullYear(),
  quilometragem: 0,
  preco: 0,
  cor: CORES[0].nome,
  cambio: "Automático",
  combustivel: "Flex",
  carroceria: "Sedã",
  motor: "",
  potencia: "",
  descricao: "",
  opcionais: [],
  fotos: [],
  status: "disponivel",
  cardCor: CORES[0].hex,
  criadoEm: new Date().toISOString(),
});

function Formulario() {
  const router = useRouter();
  const params = useSearchParams();
  const idEdicao = params.get("id");
  const { usuario, buscarVeiculo, salvarVeiculo } = useApp();
  // o layout só monta esta tela depois de carregar o estoque, então o veículo já está disponível
  const [v, setV] = useState<Veiculo>(
    () => (idEdicao && buscarVeiculo(idEdicao)) || vazio(),
  );
  const [opcionaisTexto, setOpcionaisTexto] = useState(() => {
    const achado = idEdicao ? buscarVeiculo(idEdicao) : undefined;
    return achado ? achado.opcionais.join(", ") : "";
  });

  if (usuario?.perfil !== "admin") {
    return (
      <div className="pm-card p-8 text-center">
        <ShieldAlert
          size={36}
          className="mx-auto mb-3 text-[color:var(--pm-danger)]"
        />
        <p className="text-sm font-semibold">Acesso restrito</p>
        <p className="mt-1 text-xs text-[color:var(--pm-muted)]">
          Somente o administrador pode cadastrar ou remover veículos (RN10).
          Entre com <strong>admin@primemotors.com</strong>.
        </p>
      </div>
    );
  }

  const set = <K extends keyof Veiculo>(campo: K, valor: Veiculo[K]) =>
    setV((atual) => ({ ...atual, [campo]: valor }));

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const r = await salvarVeiculo({
      ...v,
      opcionais: opcionaisTexto
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean),
    });
    if (!r.ok) return alert(r.erro);
    router.push(`/veiculos/${v.id}`);
  }

  return (
    <>
      <Titulo
        titulo={idEdicao ? "Editar Veículo" : "Cadastrar Veículo"}
        subtitulo="Preencha os dados do veículo do estoque"
      />

      <form onSubmit={enviar} className="pm-card p-4">
        {v.fotos.length > 0 ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={v.fotos[0]}
            alt="Foto de capa do veículo"
            className="h-44 w-full rounded-xl object-contain"
          />
        ) : (
          <CarroArte cor={v.cardCor} carroceria={v.carroceria} altura={150} />
        )}

        <div className="mt-4">
          <UploadFotos
            fotos={v.fotos}
            aoMudar={(fotos) => set("fotos", fotos)}
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="pm-label">Marca</label>
            <input
              className="pm-input"
              required
              value={v.marca}
              onChange={(e) => set("marca", e.target.value)}
              placeholder="Toyota"
            />
          </div>
          <div>
            <label className="pm-label">Modelo</label>
            <input
              className="pm-input"
              required
              value={v.modelo}
              onChange={(e) => set("modelo", e.target.value)}
              placeholder="Corolla XEI"
            />
          </div>
          <div>
            <label className="pm-label">Ano</label>
            <input
              className="pm-input"
              type="number"
              required
              min={1950}
              max={2100}
              value={v.ano}
              onChange={(e) => set("ano", Number(e.target.value))}
            />
          </div>
          <div>
            <label className="pm-label">Quilometragem</label>
            <input
              className="pm-input opacity-70"
              value="0 km — veículo zero quilômetro"
              readOnly
              title="A concessionária trabalha apenas com veículos 0 km"
            />
          </div>
          <div>
            <label className="pm-label">Preço (R$)</label>
            <input
              className="pm-input"
              type="number"
              required
              min={0}
              value={v.preco}
              onChange={(e) => set("preco", Number(e.target.value))}
            />
          </div>
          <div>
            <label className="pm-label">Cor</label>
            <select
              className="pm-input"
              value={v.cor}
              onChange={(e) => {
                const achada = CORES.find((c) => c.nome === e.target.value);
                setV((atual) => ({
                  ...atual,
                  cor: e.target.value,
                  cardCor: achada?.hex ?? atual.cardCor,
                }));
              }}
            >
              {CORES.map((c) => (
                <option key={c.nome}>{c.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="pm-label">Transmissão</label>
            <select
              className="pm-input"
              value={v.cambio}
              onChange={(e) => set("cambio", e.target.value as Veiculo["cambio"])}
            >
              <option>Automático</option>
              <option>Manual</option>
              <option>CVT</option>
            </select>
          </div>
          <div>
            <label className="pm-label">Combustível</label>
            <select
              className="pm-input"
              value={v.combustivel}
              onChange={(e) =>
                set("combustivel", e.target.value as Veiculo["combustivel"])
              }
            >
              <option>Flex</option>
              <option>Gasolina</option>
              <option>Diesel</option>
              <option>Elétrico</option>
              <option>Híbrido</option>
            </select>
          </div>
          <div>
            <label className="pm-label">Carroceria</label>
            <select
              className="pm-input"
              value={v.carroceria}
              onChange={(e) => set("carroceria", e.target.value)}
              title="Define também a ilustração exibida no anúncio"
            >
              <option>Sedã</option>
              <option>Cupê</option>
              <option>SUV</option>
              <option>Picape</option>
            </select>
          </div>
          <div>
            <label className="pm-label">Motor</label>
            <input
              className="pm-input"
              value={v.motor}
              onChange={(e) => set("motor", e.target.value)}
              placeholder="2.0 Dynamic Force"
            />
          </div>
          <div>
            <label className="pm-label">Potência</label>
            <input
              className="pm-input"
              value={v.potencia}
              onChange={(e) => set("potencia", e.target.value)}
              placeholder="177 cv"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="pm-label">Status no estoque</label>
            <select
              className="pm-input"
              value={v.status}
              onChange={(e) => set("status", e.target.value as Veiculo["status"])}
            >
              <option value="disponivel">Disponível</option>
              <option value="reservado">Reservado</option>
              <option value="vendido">Vendido</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="pm-label">Opcionais (separados por vírgula)</label>
            <input
              className="pm-input"
              value={opcionaisTexto}
              onChange={(e) => setOpcionaisTexto(e.target.value)}
              placeholder="Central multimídia, Bancos em couro"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="pm-label">Descrição</label>
            <textarea
              className="pm-input min-h-24"
              value={v.descricao}
              onChange={(e) => set("descricao", e.target.value)}
              placeholder="Detalhes do veículo, estado de conservação, revisões..."
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button className="pm-btn pm-btn-primary">
            <Save size={16} /> SALVAR VEÍCULO
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="pm-btn pm-btn-ghost"
          >
            <Ban size={16} /> CANCELAR
          </button>
        </div>
      </form>
    </>
  );
}

export default function Cadastrar() {
  return (
    <Suspense fallback={<p className="text-sm text-[color:var(--pm-muted)]">Carregando…</p>}>
      <Formulario />
    </Suspense>
  );
}
