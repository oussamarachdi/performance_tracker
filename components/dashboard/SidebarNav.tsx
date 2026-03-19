'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Building2, ShoppingBag, Home } from 'lucide-react';

const navItems = [
  {
    label: 'Overview',
    href: '/',
    icon: Home,
  },
  {
    label: 'Departments',
    href: '/departments',
    icon: BarChart3,
  },
  {
    label: 'Universities',
    href: '/universities',
    icon: Building2,
  },
  {
    label: 'Products',
    href: '/products',
    icon: ShoppingBag,
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col">
      {/* Logo/Title */}
      <div className="p-6 border-b border-sidebar-border bg-gradient-to-b from-sidebar to-sidebar/80">
      <div className="flex items-center gap-3">
        <img src={'/logo.png'} alt="Campaign Tracker" className="w-24 h-24" />
        <h1 className="text-xl font-bold tracking-tight">Campaign Tracker</h1>
        </div>
        <p className="text-xs text-sidebar-foreground/60 mt-2">Physical Campaigns Analytics</p>
      </div>

      {/* Navigation */}  
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-md transition-all duration-200 ${
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border bg-sidebar/50 text-xs text-sidebar-foreground/50">
        <p>v1.0.0</p>
      </div>
    </aside>
  );
}
