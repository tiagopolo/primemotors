# -*- coding: utf-8 -*-
"""
Diagrama de Comunicacao - Prime Motors.
Layout em estrela: compra:Compra no centro, demais objetos em raios proprios,
de modo que nenhuma seta cruze outra.
"""
import math

W, H = 1780, 1230
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
    "cliente":     ("cliente:Usuario",         "(Cliente / Comprador)",      300,  180, 300, 80, "verde", "pessoa"),
    "veiculo":     ("veiculo:Veiculo",         "(Estoque da Loja)",          880,  150, 300, 80, "azul", "carro"),
    "admin":       ("admin:Administrador",     "(Equipe da Concessionária)", 1480, 180, 330, 80, "vermelho", "pessoa"),
    "compra":      ("compra:Compra",           "(Registro da Compra)",       880,  600, 310, 84, "amarelo", "lista"),
    "status":      ("status:StatusCompra",     "(Situação do Pedido)",       250,  600, 290, 80, "azul", "check"),
    "entrega":     ("entrega:Entrega",         "(Endereço e Frete)",        1480,  450, 290, 80, "ciano", "caminhao"),
    "agendamento": ("agendamento:Agendamento", "(Data e Horário)",          1480,  740, 300, 80, "ciano", "calendario"),
    "pagamento":   ("pagamento:Pagamento",     "(PIX / Boleto / Cartão)",   1150,  990, 300, 80, "roxo", "cartao"),
    "comprovante": ("comprovante:Comprovante", "(Documento da Compra)",      560,  990, 300, 80, "cinza", "doc"),
}

# (origem, destino, tipo, deslocamento, x_rot, y_rot, ancora, [linhas])
MSG = [
    # --- consulta ao estoque ---
    ("cliente", "veiculo", "chamada", -13, 590, 128, "middle",
     ["1: consultarEstoque()"]),
    ("veiculo", "cliente", "retorno", 13, 590, 222, "middle",
     ["1.1: listarVeiculosDisponiveis()"]),

    # --- o cliente conversa com a compra ---
    ("cliente", "compra", "chamada", 0, 440, 330, "end", [
        "2: iniciarCompra(veiculo, cliente)",
        "3: escolherRecebimento(modalidade)",
        "4: informarAgendamento(data, horario)",
        "5: efetuarPagamento(forma)",
        "6: confirmarCompra()",
    ]),

    # --- compra delega para as entidades ---
    ("compra", "status", "chamada", -15, 575, 500, "middle", [
        "2.1: definirStatus(“Iniciada”)",
        "5.3: alterarStatus(“Paga”)",
        "6.1: alterarStatus(“Concluída”)",
    ]),
    ("status", "compra", "retorno", 15, 575, 665, "middle",
     ["6.1.1: confirmarStatus()"]),

    ("compra", "entrega", "chamada", -13, 1130, 565, "start", [
        "3.1: registrarEndereco(cep, uf)",
        "3.2: calcularFrete()",
    ]),
    ("entrega", "compra", "retorno", 13, 1150, 622, "start",
     ["3.3: informarFrete(valor)"]),

    ("compra", "agendamento", "chamada", -13, 1090, 706, "start",
     ["4.1: agendar(data, horario)"]),
    ("agendamento", "compra", "retorno", 13, 1185, 800, "end",
     ["4.2: confirmarAgendamento()"]),

    ("compra", "pagamento", "chamada", -14, 1010, 840, "end",
     ["5.1: registrarPagamento(", "        forma, valor)"]),
    ("pagamento", "compra", "retorno", 14, 1120, 885, "start",
     ["5.2: confirmarPagamento()"]),

    ("compra", "comprovante", "chamada", 0, 660, 810, "end",
     ["6.2: gerarComprovante(", "        codigo, data)"]),
    ("compra", "veiculo", "chamada", 0, 852, 405, "end",
     ["6.3: alterarStatus(“Vendido”)"]),

    ("comprovante", "cliente", "retorno", 0, 336, 487, "end",
     ["7: notificarCompra(", "     comprovante)"]),

    # --- administrador ---
    ("admin", "veiculo", "chamada", 0, 1170, 128, "middle",
     ["8: gerenciarEstoque()"]),
    ("admin", "compra", "chamada", -13, 1235, 305, "end",
     ["9: acompanharPedidos()"]),
    ("compra", "admin", "retorno", 13, 1195, 350, "end",
     ["9.1: retornarRelatorio()"]),
]

COMO_LER = [
    "1  O cliente consulta o estoque e recebe os veículos disponíveis.",
    "2  Escolhido o carro, ele inicia a compra.",
    "3  Define retirada na loja ou entrega; o sistema calcula o frete.",
    "4  Escolhe a data e o horário do atendimento.",
    "5  Paga por PIX, boleto ou cartão.",
    "6  Confirma a compra: o status vira “Concluída”, o comprovante",
    "     é gerado e o veículo passa a “Vendido”.",
    "7  O comprovante é enviado ao cliente.",
    "8/9  O administrador mantém o estoque e acompanha os pedidos.",
]

REQUISITOS = [
    "RF03 / RF04 – Listagem e detalhamento dos veículos",
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
   f'Ciclo de vida de uma compra · as mensagens seguem a numeração 1, 1.1, 2, 2.1…</text>')

# ---------- setas ----------
rotulos = []
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
    rotulos.append((lx, ly, anc, linhas, retorno))

# rotulos por cima das linhas, com fundo branco para nao embolar
for lx, ly, anc, linhas, retorno in rotulos:
    larg = max(len(t) for t in linhas) * 8.3 + 14
    x0 = lx - larg + 7 if anc == "end" else (lx - larg / 2 if anc == "middle" else lx - 7)
    alt = len(linhas) * 22 + 6
    ad(f'<rect x="{x0:.1f}" y="{ly - 17}" width="{larg:.1f}" height="{alt}" fill="#ffffff" '
       f'opacity="0.93"/>')
    for i, t in enumerate(linhas):
        ad(f'<text x="{lx}" y="{ly + i*22}" text-anchor="{anc}" font-size="15" '
           f'fill="{"#3a3a3a" if retorno else TXT}" '
           f'font-weight="{"400" if t.startswith(" ") else "700"}">{t}</text>')

# ---------- objetos ----------
for nome, desc, cx, cy, w, h, cor, ic in OBJ.values():
    fill, stroke, ci = CORES[cor]
    x, y = cx - w / 2, cy - h / 2
    ad(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="{fill}" '
       f'stroke="{stroke}" stroke-width="2.5"/>')
    ad(icone(ic, x + 18, y + h / 2 - 12, ci))
    ad(f'<text x="{x + 58}" y="{cy - 4}" font-size="17.5" font-weight="700" fill="{TXT}">{nome}</text>')
    ad(f'<text x="{x + 58}" y="{cy + 19}" font-size="13.5" fill="#555">{desc}</text>')

# ---------- caixa: como ler ----------
bx, by, bw = 38, 700, 372
ad(f'<rect x="{bx}" y="{by}" width="{bw}" height="228" rx="8" fill="#f7fbff" '
   f'stroke="#1565c0" stroke-width="1.6"/>')
ad(f'<text x="{bx+18}" y="{by+28}" font-size="14.5" font-weight="700" fill="#1f3864">'
   f'COMO LER O DIAGRAMA</text>')
for i, t in enumerate(COMO_LER):
    ad(f'<text x="{bx+18}" y="{by+54+i*20}" font-size="12.5" fill="#333">{t}</text>')

# ---------- caixa: requisitos ----------
ry = by + 246
ad(f'<rect x="{bx}" y="{ry}" width="{bw}" height="198" rx="6" fill="#ffffff" '
   f'stroke="#666" stroke-width="1.6" stroke-dasharray="6 4"/>')
ad(f'<text x="{bx+18}" y="{ry+28}" font-size="14.5" font-weight="700" fill="{TXT}">'
   f'PRINCIPAIS REQUISITOS ATENDIDOS</text>')
for i, r in enumerate(REQUISITOS):
    ad(f'<text x="{bx+18}" y="{ry+54+i*18}" font-size="12.5" fill="#333">• {r}</text>')

# ---------- legenda de notacao ----------
ly0 = H - 42
ad(f'<line x1="470" y1="{ly0}" x2="536" y2="{ly0}" stroke="#1a1a1a" stroke-width="2" '
   f'marker-end="url(#ap)"/>')
ad(f'<text x="548" y="{ly0+5}" font-size="13.5" fill="#333">chamada de mensagem</text>')
ad(f'<line x1="790" y1="{ly0}" x2="856" y2="{ly0}" stroke="#5a5a5a" stroke-width="2" '
   f'stroke-dasharray="8 5" marker-end="url(#ar)"/>')
ad(f'<text x="868" y="{ly0+5}" font-size="13.5" fill="#333">retorno / resposta</text>')

ad("</svg>")
svg = "\n".join(p)
open("diagrama-comunicacao-pm.svg", "w", encoding="utf-8").write(svg)

import cairosvg
cairosvg.svg2png(bytestring=svg.encode("utf-8"),
                 write_to="diagrama-comunicacao-pm.png", scale=2)
print("comunicacao ok")
