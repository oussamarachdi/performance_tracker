'use client';

import { SidebarNav } from '@/components/dashboard/SidebarNav';
import { Header } from '@/components/dashboard/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <SidebarNav />
      
      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="container mx-auto px-6 py-6 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
