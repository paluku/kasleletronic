import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Wallet, Package, Receipt, Shield, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Admin() {
  const { accessToken, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('users');

  async function charger() {
    setLoading(true);
    setError('');
    try {
      const [resStats, resUsers] = await Promise.all([
        fetch(`${API_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        fetch(`${API_URL}/api/users`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      ]);
      const stats = await resStats.json();
      const usersData = await resUsers.json();

      if (!resStats.ok) throw new Error(stats.error || 'Erreur');
      if (!resUsers.ok) throw new Error(usersData.error || 'Erreur');

      setData({ ...stats, users: usersData.users });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (accessToken) charger();
  }, [accessToken]);

  async function changerRole(userId, role) {
    try {
      const res = await fetch(`${API_URL}/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ role }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      charger();
    } catch (e) {
      alert(e.message);
    }
  }

  async function supprimerUser(userId, nom) {
    if (!confirm(`Supprimer « ${nom} » et toutes ses données ?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      charger();
    } catch (e) {
      alert(e.message);
    }
  }

  async function supprimerItem(type, id, nom) {
    if (!confirm(`Supprimer « ${nom} » ?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/${type}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      charger();
    } catch (e) {
      alert(e.message);
    }
  }

  if (!user?.is_admin) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl">
        Accès réservé à l'administrateur.
      </div>
    );
  }

  if (loading) return <p className="text-slate-500">Chargement...</p>;
  if (error) return <div className="bg-red-50 text-red-700 p-4 rounded-xl">{error}</div>;
  if (!data) return null;

  const tabs = [
    { id: 'users', label: `👥 Utilisateurs (${data.users.length})` },
    { id: 'recettes', label: `💰 Recettes (${data.recettes.length})` },
    { id: 'marchandises', label: `📦 Marchandises (${data.marchandises.length})` },
    { id: 'depenses', label: `💸 Dépenses (${data.depenses.length})` },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">🎛️ Administration</h1>
        <p className="text-slate-500">Gérez tous les contenus de l'application</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow border-l-4 border-blue-500">
          <div className="text-xs uppercase text-slate-500 font-semibold">Utilisateurs</div>
          <div className="text-xl font-bold text-slate-900">{data.kpi.nb_users}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border-l-4 border-green-500">
          <div className="text-xs uppercase text-slate-500 font-semibold">Recettes</div>
          <div className="text-xl font-bold text-green-600">{(data.kpi.total_recettes ?? 0).toFixed(2)}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border-l-4 border-red-500">
          <div className="text-xs uppercase text-slate-500 font-semibold">Dépenses</div>
          <div className="text-xl font-bold text-red-600">− {(data.kpi.total_depenses ?? 0).toFixed(2)}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border-l-4 border-amber-500">
          <div className="text-xs uppercase text-slate-500 font-semibold">Marchandises</div>
          <div className="text-xl font-bold text-slate-900">{data.kpi.nb_marchandises}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border-l-4 border-purple-500">
          <div className="text-xs uppercase text-slate-500 font-semibold">Net march.</div>
          <div className="text-xl font-bold text-purple-600">{(data.kpi.total_net ?? 0).toFixed(2)}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition ${
              tab === t.id
                ? 'text-amber-600 border-b-2 border-amber-500'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {tab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 text-white text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Nom</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Rôle</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100">
                    <td className="px-4 py-3">{u.id}</td>
                    <td className="px-4 py-3 font-semibold">
                      {u.nom}
                      {u.id === user.id && <span className="text-xs text-amber-600 ml-1">(vous)</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3">
                      {u.id === user.id ? (
                        <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-bold">👑 Admin</span>
                      ) : (
                        <select
                          value={u.role}
                          onChange={(e) => changerRole(u.id, e.target.value)}
                          className="px-2 py-1 border border-slate-300 rounded-lg text-xs"
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.id !== user.id && (
                        <button
                          onClick={() => supprimerUser(u.id, u.nom)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded"
                        >
                          🗑️
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'recettes' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 text-white text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Nom</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-right">Montant</th>
                  <th className="px-4 py-3 text-left">Devise</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.recettes.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-semibold">{r.nom}</td>
                    <td className="px-4 py-3 text-slate-600">{r.date}</td>
                    <td className="px-4 py-3 text-right font-mono">{(r.montant ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-3">{r.devise}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => supprimerItem('recettes', r.id, r.nom)}
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'marchandises' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 text-white text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Nom</th>
                  <th className="px-4 py-3 text-right">Prix</th>
                  <th className="px-4 py-3 text-right">Qté</th>
                  <th className="px-4 py-3 text-right">Net</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.marchandises.map((m) => (
                  <tr key={m.id} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-semibold">{m.nom}</td>
                    <td className="px-4 py-3 text-right font-mono">{(m.prix_unitaire ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">{m.quantite}</td>
                    <td className="px-4 py-3 text-right font-mono text-green-600">
                      {(m.prix_total_net ?? 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => supprimerItem('marchandises', m.id, m.nom)}
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'depenses' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 text-white text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Nom</th>
                  <th className="px-4 py-3 text-left">Catégorie</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-right">Montant</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.depenses.map((d) => (
                  <tr key={d.id} className="border-b border-slate-100">
                    <td className="px-4 py-3 font-semibold">{d.nom}</td>
                    <td className="px-4 py-3">{d.categorie}</td>
                    <td className="px-4 py-3 text-slate-600">{d.date}</td>
                    <td className="px-4 py-3 text-right font-mono text-red-600">
                      − {(d.montant ?? 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => supprimerItem('depenses', d.id, d.nom)}
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}