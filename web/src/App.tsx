import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleRoute } from './components/auth/RoleRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminUsers } from './pages/AdminUsers';
import { PropertyList } from './pages/PropertyList';
import { PropertyDetail } from './pages/PropertyDetail';
import { PropertyForm } from './pages/PropertyForm';
import { MyProperties } from './pages/MyProperties';
import { FavoritesPage } from './pages/FavoritesPage';
import { InquiriesPage } from './pages/InquiriesPage';
import { ScrapingDashboard } from './pages/ScrapingDashboard';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/properties" element={<PropertyList />} />
              <Route path="/properties/:id" element={<PropertyDetail />} />
              <Route
                path="/properties/new"
                element={
                  <RoleRoute allowedRoles={['RETAILER', 'SUPER_ADMIN']}>
                    <PropertyForm />
                  </RoleRoute>
                }
              />
              <Route
                path="/properties/:id/edit"
                element={
                  <RoleRoute allowedRoles={['RETAILER', 'SUPER_ADMIN']}>
                    <PropertyForm />
                  </RoleRoute>
                }
              />
              <Route
                path="/properties/my"
                element={
                  <RoleRoute allowedRoles={['RETAILER', 'SUPER_ADMIN']}>
                    <MyProperties />
                  </RoleRoute>
                }
              />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/inquiries" element={<InquiriesPage />} />
              <Route
                path="/admin"
                element={
                  <RoleRoute allowedRoles={['SUPER_ADMIN']}>
                    <AdminDashboard />
                  </RoleRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <RoleRoute allowedRoles={['SUPER_ADMIN']}>
                    <AdminUsers />
                  </RoleRoute>
                }
              />
              <Route
                path="/admin/scraping"
                element={
                  <RoleRoute allowedRoles={['SUPER_ADMIN']}>
                    <ScrapingDashboard />
                  </RoleRoute>
                }
              />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
