import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/store";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Prime Motors — Sistema de Compra de Veículos",
  description:
    "Trabalho de Engenharia de Software (ADS1) — plataforma de concessionária para exibição, reserva, compra e agendamento de veículos.",
};

/**
 * Aplica o tema salvo (claro/escuro) antes da página desenhar, para não
 * piscar o tema errado por uma fração de segundo. Roda só no navegador do
 * usuário: lê a própria preferência dele, nada é enviado para fora.
 */
const SCRIPT_TEMA = `
  try {
    var tema = localStorage.getItem("primemotors:tema");
    if (tema === "claro") document.documentElement.dataset.theme = "claro";
  } catch (e) {}
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body className="min-h-full font-sans">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
