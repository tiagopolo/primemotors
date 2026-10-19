import type { Modalidade, Veiculo } from "./types";

export const moeda = (v: number) =>
  v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });

export const moedaCheia = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const km = (v: number) =>
  v === 0 ? "0 km" : `${v.toLocaleString("pt-BR")} km`;

export const dataBR = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export const dataHoraBR = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const uid = (prefixo: string) =>
  `${prefixo}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

/**
 * RNF03 - hash simples só para fins didáticos.
 * Em produção usaríamos bcrypt/argon2 no servidor.
 */
export function hashSenha(senha: string): string {
  let h = 5381;
  for (let i = 0; i < senha.length; i++) {
    h = (h * 33) ^ senha.charCodeAt(i);
  }
  return `pm$${(h >>> 0).toString(16)}`;
}

/**
 * RF08 / RN12 - o frete depende do endereço informado.
 * Regra didática: base por UF + acréscimo por faixa de CEP.
 */
export function calcularFrete(uf: string, cep: string): number {
  if (!uf) return 0;
  const base: Record<string, number> = {
    PR: 350,
    SP: 900,
    SC: 750,
    RS: 1200,
    MS: 980,
    MG: 1400,
    RJ: 1600,
  };
  const valorBase = base[uf.toUpperCase()] ?? 2200;
  const digitos = cep.replace(/\D/g, "");
  const ajuste = digitos.length === 8 ? (Number(digitos.slice(0, 2)) % 7) * 45 : 0;
  return valorBase + ajuste;
}

/** RN09 - total = veículo + frete (quando aplicável) */
export function calcularTotal(
  veiculo: Pick<Veiculo, "preco">,
  modalidade: Modalidade,
  frete: number,
) {
  return veiculo.preco + (modalidade === "entrega" ? frete : 0);
}

export function mascaraCep(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export function mascaraCpf(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function mascaraTelefone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10)
    return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").trim();
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").trim();
}

export function gerarLinhaDigitavel() {
  const bloco = () => Math.floor(Math.random() * 100000).toString().padStart(5, "0");
  return `34191.${bloco()} ${bloco()}.${bloco()} ${bloco()}.${bloco()} 1 ${Date.now()
    .toString()
    .slice(-14)}`;
}

export const CHAVE_PIX = "12.345.678/0001-90";

export const UFS = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB",
  "PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO",
];
