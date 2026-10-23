import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Send } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Conversation() {
  const { user_id } = useParams();
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [autre, setAutre] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [contenu, setContenu] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [delai, setDelai] = useState(20);
  const [sec, setSec] = useState(20);

  const bodyRef = useRef(null);

  async function charger() {
    try {
      const res = await fetch(`${API_URL}/api/messages/${user_id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      setAutre(data.autre);
      setMessages(data.messages);
      setCurrentUserId(data.current_user_id);
      setDelai(data.delai_suppression);
      setSec(data.delai_suppression);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (accessToken) charger();
  }, [accessToken, user_id]);

  useEffect(() => {
    // Scroll en bas
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages]);

  // Compte à rebours + purge
  useEffect(() => {
    if (messages.length === 0) return;
    const timer = setInterval(async () => {
      setSec((s) => {
        if (s <= 1) {
          clearInterval(timer);
          fetch(`${API_URL}/api/messages/purge`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}` },
          }).finally(() => {
            charger();
          });
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [messages.length]);

  async function envoyer(e) {
    e.preventDefault();
    const texte = contenu.trim();
    if (!texte) return;

    try {
      const res = await fetch(`${API_URL}/api/messages/${user_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ contenu: texte }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      setContenu('');
      charger();
    } catch (e) {
      setError(e.message);
    }
  }

  if (loading) return <p className="text-slate-500">Chargement...</p>;
  if (error) return <div className="bg-red-50 text-red-700 p-4 rounded-xl">{error}</div>;
  if (!autre) return null;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate('/messages')}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center font-bold relative">
          {autre.nom[0]?.toUpperCase()}
          {autre.is_online && (
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
          )}
        </div>
        <div>
          <div className="font-semibold text-slate-900">{autre.nom}</div>
          <div className={`text-xs ${autre.is_online ? 'text-green-600' : 'text-slate-400'}`}>
            {autre.is_online ? 'En ligne' : 'Hors ligne'}
          </div>
        </div>
      </div>

      {/* Bannière burn-after-read */}
      {messages.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-4 text-sm text-amber-800">
          ⏱️ Ces messages seront <strong>supprimés</strong> dans{' '}
          <span className="font-bold text-lg">{sec}</span> secondes.
        </div>
      )}

      {/* Conversation */}
      <div className="bg-white rounded-2xl shadow flex flex-col" style={{ height: '60vh' }}>
        <div
          ref={bodyRef}
          className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50 rounded-t-2xl"
        >
          {messages.length === 0 ? (
            <p className="text-center text-slate-400 mt-8">Aucun message pour l'instant.</p>
          ) : (
            messages.map((m) => {
              const isMe = m.sender_id === currentUserId;
              return (
                <div
                  key={m.id}
                  className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                    isMe
                      ? 'ml-auto bg-amber-500 text-slate-900 rounded-br-sm'
                      : 'bg-white text-slate-900 border border-slate-200 rounded-bl-sm'
                  }`}
                >
                  {m.contenu}
                  <div className={`text-[10px] mt-1 opacity-70 ${isMe ? 'text-slate-800' : 'text-slate-500'}`}>
                    {m.created_at?.split(' ')[1] || ''}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input */}
        <form onSubmit={envoyer} className="flex gap-2 p-3 border-t border-slate-200">
          <input
            type="text"
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            placeholder="Écrivez votre message…"
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
            autoFocus
          />
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-4 rounded-xl flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Envoyer</span>
          </button>
        </form>
      </div>
    </div>
  );
}