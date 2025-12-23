"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Check,
  ChefHat,
} from "lucide-react";

export default function MenuClient() {
  const params = useParams();
  const tableId = params.tableId;

  const [table, setTable] = useState(null);
  const [menu, setMenu] = useState([]);
  const [panier, setPanier] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPanier, setShowPanier] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedCategorie, setSelectedCategorie] = useState("Tous");

  const API_URL = "http://localhost:5230/api";

  useEffect(() => {
    loadData();
  }, [tableId]);

  const loadData = async () => {
    try {
      // Charger les infos de la table
      const tableRes = await fetch(`${API_URL}/Table/qrcode/${tableId}`);
      if (tableRes.ok) {
        const tableData = await tableRes.json();
        setTable(tableData);
      }

      // Charger le menu
      const menuRes = await fetch(`${API_URL}/Menu`);
      if (menuRes.ok) {
        const menuData = await menuRes.json();
        setMenu(menuData);
      }
    } catch (error) {
      console.error("Erreur de chargement", error);
    } finally {
      setLoading(false);
    }
  };

  const ajouterAuPanier = (item) => {
    const existant = panier.find((p) => p.menuItemId === item.id);
    if (existant) {
      setPanier(
        panier.map((p) =>
          p.menuItemId === item.id ? { ...p, quantite: p.quantite + 1 } : p
        )
      );
    } else {
      setPanier([
        ...panier,
        {
          menuItemId: item.id,
          nom: item.nom,
          quantite: 1,
          prixUnitaire: item.prix,
          notes: "",
        },
      ]);
    }
  };

  const modifierQuantite = (menuItemId, delta) => {
    setPanier(
      panier
        .map((p) => {
          if (p.menuItemId === menuItemId) {
            const nouvelleQuantite = p.quantite + delta;
            return nouvelleQuantite > 0
              ? { ...p, quantite: nouvelleQuantite }
              : null;
          }
          return p;
        })
        .filter(Boolean)
    );
  };

  const retirerDuPanier = (menuItemId) => {
    setPanier(panier.filter((p) => p.menuItemId !== menuItemId));
  };

  const calculerTotal = () => {
    return panier.reduce(
      (total, item) => total + item.prixUnitaire * item.quantite,
      0
    );
  };

  const passerCommande = async () => {
    if (panier.length === 0) return;

    try {
      const response = await fetch(`${API_URL}/Commande/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: table.id,
          items: panier,
        }),
      });

      if (response.ok) {
        setShowConfirmation(true);
        setPanier([]);
        setShowPanier(false);
        setTimeout(() => setShowConfirmation(false), 5000);
      }
    } catch (error) {
      console.error("Erreur lors de la commande", error);
    }
  };

  const getCategorieIcon = (categorie) => {
    switch (categorie) {
      case "Entrée":
        return "🥗";
      case "Plat":
        return "🍽️";
      case "Dessert":
        return "🍰";
      case "Boisson":
        return "🥤";
      default:
        return "📋";
    }
  };

  const categories = ["Tous", ...new Set(menu.map((cat) => cat.categorie))];

  const menuFiltre =
    selectedCategorie === "Tous"
      ? menu
      : menu.filter((cat) => cat.categorie === selectedCategorie);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du menu...</p>
        </div>
      </div>
    );
  }

  if (!table) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-2xl text-red-600 mb-2">❌ Table non trouvée</p>
          <p className="text-gray-600">Veuillez scanner un QR code valide</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white sticky top-0 z-10 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-2">🍽️ MonResto</h1>
          <div className="flex justify-between items-center">
            <p className="text-purple-100">Table {table.numeroTable}</p>
            <button
              onClick={() => setShowPanier(!showPanier)}
              className="relative bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition-colors flex items-center gap-2"
            >
              <ShoppingCart size={20} />
              Panier
              {panier.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                  {panier.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation */}
      {showConfirmation && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-4 rounded-lg shadow-xl z-50 flex items-center gap-3">
          <Check size={24} />
          <div>
            <p className="font-bold">Commande envoyée !</p>
            <p className="text-sm">Votre commande est en préparation</p>
          </div>
        </div>
      )}

      {/* Filtres Catégories */}
      <div className="bg-white shadow-sm sticky top-[120px] z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategorie(cat)}
                className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all ${selectedCategorie === cat
                    ? "bg-purple-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {cat === "Tous" ? "📋 Tous" : `${getCategorieIcon(cat)} ${cat}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {menuFiltre.length === 0 ? (
          <div className="text-center py-12">
            <ChefHat className="mx-auto text-gray-400 mb-4" size={64} />
            <p className="text-gray-500 text-lg">Aucun plat disponible</p>
          </div>
        ) : (
          menuFiltre.map((categorie) => (
            <div key={categorie.categorie} className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>{getCategorieIcon(categorie.categorie)}</span>
                {categorie.categorie}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categorie.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                  >
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-gray-800">
                          {item.nom}
                        </h3>
                        <span className="text-xl font-bold text-purple-600">
                          {item.prix.toFixed(2)} DH
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">
                        {item.description}
                      </p>
                      <button
                        onClick={() => ajouterAuPanier(item)}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
                      >
                        <Plus size={18} />
                        Ajouter au panier
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Panier Flottant */}
      {showPanier && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowPanier(false)}
        >
          <div
            className="fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-2xl z-50 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <ShoppingCart size={24} />
                Mon Panier
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {panier.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart
                    className="mx-auto text-gray-400 mb-4"
                    size={64}
                  />
                  <p className="text-gray-500">Votre panier est vide</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {panier.map((item) => (
                    <div
                      key={item.menuItemId}
                      className="bg-gray-50 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">
                            {item.nom}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {item.prixUnitaire.toFixed(2)} DH
                          </p>
                        </div>
                        <button
                          onClick={() => retirerDuPanier(item.menuItemId)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 bg-white rounded-lg p-1">
                          <button
                            onClick={() =>
                              modifierQuantite(item.menuItemId, -1)
                            }
                            className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="font-bold w-8 text-center">
                            {item.quantite}
                          </span>
                          <button
                            onClick={() => modifierQuantite(item.menuItemId, 1)}
                            className="w-8 h-8 flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white rounded"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <span className="font-bold text-purple-600">
                          {(item.prixUnitaire * item.quantite).toFixed(2)} DH
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {panier.length > 0 && (
              <div className="border-t bg-white p-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-gray-700">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-purple-600">
                    {calculerTotal().toFixed(2)} DH
                  </span>
                </div>
                <button
                  onClick={passerCommande}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-3 rounded-lg font-bold hover:from-green-700 hover:to-green-600 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={20} />
                  Commander
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bouton Panier Fixe (mobile) */}
      {panier.length > 0 && !showPanier && (
        <button
          onClick={() => setShowPanier(true)}
          className="fixed bottom-6 right-6 bg-purple-600 text-white p-4 rounded-full shadow-2xl hover:bg-purple-700 transition-all z-30"
        >
          <ShoppingCart size={24} />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
            {panier.length}
          </span>
        </button>
      )}
    </div>
  );
}
