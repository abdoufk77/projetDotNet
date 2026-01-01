// app/serveur/dashboard/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Coffee,
  Plus,
  Edit,
  Trash2,
  QrCode,
  CheckCircle,
  Clock,
  AlertCircle,
  Package,
} from "lucide-react";

export default function ServeurDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("tables"); // 'tables' ou 'commandes'

  // États Tables
  const [tables, setTables] = useState([]);
  const [showTableModal, setShowTableModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [qrCodeImage, setQrCodeImage] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [tableFormData, setTableFormData] = useState({
    numeroTable: "",
    statut: "Libre",
  });

  // États Commandes
  const [commandes, setCommandes] = useState([]);
  const [selectedCommandeFilter, setSelectedCommandeFilter] = useState("all"); // 'all', 'pretes'

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
    if (parsedUser.role !== "Serveur") {
      router.push("/");
      return;
    }

    setUser(parsedUser);
    loadData(token);

    // Rafraîchir les données toutes les 10 secondes
    const interval = setInterval(() => loadData(token), 10000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async (token) => {
    await Promise.all([loadTables(token), loadCommandes(token)]);
  };

  const loadTables = async (token) => {
    try {
      const response = await fetch(`${API_URL}/Serveur/tables`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setTables(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des tables", error);
    }
  };

  const loadCommandes = async (token) => {
    try {
      const response = await fetch(`${API_URL}/Serveur/commandes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCommandes(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des commandes", error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  // Gestion Tables
  const handleTableSubmit = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      const url = editingTable
        ? `${API_URL}/Serveur/tables/${editingTable.id}`
        : `${API_URL}/Serveur/tables`;

      const response = await fetch(url, {
        method: editingTable ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(tableFormData),
      });

      if (response.ok) {
        setMessage(
          editingTable
            ? "Table modifiée avec succès"
            : "Table créée avec succès"
        );
        setShowTableModal(false);
        loadTables(token);
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

  const handleDeleteTable = async (id) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette table?")) return;

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/Serveur/tables/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setMessage("Table supprimée avec succès");
        loadTables(token);
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      setMessage("Erreur lors de la suppression");
    }
  };

  const updateTableStatut = async (tableId, newStatut) => {
    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/Serveur/tables/${tableId}/statut`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ statut: newStatut }),
        }
      );

      if (response.ok) {
        setMessage("Statut mis à jour");
        loadTables(token);
        setTimeout(() => setMessage(""), 2000);
      }
    } catch (error) {
      setMessage("Erreur");
    } finally {
      setLoading(false);
    }
  };

  const showQrCode = async (tableId) => {
    const token = localStorage.getItem("token");
    try {
      const imageResponse = await fetch(
        `${API_URL}/Serveur/tables/${tableId}/qrcode`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (imageResponse.ok) {
        const blob = await imageResponse.blob();
        const url = URL.createObjectURL(blob);
        setQrCodeImage(url);
      }

      const urlResponse = await fetch(
        `${API_URL}/Serveur/tables/${tableId}/qrcode-url`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (urlResponse.ok) {
        const data = await urlResponse.json();
        setQrCodeUrl(data.url);
      }
    } catch (error) {
      console.error("Erreur QR code", error);
    }
  };

  // Gestion Commandes
  const marquerServie = async (commandeId) => {
    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/Serveur/commandes/${commandeId}/statut`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ statut: "Servie" }),
        }
      );

      if (response.ok) {
        setMessage("Commande marquée comme servie");
        loadCommandes(token);
        setTimeout(() => setMessage(""), 2000);
      }
    } catch (error) {
      setMessage("Erreur");
    } finally {
      setLoading(false);
    }
  };

  const getTableStatutColor = (statut) => {
    switch (statut) {
      case "Libre":
        return "bg-green-100 text-green-700 border-green-200";
      case "Occupée":
        return "bg-red-100 text-red-700 border-red-200";
      case "Réservée":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getTableStatutIcon = (statut) => {
    switch (statut) {
      case "Libre":
        return "✓";
      case "Occupée":
        return "●";
      case "Réservée":
        return "◐";
      default:
        return "○";
    }
  };

  const getCommandeStatutColor = (statut) => {
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

  const getCommandeStatutIcon = (statut) => {
    switch (statut) {
      case "EnAttente":
        return <Clock size={18} />;
      case "EnPreparation":
        return <Package size={18} />;
      case "Prete":
        return <CheckCircle size={18} />;
      case "Servie":
        return <CheckCircle size={18} />;
      default:
        return <AlertCircle size={18} />;
    }
  };

  const getCommandeStatutLabel = (statut) => {
    switch (statut) {
      case "EnAttente":
        return "En Attente";
      case "EnPreparation":
        return "En Préparation";
      case "Prete":
        return "Prête";
      case "Servie":
        return "Servie";
      default:
        return statut;
    }
  };

  const filteredCommandes =
    selectedCommandeFilter === "all"
      ? commandes.filter((c) => c.statut !== "Servie")
      : commandes.filter((c) => c.statut === "Prete");

  const commandesStats = {
    pretes: commandes.filter((c) => c.statut === "Prete").length,
    enCours: commandes.filter(
      (c) => c.statut === "EnAttente" || c.statut === "EnPreparation"
    ).length,
  };

  const tablesStats = {
    total: tables.length,
    libres: tables.filter((t) => t.statut === "Libre").length,
    occupees: tables.filter((t) => t.statut === "Occupée").length,
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
                🍽️ MonResto - Serveur
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
              onClick={() => setActiveTab("tables")}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${activeTab === "tables"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
                }`}
            >
              🪑 Gestion des Tables ({tables.length})
            </button>
            <button
              onClick={() => setActiveTab("commandes")}
              className={`flex-1 px-6 py-4 font-semibold transition-colors relative ${activeTab === "commandes"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
                }`}
            >
              📦 Commandes à servir
              {commandesStats.pretes > 0 && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold animate-pulse">
                  {commandesStats.pretes}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content Tables */}
        {activeTab === "tables" && (
          <>
            {/* Stats Tables */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Tables</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {tablesStats.total}
                    </p>
                  </div>
                  <Coffee className="text-blue-600" size={40} />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Tables Libres</p>
                    <p className="text-3xl font-bold text-green-600">
                      {tablesStats.libres}
                    </p>
                  </div>
                  <div className="text-green-600 text-4xl">✓</div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Tables Occupées
                    </p>
                    <p className="text-3xl font-bold text-red-600">
                      {tablesStats.occupees}
                    </p>
                  </div>
                  <div className="text-red-600 text-4xl">●</div>
                </div>
              </div>
            </div>

            {/* Gestion des Tables */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">
                    Gestion des Tables
                  </h2>
                  <button
                    onClick={() => {
                      setEditingTable(null);
                      setTableFormData({ numeroTable: "", statut: "Libre" });
                      setShowTableModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={18} />
                    Ajouter une table
                  </button>
                </div>
              </div>

              <div className="p-6">
                {tables.length === 0 ? (
                  <div className="text-center py-12">
                    <Coffee className="mx-auto text-gray-400 mb-4" size={64} />
                    <p className="text-gray-500 text-lg">
                      Aucune table enregistrée
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {tables.map((table) => (
                      <div
                        key={table.id}
                        className={`border-2 rounded-lg p-4 hover:shadow-lg transition-all ${getTableStatutColor(
                          table.statut
                        )}`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-2xl font-bold text-gray-800">
                            Table {table.numeroTable}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${getTableStatutColor(
                              table.statut
                            )}`}
                          >
                            {getTableStatutIcon(table.statut)} {table.statut}
                          </span>
                        </div>

                        {/* Changement de statut rapide */}
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <button
                            onClick={() => updateTableStatut(table.id, "Libre")}
                            disabled={loading || table.statut === "Libre"}
                            className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 disabled:opacity-50 font-medium"
                          >
                            Libre
                          </button>
                          <button
                            onClick={() =>
                              updateTableStatut(table.id, "Occupée")
                            }
                            disabled={loading || table.statut === "Occupée"}
                            className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 disabled:opacity-50 font-medium"
                          >
                            Occupée
                          </button>
                          <button
                            onClick={() =>
                              updateTableStatut(table.id, "Réservée")
                            }
                            disabled={loading || table.statut === "Réservée"}
                            className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200 disabled:opacity-50 font-medium"
                          >
                            Réservée
                          </button>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2">
                          <button
                            onClick={() => showQrCode(table.id)}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm font-medium"
                          >
                            <QrCode size={16} />
                            Voir QR Code
                          </button>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingTable(table);
                                setTableFormData({
                                  numeroTable: table.numeroTable,
                                  statut: table.statut,
                                });
                                setShowTableModal(true);
                              }}
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm font-medium"
                            >
                              <Edit size={14} />
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDeleteTable(table.id)}
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
                            >
                              <Trash2 size={14} />
                              Supprimer
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Content Commandes */}
        {activeTab === "commandes" && (
          <>
            {/* Stats Commandes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700 font-semibold mb-1">
                      Commandes Prêtes
                    </p>
                    <p className="text-4xl font-bold text-green-600">
                      {commandesStats.pretes}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      À servir immédiatement
                    </p>
                  </div>
                  <CheckCircle className="text-green-600" size={48} />
                </div>
              </div>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700 font-semibold mb-1">
                      En Cours
                    </p>
                    <p className="text-4xl font-bold text-blue-600">
                      {commandesStats.enCours}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">En préparation</p>
                  </div>
                  <Package className="text-blue-600" size={48} />
                </div>
              </div>
            </div>

            {/* Filtres */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setSelectedCommandeFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedCommandeFilter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
              >
                Toutes les commandes actives
              </button>
              <button
                onClick={() => setSelectedCommandeFilter("pretes")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedCommandeFilter === "pretes"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
              >
                Prêtes à servir ({commandesStats.pretes})
              </button>
            </div>

            {/* Liste Commandes */}
            <div className="space-y-4">
              {filteredCommandes.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <Package className="mx-auto text-gray-400 mb-4" size={64} />
                  <p className="text-gray-500 text-lg">
                    Aucune commande en attente
                  </p>
                </div>
              ) : (
                filteredCommandes.map((commande) => (
                  <div
                    key={commande.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div
                      className={`p-4 border-l-4 ${getCommandeStatutColor(
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
                              className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${getCommandeStatutColor(
                                commande.statut
                              )}`}
                            >
                              {getCommandeStatutIcon(commande.statut)}
                              {getCommandeStatutLabel(commande.statut)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Table {commande.numeroTable} •{" "}
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
                      {commande.statut === "Prete" && (
                        <button
                          onClick={() => marquerServie(commande.id)}
                          disabled={loading}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50"
                        >
                          <CheckCircle size={20} />
                          Marquer comme servie
                        </button>
                      )}

                      {(commande.statut === "EnAttente" ||
                        commande.statut === "EnPreparation") && (
                          <div className="px-4 py-3 bg-blue-100 text-blue-700 rounded-lg text-center font-semibold">
                            ⏳ En préparation par le cuisinier...
                          </div>
                        )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal Table */}
      {showTableModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">
              {editingTable ? "Modifier la table" : "Ajouter une table"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de table
                </label>
                <input
                  type="number"
                  value={tableFormData.numeroTable}
                  onChange={(e) =>
                    setTableFormData({
                      ...tableFormData,
                      numeroTable: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 1"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  value={tableFormData.statut}
                  onChange={(e) =>
                    setTableFormData({
                      ...tableFormData,
                      statut: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Libre">Libre</option>
                  <option value="Occupée">Occupée</option>
                  <option value="Réservée">Réservée</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowTableModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleTableSubmit}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "En cours..." : editingTable ? "Modifier" : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal QR Code */}
      {qrCodeImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6 z-50"
          onClick={() => {
            setQrCodeImage(null);
            setQrCodeUrl(null);
          }}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4 text-center">
              QR Code de la Table
            </h3>
            <div className="flex justify-center mb-4">
              <img
                src={qrCodeImage}
                alt="QR Code"
                className="max-w-sm border-4 border-gray-200 rounded-lg"
              />
            </div>
            {qrCodeUrl && (
              <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Lien du menu:</p>
                <p className="text-sm text-blue-600 break-all font-mono">
                  {qrCodeUrl}
                </p>
              </div>
            )}
            <button
              onClick={() => {
                setQrCodeImage(null);
                setQrCodeUrl(null);
              }}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
