'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  PieChart, 
  MessageSquare, 
  Ticket, 
  BarChart3, 
  Brain,
  Settings, 
  Users, 
  Shield, 
  Database,
  Menu,
  Sparkles,
  LucideIcon
} from 'lucide-react';

const navigation = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: PieChart
  },
  {
    title: 'Chat & Assistenten',
    href: '/',
    icon: MessageSquare,
    badge: '2'
  },
  {
    title: 'Support & Tickets',
    href: '/tickets',
    icon: Ticket
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3
  },
  {
    title: 'Training',
    href: '/training',
    icon: Brain
  },
  {
    title: 'Branding',
    href: '/branding',
    icon: Sparkles
  }
];

const adminNavigation = [
  {
    title: 'Verwaltung',
    href: '/admin',
    icon: Settings
  },
  {
    title: 'Benutzer',
    href: '/admin/users',
    icon: Users
  },
  {
    title: 'System',
    href: '/admin/system',
    icon: Database
  },
  {
    title: 'Sicherheit',
    href: '/admin/security',
    icon: Shield
  },
  {
    title: 'Konfiguration',
    href: '/admin/config',
    icon: Settings
  }
];

export default function SidebarNavigation() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleConfigClick = () => {
    router.push('/admin/config');
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const NavItem = ({ item }: { item: typeof navigation[0] }) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    
    return (
      <Link href={item.href}>
        <div className={`
          flex items-center gap-3 px-3 py-2.5 rounded-lg
          transition-all duration-normal group relative
          ${active 
            ? 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20' 
            : 'text-text-secondary hover:bg-white/[0.03] hover:text-text-primary'
          }
        `}>
          <Icon className={`w-5 h-5 ${active ? 'text-accent-primary' : 'text-text-muted group-hover:text-text-secondary'}`} />
          <span className="font-medium text-sm">{item.title}</span>
          {item.badge && (
            <span className="ml-auto bg-accent-primary/20 text-accent-primary text-xs px-2 py-0.5 rounded-full">
              {item.badge}
            </span>
          )}
        </div>
      </Link>
    );
  };

  const AdminNavItem = ({ item }: { item: typeof adminNavigation[0] }) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    
    return (
      <Link href={item.href}>
        <div className={`
          flex items-center gap-3 px-3 py-2.5 rounded-lg
          transition-all duration-normal group relative
          ${active 
            ? 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20' 
            : 'text-text-secondary hover:bg-white/[0.03] hover:text-text-primary'
          }
        `}>
          <Icon className={`w-5 h-5 ${active ? 'text-accent-primary' : 'text-text-muted group-hover:text-text-secondary'}`} />
          <span className="font-medium text-sm">{item.title}</span>
        </div>
      </Link>
    );
  };

  return (
    <aside className="w-64 bg-bg-secondary border-r border-border-subtle h-screen">
      {/* Header */}
      <div className="h-16 px-6 flex items-center border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-accent-primary to-accent-purple rounded-lg flex items-center justify-center shadow-lg shadow-accent-primary/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-text-primary">AI Gateway</span>
        </div>
      </div>

      {/* Settings Button */}
      <div className="px-4 py-4">
        <div className="mb-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start gap-2"
            onClick={handleConfigClick}
          >
            <Settings className="w-4 h-4" />
            <span>Einstellungen</span>
          </Button>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="px-4 space-y-1">
        {navigation.map((item) => (
          <NavItem key={item.href} item={item} />
        ))}
      </nav>

      {/* Admin Section */}
      <div className="px-4 mt-6">
        <div className="border-t border-border-subtle pt-4">
          <button
            onClick={() => setShowAdmin(!showAdmin)}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors w-full"
          >
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Administration</span>
            <Menu className={`w-4 h-4 ml-auto transition-transform ${showAdmin ? 'rotate-90' : ''}`} />
          </button>
          
          {showAdmin && (
            <div className="mt-2 space-y-1">
              {adminNavigation.map((item) => (
                <AdminNavItem key={item.href} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}