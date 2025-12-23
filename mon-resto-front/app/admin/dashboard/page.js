"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Users,
  Plus,
  Edit,
  Trash2,
  ChefHat,
  UserCog,
  Coffee,
} from "lucide-react";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("serveurs"); // 'serveurs' ou 'cuisiniers'
  const [serveurs, setServeurs] = useState([]);
  const [cuisiniers, setCuisiniers] = useState([]);
  const [stats, setStats] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [modalType, setModalType] = useState("serveur"); // 'serveur' ou 'cuisinier'
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const API_URL = "http://localhost:5230/api";

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!userData || !token) {
      router.push("/");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "Admin") {
      router.push("/");
      return;
    }

    setUser(parsedUser);
    loadData(token);
  }, []);

  const loadData = async (token) => {
    try {
      const [serveursRes, cuisiniersRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/Admin/serveurs`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/Admin/cuisiniers`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/Admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (serveursRes.ok) setServeurs(await serveursRes.json());
      if (cuisiniersRes.ok) setCuisiniers(await cuisiniersRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (error) {
      console.error("Erreur de chargement", error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      const endpoint = modalType === "serveur" ? "serveurs" : "cuisiniers";
      const url = editingUser
        ? `${API_URL}/Admin/${endpoint}/${editingUser.id}`
        : `${API_URL}/Admin/${endpoint}`;

      const response = await fetch(url, {
        method: editingUser ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const userType = modalType === "serveur" ? "Serveur" : "Cuisinier";
        setMessage(
          editingUser
            ? `${userType} modifié avec succès`
            : `${userType} créé avec succès`
        );
        setShowModal(false);
        loadData(token);
        setTimeout(() => setMessage(""), 3000);
      } else {
        const error = await response.json();
        setMessage(error.message || "Erreur");
      }
    } catch (error) {
      setMessage("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, type) => {
    const userType = type === "serveur" ? "serveur" : "cuisinier";
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ce ${userType}?`)) return;

    const token = localStorage.getItem("token");
    const endpoint = type === "serveur" ? "serveurs" : "cuisiniers";

    try {
      const response = await fetch(`${API_URL}/Admin/${endpoint}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setMessage(`${userType.charAt(0).toUpperCase() + userType.slice(1)} supprimé avec succès`);
        loadData(token);
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      setMessage("Erreur lors de la suppression");
    }
  };

  const openModal = (type, user = null) => {
    setModalType(type);
    setEditingUser(user);
    setFormData(
      user
        ? { username: user.username, password: "", fullName: user.fullName }
        : { username: "", password: "", fullName: "" }
    );
    setShowModal(true);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                🍽️ MonResto - Admin
              </h1>
              <p className="text-sm text-gray-600">
                Bienvenue, {user.fullName}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              <LogOut size={18} />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            {message}
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Serveurs</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats.totalServeurs}
                  </p>
                </div>
                <Users className="text-blue-600" size={40} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Cuisiniers</p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.totalCuisiniers}
                  </p>
                </div>
                <ChefHat className="text-green-600" size={40} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Tables</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {stats.totalTables}
                  </p>
                </div>
                <Coffee className="text-purple-600" size={40} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tables Libres</p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.tablesLibres}
                  </p>
                </div>
                <div className="text-green-600 text-2xl">✓</div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("serveurs")}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${activeTab === "serveurs"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
                }`}
            >
              🍽️ Serveurs ({serveurs.length})
            </button>
            <button
              onClick={() => setActiveTab("cuisiniers")}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${activeTab === "cuisiniers"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-600 hover:text-gray-800"
                }`}
            >
              👨‍🍳 Cuisiniers ({cuisiniers.length})
            </button>
          </div>
        </div>

        {/* Content Serveurs */}
        {activeTab === "serveurs" && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  Gestion des Serveurs
                </h2>
                <button
                  onClick={() => openModal("serveur")}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={18} />
                  Ajouter un serveur
                </button>
              </div>
            </div>

            <div className="p-6">
              {serveurs.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Aucun serveur enregistré
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {serveurs.map((serveur) => (
                    <div
                      key={serveur.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {serveur.fullName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            @{serveur.username}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                          {serveur.role}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal("serveur", serveur)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors text-sm"
                        >
                          <Edit size={16} />
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(serveur.id, "serveur")}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
                        >
                          <Trash2 size={16} />
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content Cuisiniers */}
        {activeTab === "cuisiniers" && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  Gestion des Cuisiniers
                </h2>
                <button
                  onClick={() => openModal("cuisinier")}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus size={18} />
                  Ajouter un cuisinier
                </button>
              </div>
            </div>

            <div className="p-6">
              {cuisiniers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Aucun cuisinier enregistré
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cuisiniers.map((cuisinier) => (
                    <div
                      key={cuisinier.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {cuisinier.fullName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            @{cuisinier.username}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium">
                          {cuisinier.role}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal("cuisinier", cuisinier)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors text-sm"
                        >
                          <Edit size={16} />
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(cuisinier.id, "cuisinier")}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
                        >
                          <Trash2 size={16} />
                          Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">
              {editingUser
                ? `Modifier le ${modalType}`
                : `Ajouter un ${modalType}`}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Jean Dupont"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={modalType === "serveur" ? "serveur2" : "chef2"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe{" "}
                  {editingUser && "(laisser vide pour ne pas changer)"}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="********"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 ${modalType === "serveur" ? "bg-blue-600" : "bg-green-600"
                  }`}
              >
                {loading
                  ? "En cours..."
                  : editingUser
                    ? "Modifier"
                    : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
