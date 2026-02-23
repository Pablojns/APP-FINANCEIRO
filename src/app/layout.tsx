import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinanceApp - Controle Financeiro",
  description: "Gerencie suas finanças pessoais com facilidade",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
