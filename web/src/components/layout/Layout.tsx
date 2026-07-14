import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { ToastContainer } from '../ui/toast';

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 min-h-screen">
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  );
}
