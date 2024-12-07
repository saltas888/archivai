import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  isActive: boolean;
}

export function SidebarItem({ icon: Icon, label, href, isActive }: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors",
        isActive
          ? "bg-black text-white"
          : "text-gray-600 hover:text-black hover:bg-gray-100"
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );
}