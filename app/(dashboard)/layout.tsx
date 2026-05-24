import AppNavbar from "@/components/layout/AppNavbar";
import AppSidebar from "@/components/layout/AppSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AppNavbar />
      <AppSidebar />
      <main className="ml-64 pt-16">
        <div className="min-h-[calc(100vh-4rem)] p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
