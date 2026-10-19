# -*- coding: utf-8 -*-
"""Diagrama de Sequencia - Prime Motors (estilo do material do professor)."""

AMARELO = "#fff2cc"
BORDA_AM = "#d6b656"
CINZA = "#7f7f7f"
TXT = "#1a1a1a"

PARTICIPANTES = [
    ["Visitante"],
    ["Cliente"],
    ["Administrador"],
    ["Autenticar no", "Sistema"],
    ["Recuperar Senha"],
    ["Consultar", "Estoque"],
    ["Detalhar", "Veículo"],
    ["Realizar Compra"],
    ["Escolher", "Recebimento"],
    ["Agendar Entrega", "ou Retirada"],
    ["Efetuar", "Pagamento"],
    ["Emitir", "Comprovante"],
    ["Gerenciar", "Estoque"],
    ["Gerenciar", "Pedidos"],
    ["Visualizar", "Relatórios"],
]

# (indice origem, indice destino, rotulo, tipo)
# tipo: "assoc" (linha cheia) ou "heranca" (tracejada)
INTERACOES = [
    (0, 3, "associação", "assoc"),
    (0, 5, "associação", "assoc"),
    (0, 6, "associação", "assoc"),
    (1, 0, "herança", "heranca"),
    (1, 3, "associação", "assoc"),
    (1, 4, "associação", "assoc"),
    (1, 7, "associação", "assoc"),
    (1, 8, "associação", "assoc"),
    (1, 9, "associação", "assoc"),
    (1, 10, "associação", "assoc"),
    (1, 11, "associação", "assoc"),
    (2, 1, "herança", "heranca"),
    (2, 12, "associação", "assoc"),
    (2, 13, "associação", "assoc"),
    (2, 14, "associação", "assoc"),
    (11, 1, "", "assoc"),
    (13, 2, "", "assoc"),
]

N = len(PARTICIPANTES)
MARGEM = 60
CAIXA_W = 132
ESPACO = 148
W = MARGEM * 2 + (N - 1) * ESPACO + CAIXA_W
Y_TOPO = 90
CAIXA_H = 56
Y_INICIO = Y_TOPO + CAIXA_H + 42
H_LINHA = 30
Y_FIM = Y_INICIO + len(INTERACOES) * H_LINHA + 40
H = Y_FIM + CAIXA_H + 70


def cx(i):
    return MARGEM + CAIXA_W / 2 + i * ESPACO


p = []
ad = p.append
ad(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" '
   f'height="{H}" font-family="DejaVu Sans, Segoe UI, Arial, sans-serif">')
ad('<defs><marker id="s" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" '
   'markerHeight="9" orient="auto-start-reverse">'
   f'<path d="M0,0 L10,5 L0,10" fill="none" stroke="{CINZA}" stroke-width="1.6"/>'
   '</marker></defs>')
ad(f'<rect width="{W}" height="{H}" fill="#ffffff"/>')

ad(f'<text x="{W/2}" y="40" text-anchor="middle" font-size="26" font-weight="700" '
   f'fill="#1f3864">DIAGRAMA DE SEQUÊNCIA – PRIME MOTORS</text>')
ad(f'<text x="{W/2}" y="66" text-anchor="middle" font-size="15" fill="#555">'
   f'Atores e funcionalidades do Sistema de Compra de Veículos · Engenharia de Software (ADS1)</text>')


def caixa(i, y):
    x = MARGEM + i * ESPACO
    ad(f'<rect x="{x}" y="{y}" width="{CAIXA_W}" height="{CAIXA_H}" rx="6" '
       f'fill="{AMARELO}" stroke="{BORDA_AM}" stroke-width="1.6"/>')
    linhas = PARTICIPANTES[i]
    base = y + CAIXA_H / 2 + (5 if len(linhas) == 1 else -3)
    for k, t in enumerate(linhas):
        ad(f'<text x="{x + CAIXA_W/2}" y="{base + k*15}" text-anchor="middle" '
           f'font-size="12" fill="{TXT}">{t}</text>')


# linhas de vida
for i in range(N):
    ad(f'<line x1="{cx(i)}" y1="{Y_TOPO + CAIXA_H}" x2="{cx(i)}" y2="{Y_FIM}" '
       f'stroke="#333" stroke-width="1.2" stroke-dasharray="6 5"/>')

# mensagens
for k, (a, b, rot, tipo) in enumerate(INTERACOES):
    y = Y_INICIO + k * H_LINHA
    x1, x2 = cx(a), cx(b)
    tracejado = ' stroke-dasharray="6 4"' if tipo == "heranca" else ""
    ad(f'<line x1="{x1}" y1="{y}" x2="{x2}" y2="{y}" stroke="{CINZA}" '
       f'stroke-width="1.3"{tracejado} marker-end="url(#s)"/>')
    if rot:
        mx = (x1 + x2) / 2
        larg = len(rot) * 6.2
        ad(f'<rect x="{mx - larg/2}" y="{y - 11}" width="{larg}" height="14" fill="#ffffff"/>')
        ad(f'<text x="{mx}" y="{y - 1}" text-anchor="middle" font-size="10.5" '
           f'fill="#444">{rot}</text>')

for i in range(N):
    caixa(i, Y_TOPO)
    caixa(i, Y_FIM)

# legenda
ly = H - 44
ad(f'<line x1="{MARGEM}" y1="{ly}" x2="{MARGEM+56}" y2="{ly}" stroke="{CINZA}" '
   f'stroke-width="1.3" marker-end="url(#s)"/>')
ad(f'<text x="{MARGEM+66}" y="{ly+4}" font-size="12" fill="#444">associação — o ator utiliza a funcionalidade</text>')
ad(f'<line x1="{MARGEM+430}" y1="{ly}" x2="{MARGEM+486}" y2="{ly}" stroke="{CINZA}" '
   f'stroke-width="1.3" stroke-dasharray="6 4" marker-end="url(#s)"/>')
ad(f'<text x="{MARGEM+496}" y="{ly+4}" font-size="12" fill="#444">'
   f'herança — o ator herda as funcionalidades do ator anterior</text>')

ad("</svg>")
svg = "\n".join(p)
open("diagrama-sequencia-pm.svg", "w", encoding="utf-8").write(svg)

import cairosvg
cairosvg.svg2png(bytestring=svg.encode("utf-8"),
                 write_to="diagrama-sequencia-pm.png", scale=2)
print("sequencia ok", W, H)
