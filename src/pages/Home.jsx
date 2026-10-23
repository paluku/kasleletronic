import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">🏠 Accueil</h1>
      <p className="text-slate-500 mb-8">
        Bienvenue {user?.nom} — {user?.email}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition cursor-pointer">
          <h2 className="text-lg font-bold text-slate-900">💰 Recettes</h2>
          <p className="text-slate-500 text-sm mt-1">Vos recettes journalières</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition cursor-pointer">
          <h2 className="text-lg font-bold text-slate-900">💸 Dépenses</h2>
          <p className="text-slate-500 text-sm mt-1">Vos sorties d'argent</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition cursor-pointer">
          <h2 className="text-lg font-bold text-slate-900">📦 Marchandises</h2>
          <p className="text-slate-500 text-sm mt-1">Votre stock</p>
        </div>
      </div>

      {user?.is_admin && (
        <div className="mt-6 bg-amber-50 border border-amber-200 p-4 rounded-xl">
          <p className="text-amber-800 text-sm">
            👑 Vous êtes connecté en tant qu'<strong>administrateur</strong>
          </p>
        </div>
      )}
    </div>
  );
}