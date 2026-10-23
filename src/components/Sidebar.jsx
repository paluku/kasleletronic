import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const lien = (to, label, icone) => (
    <NavLink
      to={to}
      onClick={onClose}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition ${
          isActive
            ? 'bg-amber-500 text-slate-900 font-bold'
            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }`
      }
    >
      <span>{icone}</span>
      <span>{label}</span>
    </NavLink>
  );

  const section = (titre) => (
    <div className="text-xs uppercase tracking-wider font-bold text-slate-500 px-4 pt-4 pb-2">
      {titre}
    </div>
  );

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-64 bg-slate-900 text-white
          flex flex-col
          transform transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">💰 Caisse</span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-2">
          {section('Principal')}
          {lien('/', 'Accueil', '🏠')}
          {lien('/recettes', 'Recettes', '💰')}
          {lien('/depenses', 'Dépenses', '💸')}
          {lien('/marchandises', 'Marchandises', '📦')}

          {section('Analyse')}
          {lien('/stats', 'Stats', '📊')}
          {lien('/graphiques', 'Graphiques', '📈')}

          {section('Communication')}
          {lien('/messages', 'Messages', '💬')}

          {user?.is_admin && (
            <>
              {section('Administration')}
              {lien('/admin', 'Admin', '🎛️')}
            </>
          )}
        </nav>

        {/* Footer utilisateur */}
        <div className="border-t border-slate-800 p-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center font-bold flex-shrink-0">
              {user?.nom?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <div className="text-white font-semibold text-sm truncate">
                {user?.nom}
              </div>
              <div className="text-slate-500 text-xs">
                {user?.is_admin ? '👑 Admin' : '👤 Utilisateur'}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300 text-lg p-1.5 rounded hover:bg-slate-800"
            title="Déconnexion"
          >
            🚪
          </button>
        </div>
      </aside>
    </>
  );
}