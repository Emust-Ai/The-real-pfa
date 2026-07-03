import React, { useState, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  Home,
  Building2,
  Heart,
  Settings,
  LogOut,
  BarChart3,
  Users,
  Search,
  MessageSquare,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';

const roleLinks: Record<string, { to: string; label: string; icon: React.ElementType }[]> = {
  SUPER_ADMIN: [
    { to: '/admin', label: 'Dashboard', icon: BarChart3 },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/scraping', label: 'Scraping', icon: Search },
    { to: '/properties', label: 'Properties', icon: Building2 },
  ],
  RETAILER: [
    { to: '/', label: 'Dashboard', icon: BarChart3 },
    { to: '/properties/my', label: 'My Properties', icon: Building2 },
    { to: '/properties/new', label: 'Add Property', icon: Building2 },
    { to: '/properties', label: 'Browse', icon: Search },
    { to: '/inquiries', label: 'Inquiries', icon: MessageSquare },
  ],
  CLIENT: [
    { to: '/', label: 'Home', icon: Home },
    { to: '/properties', label: 'Browse', icon: Search },
    { to: '/favorites', label: 'Favorites', icon: Heart },
    { to: '/conversations', label: 'Messages', icon: MessageSquare },
  ],
  BUILDER: [
    { to: '/', label: 'Home', icon: Home },
    { to: '/properties', label: 'Land & Plots', icon: Search },
    { to: '/favorites', label: 'Favorites', icon: Heart },
    { to: '/conversations', label: 'Messages', icon: MessageSquare },
  ],
};

const COLLAPSED_KEY = 'sidebar-collapsed';

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSED_KEY) === 'true');

  const toggleCollapsed = useCallback(() => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem(COLLAPSED_KEY, String(next));
      window.dispatchEvent(new Event('sidebar-toggle'));
      return next;
    });
  }, []);

  if (!user) return null;

  const links = roleLinks[user.role] ?? roleLinks.CLIENT;

  const navItem = (to: string, label: string, icon: React.ElementType) => (
    <NavLink
      key={to}
      to={to}
      className={({ isActive }) =>
        `flex items-center justify-center ${collapsed ? '' : 'gap-3 px-3'} py-2 rounded-md text-sm transition-colors ${
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-accent hover:text-accent-foreground'
        }`
      }
      title={collapsed ? label : undefined}
    >
      {React.createElement(icon, { className: 'h-4 w-4 shrink-0' })}
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );

  const actionButton = (label: string, icon: React.ElementType, onClick?: () => void) => (
    <button onClick={onClick}
      className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-3'} py-2 rounded-md text-sm hover:bg-accent hover:text-accent-foreground w-full transition-colors cursor-pointer`}
      title={collapsed ? label : undefined}>
      {React.createElement(icon, { className: 'h-4 w-4 shrink-0' })}
      {!collapsed && <span className="truncate">{label}</span>}
    </button>
  );

  return (
    <aside className={`fixed left-0 top-20 h-[calc(100vh-5rem)] border-r bg-card flex flex-col z-20 transition-[width] duration-200 ${collapsed ? 'w-14' : 'w-64'}`}>
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between px-4'} h-14 border-b shrink-0`}>
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="text-base font-bold truncate">RealEstate</h1>
            <p className="text-[10px] text-muted-foreground capitalize truncate">{user.role.toLowerCase()}</p>
          </div>
        )}
        <button onClick={toggleCollapsed}
          className="p-1.5 rounded-md hover:bg-accent transition-colors shrink-0"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {React.createElement(collapsed ? PanelLeft : PanelLeftClose, { className: 'h-4 w-4' })}
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        {links.map(l => navItem(l.to, l.label, l.icon))}
      </nav>

      <div className={`border-t p-2 space-y-1 ${collapsed ? 'flex flex-col items-center' : ''}`}>
        <NavLink to="/settings"
          className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 px-3'} py-2 rounded-md text-sm hover:bg-accent hover:text-accent-foreground transition-colors`}
          title={collapsed ? 'Settings' : undefined}>
          <Settings className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>
        {actionButton('Logout', LogOut, logout)}
      </div>
    </aside>
  );
}
