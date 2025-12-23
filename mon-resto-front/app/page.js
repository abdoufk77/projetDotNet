"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const API_URL = "http://localhost:5230/api";

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/Auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Stocker le token et les infos utilisateur
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data));

        // Rediriger selon le rôle
        switch (data.role) {
          case "Admin":
            router.push("/admin/dashboard");
            break;
          case "Serveur":
            router.push("/serveur/dashboard");
            break;
          case "Cuisinier":
            router.push("/cuisinier/dashboard");
            break;
          default:
            setError("Rôle non reconnu");
        }
      } else {
        setError(data.message || "Erreur de connexion");
      }
    } catch (error) {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  const quickLogin = (role) => {
    const credentials = {
      admin: { username: "admin", password: "admin123" },
      serveur: { username: "serveur1", password: "serveur123" },
      cuisinier: { username: "chef1", password: "chef123" },
    };

    const cred = credentials[role];
    setUsername(cred.username);
    setPassword(cred.password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-white text-center">
          <h1 className="text-4xl font-bold mb-2">🍽️ MonResto</h1>
          <p className="text-purple-100">Système de gestion de restaurant</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-800">
              <AlertCircle size={20} />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-3 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Entrez votre username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-3 text-gray-400"
                  size={20}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Entrez votre mot de passe"
                />
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </div>

          <div className="mt-8">
            <p className="text-center text-sm text-gray-600 mb-4 font-medium">
              Connexion rapide (test)
            </p>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => quickLogin("admin")}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
              >
                👑 Admin
              </button>
              <button
                onClick={() => quickLogin("serveur")}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
              >
                🍽️ Serveur
              </button>
              <button
                onClick={() => quickLogin("cuisinier")}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
              >
                👨‍🍳 Chef
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
