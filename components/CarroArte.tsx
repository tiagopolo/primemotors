/**
 * Ilustração vetorial do veículo em perfil lateral, sem fundo.
 * O desenho muda conforme a carroceria (Sedã, Cupê, SUV, Picape) e é pintado
 * com a cor real do carro (campo cardCor), então cada anúncio fica distinto
 * sem depender de fotos externas.
 */

type Silhueta = {
  body: string;
  vidros: string[];
  rodas: [number, number][];
  raio: number;
  vinco: string;
};

const SILHUETAS: Record<string, Silhueta> = {
  seda: {
    body:
      "M26 126 L26 104 C26 95 32 89 43 87 L96 79 L140 45 C149 38 160 34 173 34 " +
      "L253 34 C266 34 277 38 286 45 L330 79 L366 87 C377 89 383 95 383 106 L383 126 Z",
    vidros: [
      "M122 77 L156 50 C161 46 167 44 174 44 L200 44 L200 77 Z",
      "M212 44 L250 44 C258 44 265 47 271 51 L302 77 L212 77 Z",
    ],
    rodas: [
      [112, 126],
      [300, 126],
    ],
    raio: 27,
    vinco: "M40 104 L370 104",
  },
  cupe: {
    body:
      "M22 128 L22 108 C22 99 28 93 39 91 L92 84 L150 50 C162 43 175 40 190 40 " +
      "L246 40 C262 40 277 45 288 54 L336 88 L372 93 C382 95 388 101 388 110 L388 128 Z",
    vidros: [
      "M124 82 L166 54 C172 50 179 48 187 48 L206 48 L206 82 Z",
      "M216 48 L244 48 C254 48 262 51 269 57 L299 82 L216 82 Z",
    ],
    rodas: [
      [110, 128],
      [302, 128],
    ],
    raio: 27,
    vinco: "M36 106 L374 106",
  },
  suv: {
    body:
      "M20 124 L20 84 C20 74 26 68 38 66 L72 62 L104 26 C112 18 123 14 136 14 " +
      "L274 14 C287 14 298 18 306 26 L338 62 L372 66 C384 68 390 74 390 86 L390 124 Z",
    vidros: [
      "M98 60 L128 28 C133 23 139 21 146 21 L196 21 L196 60 Z",
      "M208 21 L266 21 C274 21 281 24 287 30 L314 60 L208 60 Z",
    ],
    rodas: [
      [108, 124],
      [302, 124],
    ],
    raio: 30,
    vinco: "M34 88 L376 88",
  },
  picape: {
    body:
      "M22 128 L22 96 C22 86 28 80 39 78 L80 72 L114 34 C122 26 133 22 146 22 " +
      "L226 22 C236 22 244 27 244 38 L244 74 L388 74 C392 74 394 77 394 82 L394 128 Z",
    vidros: [
      "M104 70 L134 38 C139 33 145 31 152 31 L176 31 L176 70 Z",
      "M188 31 L222 31 C230 31 234 35 234 42 L234 70 L188 70 Z",
    ],
    rodas: [
      [104, 128],
      [312, 128],
    ],
    raio: 30,
    vinco: "M36 96 L240 96",
  },
};

/** Descobre a silhueta a partir do texto da carroceria cadastrada. */
function escolherSilhueta(carroceria?: string): Silhueta {
  const t = (carroceria ?? "").toLowerCase();
  if (t.includes("suv") || t.includes("utilit")) return SILHUETAS.suv;
  if (t.includes("picape") || t.includes("pick")) return SILHUETAS.picape;
  if (t.includes("cup") || t.includes("coup") || t.includes("esport"))
    return SILHUETAS.cupe;
  return SILHUETAS.seda;
}

export function CarroArte({
  cor = "#1f6fff",
  carroceria,
  altura = 120,
  className = "",
}: {
  cor?: string;
  carroceria?: string;
  altura?: number;
  className?: string;
}) {
  const s = escolherSilhueta(carroceria);
  const escuro = "#0b1220";
  const id = `br-${cor.replace("#", "")}-${s.raio}`;

  return (
    <div
      className={`flex w-full items-center justify-center ${className}`}
      style={{ height: altura }}
    >
      <svg
        viewBox="0 0 410 152"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
          </linearGradient>
        </defs>

        {/* sombra projetada no chão */}
        <ellipse cx="205" cy="140" rx="178" ry="8" fill="#000" opacity="0.22" />

        {/* carroceria */}
        <path d={s.body} fill={cor} />
        <path d={s.body} fill={`url(#${id})`} />
        <path
          d={s.body}
          fill="none"
          stroke={escuro}
          strokeWidth="2"
          strokeLinejoin="round"
          opacity="0.55"
        />

        {/* vidros */}
        {s.vidros.map((v, i) => (
          <g key={i}>
            <path d={v} fill={escuro} opacity="0.82" />
            <path d={v} fill="#ffffff" opacity="0.1" />
          </g>
        ))}

        {/* vinco lateral */}
        <path d={s.vinco} stroke="#000" strokeWidth="2" opacity="0.16" fill="none" />

        {/* faróis */}
        <path d="M26 104 L48 101 L48 111 L26 112 Z" fill="#fff8dc" opacity="0.9" />
        <path d="M384 104 L366 101 L366 111 L384 112 Z" fill="#ff5a4d" opacity="0.85" />

        {/* rodas */}
        {s.rodas.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={s.raio} fill={escuro} />
            <circle cx={x} cy={y} r={s.raio - 12} fill="#c9d3e3" />
            <circle cx={x} cy={y} r={s.raio - 18} fill="#8b97ab" />
            <circle cx={x} cy={y} r="4" fill={escuro} />
          </g>
        ))}
      </svg>
    </div>
  );
}
