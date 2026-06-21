import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import api from '../../lib/api';
import type { Notification } from '../../types/notification';
import {
  Home,
  Building2,
  Heart,
  Bell,
  Settings,
  LogOut,
  BarChart3,
  Users,
  Search,
  MessageSquare,
  X,
  CheckCheck,
} from 'lucide-react';

const roleLinks = {
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
  ],
  BUILDER: [
    { to: '/', label: 'Home', icon: Home },
    { to: '/properties', label: 'Land & Plots', icon: Search },
    { to: '/favorites', label: 'Favorites', icon: Heart },
  ],
};

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const queryClient = useQueryClient();
  const [showNotifs, setShowNotifs] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const markOneRead = useMutation({
    mutationFn: (id: number) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!user) return null;

  const links = roleLinks[user.role] ?? roleLinks.CLIENT;

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <aside className="w-64 border-r bg-card min-h-screen p-4 flex flex-col relative">
      <div className="mb-8">
        <h1 className="text-xl font-bold">RealEstate</h1>
        <p className="text-sm text-muted-foreground capitalize">{user.role.toLowerCase()}</p>
      </div>

      <nav className="flex-1 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              }`
            }
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t pt-4 space-y-2">
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setShowNotifs(!showNotifs)}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-accent hover:text-accent-foreground w-full transition-colors cursor-pointer relative">
            <Bell className="h-4 w-4" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                {unreadCount}
              </span>
            )}
          </button>
          {showNotifs && (
            <div className="absolute left-0 right-0 bottom-full mb-2 bg-popover border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
              <div className="flex items-center justify-between px-3 py-2 border-b sticky top-0 bg-popover">
                <span className="text-xs font-semibold">Notifications</span>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button onClick={() => markAllRead.mutate()} title="Mark all as read"
                      className="p-1 hover:bg-accent rounded">
                      <CheckCheck className="h-3 w-3" />
                    </button>
                  )}
                  <button onClick={() => setShowNotifs(false)} className="p-1 hover:bg-accent rounded">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
              {notifications.length === 0 ? (
                <p className="text-xs text-muted-foreground p-3 text-center">No notifications</p>
              ) : (
                notifications.map(n => (
                  <div key={n.id}
                    className={`px-3 py-2 text-xs border-b last:border-0 cursor-pointer transition-colors ${
                      !n.isRead ? 'bg-accent/50 hover:bg-accent' : 'hover:bg-muted'
                    }`}
                    onClick={() => {
                      if (!n.isRead) markOneRead.mutate(n.id);
                      if (n.link) window.location.href = n.link;
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium">{n.title}</p>
                      <span className="text-muted-foreground shrink-0">{timeAgo(n.createdAt)}</span>
                    </div>
                    <p className="text-muted-foreground mt-0.5">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Settings className="h-4 w-4" />
          Settings
        </NavLink>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-destructive/10 hover:text-destructive w-full transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
