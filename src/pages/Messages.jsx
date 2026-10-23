import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Messages() {
  const { accessToken, user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function charger() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/messages`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      setConversations(data.conversations);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (accessToken) charger();
  }, [accessToken]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">💬 Messages</h1>
        <p className="text-slate-500 text-sm sm:text-base">Discutez avec les autres utilisateurs</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-slate-500">Chargement...</p>
      ) : conversations.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <div className="text-5xl mb-3">💬</div>
          <p className="text-slate-500">Aucun autre utilisateur pour l'instant.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((c) => (
            <Link
              key={c.user.id}
              to={`/messages/${c.user.id}`}
              className={`flex items-center gap-4 p-4 bg-white rounded-xl shadow hover:shadow-md transition ${
                c.non_lus > 0 ? 'border-l-4 border-amber-500 bg-amber-50/30' : ''
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center font-bold text-lg flex-shrink-0 relative">
                {c.user.nom[0]?.toUpperCase()}
                {c.user.is_online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 truncate">
                    {c.user.nom}
                  </span>
                  {c.user.is_admin && <span className="text-xs">👑</span>}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {c.dernier ? (
                    <>
                      {c.dernier.sender_id === user.id && <span>Vous : </span>}
                      {c.dernier.contenu}
                    </>
                  ) : (
                    <em>Aucun message</em>
                  )}
                </div>
              </div>

              {c.non_lus > 0 && (
                <div className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[22px] h-[22px] flex items-center justify-center px-1.5 flex-shrink-0">
                  {c.non_lus}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}