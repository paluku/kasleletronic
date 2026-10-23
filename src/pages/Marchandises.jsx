import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Marchandises() {
  const { accessToken } = useAuth();
  const [marchandises, setMarchandises] = useState([]);
  const [totaux, setTotaux] = useState({ brut: 0, net: 0, red: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    nom: '', description: '', prix_unitaire: '',
    quantite: '1', reduction_pct: '0', devise: 'CDF',
  });

  async function charger() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/marchandises`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');

      setMarchandises(data.marchandises || []);
      setTotaux({
        brut: data.total_brut ?? 0,
        net: data.total_net ?? 0,
        red: data.total_reductions ?? 0,
      });
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
    setEditing(null);
    setForm({
      nom: '', description: '', prix_unitaire: '',
      quantite: '1', reduction_pct: '0', devise: 'CDF',
    });
    setModalOpen(true);
  }

  function ouvrirEdit(m) {
    setEditing(m);
    setForm({
      nom: m.nom,
      description: m.description || '',
      prix_unitaire: String(m.prix_unitaire ?? ''),
      quantite: String(m.quantite ?? '1'),
      reduction_pct: String(m.reduction_pct ?? '0'),
      devise: m.devise || 'CDF',
    });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const url = editing
        ? `${API_URL}/api/marchandises/${editing.id}`
        : `${API_URL}/api/marchandises`;
      const method = editing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          ...form,
          prix_unitaire: parseFloat(form.prix_unitaire) || 0,
          quantite: parseFloat(form.quantite) || 1,
          reduction_pct: parseFloat(form.reduction_pct) || 0,
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

  async function supprimer(m) {
    if (!confirm(`Supprimer « ${m.nom} » ?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/marchandises/${m.id}`, {
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

  // Aperçu calcul en direct
  const brutPreview = (parseFloat(form.prix_unitaire) || 0) * (parseFloat(form.quantite) || 0);
  const redPreview = brutPreview * ((parseFloat(form.reduction_pct) || 0) / 100);
  const netPreview = brutPreview - redPreview;

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">📦 Marchandises</h1>
          <p className="text-slate-500 text-sm sm:text-base">Calcul automatique des réductions</p>
        </div>
        <button
          onClick={ouvrirAjout}
          className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg text-sm sm:text-base"
        >
          ＋ Nouvelle
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white p-3 sm:p-5 rounded-xl shadow border-l-4 border-blue-500">
          <div className="text-xs uppercase text-slate-500 font-semibold">Nombre</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">
            {marchandises.length}
          </div>
        </div>
        <div className="bg-white p-3 sm:p-5 rounded-xl shadow border-l-4 border-amber-500">
          <div className="text-xs uppercase text-slate-500 font-semibold">Brut</div>
          <div className="text-lg sm:text-2xl font-bold text-slate-900">
            {(totaux.brut ?? 0).toFixed(2)}
          </div>
        </div>
        <div className="bg-white p-3 sm:p-5 rounded-xl shadow border-l-4 border-red-500">
          <div className="text-xs uppercase text-slate-500 font-semibold">Réductions</div>
          <div className="text-lg sm:text-2xl font-bold text-red-600">
            − {(totaux.red ?? 0).toFixed(2)}
          </div>
        </div>
        <div className="bg-white p-3 sm:p-5 rounded-xl shadow border-l-4 border-green-500">
          <div className="text-xs uppercase text-slate-500 font-semibold">Net</div>
          <div className="text-lg sm:text-2xl font-bold text-green-600">
            {(totaux.net ?? 0).toFixed(2)}
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
      ) : marchandises.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <div className="text-5xl mb-3">📦</div>
          <p className="text-slate-500 mb-4">Aucune marchandise.</p>
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
            {marchandises.map((m) => (
              <div key={m.id} className="bg-white rounded-xl shadow p-4 border-l-4 border-amber-500">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="font-bold text-slate-900 text-base truncate">{m.nom}</div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => ouvrirEdit(m)}
                      className="bg-blue-100 text-blue-800 p-2 rounded-lg text-sm"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => supprimer(m)}
                      className="bg-red-100 text-red-800 p-2 rounded-lg text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 flex-wrap">
                  <span>Prix : {(m.prix_unitaire ?? 0).toFixed(2)}</span>
                  <span>×</span>
                  <span>{m.quantite ?? 0}</span>
                  {(m.reduction_pct ?? 0) > 0 && (
                    <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded font-semibold">
                      − {m.reduction_pct}%
                    </span>
                  )}
                </div>

                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-xs text-slate-400 line-through">
                      {(m.prix_total_brut ?? 0).toFixed(2)}
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {(m.prix_total_net ?? 0).toFixed(2)}
                      <span className="text-xs text-amber-700 ml-1">{m.devise}</span>
                    </div>
                  </div>
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
                  <th className="px-4 py-3 text-right">Prix unit.</th>
                  <th className="px-4 py-3 text-right">Qté</th>
                  <th className="px-4 py-3 text-right">Réduction</th>
                  <th className="px-4 py-3 text-right">Brut</th>
                  <th className="px-4 py-3 text-right">Net</th>
                  <th className="px-4 py-3 text-left">Devise</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {marchandises.map((m) => (
                  <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{m.nom}</td>
                    <td className="px-4 py-3 text-right font-mono">
                      {(m.prix_unitaire ?? 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">{m.quantite ?? 0}</td>
                    <td className="px-4 py-3 text-right text-red-600">
                      {m.reduction_pct ?? 0} %
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-600">
                      {(m.prix_total_brut ?? 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-green-600">
                      {(m.prix_total_net ?? 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full">
                        {m.devise}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => ouvrirEdit(m)}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded mr-1"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => supprimer(m)}
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
                {editing ? '✏️ Modifier' : '➕ Nouvelle marchandise'}
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

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prix unitaire *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={form.prix_unitaire}
                    onChange={(e) => setForm({ ...form, prix_unitaire: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantité *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={form.quantite}
                    onChange={(e) => setForm({ ...form, quantite: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Réduction %</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={form.reduction_pct}
                    onChange={(e) => setForm({ ...form, reduction_pct: e.target.value })}
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

              {/* Aperçu calcul en direct */}
              {brutPreview > 0 && (
                <div className="bg-slate-50 rounded-lg p-3 text-sm">
                  <div className="flex justify-between">
                    <span>Brut :</span>
                    <strong>{brutPreview.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Réduction :</span>
                    <strong className="text-red-600">− {redPreview.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1 mt-1">
                    <span>Net :</span>
                    <strong className="text-green-600">{netPreview.toFixed(2)}</strong>
                  </div>
                </div>
              )}

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