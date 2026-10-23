import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'];

export default function Graphiques() {
  const { accessToken } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function charger() {
      try {
        const res = await fetch(`${API_URL}/api/graphiques`, {
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

  const lineData = data.courbe.dates.map((d, i) => ({
    date: d.slice(5), // MM-DD
    montant: data.courbe.montants[i],
  }));

  const pieData = data.camembert.labels.map((label, i) => ({
    name: label,
    value: data.camembert.values[i],
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
          <div className="text-xs uppercase text-slate-500 font-semibold">💰 Total recettes</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {data.kpi.total_recettes.toFixed(2)}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
          <div className="text-xs uppercase text-slate-500 font-semibold">📦 Marchandises net</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {data.kpi.total_marchandises.toFixed(2)}
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 shadow-lg text-white">
          <div className="text-xs uppercase opacity-90 font-semibold">➕ TOTAL GLOBAL</div>
          <div className="text-2xl font-bold mt-1">{data.kpi.total_global.toFixed(2)}</div>
        </div>
      </div>

      {/* Courbe */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">📈 Recettes par date</h2>
        {lineData.length === 0 ? (
          <p className="text-slate-500 text-center py-12">Aucune recette</p>
        ) : (
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
                  formatter={(v) => v.toFixed(2)}
                />
                <Line
                  type="monotone"
                  dataKey="montant"
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#16a34a' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Camembert */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">🥧 Marchandises nettes par devise</h2>
        {pieData.length === 0 ? (
          <p className="text-slate-500 text-center py-12">Aucune marchandise</p>
        ) : (
          <div style={{ width: '100%', height: 340 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={55}
                  paddingAngle={3}
                  label={({ name, value }) => `${name} : ${value.toFixed(0)}`}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => v.toFixed(2)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}