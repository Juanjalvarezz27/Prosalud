import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  FileText,
  LayoutDashboard,
  Package,
  Palette,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

// Navegación principal compartida entre barra lateral y menú hamburguesa móvil
export const APP_NAV_ITEMS: NavItem[] = [
  {
    id: "panel",
    label: "Panel",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    id: "cotizaciones",
    label: "Cotizar",
    href: "/cotizaciones",
    icon: ClipboardList,
  },
  {
    id: "notas",
    label: "Notas de entrega",
    href: "/notas",
    icon: FileText,
  },
  {
    id: "cobranza",
    label: "Cobranza",
    href: "/cobranza",
    icon: Wallet,
  },
  {
    id: "productos",
    label: "Productos",
    href: "/productos",
    icon: Package,
  },
  {
    id: "clientes",
    label: "Clientes",
    href: "/clientes",
    icon: Users,
  },
  {
    id: "usuarios",
    label: "Usuarios",
    href: "/usuarios",
    icon: ShieldCheck,
    adminOnly: true,
  },
  {
    id: "galeria",
    label: "Componentes",
    href: "/galeria",
    icon: Palette,
    adminOnly: true,
  },
];
