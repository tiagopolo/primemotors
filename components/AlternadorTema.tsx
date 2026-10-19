"use client";

/**
 * Alternador de tema (claro/escuro) — melhoria pedida pelo professor.
 * Mostra sol no tema escuro (clique para clarear) e lua no tema claro
 * (clique para escurecer), no canto superior direito do cabeçalho.
 *
 * A troca só altera o atributo data-theme no <html>; as cores em si estão
 * em app/globals.css, e é lá também que o CSS decide qual dos dois ícones
 * aparece (ver ".pm-icone-sol" / ".pm-icone-lua"). Assim o botão não precisa
 * de estado React nem de useEffect: não há risco de mostrar o ícone errado
 * por uma fração de segundo ao carregar a página.
 *
 * A escolha fica salva no navegador (localStorage) e é aplicada antes da
 * tela desenhar, pelo script em app/layout.tsx.
 */

import { Moon, Sun } from "lucide-react";

const CHAVE_TEMA = "primemotors:tema";

function alternar() {
  const atual = document.documentElement.dataset.theme === "claro" ? "claro" : "escuro";
  const novo = atual === "escuro" ? "claro" : "escuro";
  document.documentElement.dataset.theme = novo;
  try {
    window.localStorage.setItem(CHAVE_TEMA, novo);
  } catch {
    /* navegador sem localStorage (modo privado): a escolha vale só nesta visita */
  }
}

export function AlternadorTema() {
  return (
    <button
      onClick={alternar}
      aria-label="Mudar entre tema claro e escuro"
      title="Mudar tema"
      className="rounded-lg p-2 hover:bg-[color:var(--pm-surface-2)]"
    >
      <Sun size={20} className="pm-icone-sol" />
      <Moon size={20} className="pm-icone-lua" />
    </button>
  );
}
