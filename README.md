# Suivi de Budget Personnel

Application web pour suivre tes revenus et dépenses, avec graphiques et filtres par mois.

---

## Ce que fait l'application

- Ajouter des **revenus** et des **dépenses** avec une catégorie
- Voir en un coup d'œil ton **solde**, tes revenus totaux et tes dépenses totales
- Consulter un **graphique** qui montre où va ton argent par catégorie
- Filtrer par **mois** pour analyser chaque période
- Toutes tes données sont **sauvegardées automatiquement** dans ton navigateur (localStorage)

---

## Lancer l'application

Tu as deux façons de démarrer l'application : avec Docker (recommandé, aucune installation de code requise) ou en mode développement.

### Option 1 — Avec Docker (recommandé)

Docker permet de lancer l'application sans installer Node.js ni aucune dépendance sur ta machine.

**Étape 1 — Installer Docker Desktop**

Télécharge et installe Docker Desktop depuis le site officiel :
- Windows / Mac : https://www.docker.com/products/docker-desktop
- Linux : https://docs.docker.com/engine/install/

Lance Docker Desktop et attends que l'icône en bas à droite soit verte (« Docker is running »).

**Étape 2 — Télécharger le projet**

Si tu n'as pas encore le projet sur ta machine, télécharge le dossier et place-le où tu veux (par exemple sur le Bureau).

**Étape 3 — Ouvrir un terminal dans le dossier du projet**

- **Mac** : clique droit sur le dossier → « Nouveau terminal au dossier »
- **Windows** : ouvre le dossier, clique droit sur un espace vide → « Ouvrir dans le terminal »

**Étape 4 — Lancer l'application**

Tape cette commande dans le terminal :

```
docker compose up --build
```

La première fois, cette commande télécharge les outils nécessaires et construit l'application. Ça peut prendre 1 à 2 minutes. Les fois suivantes, ce sera beaucoup plus rapide.

**Étape 5 — Ouvrir l'application**

Une fois que tu vois `ready` dans le terminal, ouvre ton navigateur et va à l'adresse :

```
http://localhost:8080
```

**Pour arrêter l'application**, retourne dans le terminal et appuie sur `Ctrl + C`.

---

### Option 2 — En mode développement (pour les développeurs)

Cette option nécessite d'avoir **Node.js 20** ou plus installé sur ta machine.

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

L'application sera disponible sur `http://localhost:5173`.

---

## Utiliser l'application

### Ajouter une transaction

1. Dans la section **« Nouvelle transaction »**, choisis **Revenu** ou **Dépense**
2. Écris une description (ex : « Salaire de juin »)
3. Entre le montant en euros
4. Sélectionne la date
5. Si c'est une dépense, choisis une catégorie
6. Clique sur **« Ajouter »**

### Supprimer une transaction

Dans la liste des transactions, passe la souris sur une ligne — un bouton de suppression apparaît à droite.

### Filtrer par mois

Utilise les boutons de mois juste sous le tableau de bord pour voir uniquement les transactions d'un mois précis. Clique sur **« Tous »** pour tout réafficher.

---

## Catégories disponibles

| Catégorie | Usage |
|---|---|
| Transport | Essence, transports en commun, taxi |
| Alimentation | Courses, supermarché |
| Logement | Loyer, charges, internet |
| Divertissement | Cinéma, restaurants, sorties |
| Santé | Médecin, pharmacie, sport |
| Vêtements | Habits, chaussures, accessoires |
| Loisirs | Voyages, hobbies, livres |
| Autres | Tout ce qui ne rentre pas ailleurs |

---

## Structure du projet

```
App-Financial-Tracker/
├── src/
│   ├── components/        # Composants visuels (graphique, formulaire, liste…)
│   ├── hooks/             # Logique métier (calculs, sauvegarde…)
│   ├── constants.js       # Catégories et fonctions utilitaires
│   ├── App.jsx            # Composant principal
│   └── App.css            # Styles de l'application
├── Dockerfile             # Instructions pour construire l'image Docker
├── docker-compose.yml     # Commande de lancement simplifiée
├── nginx.conf             # Configuration du serveur web
├── index.html             # Point d'entrée HTML
└── package.json           # Dépendances du projet
```

---

## Technologies utilisées

| Technologie | Rôle |
|---|---|
| React 18 | Interface utilisateur |
| Vite | Outil de build ultra-rapide |
| Recharts | Graphiques |
| Docker + nginx | Conteneurisation et serveur web |

---

## Questions fréquentes

**Mes données sont-elles sauvegardées ?**
Oui, automatiquement dans ton navigateur (localStorage). Elles restent disponibles même après avoir fermé l'onglet ou redémarré l'application. En revanche, elles sont liées à ton navigateur — si tu changes de navigateur ou d'ordinateur, elles ne se transfèrent pas.

**L'application est-elle connectée à internet ?**
Non. Tout fonctionne en local sur ta machine. Aucune donnée n'est envoyée à un serveur externe.

**Comment mettre à jour l'application après une modification du code ?**
Arrête le conteneur (`Ctrl + C`), puis relance avec `docker compose up --build` pour reconstruire avec les nouveaux fichiers.

**Le port 8080 est déjà utilisé sur ma machine ?**
Ouvre `docker-compose.yml` et change `"8080:80"` par exemple en `"9090:80"`, puis accède à `http://localhost:9090`.
