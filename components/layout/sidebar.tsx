"use client";

import { LayoutDashboard, Users, FileText, Building2, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslations } from 'next-intl';

const menuItems = [
  { icon: LayoutDashboard, label: "navigation.dashboard", href: "/" },
  { icon: Users, label: "navigation.clients", href: "/clients" },
  { icon: FileText, label: "navigation.documents", href: "/documents" },
  { icon: Building2, label: "navigation.organization", href: "/organization" },
  { icon: Settings, label: "navigation.settings", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations();

  return (
    <div className="w-64 border-r bg-white">
      <div className="flex h-16 items-center px-4 border-b">
        <span className="font-semibold">ArcheioAI</span>
      </div>
      <div className="space-y-1 p-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.href}
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-2",
                pathname === item.href && "bg-secondary"
              )}
              asChild
            >
              <Link href={item.href}>
                <Icon className="h-4 w-4" />
                {t(item.label)}
              </Link>
            </Button>
          );
        })}
      </div>
    </div>
  );
}