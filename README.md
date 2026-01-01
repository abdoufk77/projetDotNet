# 🍽️ MonResto - Système de Gestion de Restaurant

MonResto est une application web complète pour la gestion d'un restaurant, facilitant la coordination entre les serveurs, les cuisiniers et l'administration. Elle permet une gestion fluide des commandes, des tables et du menu en temps réel.

## 🚀 Fonctionnalités Principales

L'application est divisée en trois espaces sécurisés par rôle :

### 👨‍💼 Espace Admin
- **Gestion des Utilisateurs** : Création et modification des comptes (Cuisiniers, Serveurs).
- **Supervision** : Vue d'ensemble de l'activité du restaurant.
- **Gestion des Tables** : Configuration du plan de salle.

### 👨‍🍳 Espace Cuisinier
- **Gestion du Menu** : Ajout, modification, et suppression de plats. Gestion de la disponibilité .
- **Suivi des Commandes** : Réception des commandes en temps réel.
- **Workflow de Cuisine** : Changement de statut des commandes (En attente -> En préparation -> Prête).

### 🤵 Espace Serveur
- **Prise de Commande** : Interface intuitive pour créer des commandes par table.
- **Suivi** : Notification des plats prêts à être servis.
- **Gestion des Tables** : Changement de statut (Libre, Occupée) et génération de QR Codes.

## 🛠️ Stack Technique

### Backend (API)
- **Framework** : .NET 8 (ASP.NET Core Web API)
- **Base de Données** : MongoDB
- **Authentification** : JWT (JSON Web Tokens)
- **Architecture** : Services / Controllers pattern

### Frontend (Client)
- **Framework** : Next.js 14 (App Router)
- **Langage** : JavaScript / React
- **Styling** : Tailwind CSS
- **Icônes** : Lucide React

## ⚙️ Prérequis

- **.NET SDK 8.0** ou supérieur
- **Node.js 18+** et **npm**
- **MongoDB** (Local ou Atlas)

## 📦 Installation et Démarrage

### 1. Configuration du Backend

1. Naviguez dans le dossier du backend :
   ```bash
   cd MonResto/MonResto
   ```

2. Configurez la connexion MongoDB dans `appsettings.json` (si nécessaire) :
   ```json
   "MongoDbString": "mongodb://localhost:27017",
   "DatabaseName": "MonRestoDB"
   ```

3. Lancez le serveur :
   ```bash
   dotnet run
   ```
   L'API sera accessible sur `http://localhost:5230`.

### 2. Configuration du Frontend

1. Naviguez dans le dossier du frontend :
   ```bash
   cd mon-resto-front
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```
   L'application sera accessible sur `http://localhost:3000`.

## 📁 Structure du Projet

```
projetDotNet/
├── MonResto/               # Backend ASP.NET Core
│   ├── Controllers/        # Points d'entrée API
│   ├── Models/             # Modèles de données (MongoDB)
│   ├── Services/           # Logique métier
│   └── ...
│
└── mon-resto-front/        # Frontend Next.js
    ├── app/                # Pages et Routing (App Router)
    │   ├── admin/          # Dashboard Admin
    │   ├── cuisinier/      # Dashboard Cuisinier
    │   └── serveur/        # Dashboard Serveur
    ├── components/         # Composants Réutilisables
    └── ...
```

## 🔒 Comptes de Test (Par défaut)

L'application peut être initialisée avec des comptes par défaut (voir `MongoDbSeeder.cs` si implémenté) ou vous pouvez créer un admin manuellement via l'API.

---
*Projet réalisé dans le cadre de l'examen de Développement .NET.*
