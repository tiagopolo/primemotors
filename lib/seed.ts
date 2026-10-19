import type { Usuario, Veiculo } from "./types";
import { hashSenha } from "./utils";

/** Usuários iniciais - RNF07 (controle de acesso entre cliente e admin) */
export const USUARIOS_INICIAIS: Usuario[] = [
  {
    id: "usr_admin",
    nome: "Tiago Marson Polo",
    email: "admin@primemotors.com",
    telefone: "(44) 99999-9999",
    // hash gerado a partir da senha de teste combinada com o grupo (ver docs/GUIA-HOSPEDAGEM.md)
    senhaHash: "pm$f5505c1f",
    perfil: "admin",
    criadoEm: "2026-01-10T09:00:00.000Z",
  },
  {
    id: "usr_cliente",
    nome: "Anthonny Gabriel Ribeiro",
    email: "cliente@primemotors.com",
    telefone: "(44) 98888-1010",
    senhaHash: "pm$319b164b",
    perfil: "cliente",
    criadoEm: "2026-02-02T09:00:00.000Z",
  },
  {
    // usuário técnico usado pela opção "Entrar como visitante".
    // Existe no banco para a compra ter um dono (FK de compra.usuario_id).
    id: "usr_visitante",
    nome: "Visitante",
    email: "visitante@primemotors.com",
    telefone: "",
    senhaHash: hashSenha(""), // sem senha: não é possível entrar por e-mail
    perfil: "cliente",
    criadoEm: "2026-01-10T09:00:00.000Z",
  },
];

/**
 * Estoque inicial — nesta versão a Prime Motors trabalha exclusivamente
 * com veículos ZERO KM, então todos têm quilometragem 0.
 */
export const VEICULOS_INICIAIS: Veiculo[] = [
  {
    id: "vei_001",
    modelo: "Corolla XEI",
    marca: "Toyota",
    ano: 2026,
    quilometragem: 0,
    preco: 129900,
    cor: "Branco Pérola",
    cambio: "CVT",
    combustivel: "Flex",
    carroceria: "Sedã",
    motor: "2.0 Dynamic Force",
    potencia: "177 cv",
    descricao:
      "Sedã completo zero quilômetro, com central multimídia, bancos em couro e pacote de segurança Toyota Safety Sense.",
    opcionais: ["Central multimídia", "Bancos em couro", "Piloto automático", "Câmera de ré"],
    fotos: [
      "/veiculos/sf/corolla-1.png",
      "/veiculos/sf/corolla-3.png",
      "/veiculos/corolla-2.jpg",
    ],
    status: "disponivel",
    cardCor: "#cfd6e6",
    criadoEm: "2026-04-01T12:00:00.000Z",
  },
  {
    id: "vei_002",
    modelo: "Revuelto",
    marca: "Lamborghini",
    ano: 2026,
    quilometragem: 0,
    preco: 6990000,
    cor: "Laranja Arancio",
    cambio: "Automático",
    combustivel: "Híbrido",
    carroceria: "Cupê",
    motor: "V12 6.5L",
    potencia: "1.015 cv",
    descricao:
      "O ápice da engenharia, zero quilômetro. Performance sem limites com motor V12 aspirado combinado a três motores elétricos.",
    opcionais: ["Interior couro premium", "Modo Corsa", "Freios carbono-cerâmica", "Escape esportivo"],
    fotos: [
      "/veiculos/sf/revuelto-2.png",
      "/veiculos/revuelto-1.jpg",
      "/veiculos/revuelto-3.jpg",
    ],
    status: "disponivel",
    cardCor: "#ff6a1f",
    criadoEm: "2026-04-03T12:00:00.000Z",
  },
  {
    id: "vei_003",
    modelo: "Seal",
    marca: "BYD",
    ano: 2026,
    quilometragem: 0,
    preco: 129900,
    cor: "Azul Atlântico",
    cambio: "Automático",
    combustivel: "Elétrico",
    carroceria: "Sedã",
    motor: "Elétrico AWD",
    potencia: "530 cv",
    descricao:
      "Sedã elétrico zero quilômetro de alta performance, autonomia de 570 km e carregamento rápido em 30 minutos.",
    opcionais: ["Teto solar panorâmico", "Head-up display", "Som Dynaudio", "Piloto adaptativo"],
    fotos: [
      "/veiculos/seal-1.webp",
      "/veiculos/seal-2.webp",
      "/veiculos/seal-3.jpg",
    ],
    status: "disponivel",
    cardCor: "#1f6fff",
    criadoEm: "2026-04-05T12:00:00.000Z",
  },
  {
    id: "vei_004",
    modelo: "EX30",
    marca: "Volvo",
    ano: 2026,
    quilometragem: 0,
    preco: 249900,
    cor: "Cinza Vapour",
    cambio: "Automático",
    combustivel: "Elétrico",
    carroceria: "SUV",
    motor: "Elétrico Single Motor",
    potencia: "272 cv",
    descricao:
      "SUV elétrico compacto zero quilômetro, com o melhor pacote de segurança da categoria e interior sustentável.",
    opcionais: ["Park Pilot Assist", "Som Harman Kardon", "Carregador sem fio"],
    fotos: [
      "/veiculos/ex30-1.jpg",
      "/veiculos/ex30-2.jpg",
      "/veiculos/ex30-3.jpg",
    ],
    status: "disponivel",
    cardCor: "#9aa4b2",
    criadoEm: "2026-04-08T12:00:00.000Z",
  },
  {
    id: "vei_005",
    modelo: "Hilux SRX",
    marca: "Toyota",
    ano: 2026,
    quilometragem: 0,
    preco: 329900,
    cor: "Prata Metálico",
    cambio: "Automático",
    combustivel: "Diesel",
    carroceria: "Picape",
    motor: "2.8 Turbo Diesel",
    potencia: "204 cv",
    descricao:
      "Picape 4x4 zero quilômetro, pronta entrega, com garantia de fábrica de 3 anos.",
    opcionais: ["Tração 4x4", "Capota marítima", "Estribos laterais"],
    fotos: [
      "/veiculos/sf/hilux-1.png",
      "/veiculos/hilux-2.jpg",
      "/veiculos/hilux-3.jpg",
    ],
    status: "disponivel",
    cardCor: "#b9c0cc",
    criadoEm: "2026-04-11T12:00:00.000Z",
  },
  {
    id: "vei_006",
    modelo: "Compass Limited",
    marca: "Jeep",
    ano: 2026,
    quilometragem: 0,
    preco: 168900,
    cor: "Preto Carbon",
    cambio: "Automático",
    combustivel: "Flex",
    carroceria: "SUV",
    motor: "1.3 Turbo T270",
    potencia: "185 cv",
    descricao:
      "SUV familiar zero quilômetro, com teto solar e pacote de assistências ao condutor.",
    opcionais: ["Teto solar", "Bancos em couro", "Sensor de estacionamento"],
    fotos: [
      "/veiculos/compass-1.jpg",
      "/veiculos/compass-2.jpg",
      "/veiculos/compass-3.webp",
    ],
    status: "disponivel",
    cardCor: "#2b2f36",
    criadoEm: "2026-03-20T12:00:00.000Z",
  },
];

/** Unidade usada na modalidade de retirada - RN05 */
export const UNIDADE_LOJA = {
  unidade: "Prime Motors - Matriz Maringá",
  endereco: "Av. Colombo, 5834 - Zona 7, Maringá - PR, 87020-000",
};

/** Série histórica usada nos relatórios */
export const VENDAS_MENSAIS = [
  { mes: "Jan", vendas: 42, faturamento: 5200000 },
  { mes: "Fev", vendas: 55, faturamento: 6100000 },
  { mes: "Mar", vendas: 38, faturamento: 4400000 },
  { mes: "Abr", vendas: 61, faturamento: 7300000 },
  { mes: "Mai", vendas: 74, faturamento: 8900000 },
  { mes: "Jun", vendas: 68, faturamento: 8100000 },
  { mes: "Jul", vendas: 82, faturamento: 9600000 },
  { mes: "Ago", vendas: 71, faturamento: 8450000 },
  { mes: "Set", vendas: 90, faturamento: 10200000 },
  { mes: "Out", vendas: 66, faturamento: 7800000 },
  { mes: "Nov", vendas: 95, faturamento: 11400000 },
  { mes: "Dez", vendas: 125, faturamento: 14900000 },
];
