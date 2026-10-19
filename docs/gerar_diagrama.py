# -*- coding: utf-8 -*-
"""Diagrama de Comunicacao (UML) - fluxo de compra do Prime Motors."""
import math

W, H = 1400, 920

AZUL = "#1d6ef5"
AZUL_ESC = "#0f3d8c"
CINZA = "#64748b"
TXT = "#0f172a"
BORDA = "#94a3b8"

# chave: (nome, cx, cy, largura, altura, estereotipo)
CAIXAS = {
    "cliente":     (":Cliente",           150, 460, 150, 64, "ator"),
    "tela":        (":TelaCompra",         430, 460, 190, 64, "<<boundary>>"),
    "ctrl":        (":ControladorCompra",  760, 460, 215, 64, "<<control>>"),
    "veiculo":     (":Veiculo",            760, 150, 170, 64, "<<entity>>"),
    "compra":      (":Compra",            1180, 200, 170, 64, "<<entity>>"),
    "pagamento":   (":Pagamento",         1180, 620, 180, 64, "<<entity>>"),
    "agendamento": (":Agendamento",        330, 720, 195, 64, "<<entity>>"),
    "comprovante": (":Comprovante",        900, 810, 195, 64, "<<entity>>"),
}

# (origem, destino, x_divisor, y_inicial, [(numero, mensagem), ...])
# numeros ficam alinhados a direita do divisor, mensagens a esquerda dele
LIGACOES = [
    ("cliente", "tela", 235, 322, [
        ("1", "selecionarVeiculo(id)"),
        ("2", "informarDados(cliente)"),
        ("3", "escolherModalidade(m)"),
        ("6", "confirmarCompra()"),
        ("7", "exibirComprovante()  ↩"),
    ]),
    ("tela", "ctrl", 520, 372, [
        ("1.1", "verificarDisponibilidade(id)"),
        ("2.1", "criarCompra(usuario, veiculo)"),
        ("6.1", "finalizarCompra(compra)"),
    ]),
    ("ctrl", "veiculo", 800, 270, [
        ("1.1.1", "consultarStatus()"),
        ("6.1.3", "alterarStatus('vendido')"),
    ]),
    ("ctrl", "compra", 935, 388, [
        ("2.1.1", "registrar(veiculo, valor)"),
        ("3.1", "calcularFrete(cep, uf)"),
        ("6.1.1", "atualizarStatus('concluida')"),
    ]),
    ("pagamento", "compra", 1004, 500, [
        ("5.1", "confirmarPagamento()"),
    ]),
    ("ctrl", "pagamento", 900, 685, [
        ("5", "registrarPagamento(forma, valor)"),
    ]),
    ("ctrl", "agendamento", 620, 640, [
        ("4", "agendar(data, horario)"),
    ]),
    ("ctrl", "comprovante", 940, 748, [
        ("6.1.2", "gerar(codigo, data)"),
    ]),
]


def borda(cx, cy, w, h, ax, ay):
    """Ponto onde a reta ate (ax, ay) cruza a borda do retangulo."""
    dx, dy = ax - cx, ay - cy
    esc = float("inf")
    if dx:
        esc = min(esc, (w / 2 + 4) / abs(dx))
    if dy:
        esc = min(esc, (h / 2 + 4) / abs(dy))
    return cx + dx * esc, cy + dy * esc


p = []
ad = p.append

ad(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
   f'width="{W}" height="{H}" font-family="DejaVu Sans, Segoe UI, Arial, sans-serif">')
ad('<defs>'
   f'<marker id="seta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" '
   f'markerHeight="6.5" orient="auto-start-reverse">'
   f'<path d="M0,0 L10,5 L0,10 z" fill="{AZUL_ESC}"/></marker>'
   '<linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">'
   '<stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#eaf1fc"/>'
   '</linearGradient></defs>')
ad(f'<rect width="{W}" height="{H}" fill="#ffffff"/>')

ad(f'<text x="{W/2}" y="48" text-anchor="middle" font-size="27" font-weight="700" '
   f'fill="{TXT}">Diagrama de Comunicação — Fluxo de Compra de Veículo</text>')
ad(f'<text x="{W/2}" y="76" text-anchor="middle" font-size="14.5" fill="{CINZA}">'
   f'Prime Motors · Engenharia de Software (ADS1) · requisitos RF05 a RF18</text>')

# ---------- linhas e mensagens ----------
for origem, destino, div, y0, msgs in LIGACOES:
    _, ox, oy, ow, oh, _ = CAIXAS[origem]
    _, dx_, dy_, dw, dh, _ = CAIXAS[destino]
    x1, y1 = borda(ox, oy, ow, oh, dx_, dy_)
    x2, y2 = borda(dx_, dy_, dw, dh, ox, oy)
    ad(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" '
       f'stroke="{BORDA}" stroke-width="2"/>')

    mx, my = (x1 + x2) / 2, (y1 + y2) / 2
    ang = math.atan2(y2 - y1, x2 - x1)
    ad(f'<line x1="{mx - math.cos(ang)*15:.1f}" y1="{my - math.sin(ang)*15:.1f}" '
       f'x2="{mx + math.cos(ang)*15:.1f}" y2="{my + math.sin(ang)*15:.1f}" '
       f'stroke="{AZUL_ESC}" stroke-width="3" marker-end="url(#seta)"/>')

    # ligacao tenue entre o bloco de mensagens e o meio da linha
    ad(f'<line x1="{div + 4}" y1="{y0 + (len(msgs) - 1) * 20 + 6}" '
       f'x2="{mx:.1f}" y2="{my:.1f}" stroke="{BORDA}" stroke-width="1" '
       f'stroke-dasharray="3 4" opacity="0.55"/>')

    for i, (num, msg) in enumerate(msgs):
        y = y0 + i * 20
        ad(f'<text x="{div - 8}" y="{y}" text-anchor="end" font-size="13.5" '
           f'font-weight="700" fill="{AZUL}">{num}:</text>')
        ad(f'<text x="{div + 8}" y="{y}" text-anchor="start" font-size="13.5" '
           f'fill="{TXT}">{msg}</text>')

# ---------- caixas ----------
for nome, cx, cy, w, h, est in CAIXAS.values():
    x, y = cx - w / 2, cy - h / 2
    if est == "ator":
        ad(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="32" '
           f'fill="url(#grad)" stroke="{AZUL}" stroke-width="2.5"/>')
        ad(f'<text x="{cx}" y="{cy - 2}" text-anchor="middle" font-size="16.5" '
           f'font-weight="700" fill="{TXT}" text-decoration="underline">{nome}</text>')
        ad(f'<text x="{cx}" y="{cy + 18}" text-anchor="middle" font-size="11" '
           f'fill="{CINZA}">ator</text>')
    else:
        est_txt = est.replace("<", "&lt;").replace(">", "&gt;")
        ad(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="9" '
           f'fill="url(#grad)" stroke="{AZUL_ESC}" stroke-width="2"/>')
        ad(f'<text x="{cx}" y="{cy - 8}" text-anchor="middle" font-size="11" '
           f'fill="{CINZA}">{est_txt}</text>')
        ad(f'<text x="{cx}" y="{cy + 15}" text-anchor="middle" font-size="16.5" '
           f'font-weight="700" fill="{TXT}" text-decoration="underline">{nome}</text>')

# ---------- legenda ----------
lx, ly, lw, lh = 40, H - 112, 400, 94
ad(f'<rect x="{lx}" y="{ly}" width="{lw}" height="{lh}" rx="9" fill="#f8fafc" '
   f'stroke="{BORDA}" stroke-width="1"/>')
ad(f'<text x="{lx+16}" y="{ly+24}" font-size="13" font-weight="700" fill="{TXT}">Legenda</text>')
linhas = [
    "A numeração indica a ordem das mensagens (1, 1.1, 1.1.1…)",
    "&lt;&lt;boundary&gt;&gt; interface · &lt;&lt;control&gt;&gt; controle · &lt;&lt;entity&gt;&gt; entidade",
    "Objetos sublinhados conforme a notação UML de instância",
    "↩ mensagem de retorno ao ator",
]
for i, t in enumerate(linhas):
    ad(f'<text x="{lx+16}" y="{ly+44+i*16}" font-size="11.5" fill="{CINZA}">{t}</text>')

ad("</svg>")

svg = "\n".join(p)
with open("diagrama-comunicacao.svg", "w", encoding="utf-8") as f:
    f.write(svg)

import cairosvg
cairosvg.svg2png(bytestring=svg.encode("utf-8"),
                 write_to="diagrama-comunicacao.png", scale=2)
print("gerado")
