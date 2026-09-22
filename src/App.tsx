import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import { LanguageProvider } from './lib/i18n';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LanguageToggle } from './components/LanguageToggle';
import Catalog from './pages/Catalog';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminAddProduct from './pages/AdminAddProduct';
import AdminProducts from './pages/AdminProducts';
import SuperAdmin from './pages/SuperAdmin';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <HashRouter>
          <LanguageToggle />
          <Routes>
            <Route path="/" element={<Catalog />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute>
                  <AdminProducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products/new"
              element={
                <ProtectedRoute>
                  <AdminAddProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/system"
              element={
                <ProtectedRoute>
                  <SuperAdmin />
                </ProtectedRoute>
              }
            />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
