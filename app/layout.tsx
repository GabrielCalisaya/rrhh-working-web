import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "RRHH Working",
  description: "Portal de empleos y gestión de postulaciones para RRHH Working",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full bg-[var(--color-background)] text-[var(--color-text)]">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 md:px-8">
          <Header />
          <main className="flex-1 py-8">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
