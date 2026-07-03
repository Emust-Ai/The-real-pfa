import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import api from '../../lib/api';
import type { Notification } from '../../types/notification';
import {
  Menu, X, Bell, Settings, LogOut, Heart, Building2, Search,
  MessageSquare, BarChart3, Users, Home, CheckCheck, ChevronDown
} from 'lucide-react';
import { cn } from '../../lib/utils';

const roleLinks: Record<string, { to: string; label: string; icon: React.ElementType }[]> = {
  SUPER_ADMIN: [
    { to: '/', label: 'Dashboard', icon: BarChart3 },
    { to: '/admin', label: 'Admin', icon: Users },
    { to: '/properties', label: 'Properties', icon: Building2 },
    { to: '/admin/scraping', label: 'Scraping', icon: Search },
  ],
  RETAILER: [
    { to: '/', label: 'Dashboard', icon: BarChart3 },
    { to: '/properties', label: 'Browse', icon: Search },
    { to: '/properties/my', label: 'My Listings', icon: Building2 },
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

export function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data),
    enabled: !!user,
    refetchInterval: 30000,
  });

  const { data: unreadCount = 0 } = useQuery<number>({
    queryKey: ['notifications-unread'],
    queryFn: () => api.get('/notifications/unread-count').then(r => r.data),
    enabled: !!user,
    refetchInterval: 15000,
  });

  const markAllRead = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;

  const links = roleLinks[user.role] ?? roleLinks.CLIENT;
  const initials = ((user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '') || user.email[0]).toUpperCase();

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-20 bg-background border-b border-hairline">
      <div className="h-full px-6 flex items-center justify-between max-w-screen-2xl mx-auto">
        <Link to="/" className="text-primary font-bold text-xl shrink-0">RealEstate</Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-sm transition-colors relative',
                  isActive
                    ? 'text-foreground after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-foreground after:rounded-full'
                    : 'text-muted-foreground hover:text-foreground hover:bg-surface-soft'
                )
              }
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="relative" ref={notifRef}>
            <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 rounded-sm hover:bg-surface-soft transition-colors cursor-pointer">
              <Bell className="h-5 w-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 min-w-4 flex items-center justify-center px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-popover border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-popover">
                  <span className="text-sm font-semibold">Notifications</span>
                  <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                      <button onClick={() => markAllRead.mutate()} title="Mark all as read"
                        className="p-1 hover:bg-surface-soft rounded-sm cursor-pointer">
                        <CheckCheck className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
                {notifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-4 text-center">No notifications</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id}
                      className={cn('px-4 py-3 text-sm border-b last:border-0 transition-colors', !n.isRead ? 'bg-primary/5' : '')}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm">{n.title}</p>
                        <span className="text-muted-foreground shrink-0 text-xs">{timeAgo(n.createdAt)}</span>
                      </div>
                      <p className="text-muted-foreground text-xs mt-0.5">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="relative" ref={menuRef}>
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-sm hover:bg-surface-soft transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-muted-foreground/20 flex items-center justify-center text-xs font-semibold">
                {initials}
              </div>
              <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-popover border rounded-md shadow-lg z-50 py-1">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium">{user.firstName ?? user.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role.toLowerCase()}</p>
                </div>
                <Link to="/settings" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-surface-soft transition-colors">
                  <Settings className="h-4 w-4" /> Settings
                </Link>
                <button onClick={() => { logout(); navigate('/login'); }}
                  className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-surface-soft transition-colors w-full cursor-pointer">
                  <LogOut className="h-4 w-4" /> Log out
                </button>
              </div>
            )}
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-sm hover:bg-surface-soft transition-colors cursor-pointer">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t bg-background px-4 py-2 space-y-1">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn('flex items-center gap-3 px-3 py-2.5 text-sm rounded-sm transition-colors', isActive ? 'bg-surface-soft text-foreground font-medium' : 'text-muted-foreground hover:text-foreground')
              }>
              <l.icon className="h-4 w-4" /> {l.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
