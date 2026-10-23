import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export default function Navbar() {

  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {

    const email = localStorage.getItem("email");

    try {

      await axios.post(
        "http://localhost:3000/api/logout",
        { email }
      );

      localStorage.removeItem("email");

      alert("Logged out successfully");

      navigate("/authform");

    } catch (err) {

      console.error(err);

    }

  };

  return (
    <nav className="bg-purple-600 shadow-md">

      <div className="h-16 flex items-center justify-between max-w-7xl mx-auto px-4">

        <div className="text-3xl text-white font-bold tracking-wide">
          LOGO
        </div>

        {/* Desktop Menu */}
        <div className="hidden sm:flex items-center space-x-6">

          <Link className="text-gray-100 text-lg hover:text-white transition" to="/">HOME</Link>

          <Link className="text-gray-100 text-lg hover:text-white transition" to="/login">SERVICE</Link>

          <Link className="text-gray-100 text-lg hover:text-white transition" to="/authform">LOGIREGISTER</Link>

          <Link className="text-gray-100 text-lg hover:text-white transition" to="/users">CONTACT</Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>

        </div>

        {/* Mobile Button */}
        <button
          className="sm:hidden text-white text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

      </div>

      {/* Mobile Menu */}
      {menuOpen && (

        <div className="sm:hidden flex flex-col bg-purple-600 px-4 pb-4 space-y-2">

          <Link className="text-gray-100 text-lg" to="/">HOME</Link>

          <Link className="text-gray-100 text-lg" to="/service">SERVICE</Link>

          <Link className="text-gray-100 text-lg" to="/about">ABOUT</Link>

          <Link className="text-gray-100 text-lg" to="/contact">CONTACT</Link>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>

        </div>

      )}

    </nav>
  );
}