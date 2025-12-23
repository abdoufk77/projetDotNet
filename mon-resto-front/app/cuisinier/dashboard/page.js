"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Plus,
  Edit,
  Trash2,
  ChefHat,
  Coffee,
  UtensilsCrossed,
  Cake,
  Wine,
  Eye,
  EyeOff,
  Clock,
  CheckCircle,
  PlayCircle,
  AlertCircle,
} from "lucide-react";

export default function CuisinierDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("commandes"); // 'commandes' ou 'menu'

  // États Menu
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategorie, setSelectedCategorie] = useState("Tous");
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [menuFormData, setMenuFormData] = useState({
    nom: "",
    description: "",
    prix: "",
    categorie: "",
    imageUrl: "",
    disponible: true,
  });

  // États Commandes
  const [commandes, setCommandes] = useState([]);
  const [selectedCommandeFilter, setSelectedCommandeFilter] = useState("all"); // 'all', 'en-attente', 'en-preparation'

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
    if (parsedUser.role !== "Cuisinier" && parsedUser.role !== "Admin") {
      router.push("/");
      return;
    }

    setUser(parsedUser);
    loadData(token);

    // Rafraîchir les commandes toutes les 10 secondes
    const interval = setInterval(() => loadCommandes(token), 10000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async (token) => {
    await Promise.all([
      loadMenuItems(token),
      loadCategories(token),
      loadCommandes(token),
    ]);
  };

  const loadMenuItems = async (token) => {
    try {
      const response = await fetch(`${API_URL}/Cuisinier/menu`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) setMenuItems(await response.json());
    } catch (error) {
      console.error("Erreur chargement menu", error);
    }
  };

  const loadCategories = async (token) => {
    try {
      const response = await fetch(`${API_URL}/Cuisinier/menu/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) setCategories(await response.json());
    } catch (error) {
      console.error("Erreur chargement catégories", error);
    }
  };

  const loadCommandes = async (token) => {
    try {
      const response = await fetch(`${API_URL}/Cuisinier/commandes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) setCommandes(await response.json());
    } catch (error) {
      console.error("Erreur chargement commandes", error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  // Gestion Menu
  const handleMenuSubmit = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      if (!menuFormData.nom || !menuFormData.prix || !menuFormData.categorie) {
        setMessage("Veuillez remplir tous les champs obligatoires");
        setLoading(false);
        return;
      }

      const url = editingItem
        ? `${API_URL}/Cuisinier/menu/${editingItem.id}`
        : `${API_URL}/Cuisinier/menu`;

      const response = await fetch(url, {
        method: editingItem ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...menuFormData,
          id: editingItem?.id || 0,
          prix: parseFloat(menuFormData.prix),
        }),
      });

      if (response.ok) {
        setMessage(
          editingItem ? "Plat modifié avec succès" : "Plat ajouté avec succès"
        );
        setShowMenuModal(false);
        loadMenuItems(token);
        resetMenuForm();
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

  const handleDeleteMenuItem = async (id) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce plat?")) return;
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/Cuisinier/menu/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setMessage("Plat supprimé avec succès");
        loadMenuItems(token);
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      setMessage("Erreur lors de la suppression");
    }
  };

  const toggleDisponibilite = async (id, disponible) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${API_URL}/Cuisinier/menu/${id}/disponibilite`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ disponible: !disponible }),
        }
      );

      if (response.ok) {
        loadMenuItems(token);
        setMessage(`Plat ${!disponible ? "activé" : "désactivé"}`);
        setTimeout(() => setMessage(""), 2000);
      }
    } catch (error) {
      setMessage("Erreur lors de la mise à jour");
    }
  };

  const resetMenuForm = () => {
    setMenuFormData({
      nom: "",
      description: "",
      prix: "",
      categorie: "",
      imageUrl: "",
      disponible: true,
    });
    setEditingItem(null);
  };

  // Gestion Commandes
  const demarrerPreparation = async (commandeId) => {
    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/Cuisinier/commandes/${commandeId}/demarrer`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        setMessage("Préparation démarrée");
        loadCommandes(token);
        setTimeout(() => setMessage(""), 2000);
      }
    } catch (error) {
      setMessage("Erreur");
    } finally {
      setLoading(false);
    }
  };

  const terminerPreparation = async (commandeId) => {
    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/Cuisinier/commandes/${commandeId}/terminer`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        setMessage("Commande prête!");
        loadCommandes(token);
        setTimeout(() => setMessage(""), 2000);
      }
    } catch (error) {
      setMessage("Erreur");
    } finally {
      setLoading(false);
    }
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case "EnAttente":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "EnPreparation":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "Prete":
        return "bg-green-100 text-green-700 border-green-300";
      case "Servie":
        return "bg-gray-100 text-gray-700 border-gray-300";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatutIcon = (statut) => {
    switch (statut) {
      case "EnAttente":
        return <Clock size={18} />;
      case "EnPreparation":
        return <PlayCircle size={18} />;
      case "Prete":
        return <CheckCircle size={18} />;
      case "Servie":
        return <CheckCircle size={18} />;
      default:
        return <AlertCircle size={18} />;
    }
  };

  const getCategorieIcon = (categorie) => {
    switch (categorie) {
      case "Entrée":
        return <UtensilsCrossed size={20} />;
      case "Plat":
        return <ChefHat size={20} />;
      case "Dessert":
        return <Cake size={20} />;
      case "Boisson":
        return <Wine size={20} />;
      default:
        return <Coffee size={20} />;
    }
  };

  const filteredMenuItems =
    selectedCategorie === "Tous"
      ? menuItems
      : menuItems.filter((item) => item.categorie === selectedCategorie);

  const filteredCommandes =
    selectedCommandeFilter === "all"
      ? commandes.filter((c) => c.statut !== "Servie")
      : commandes.filter((c) => {
        if (selectedCommandeFilter === "en-attente")
          return c.statut === "EnAttente";
        if (selectedCommandeFilter === "en-preparation")
          return c.statut === "EnPreparation";
        return true;
      });

  const commandesStats = {
    enAttente: commandes.filter((c) => c.statut === "EnAttente").length,
    enPreparation: commandes.filter((c) => c.statut === "EnPreparation").length,
    pretes: commandes.filter((c) => c.statut === "Prete").length,
  };

  const menuStats = {
    total: menuItems.length,
    disponibles: menuItems.filter((i) => i.disponible).length,
    entrees: menuItems.filter((i) => i.categorie === "Entrée").length,
    plats: menuItems.filter((i) => i.categorie === "Plat").length,
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                👨‍🍳 MonResto - Cuisinier
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
        {/* Message */}
        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("commandes")}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${activeTab === "commandes"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
                }`}
            >
              📋 Commandes (
              {commandesStats.enAttente + commandesStats.enPreparation})
            </button>
            <button
              onClick={() => setActiveTab("menu")}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${activeTab === "menu"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-800"
                }`}
            >
              🍽️ Gestion du Menu
            </button>
          </div>
        </div>

        {/* Content Commandes */}
        {activeTab === "commandes" && (
          <>
            {/* Stats Commandes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-700 font-semibold mb-1">
                      En Attente
                    </p>
                    <p className="text-4xl font-bold text-yellow-600">
                      {commandesStats.enAttente}
                    </p>
                  </div>
                  <Clock className="text-yellow-600" size={48} />
                </div>
              </div>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700 font-semibold mb-1">
                      En Préparation
                    </p>
                    <p className="text-4xl font-bold text-blue-600">
                      {commandesStats.enPreparation}
                    </p>
                  </div>
                  <PlayCircle className="text-blue-600" size={48} />
                </div>
              </div>
              <div className="bg-green-50 border-2 border-green-200 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700 font-semibold mb-1">
                      Prêtes
                    </p>
                    <p className="text-4xl font-bold text-green-600">
                      {commandesStats.pretes}
                    </p>
                  </div>
                  <CheckCircle className="text-green-600" size={48} />
                </div>
              </div>
            </div>

            {/* Filtres Commandes */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setSelectedCommandeFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedCommandeFilter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
              >
                Toutes
              </button>
              <button
                onClick={() => setSelectedCommandeFilter("en-attente")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedCommandeFilter === "en-attente"
                    ? "bg-yellow-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
              >
                En Attente
              </button>
              <button
                onClick={() => setSelectedCommandeFilter("en-preparation")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedCommandeFilter === "en-preparation"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
              >
                En Préparation
              </button>
            </div>

            {/* Liste Commandes */}
            <div className="space-y-4">
              {filteredCommandes.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <ChefHat className="mx-auto text-gray-400 mb-4" size={64} />
                  <p className="text-gray-500 text-lg">
                    Aucune commande en cours
                  </p>
                </div>
              ) : (
                filteredCommandes.map((commande) => (
                  <div
                    key={commande.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div
                      className={`p-4 border-l-4 ${getStatutColor(
                        commande.statut
                      )}`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-bold text-gray-800">
                              Commande #{commande.id}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${getStatutColor(
                                commande.statut
                              )}`}
                            >
                              {getStatutIcon(commande.statut)}
                              {commande.statut === "EnAttente"
                                ? "En Attente"
                                : commande.statut === "EnPreparation"
                                  ? "En Préparation"
                                  : "Prête"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Table {commande.tableId} •{" "}
                            {new Date(commande.dateCommande).toLocaleTimeString(
                              "fr-FR",
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-purple-600">
                            {commande.total.toFixed(2)} MAD
                          </p>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-gray-700 mb-3">
                          Articles:
                        </h4>
                        <div className="space-y-2">
                          {commande.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center"
                            >
                              <div className="flex items-center gap-2">
                                <span className="bg-white px-2 py-1 rounded font-bold text-sm">
                                  {item.quantite}x
                                </span>
                                <span className="font-medium">{item.nom}</span>
                                {item.notes && (
                                  <span className="text-xs text-gray-500 italic">
                                    ({item.notes})
                                  </span>
                                )}
                              </div>
                              <span className="text-gray-600">
                                {(item.prixUnitaire * item.quantite).toFixed(2)}{" "}
                                MAD
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        {commande.statut === "EnAttente" && (
                          <button
                            onClick={() => demarrerPreparation(commande.id)}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50"
                          >
                            <PlayCircle size={20} />
                            Démarrer la préparation
                          </button>
                        )}
                        {commande.statut === "EnPreparation" && (
                          <button
                            onClick={() => terminerPreparation(commande.id)}
                            disabled={loading}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50"
                          >
                            <CheckCircle size={20} />
                            Marquer comme prête
                          </button>
                        )}
                        {commande.statut === "Prete" && (
                          <div className="flex-1 px-4 py-3 bg-green-100 text-green-700 rounded-lg text-center font-semibold">
                            ✓ Prête - En attente du serveur
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Content Menu */}
        {activeTab === "menu" && (
          <>
            {/* Stats Menu */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Plats</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {menuStats.total}
                    </p>
                  </div>
                  <Coffee className="text-blue-600" size={40} />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Disponibles</p>
                    <p className="text-3xl font-bold text-green-600">
                      {menuStats.disponibles}
                    </p>
                  </div>
                  <Eye className="text-green-600" size={40} />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Entrées</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {menuStats.entrees}
                    </p>
                  </div>
                  <UtensilsCrossed className="text-purple-600" size={40} />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Plats</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {menuStats.plats}
                    </p>
                  </div>
                  <ChefHat className="text-orange-600" size={40} />
                </div>
              </div>
            </div>

            {/* Gestion Menu */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    Gestion du Menu
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategorie("Tous")}
                      className={`px-3 py-1 rounded-lg text-sm ${selectedCategorie === "Tous"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    >
                      Tous
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategorie(cat)}
                        className={`px-3 py-1 rounded-lg text-sm ${selectedCategorie === cat
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      resetMenuForm();
                      setShowMenuModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus size={18} />
                    Ajouter un plat
                  </button>
                </div>
              </div>

              <div className="p-6">
                {filteredMenuItems.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Aucun plat dans cette catégorie
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMenuItems.map((item) => (
                      <div
                        key={item.id}
                        className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${!item.disponible
                            ? "bg-gray-50 opacity-75"
                            : "bg-white"
                          }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getCategorieIcon(item.categorie)}
                              <h3 className="font-semibold text-gray-800">
                                {item.nom}
                              </h3>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {item.description}
                            </p>
                            <p className="text-lg font-bold text-green-600">
                              {item.prix.toFixed(2)} MAD
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs rounded font-medium ${item.categorie === "Entrée"
                                ? "bg-purple-100 text-purple-700"
                                : item.categorie === "Plat"
                                  ? "bg-orange-100 text-orange-700"
                                  : item.categorie === "Dessert"
                                    ? "bg-pink-100 text-pink-700"
                                    : "bg-blue-100 text-blue-700"
                              }`}
                          >
                            {item.categorie}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              toggleDisponibilite(item.id, item.disponible)
                            }
                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded text-sm ${item.disponible
                                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                              }`}
                          >
                            {item.disponible ? (
                              <>
                                <EyeOff size={16} /> Désactiver
                              </>
                            ) : (
                              <>
                                <Eye size={16} /> Activer
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setMenuFormData({
                                nom: item.nom,
                                description: item.description,
                                prix: item.prix.toString(),
                                categorie: item.categorie,
                                imageUrl: item.imageUrl || "",
                                disponible: item.disponible,
                              });
                              setShowMenuModal(true);
                            }}
                            className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteMenuItem(item.id)}
                            className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal Menu */}
      {showMenuModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingItem ? "Modifier le plat" : "Ajouter un plat"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du plat *
                </label>
                <input
                  type="text"
                  value={menuFormData.nom}
                  onChange={(e) =>
                    setMenuFormData({ ...menuFormData, nom: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Tajine poulet"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={menuFormData.description}
                  onChange={(e) =>
                    setMenuFormData({
                      ...menuFormData,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Description du plat"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix (MAD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={menuFormData.prix}
                  onChange={(e) =>
                    setMenuFormData({ ...menuFormData, prix: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="120.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie *
                </label>
                <select
                  value={menuFormData.categorie}
                  onChange={(e) =>
                    setMenuFormData({
                      ...menuFormData,
                      categorie: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="disponible"
                  checked={menuFormData.disponible}
                  onChange={(e) =>
                    setMenuFormData({
                      ...menuFormData,
                      disponible: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="disponible" className="text-sm text-gray-700">
                  Disponible
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowMenuModal(false);
                  resetMenuForm();
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleMenuSubmit}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "En cours..." : editingItem ? "Modifier" : "Ajouter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
