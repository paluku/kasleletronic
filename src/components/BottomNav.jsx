import { NavLink } from 'react-router-dom';
import { Home, Receipt, Wallet, Package } from 'lucide-react';

export default function BottomNav() {
  const items = [
    { to: '/',             icon: Home,    label: 'Accueil' },
    { to: '/depenses',     icon: Receipt, label: 'Dépenses' },
    { to: '/recettes',     icon: Wallet,  label: 'Recettes' },
    { to: '/marchandises', icon: Package, label: 'Marchand.' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white border-t border-slate-200 shadow-lg">
      <div className="flex justify-around">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 flex-1 py-2.5 transition ${
                isActive ? 'text-brand-600' : 'text-slate-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className={`text-[10px] font-semibold ${isActive ? 'text-brand-600' : ''}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}