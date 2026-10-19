/**
 * PRIME MOTORS - Modelo de dados
 * Entidades derivadas do documento "Levantamento de Requisitos" (item 8):
 * usuario, veiculo, compra, pagamento, entrega, retirada, agendamento, comprovante.
 */

export type Perfil = "cliente" | "admin";

/** RF01, RF02, RNF07 */
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  /** RNF03 - nunca guardamos a senha em texto puro */
  senhaHash: string;
  perfil: Perfil;
  criadoEm: string;
}

/** RN03 - veiculo vendido sai do estoque disponivel */
export type StatusVeiculo = "disponivel" | "reservado" | "vendido";

/** RF03, RF04, RF16 */
export interface Veiculo {
  id: string;
  modelo: string;
  marca: string;
  ano: number;
  /** Nesta versão a concessionária trabalha apenas com 0 km. */
  quilometragem: 0;
  preco: number;
  cor: string;
  cambio: "Automático" | "Manual" | "CVT";
  combustivel: "Flex" | "Gasolina" | "Diesel" | "Elétrico" | "Híbrido";
  carroceria: string;
  motor: string;
  potencia: string;
  descricao: string;
  opcionais: string[];
  /**
   * Fotos do veículo em base64 (data URL).
   * Ficam no localStorage junto com o registro; ao migrar para o PostgreSQL,
   * viram a tabela imagem_veiculo (id, veiculo_id, url).
   */
  fotos: string[];
  status: StatusVeiculo;
  /** cor de destaque usada no card (o prototipo usa fotos; aqui geramos o visual) */
  cardCor: string;
  criadoEm: string;
  /** Data em que o veículo foi marcado como vendido (RF18) — usada para ordenar o estoque. */
  vendidoEm?: string;
}

/** RF07 */
export type Modalidade = "retirada" | "entrega";

/** RF10 */
export type FormaPagamento = "pix" | "boleto" | "cartao";

/** RF14 */
export type StatusPagamento = "pendente" | "aguardando" | "confirmado";

/** RN11 - historico de status da compra */
export type StatusCompra =
  | "iniciada"
  | "aguardando_pagamento"
  | "paga"
  | "agendada"
  | "concluida";

/** RF07, RN04, RN12 */
export interface Entrega {
  cep: string;
  rua: string;
  numero: string;
  cidade: string;
  uf: string;
  /** RF08 - calculado a partir do endereco */
  valorFrete: number;
}

/** RN05 */
export interface Retirada {
  unidade: string;
  endereco: string;
}

/** RF09, RN06 */
export interface Agendamento {
  data: string;
  horario: string;
}

/** RF10 a RF14, RN07 */
export interface Pagamento {
  forma: FormaPagamento;
  valor: number;
  status: StatusPagamento;
  /** gerado quando a forma for boleto (RF11) */
  linhaDigitavel?: string;
  /** exibido quando a forma for pix (RF12) */
  chavePix?: string;
  /** apenas os 4 ultimos digitos ficam registrados (RF13 + RNF03) */
  cartaoFinal?: string;
  nomeCartao?: string;
  dataPagamento?: string;
}

/** RF15, RN08 */
export interface Comprovante {
  codigo: string;
  emitidoEm: string;
}

/** RF05, RF06, RN02, RN07, RN09 */
export interface Compra {
  id: string;
  usuarioId: string;
  veiculoId: string;
  /** snapshot para o comprovante nao mudar se o veiculo for editado depois */
  veiculoDescricao: string;
  valorVeiculo: number;
  valorFrete: number;
  valorTotal: number;
  modalidade: Modalidade;
  entrega?: Entrega;
  retirada?: Retirada;
  agendamento?: Agendamento;
  pagamento?: Pagamento;
  comprovante?: Comprovante;
  status: StatusCompra;
  /** RN11 - historico rastreavel */
  historico: { status: StatusCompra; em: string }[];
  criadaEm: string;
}

export interface DadosCliente {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
}
