"use client";

/**
 * Tela "Finalizar Compra" — cobre RF05 a RF15 e RF18.
 * RF05 iniciar compra · RF06 dados do cliente · RF07 retirada/entrega
 * RF08 frete · RF09 agendamento · RF10-RF13 pagamento · RF14 status
 * RF15 comprovante · RF18 veículo passa a vendido
 */

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Banknote,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  FileText,
  MapPin,
  MessageCircle,
  QrCode,
  ShoppingCart,
  Store,
  Truck,
  User,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { UNIDADE_LOJA } from "@/lib/seed";
import {
  CHAVE_PIX,
  UFS,
  calcularFrete,
  gerarLinhaDigitavel,
  mascaraCep,
  mascaraCpf,
  mascaraTelefone,
  moedaCheia,
} from "@/lib/utils";
import type {
  DadosCliente,
  Entrega,
  FormaPagamento,
  Modalidade,
  Pagamento,
} from "@/lib/types";
import { CarroArte } from "@/components/CarroArte";
import { Secao } from "@/components/Layout";

const HORARIOS = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

export default function FinalizarCompra({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { buscarVeiculo, usuario, criarCompra, atualizarCompra, registrarPagamento, confirmarCompra } =
    useApp();
  const veiculo = buscarVeiculo(id);

  const [modalidade, setModalidade] = useState<Modalidade>("retirada");
  const [cliente, setCliente] = useState<DadosCliente>({
    nome: usuario?.nome ?? "",
    cpf: "",
    telefone: usuario?.telefone ?? "",
    email: usuario?.email ?? "",
  });
  const [endereco, setEndereco] = useState<Omit<Entrega, "valorFrete">>({
    cep: "",
    rua: "",
    numero: "",
    cidade: "",
    uf: "",
  });
  const [data, setData] = useState("");
  const [horario, setHorario] = useState(HORARIOS[4]);
  const [forma, setForma] = useState<FormaPagamento>("cartao");
  const [cartao, setCartao] = useState({ nome: "", numero: "", validade: "", cvv: "" });
  const [erro, setErro] = useState("");

  /** RF08 / RN12 — frete depende do endereço informado */
  const frete = useMemo(
    () => (modalidade === "entrega" ? calcularFrete(endereco.uf, endereco.cep) : 0),
    [modalidade, endereco.uf, endereco.cep],
  );

  if (!veiculo) {
    return (
      <p className="pm-card p-8 text-center text-sm text-[color:var(--pm-muted)]">
        Veículo não encontrado.
      </p>
    );
  }

  /** RN09 — total = veículo + frete quando aplicável */
  const total = veiculo.preco + frete;

  function validar(): string {
    if (!cliente.nome || !cliente.cpf || !cliente.email)
      return "Preencha os dados pessoais (RF06).";
    if (!data) return "Selecione a data do agendamento (RF09 / RN05).";
    if (modalidade === "entrega") {
      // RN04 — entrega exige endereço completo
      const { cep, rua, numero, cidade, uf } = endereco;
      if (!cep || !rua || !numero || !cidade || !uf)
        return "Informe o endereço completo para entrega (RN04).";
    }
    if (forma === "cartao" && (!cartao.nome || cartao.numero.replace(/\D/g, "").length < 13))
      return "Preencha os dados do cartão (RF13).";
    return "";
  }

  async function finalizar() {
    const problema = validar();
    if (problema) return setErro(problema);
    setErro("");

    // RF05 / RN01 / RN02
    const compra = await criarCompra(veiculo!.id, modalidade);
    if (!compra) return setErro("Não foi possível iniciar a compra.");

    // RF07, RF08, RF09, RN04, RN05, RN06, RN09
    await atualizarCompra(compra.id, {
      valorFrete: frete,
      valorTotal: total,
      entrega:
        modalidade === "entrega" ? { ...endereco, valorFrete: frete } : undefined,
      retirada: modalidade === "retirada" ? UNIDADE_LOJA : undefined,
      agendamento: { data, horario },
      status: "agendada",
    });

    // RF10 a RF14 / RN07
    const pagamento: Pagamento = {
      forma,
      valor: total,
      status: forma === "cartao" ? "confirmado" : "aguardando",
      linhaDigitavel: forma === "boleto" ? gerarLinhaDigitavel() : undefined,
      chavePix: forma === "pix" ? CHAVE_PIX : undefined,
      cartaoFinal:
        forma === "cartao" ? cartao.numero.replace(/\D/g, "").slice(-4) : undefined,
      nomeCartao: forma === "cartao" ? cartao.nome : undefined,
    };
    await registrarPagamento(compra.id, pagamento);

    // RF15 / RF18 / RN03 / RN08
    const concluida = await confirmarCompra(compra.id);
    if (!concluida) return setErro("Não foi possível concluir a compra.");
    router.push(`/comprovante/${compra.id}`);
  }

  return (
    <>
      <div className="pm-card mb-4 p-4">
        <h1 className="text-lg font-bold">Finalizar Compra</h1>
        <div className="mt-2 flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {veiculo.marca} {veiculo.modelo}{" "}
              <span className="rounded-full bg-[color:var(--pm-primary)] px-2 py-0.5 text-[10px]">
                {veiculo.ano}
              </span>
            </p>
            <p className="mt-1 text-[10px] uppercase text-[color:var(--pm-muted)]">Preço</p>
            <p className="text-lg font-extrabold text-[color:var(--pm-primary-2)]">
              {moedaCheia(veiculo.preco)}
            </p>
          </div>
          <div className="w-32">
            {veiculo.fotos.length > 0 ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={veiculo.fotos[0]}
                alt={`${veiculo.marca} ${veiculo.modelo}`}
                className="h-[70px] w-full rounded-xl object-contain"
              />
            ) : (
              <CarroArte cor={veiculo.cardCor} carroceria={veiculo.carroceria} altura={70} />
            )}
          </div>
        </div>
      </div>

      {/* RF07 — modalidade de recebimento */}
      <Secao titulo="Modalidade de recebimento" Icone={Truck}>
        <div className="grid grid-cols-2 gap-2">
          {(["retirada", "entrega"] as Modalidade[]).map((m) => (
            <button
              key={m}
              onClick={() => setModalidade(m)}
              className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-xs font-semibold transition-colors ${
                modalidade === m
                  ? "border-[color:var(--pm-primary)] bg-[color:var(--pm-primary)]/15"
                  : "border-[color:var(--pm-border)]"
              }`}
            >
              {m === "retirada" ? <Store size={20} /> : <Truck size={20} />}
              {m === "retirada" ? "Retirar na loja" : "Entrega no endereço"}
            </button>
          ))}
        </div>

        {modalidade === "retirada" && (
          <div className="mt-3 rounded-xl border border-[color:var(--pm-border)] p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold">
              <MapPin size={14} className="text-[color:var(--pm-primary-2)]" />
              {UNIDADE_LOJA.unidade}
            </p>
            <p className="mt-1 text-[11px] text-[color:var(--pm-muted)]">
              {UNIDADE_LOJA.endereco}
            </p>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Av.+Colombo,+5834,+Maringa+PR"
              target="_blank"
              rel="noopener noreferrer"
              className="pm-btn pm-btn-primary mt-2 w-full py-1.5 text-xs"
            >
              <MapPin size={14} /> Abrir no Maps
            </a>
          </div>
        )}
      </Secao>

      {/* RF09 / RN05 / RN06 — agendamento */}
      <Secao titulo="Agendar atendimento" Icone={CalendarClock}>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="pm-label">Data</label>
            <input
              type="date"
              className="pm-input"
              value={data}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setData(e.target.value)}
            />
          </div>
          <div>
            <label className="pm-label">Horário</label>
            <select
              className="pm-input"
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
            >
              {HORARIOS.map((h) => (
                <option key={h}>{h}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-[color:var(--pm-muted)]">
          Escolha o melhor horário para{" "}
          {modalidade === "retirada" ? "a retirada na concessionária" : "a entrega"}.
        </p>
      </Secao>

      {/* RF06 — dados do cliente */}
      <Secao titulo="Dados pessoais" Icone={User}>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            className="pm-input"
            placeholder="Digite seu nome completo"
            value={cliente.nome}
            onChange={(e) => setCliente({ ...cliente, nome: e.target.value })}
          />
          <input
            className="pm-input"
            placeholder="000.000.000-00"
            value={cliente.cpf}
            onChange={(e) => setCliente({ ...cliente, cpf: mascaraCpf(e.target.value) })}
          />
          <input
            className="pm-input"
            placeholder="(00) 00000-0000"
            value={cliente.telefone}
            onChange={(e) =>
              setCliente({ ...cliente, telefone: mascaraTelefone(e.target.value) })
            }
          />
          <input
            className="pm-input"
            type="email"
            placeholder="seuemail@exemplo.com"
            value={cliente.email}
            onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
          />
        </div>
      </Secao>

      {/* RN04 — endereço só quando a modalidade for entrega */}
      {modalidade === "entrega" && (
        <Secao titulo="Endereço de entrega" Icone={MapPin}>
          <div className="grid grid-cols-2 gap-2">
            <input
              className="pm-input"
              placeholder="00000-000"
              value={endereco.cep}
              onChange={(e) =>
                setEndereco({ ...endereco, cep: mascaraCep(e.target.value) })
              }
            />
            <input
              className="pm-input"
              placeholder="Digite sua rua"
              value={endereco.rua}
              onChange={(e) => setEndereco({ ...endereco, rua: e.target.value })}
            />
            <input
              className="pm-input"
              placeholder="Nº"
              value={endereco.numero}
              onChange={(e) => setEndereco({ ...endereco, numero: e.target.value })}
            />
            <input
              className="pm-input"
              placeholder="Digite sua cidade"
              value={endereco.cidade}
              onChange={(e) => setEndereco({ ...endereco, cidade: e.target.value })}
            />
            <select
              className="pm-input"
              value={endereco.uf}
              onChange={(e) => setEndereco({ ...endereco, uf: e.target.value })}
            >
              <option value="">UF</option>
              {UFS.map((uf) => (
                <option key={uf}>{uf}</option>
              ))}
            </select>
          </div>
          {frete > 0 && (
            <p className="mt-2 text-xs">
              Frete calculado:{" "}
              <strong className="text-[color:var(--pm-primary-2)]">
                {moedaCheia(frete)}
              </strong>
            </p>
          )}
        </Secao>
      )}

      {/* RF10 a RF13 — formas de pagamento */}
      <Secao titulo="Forma de pagamento" Icone={CreditCard}>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { v: "pix", rotulo: "PIX", Icone: QrCode },
              { v: "cartao", rotulo: "Cartão", Icone: CreditCard },
              { v: "boleto", rotulo: "Boleto", Icone: Banknote },
            ] as const
          ).map(({ v, rotulo, Icone }) => (
            <button
              key={v}
              onClick={() => setForma(v)}
              className={`flex flex-col items-center gap-1 rounded-xl border p-2.5 text-xs font-semibold ${
                forma === v
                  ? "border-[color:var(--pm-primary)] bg-[color:var(--pm-primary)]/15"
                  : "border-[color:var(--pm-border)]"
              }`}
            >
              <Icone size={18} />
              {rotulo}
            </button>
          ))}
        </div>

        {/* RF13 */}
        {forma === "cartao" && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <input
              className="pm-input col-span-2"
              placeholder="Nome impresso no cartão"
              value={cartao.nome}
              onChange={(e) => setCartao({ ...cartao, nome: e.target.value })}
            />
            <input
              className="pm-input col-span-2"
              placeholder="0000 0000 0000 0000"
              inputMode="numeric"
              value={cartao.numero}
              onChange={(e) =>
                setCartao({
                  ...cartao,
                  numero: e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 16)
                    .replace(/(\d{4})(?=\d)/g, "$1 "),
                })
              }
            />
            <input
              className="pm-input"
              placeholder="MM/AA"
              value={cartao.validade}
              onChange={(e) =>
                setCartao({
                  ...cartao,
                  validade: e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 4)
                    .replace(/(\d{2})(?=\d)/, "$1/"),
                })
              }
            />
            <input
              className="pm-input"
              placeholder="CVV"
              value={cartao.cvv}
              onChange={(e) =>
                setCartao({ ...cartao, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })
              }
            />
          </div>
        )}

        {/* RF12 */}
        {forma === "pix" && (
          <div className="mt-3 rounded-xl border border-[color:var(--pm-border)] p-3 text-xs">
            <p className="font-semibold">Dados para transferência</p>
            <p className="mt-1 text-[color:var(--pm-muted)]">
              Chave PIX (CNPJ): <strong className="text-[color:var(--pm-text)]">{CHAVE_PIX}</strong>
            </p>
            <p className="text-[color:var(--pm-muted)]">
              Favorecido: Prime Motors Comércio de Veículos LTDA
            </p>
          </div>
        )}

        {/* RF11 */}
        {forma === "boleto" && (
          <div className="mt-3 rounded-xl border border-[color:var(--pm-border)] p-3 text-xs">
            <p className="font-semibold">Boleto bancário</p>
            <p className="mt-1 text-[color:var(--pm-muted)]">
              A linha digitável será gerada na confirmação da compra. Vencimento em 3
              dias úteis.
            </p>
          </div>
        )}
      </Secao>

      {/* RN09 — resumo */}
      <Secao titulo="Resumo da compra" Icone={FileText}>
        <dl className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <dt className="text-[color:var(--pm-muted)]">Veículo</dt>
            <dd className="font-semibold">
              {veiculo.marca} {veiculo.modelo}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[color:var(--pm-muted)]">Preço</dt>
            <dd className="font-semibold">{moedaCheia(veiculo.preco)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[color:var(--pm-muted)]">Frete</dt>
            <dd className="font-semibold">{moedaCheia(frete)}</dd>
          </div>
          <div className="mt-2 flex justify-between border-t border-[color:var(--pm-border)] pt-2 text-sm">
            <dt className="font-bold">Total</dt>
            <dd className="font-extrabold text-[color:var(--pm-primary-2)]">
              {moedaCheia(total)}
            </dd>
          </div>
        </dl>
      </Secao>

      {erro && (
        <p className="mb-3 rounded-lg border border-[color:var(--pm-danger)]/40 bg-[color:var(--pm-danger)]/10 px-3 py-2 text-xs text-[color:var(--pm-danger)]">
          {erro}
        </p>
      )}

      <div className="space-y-2 pb-4">
        <button onClick={finalizar} className="pm-btn pm-btn-primary w-full">
          <ShoppingCart size={18} /> Confirmar Compra
        </button>
        <a
          href="https://wa.me/5544999999999"
          target="_blank"
          rel="noopener noreferrer"
          className="pm-btn pm-btn-success w-full"
        >
          <MessageCircle size={18} /> Falar com Especialista
        </a>
        <p className="flex items-center justify-center gap-1 text-center text-[10px] text-[color:var(--pm-muted)]">
          <CheckCircle2 size={12} /> Compra protegida — dados tratados conforme a LGPD
        </p>
      </div>
    </>
  );
}
