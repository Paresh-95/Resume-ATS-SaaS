import {
  LayoutDashboard,
  ScanLine,
  Target,
  FileEdit,
  History,
  CreditCard,
} from "lucide-react";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/check", label: "General Check", icon: ScanLine },
  { href: "/dashboard/targeted", label: "Targeted Check", icon: Target },
  { href: "/dashboard/generate", label: "Resume Generator", icon: FileEdit },
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
];
