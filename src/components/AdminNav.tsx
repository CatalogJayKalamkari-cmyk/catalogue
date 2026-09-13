import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useLanguage } from '../lib/i18n';

export function AdminNav() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/admin/login');
  }

  return (
    <nav className="admin-nav">
      <NavLink to="/admin" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
        {t('nav.dashboard')}
      </NavLink>
      <NavLink to="/admin/products" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
        {t('nav.products')}
      </NavLink>
      <NavLink to="/admin/products/new" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
        {t('nav.add')}
      </NavLink>
      <button className="nav-link nav-logout" onClick={handleLogout}>
        {t('nav.logout')}
      </button>
    </nav>
  );
}
