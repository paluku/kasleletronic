import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ✅ Jours abrégés
const JOURS_ABREGES = {
  Lundi: 'Lun', Mardi: 'Mar', Mercredi: 'Mer',
  Jeudi: 'Jeu', Vendredi: 'Ven', Samedi: 'Sam', Dimanche: 'Dim',
};

export default function Recettes() {
  const { accessToken } = useAuth();
  const [recettes, setRecettes] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalDepenses, setTotalDepenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    nom: '', date: '', heure: '', montant: '', devise: 'CDF', description: '',
  });

  async function charger() {
    setLoading(true);
    setError('');
    try {
      // Recettes
      const res = await fetch(`${API_URL}/api/recettes`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      setRecettes(data.recettes || []);
       setTotal(Number(data.total) || 0);
     

      // Dépenses (pour le solde net)
      const resD = await fetch(`${API_URL}/api/depenses`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const dataD = await resD.json();
      if (resD.ok) setTotalDepenses(dataD.total ?? 0);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (accessToken) charger();
  }, [accessToken]);

  function ouvrirAjout() {
    const now = new Date();
    setEditing(null);
    setForm({
      nom: '',
      date: now.toISOString().slice(0, 10),
      heure: now.toTimeString().slice(0, 5),
      montant: '',
      devise: 'CDF',
      description: '',
    });
    setModalOpen(true);
  }

  function ouvrirEdit(r) {
    setEditing(r);
    setForm({
      nom: r.nom, date: r.date, heure: r.heure,
      montant: String(r.montant), devise: r.devise,
      description: r.description || '',
    });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const url = editing
        ? `${API_URL}/api/recettes/${editing.id}`
        : `${API_URL}/api/recettes`;
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

  async function supprimer(r) {
    if (!confirm(`Supprimer la recette « ${r.nom} » ?`)) return;
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/recettes/${r.id}`, {
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

  // Format date court : 2026-10-19 → 19/10/26
  function dateCourte(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y?.slice(2) || ''}`;
  }

  const soldeNet = (total ?? 0) - (totalDepenses ?? 0);

  return (
    <div>
      {/* En-tête */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">💰 Recettes</h1>
          <p className="text-slate-500 text-sm sm:text-base">Gérez vos recettes</p>
        </div>
        <button
          onClick={ouvrirAjout}
          className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg text-sm sm:text-base"
        >
          ＋ Nouvelle
        </button>
      </div>

      {/* KPI — 4 cartes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow border-l-4 border-blue-500">
          <div className="text-xs uppercase text-slate-500 font-semibold">Nombre</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">
            {recettes.length}
          </div>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow border-l-4 border-green-500">
          <div className="text-xs uppercase text-slate-500 font-semibold">Total recettes</div>
          <div className="text-xl sm:text-2xl font-bold text-green-600">
            {(total ?? 0).toFixed(2)}
          </div>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow border-l-4 border-red-500">
          <div className="text-xs uppercase text-slate-500 font-semibold">Total dépenses</div>
          <div className="text-xl sm:text-2xl font-bold text-red-600">
            − {(totalDepenses ?? 0).toFixed(2)}
          </div>
        </div>
        <div
          className={`bg-white p-4 sm:p-5 rounded-xl shadow border-l-4 ${
            soldeNet >= 0 ? 'border-green-500' : 'border-red-500'
          }`}
        >
          <div className="text-xs uppercase text-slate-500 font-semibold">💰 Solde net</div>
          <div
            className={`text-xl sm:text-2xl font-bold ${
              soldeNet >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {soldeNet.toFixed(2)}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-slate-500">Chargement...</p>
      ) : recettes.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-slate-500 mb-4">Aucune recette enregistrée.</p>
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
            {recettes.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-xl shadow p-4 border-l-4 border-amber-500"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="font-bold text-slate-900 text-base truncate">
                    {r.nom}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => ouvrirEdit(r)}
                      className="bg-blue-100 text-blue-800 p-2 rounded-lg text-sm"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => supprimer(r)}
                      className="bg-red-100 text-red-800 p-2 rounded-lg text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 flex-wrap">
                  <span className="bg-slate-100 px-2 py-0.5 rounded">
                    {JOURS_ABREGES[r.jour] || r.jour}
                  </span>
                  <span>{dateCourte(r.date)}</span>
                  <span>·</span>
                  <span>{r.heure}</span>
                </div>

                <div className="flex items-baseline justify-between">
                  <div className="text-lg font-bold text-slate-900">
                    {(r.montant ?? 0).toFixed(2)}
                    <span className="text-xs font-semibold text-amber-700 ml-1">
                      {r.devise}
                    </span>
                  </div>
                  {r.description && (
                    <div className="text-xs text-slate-400 truncate max-w-[50%]">
                      {r.description}
                    </div>
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
                  <th className="px-4 py-3 text-left">Jour</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Heure</th>
                  <th className="px-4 py-3 text-right">Montant</th>
                  <th className="px-4 py-3 text-left">Devise</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recettes.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{r.nom}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {JOURS_ABREGES[r.jour] || r.jour}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.date}</td>
                    <td className="px-4 py-3 text-slate-600">{r.heure}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-900">
                      {(r.montant ?? 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full">
                        {r.devise}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => ouvrirEdit(r)}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded mr-1"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => supprimer(r)}
                        className="bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded"
                      >
                        🗑️
                      </button>
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
                {editing ? '✏️ Modifier' : '➕ Nouvelle recette'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-red-600 text-2xl leading-none"
              >
                ✕
              </button>
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
