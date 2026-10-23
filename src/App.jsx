import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Recettes from './pages/Recettes';
import Depenses from './pages/Depenses';
import Marchandises from './pages/Marchandises';
import Stats from './pages/Stats';
import Graphiques from './pages/Graphiques';
import Messages from './pages/Messages';            // ← AJOUT
import Conversation from './pages/Conversation';    // ← AJOUT
import Admin from './pages/Admin';  // ← AJOUT

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Home />} />
          <Route path="/recettes" element={<Recettes />} />
          <Route path="/depenses" element={<Depenses />} />
          <Route path="/marchandises" element={<Marchandises />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/graphiques" element={<Graphiques />} />
          <Route path="/messages" element={<Messages />} />                    {/* ← AJOUT */}
          <Route path="/messages/:user_id" element={<Conversation />} />
		  <Route path="/admin" element={<Admin />} />   // ← AJOUT
       {/* ← AJOUT */}
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}