"use client";

import { Navbar, Avatar, Dropdown, DarkThemeToggle } from "flowbite-react";
import { useUser } from "@/hooks/useUser";
import { FileText } from "lucide-react";

export default function AppNavbar() {
  const { user, signOut } = useUser();

  return (
    <Navbar
      fluid
      className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95"
    >
      <Navbar.Brand href="/dashboard">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <span className="self-center whitespace-nowrap text-xl font-bold text-gray-900 dark:text-white">
            ResumeFit <span className="text-blue-600">AI</span>
          </span>
        </div>
      </Navbar.Brand>

      <div className="flex items-center gap-3 md:order-2">
        <DarkThemeToggle />
        {user && (
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar
                alt={user.full_name || user.email}
                placeholderInitials={
                  user.full_name
                    ? user.full_name.charAt(0).toUpperCase()
                    : user.email.charAt(0).toUpperCase()
                }
                rounded
                size="sm"
                className="cursor-pointer ring-2 ring-blue-100 hover:ring-blue-300"
              />
            }
          >
            <Dropdown.Header>
              <span className="block text-sm font-medium text-gray-900 dark:text-white">
                {user.full_name || "User"}
              </span>
              <span className="block truncate text-sm text-gray-500 dark:text-gray-400">
                {user.email}
              </span>
              <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium capitalize text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                {user.plan} plan
              </span>
            </Dropdown.Header>
            <Dropdown.Item href="/dashboard">Dashboard</Dropdown.Item>
            <Dropdown.Item href="/settings">Settings</Dropdown.Item>
            <Dropdown.Item href="/pricing">Upgrade</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={signOut} className="text-red-600 dark:text-red-400">
              Sign out
            </Dropdown.Item>
          </Dropdown>
        )}
      </div>
    </Navbar>
  );
}
