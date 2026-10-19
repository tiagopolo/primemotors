"use client";

/** Gráfico de linha em SVG puro — sem biblioteca externa. */

export function GraficoLinha({
  dados,
  campo,
  altura = 150,
}: {
  dados: { mes: string; vendas: number; faturamento: number }[];
  campo: "vendas" | "faturamento";
  altura?: number;
}) {
  const largura = 320;
  const padTop = 10;
  const padBottom = 22;
  const padLeft = 34;
  const valores = dados.map((d) => d[campo]);
  const max = Math.max(...valores) * 1.1;
  const min = 0;

  const x = (i: number) =>
    padLeft + (i * (largura - padLeft - 8)) / Math.max(dados.length - 1, 1);
  const y = (v: number) =>
    padTop + (1 - (v - min) / (max - min)) * (altura - padTop - padBottom);

  const linha = dados.map((d, i) => `${x(i)},${y(d[campo])}`).join(" ");
  const area = `${padLeft},${altura - padBottom} ${linha} ${x(dados.length - 1)},${altura - padBottom}`;

  const rotuloEixo = (v: number) =>
    campo === "faturamento"
      ? `${(v / 1_000_000).toFixed(1)}M`
      : String(Math.round(v));

  return (
    <svg
      viewBox={`0 0 ${largura} ${altura}`}
      className="w-full"
      role="img"
      aria-label={`Gráfico de ${campo} por mês`}
    >
      {[0, 0.25, 0.5, 0.75, 1].map((f) => {
        const v = min + f * (max - min);
        return (
          <g key={f}>
            <line
              x1={padLeft}
              x2={largura - 4}
              y1={y(v)}
              y2={y(v)}
              stroke="#1e3a6e"
              strokeWidth="0.5"
            />
            <text x={2} y={y(v) + 3} fontSize="7" fill="#8aa0c8">
              {rotuloEixo(v)}
            </text>
          </g>
        );
      })}

      <polygon points={area} fill="#1d6ef5" opacity="0.15" />
      <polyline
        points={linha}
        fill="none"
        stroke="#3b8dff"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {dados.map((d, i) => (
        <g key={d.mes}>
          <circle cx={x(i)} cy={y(d[campo])} r="3" fill="#3b8dff" />
          <text
            x={x(i)}
            y={altura - 6}
            fontSize="7.5"
            fill="#8aa0c8"
            textAnchor="middle"
          >
            {d.mes}
          </text>
        </g>
      ))}
    </svg>
  );
}
