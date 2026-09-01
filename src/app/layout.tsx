import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Validador de Perfil & Gerador de Importa VAR",
  description: "Automação de De-Para e Conciliação TOTVS RM & VAR",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen bg-background font-sans antialiased selection:bg-zinc-800 selection:text-white">
        {children}
      </body>
    </html>
  );
}
