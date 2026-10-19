import Image from "next/image";

/**
 * Logo oficial da Prime Motors (public/logo-pm.png).
 * Arquivo em alta resolução (574 x 266) com fundo transparente — o Next.js
 * gera as versões otimizadas para cada tamanho de tela.
 */
const LARGURA_ORIGINAL = 574;
const ALTURA_ORIGINAL = 266;

export function Marca({
  largura = 150,
  className = "",
}: {
  largura?: number;
  className?: string;
}) {
  return (
    <Image
      src="/logo-pm.png"
      alt="Prime Motors — Confiança, Qualidade, Performance"
      width={LARGURA_ORIGINAL}
      height={ALTURA_ORIGINAL}
      priority
      quality={100}
      sizes={`${largura * 2}px`}
      style={{ width: largura, height: "auto" }}
      className={`select-none ${className}`}
    />
  );
}
