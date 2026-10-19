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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
