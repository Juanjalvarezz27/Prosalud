import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { AppToaster } from "@/src/components/ui/toaster";
import "./globals.css";

// Carga optimizada de Poppins sin parpadeos ni peticiones externas en runtime
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "ProSalud Servicios Integrales",
  description: "Sistema administrativo, cotizaciones y notas de entrega de ProSalud.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F4F7F8",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--ps-bg)] font-sans text-[var(--ps-text)] selection:bg-[var(--ps-teal-soft)] selection:text-[var(--ps-teal-800)]">
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
