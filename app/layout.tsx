import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Suivi des revenus en portage",
  description: "Outil personnel de suivi des revenus en portage salarial"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
