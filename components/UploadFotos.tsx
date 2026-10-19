"use client";

/**
 * Upload de fotos do veículo.
 * As imagens são redimensionadas no próprio navegador (canvas) antes de virarem
 * data URL, para não estourar a cota do localStorage.
 */

import { useRef, useState } from "react";
import { ImagePlus, Star, Trash2 } from "lucide-react";

const LARGURA_MAX = 1000;
const QUALIDADE = 0.72;
const MAX_FOTOS = 6;

function redimensionar(arquivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onerror = () => reject(new Error("Falha ao ler o arquivo."));
    leitor.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Arquivo de imagem inválido."));
      img.onload = () => {
        const escala = Math.min(1, LARGURA_MAX / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * escala);
        canvas.height = Math.round(img.height * escala);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas indisponível."));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", QUALIDADE));
      };
      img.src = leitor.result as string;
    };
    leitor.readAsDataURL(arquivo);
  });
}

export function UploadFotos({
  fotos,
  aoMudar,
}: {
  fotos: string[];
  aoMudar: (fotos: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function selecionar(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivos = Array.from(e.target.files ?? []);
    if (arquivos.length === 0) return;
    setErro("");
    setCarregando(true);
    try {
      const novas: string[] = [];
      for (const arquivo of arquivos) {
        if (!arquivo.type.startsWith("image/")) continue;
        novas.push(await redimensionar(arquivo));
      }
      aoMudar([...fotos, ...novas].slice(0, MAX_FOTOS));
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao processar a imagem.");
    } finally {
      setCarregando(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const remover = (i: number) => aoMudar(fotos.filter((_, idx) => idx !== i));

  const definirCapa = (i: number) =>
    aoMudar([fotos[i], ...fotos.filter((_, idx) => idx !== i)]);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="pm-label mb-0">
          Fotos do veículo ({fotos.length}/{MAX_FOTOS})
        </label>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={carregando || fotos.length >= MAX_FOTOS}
          className="pm-btn pm-btn-primary px-3 py-1 text-xs"
        >
          <ImagePlus size={14} />
          {carregando ? "Processando…" : "Adicionar fotos"}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={selecionar}
        className="hidden"
      />

      {erro && (
        <p className="mb-2 text-xs text-[color:var(--pm-danger)]">{erro}</p>
      )}

      {fotos.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-28 w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[color:var(--pm-border)] text-xs text-[color:var(--pm-muted)] hover:bg-[color:var(--pm-surface-2)]"
        >
          <ImagePlus size={22} />
          Clique para escolher as fotos do veículo
        </button>
      ) : (
        <ul className="grid grid-cols-3 gap-2">
          {fotos.map((foto, i) => (
            <li
              key={i}
              className="group relative overflow-hidden rounded-xl border border-[color:var(--pm-border)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={foto}
                alt={`Foto ${i + 1} do veículo`}
                className="h-20 w-full object-contain"
              />
              {i === 0 && (
                <span className="absolute left-1 top-1 rounded bg-[color:var(--pm-primary)] px-1.5 py-0.5 text-[9px] font-bold">
                  CAPA
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-black/60 p-1">
                {i !== 0 && (
                  <button
                    type="button"
                    onClick={() => definirCapa(i)}
                    title="Definir como capa"
                    className="rounded p-1 hover:bg-white/15"
                  >
                    <Star size={13} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => remover(i)}
                  title="Remover foto"
                  className="rounded p-1 text-[color:var(--pm-danger)] hover:bg-white/15"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-1 text-[10px] text-[color:var(--pm-muted)]">
        As imagens são reduzidas automaticamente para até {LARGURA_MAX}px de largura.
      </p>
    </div>
  );
}
