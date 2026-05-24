"use client";

import { Sidebar, Progress } from "flowbite-react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  FileText,
  History,
  Settings,
  CreditCard,
  Zap,
  Shield,
} from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/dashboard",         label: "Dashboard",         icon: LayoutDashboard },
  { href: "/upload",            label: "Upload Resume",     icon: Upload },
  { href: "/job-description",   label: "Job Description",   icon: FileText },
  { href: "/history",           label: "History",           icon: History },
];

const bottomItems = [
  { href: "/pricing",  label: "Upgrade",  icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  const scansUsed = user?.scans_used ?? 0;
  const scansLimit = user?.scans_limit ?? 3;
  const scansPercent = Math.round((scansUsed / scansLimit) * 100);

  return (
    <Sidebar
      aria-label="Main navigation"
      className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
    >
      <Sidebar.Items>
        <Sidebar.ItemGroup>
          {navItems.map(({ href, label, icon: Icon }) => (
            <Sidebar.Item
              key={href}
              href={href}
              icon={Icon}
              className={cn(
                "cursor-pointer",
                pathname === href || pathname.startsWith(href + "/")
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              )}
            >
              {label}
            </Sidebar.Item>
          ))}
        </Sidebar.ItemGroup>

        {/* Scan usage meter */}
        {user?.plan === "free" && (
          <div className="mx-3 my-4 rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                  Scans used
                </span>
              </div>
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                {scansUsed}/{scansLimit}
              </span>
            </div>
            <Progress
              progress={scansPercent}
              size="sm"
              color={scansPercent >= 90 ? "red" : "blue"}
              className="mb-2"
            />
            <a
              href="/pricing"
              className="block text-center text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              Upgrade for unlimited →
            </a>
          </div>
        )}

        <Sidebar.ItemGroup>
          {bottomItems.map(({ href, label, icon: Icon }) => (
            <Sidebar.Item
              key={href}
              href={href}
              icon={Icon}
              className={cn(
                "cursor-pointer",
                pathname === href
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              )}
            >
              {label}
            </Sidebar.Item>
          ))}

          {user?.role === "admin" && (
            <Sidebar.Item
              href="/admin"
              icon={Shield}
              className={cn(
                "cursor-pointer",
                pathname.startsWith("/admin")
                  ? "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              )}
            >
              Admin Panel
            </Sidebar.Item>
          )}
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
}
