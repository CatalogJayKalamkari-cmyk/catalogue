import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export function AdminNav() {
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/admin/login');
  }

  return (
    <nav className="admin-nav">
      <NavLink to="/admin" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
        Dashboard
      </NavLink>
      <NavLink to="/admin/products" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
        Products
      </NavLink>
      <NavLink to="/admin/products/new" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
        + Add
      </NavLink>
      <button className="nav-link nav-logout" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
}
