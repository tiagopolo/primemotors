# -*- coding: utf-8 -*-
"""Diagrama de Comunicacao - Prime Motors (estilo do material do professor)."""
import math

W, H = 1720, 1180
AZUL_TIT = "#1f3864"
TXT = "#1a1a1a"

CORES = {
    "verde":    ("#e8f5e9", "#2e7d32", "#2e7d32"),
    "amarelo":  ("#fff8e1", "#f5a623", "#f5a623"),
    "azul":     ("#e3f2fd", "#1565c0", "#1565c0"),
    "roxo":     ("#f3e5f5", "#7b1fa2", "#7b1fa2"),
    "ciano":    ("#e0f7fa", "#00838f", "#00838f"),
    "cinza":    ("#eceff1", "#546e7a", "#546e7a"),
    "vermelho": ("#ffebee", "#c62828", "#c62828"),
}

# chave: (instancia:Classe, descricao, cx, cy, w, h, cor, icone)
OBJ = {
    "cliente":     ("cliente:Usuario",         "(Cliente / Comprador)",      300,  170, 300, 80, "verde", "pessoa"),
    "veiculo":     ("veiculo:Veiculo",         "(Estoque da Loja)",         1380,  170, 300, 80, "azul", "carro"),
    "compra":      ("compra:Compra",           "(Registro da Compra)",       840,  560, 300, 80, "amarelo", "lista"),
    "status":      ("status:StatusCompra",     "(Situação do Pedido)",       250,  560, 300, 80, "azul", "check"),
    "entrega":     ("entrega:Entrega",         "(Endereço e Frete)",        1250,  380, 290, 80, "ciano", "caminhao"),
    "agendamento": ("agendamento:Agendamento", "(Data e Horário)",          1250,  700, 300, 80, "ciano", "calendario"),
    "pagamento":   ("pagamento:Pagamento",     "(PIX / Boleto / Cartão)",    900,  910, 300, 80, "roxo", "cartao"),
    "comprovante": ("comprovante:Comprovante", "(Documento da Compra)",      560,  900, 300, 80, "cinza", "doc"),
    "admin":       ("admin:Administrador",     "(Equipe da Concessionária)", 1470, 1010, 320, 80, "vermelho", "pessoa"),
}

# (origem, destino, tipo, deslocamento, x_rot, y_rot, ancora, [linhas])
MSG = [
    ("cliente", "veiculo", "chamada", -16, 840, 118, "middle",
     ["1: consultarEstoque()"]),
    ("veiculo", "cliente", "retorno", 16, 840, 232, "middle",
     ["1.1: listarVeiculosDisponiveis()"]),

    ("cliente", "compra", "chamada", 0, 430, 300, "end", [
        "2: iniciarCompra(veiculo, cliente)",
        "3: escolherRecebimento(modalidade)",
        "4: informarAgendamento(data, horario)",
        "5: efetuarPagamento(forma)",
        "6: confirmarCompra()",
    ]),

    ("compra", "entrega", "chamada", -14, 1090, 430, "middle", [
        "3.1: registrarEndereco(cep, uf)",
        "3.2: calcularFrete()",
    ]),
    ("entrega", "compra", "retorno", 14, 1210, 545, "middle",
     ["3.3: informarFrete(valor)"]),

    ("compra", "agendamento", "chamada", 14, 930, 750, "middle",
     ["4.1: agendar(data, horario)"]),
    ("agendamento", "compra", "retorno", -14, 1250, 600, "middle",
     ["4.2: confirmarAgendamento()"]),

    ("compra", "pagamento", "chamada", -16, 810, 745, "end",
     ["5.1: registrarPagamento(", "        forma, valor)"]),
    ("pagamento", "compra", "retorno", 16, 960, 765, "start",
     ["5.2: confirmarPagamento()"]),

    ("compra", "status", "chamada", -16, 545, 462, "middle", [
        "2.1: definirStatus(“Iniciada”)",
        "5.3: alterarStatus(“Paga”)",
        "6.1: alterarStatus(“Concluída”)",
    ]),
    ("status", "compra", "retorno", 16, 545, 622, "middle",
     ["6.1.1: confirmarStatus()"]),

    ("compra", "comprovante", "chamada", 0, 760, 800, "middle",
     ["6.2: gerarComprovante(codigo, data)"]),
    ("compra", "veiculo", "chamada", 0, 1000, 330, "middle",
     ["6.3: alterarStatus(“Vendido”)"]),

    ("comprovante", "cliente", "retorno", 0, 392, 468, "end",
     ["7: notificarCompra(", "     comprovante)"]),

    ("admin", "veiculo", "chamada", 0, 1390, 840, "end",
     ["8: gerenciarEstoque()"]),
    ("admin", "compra", "chamada", -14, 1250, 895, "middle",
     ["9: acompanharPedidos()"]),
    ("compra", "admin", "retorno", 14, 1270, 955, "middle",
     ["9.1: retornarRelatorio()"]),
]

REQUISITOS = [
    "RF03 – Listagem dos veículos disponíveis",
    "RF04 – Detalhamento do veículo",
    "RF05 / RF06 – Início da compra e dados do cliente",
    "RF07 / RF08 – Retirada ou entrega e cálculo do frete",
    "RF09 – Agendamento de data e horário",
    "RF10 a RF14 – Pagamento e registro do status",
    "RF15 – Geração do comprovante",
    "RF16 / RF17 – Administração do estoque e dos pedidos",
    "RF18 – Veículo alterado para vendido",
]


def icone(tipo, x, y, cor):
    g = [f'<g stroke="{cor}" fill="none" stroke-width="2" stroke-linecap="round" '
         f'stroke-linejoin="round" transform="translate({x},{y})">']
    if tipo == "pessoa":
        g.append(f'<circle cx="11" cy="7" r="5" fill="{cor}" stroke="none"/>')
        g.append(f'<path d="M2 22c0-5 4-8 9-8s9 3 9 8" fill="{cor}" stroke="none"/>')
    elif tipo == "carro":
        g.append('<path d="M2 16h20M4 16v-4l3-5h8l3 5v4"/>')
        g.append(f'<circle cx="7" cy="18" r="2.5" fill="{cor}" stroke="none"/>')
        g.append(f'<circle cx="17" cy="18" r="2.5" fill="{cor}" stroke="none"/>')
    elif tipo == "lista":
        g.append('<rect x="2" y="3" width="20" height="19" rx="3"/>')
        g.append('<path d="M7 9h10M7 13h10M7 17h6"/>')
    elif tipo == "check":
        g.append('<rect x="3" y="3" width="18" height="18" rx="4"/>')
        g.append('<path d="M7.5 12.5l3 3 6-6"/>')
    elif tipo == "caminhao":
        g.append('<path d="M2 7h11v10H2zM13 10h4l4 4v3h-8z"/>')
        g.append(f'<circle cx="7" cy="19" r="2" fill="{cor}" stroke="none"/>')
        g.append(f'<circle cx="17" cy="19" r="2" fill="{cor}" stroke="none"/>')
    elif tipo == "calendario":
        g.append('<rect x="3" y="5" width="18" height="16" rx="3"/>')
        g.append('<path d="M3 10h18M8 3v4M16 3v4"/>')
    elif tipo == "cartao":
        g.append('<rect x="2" y="5" width="20" height="14" rx="3"/>')
        g.append('<path d="M2 10h20M6 15h4"/>')
    elif tipo == "doc":
        g.append('<path d="M6 2h8l5 5v15H6z"/>')
        g.append('<path d="M14 2v5h5M9 12h7M9 16h7"/>')
    g.append("</g>")
    return "".join(g)


def borda(cx, cy, w, h, ax, ay):
    dx, dy = ax - cx, ay - cy
    esc = float("inf")
    if dx:
        esc = min(esc, (w / 2 + 8) / abs(dx))
    if dy:
        esc = min(esc, (h / 2 + 8) / abs(dy))
    return cx + dx * esc, cy + dy * esc


p = []
ad = p.append
ad(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" '
   f'height="{H}" font-family="DejaVu Sans, Segoe UI, Arial, sans-serif">')
ad('<defs>'
   '<marker id="ap" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" '
   'orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#1a1a1a"/></marker>'
   '<marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" '
   'orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#5a5a5a"/></marker>'
   '</defs>')
ad(f'<rect width="{W}" height="{H}" fill="#ffffff"/>')

ad(f'<text x="{W/2}" y="46" text-anchor="middle" font-size="27" font-weight="700" '
   f'fill="{AZUL_TIT}">DIAGRAMA DE COMUNICAÇÃO – PRIME MOTORS (Sistema de Compra de Veículos)</text>')
ad(f'<text x="{W/2}" y="74" text-anchor="middle" font-size="16" fill="#444">'
   f'Visão completa do ciclo de vida de uma compra de veículo</text>')

for orig, dest, tipo, desl, lx, ly, anc, linhas in MSG:
    _, _, ox, oy, ow, oh, _, _ = OBJ[orig]
    _, _, dx_, dy_, dw, dh, _, _ = OBJ[dest]
    x1, y1 = borda(ox, oy, ow, oh, dx_, dy_)
    x2, y2 = borda(dx_, dy_, dw, dh, ox, oy)
    if desl:
        ang = math.atan2(y2 - y1, x2 - x1)
        nx, ny = -math.sin(ang) * desl, math.cos(ang) * desl
        x1, y1, x2, y2 = x1 + nx, y1 + ny, x2 + nx, y2 + ny
    retorno = tipo == "retorno"
    tracejado = ' stroke-dasharray="8 5"' if retorno else ""
    cor = "#5a5a5a" if retorno else "#1a1a1a"
    ad(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{cor}" '
       f'stroke-width="2"{tracejado} marker-end="url(#{"ar" if retorno else "ap"})"/>')
    for i, t in enumerate(linhas):
        ad(f'<text x="{lx}" y="{ly + i*22}" text-anchor="{anc}" font-size="15" '
           f'fill="{"#3a3a3a" if retorno else TXT}" '
           f'font-weight="{"700" if not t.startswith(" ") else "400"}">{t}</text>')

for nome, desc, cx, cy, w, h, cor, ic in OBJ.values():
    fill, stroke, ci = CORES[cor]
    x, y = cx - w / 2, cy - h / 2
    ad(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="{fill}" '
       f'stroke="{stroke}" stroke-width="2.5"/>')
    ad(icone(ic, x + 18, y + h / 2 - 12, ci))
    ad(f'<text x="{x + 58}" y="{cy - 4}" font-size="17.5" font-weight="700" fill="{TXT}">{nome}</text>')
    ad(f'<text x="{x + 58}" y="{cy + 19}" font-size="13.5" fill="#555">{desc}</text>')

bx, by, bw, bh = 40, H - 232, 480, 210
ad(f'<rect x="{bx}" y="{by}" width="{bw}" height="{bh}" rx="6" fill="#ffffff" '
   f'stroke="#666" stroke-width="1.6" stroke-dasharray="6 4"/>')
ad(f'<text x="{bx+22}" y="{by+30}" font-size="14.5" font-weight="700" fill="{TXT}">'
   f'PRINCIPAIS REQUISITOS ATENDIDOS</text>')
for i, r in enumerate(REQUISITOS):
    ad(f'<text x="{bx+22}" y="{by+56+i*18}" font-size="12.5" fill="#333">• {r}</text>')

ly0 = H - 100
ad(f'<line x1="600" y1="{ly0}" x2="666" y2="{ly0}" stroke="#1a1a1a" stroke-width="2" '
   f'marker-end="url(#ap)"/>')
ad(f'<text x="678" y="{ly0+5}" font-size="13.5" fill="#333">chamada de mensagem</text>')
ad(f'<line x1="600" y1="{ly0+30}" x2="666" y2="{ly0+30}" stroke="#5a5a5a" stroke-width="2" '
   f'stroke-dasharray="8 5" marker-end="url(#ar)"/>')
ad(f'<text x="678" y="{ly0+35}" font-size="13.5" fill="#333">retorno / resposta</text>')

ad("</svg>")
svg = "\n".join(p)
open("diagrama-comunicacao-pm.svg", "w", encoding="utf-8").write(svg)

import cairosvg
cairosvg.svg2png(bytestring=svg.encode("utf-8"),
                 write_to="diagrama-comunicacao-pm.png", scale=2)
print("comunicacao ok")
