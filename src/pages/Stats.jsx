import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Wallet, Receipt, Package, TrendingUp } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Stats() {
  const { accessToken } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function charger() {
      try {
        const res = await fetch(`${API_URL}/api/stats`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Erreur');
        setData(json);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    if (accessToken) charger();
  }, [accessToken]);

  if (loading) return <p className="text-slate-500">Chargement...</p>;
  if (error) return <div className="bg-red-50 text-red-700 p-4 rounded-xl">{error}</div>;
  if (!data) return null;

  const Kpi = ({ icon: Icon, label, value, color = 'brand' }) => {
    const colors = {
      brand: 'bg-amber-50 text-amber-600 border-amber-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
    };
    return (
      <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
        <div className={`w-11 h-11 rounded-xl ${colors[color]} border flex items-center justify-center mb-3`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-xs uppercase text-slate-500 font-semibold">{label}</div>
        <div className="text-2xl font-bold text-slate-900 mt-1">{value}</div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* RECETTES */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">💰 Recettes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Kpi icon={Wallet} label="Nombre" value={data.recettes.count} color="green" />
          <Kpi icon={TrendingUp} label="Total" value={data.recettes.total.toFixed(2)} color="green" />
        </div>
        {Object.keys(data.recettes.par_devise).length > 0 && (
          <div className="mt-4 bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-600">
                <tr><th className="text-left px-4 py-2">Devise</th><th className="text-right px-4 py-2">Total</th></tr>
              </thead>
              <tbody>
                {Object.entries(data.recettes.par_devise).map(([dv, v]) => (
                  <tr key={dv} className="border-t border-slate-100">
                    <td className="px-4 py-2 font-semibold">{dv}</td>
                    <td className="px-4 py-2 text-right font-mono">{v.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* DÉPENSES */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">💸 Dépenses</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Kpi icon={Receipt} label="Nombre" value={data.depenses.count} color="red" />
          <Kpi icon={TrendingUp} label="Total" value={`− ${data.depenses.total.toFixed(2)}`} color="red" />
        </div>
      </section>

      {/* SOLDE */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">⚖️ Solde</h2>
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg">
          <div className="text-xs uppercase opacity-70 font-semibold">Solde global</div>
          <div className={`text-4xl font-bold mt-2 ${data.solde_global >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {data.solde_global.toFixed(2)}
          </div>
        </div>
      </section>

      {/* MARCHANDISES */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">📦 Marchandises</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Kpi icon={Package} label="Nombre" value={data.marchandises.count} color="blue" />
          <Kpi icon={TrendingUp} label="Brut" value={data.marchandises.total_brut.toFixed(2)} color="brand" />
          <Kpi icon={TrendingUp} label="Réductions" value={`− ${data.marchandises.total_reductions.toFixed(2)}`} color="red" />
          <Kpi icon={TrendingUp} label="Net" value={data.marchandises.total_net.toFixed(2)} color="green" />
        </div>
      </section>
    </div>
  );
}