import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CATEGORIES = [
  'Alimentation', 'Transport', 'Loyer', 'Salaires',
  'Électricité', 'Eau', 'Internet', 'Fournitures',
  'Santé', 'Éducation', 'Autre',
];

export default function Depenses() {
  const { accessToken } = useAuth();
  const [depenses, setDepenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    nom: '', categorie: 'Autre', date: '', heure: '',
    montant: '', devise: 'CDF', description: '',
  });

  async function charger() {
    setLoading(true);
    setError('');

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const res = await fetch(`${API_URL}/api/depenses`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();

        if (res.ok) {
          setDepenses(data.depenses || []);
          setTotal(data.total ?? 0);
          setLoading(false);
          return;
        }

        throw new Error(data.error || `Erreur ${res.status}`);
      } catch (e) {
        attempts++;
        console.log(`Tentative ${attempts}/${maxAttempts} échouée :`, e.message);

        if (attempts >= maxAttempts) {
          setError('Serveur indisponible. Cliquez sur "Réessayer".');
          setDepenses([]);
          setTotal(0);
          setLoading(false);
          return;
        }

        await new Promise((r) => setTimeout(r, 5000));
      }
    }
  }

  useEffect(() => {
    if (accessToken) charger();
  }, [accessToken]);

  function ouvrirAjout() {
    const now = new Date();
    setEditing(null);
    setForm({
      nom: '', categorie: 'Autre',
      date: now.toISOString().slice(0, 10),
      heure: now.toTimeString().slice(0, 5),
      montant: '', devise: 'CDF', description: '',
    });
    setModalOpen(true);
  }

  function ouvrirEdit(d) {
    setEditing(d);
    setForm({
      nom: d.nom, categorie: d.categorie,
      date: d.date, heure: d.heure,
      montant: String(d.montant ?? ''), devise: d.devise,
      description: d.description || '',
    });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const url = editing
        ? `${API_URL}/api/depenses/${editing.id}`
        : `${API_URL}/api/depenses`;
      const method = editing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          ...form,
          montant: parseFloat(form.montant) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      setModalOpen(false);
      charger();
    } catch (e) {
      setError(e.message);
    }
  }

  async function supprimer(d) {
    if (!confirm(`Supprimer la dépense « ${d.nom} » ?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/depenses/${d.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      charger();
    } catch (e) {
      setError(e.message);
    }
  }

  function dateCourte(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y?.slice(2) || ''}`;
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">💸 Dépenses</h1>
          <p className="text-slate-500 text-sm sm:text-base">Suivez vos sorties d'argent</p>
        </div>
        <button
          onClick={ouvrirAjout}
          className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg text-sm sm:text-base"
        >
          ＋ Nouvelle
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow border-l-4 border-blue-500">
          <div className="text-xs uppercase text-slate-500 font-semibold">Nombre</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">{depenses.length}</div>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow border-l-4 border-red-500">
          <div className="text-xs uppercase text-slate-500 font-semibold">Total dépensé</div>
          <div className="text-xl sm:text-2xl font-bold text-red-600">
            − {(total ?? 0).toFixed(2)}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded mb-4 text-sm flex items-center justify-between gap-3">
          <span>{error}</span>
          <button
            onClick={charger}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap"
          >
            🔄 Réessayer
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-slate-500">Chargement...</p>
      ) : depenses.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <div className="text-5xl mb-3">💸</div>
          <p className="text-slate-500 mb-4">Aucune dépense enregistrée.</p>
          <button
            onClick={ouvrirAjout}
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-5 py-2.5 rounded-lg"
          >
            ＋ Ajouter la première
          </button>
        </div>
      ) : (
        <>
          {/* MOBILE — Cartes */}
          <div className="md:hidden space-y-3">
            {depenses.map((d) => (
              <div key={d.id} className="bg-white rounded-xl shadow p-4 border-l-4 border-red-500">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="font-bold text-slate-900 text-base truncate">{d.nom}</div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => ouvrirEdit(d)} className="bg-blue-100 text-blue-800 p-2 rounded-lg text-sm">✏️</button>
                    <button onClick={() => supprimer(d)} className="bg-red-100 text-red-800 p-2 rounded-lg text-sm">🗑️</button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 flex-wrap">
                  <span className="bg-pink-100 text-pink-800 px-2 py-0.5 rounded font-semibold">{d.categorie}</span>
                  <span>{dateCourte(d.date)}</span>
                  <span>·</span>
                  <span>{d.heure}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-lg font-bold text-red-600">
                    − {(d.montant ?? 0).toFixed(2)}
                    <span className="text-xs text-amber-700 ml-1">{d.devise}</span>
                  </div>
                  {d.description && (
                    <div className="text-xs text-slate-400 truncate max-w-[50%]">{d.description}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP — Tableau */}
          <div className="hidden md:block bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 text-white text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Nom</th>
                  <th className="px-4 py-3 text-left">Catégorie</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Heure</th>
                  <th className="px-4 py-3 text-right">Montant</th>
                  <th className="px-4 py-3 text-left">Devise</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {depenses.map((d) => (
                  <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{d.nom}</td>
                    <td className="px-4 py-3">
                      <span className="bg-pink-100 text-pink-800 text-xs font-bold px-2 py-1 rounded-full">{d.categorie}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{d.date}</td>
                    <td className="px-4 py-3 text-slate-600">{d.heure}</td>
                    <td className="px-4 py-3 text-right font-mono text-red-600">
                      − {(d.montant ?? 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full">{d.devise}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => ouvrirEdit(d)} className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded mr-1">✏️</button>
                      <button onClick={() => supprimer(d)} className="bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* MODALE */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">
                {editing ? '✏️ Modifier' : '➕ Nouvelle dépense'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-red-600 text-2xl leading-none">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
                <input
                  type="text"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
                <select
                  value={form.categorie}
                  onChange={(e) => setForm({ ...form, categorie: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Heure *</label>
                  <input
                    type="time"
                    value={form.heure}
                    onChange={(e) => setForm({ ...form, heure: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Montant *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.montant}
                    onChange={(e) => setForm({ ...form, montant: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Devise</label>
                  <select
                    value={form.devise}
                    onChange={(e) => setForm({ ...form, devise: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="CDF">CDF</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-2.5 rounded-lg"
                >
                  💾 Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
