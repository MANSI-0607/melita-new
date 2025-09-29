import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom"; // ✅ needed for nested routes


export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">

      {/* Mobile header */}
      <header className="lg:hidden bg-card border-b border-border px-4 py-3 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">M</span>
            </div>
            <h1 className="font-semibold text-foreground">Melita Skincare</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="flex h-screen">
        <AppSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 lg:ml-0 overflow-auto">
          <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            {/* ✅ this is where dashboard pages will render */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
