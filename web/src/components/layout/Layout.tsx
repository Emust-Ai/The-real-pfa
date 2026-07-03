import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { ToastContainer } from '../ui/toast';

const COLLAPSED_KEY = 'sidebar-collapsed';

export function Layout() {
  const [sidebarW, setSidebarW] = useState(() => localStorage.getItem(COLLAPSED_KEY) === 'true' ? '3.5rem' : '16rem');

  useEffect(() => {
    const handler = () => {
      setSidebarW(localStorage.getItem(COLLAPSED_KEY) === 'true' ? '3.5rem' : '16rem');
    };
    window.addEventListener('storage', handler);
    window.addEventListener('sidebar-toggle', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('sidebar-toggle', handler);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar />
      <main style={{ marginLeft: sidebarW }} className="pt-20 transition-[margin] duration-200 min-h-screen">
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  );
}
