# Catégories personnalisées — Spec

**Date :** 2026-06-10
**Statut :** Approuvé

---

## Contexte

L'app de suivi de budget dispose de 8 catégories de dépenses fixes hardcodées dans `constants.js`. L'utilisateur ne peut pas en créer de nouvelles. Cette spec décrit l'ajout de catégories personnalisées créées et supprimées par l'utilisateur, accessibles depuis le formulaire de dépense.

---

## Ce qui est construit

### Comportement utilisateur

1. Dans le formulaire de dépense, un bouton **"+"** apparaît à droite du select de catégorie.
2. Cliquer sur "+" ouvre un panneau inline juste en dessous avec deux zones :
   - **Mes catégories** (visible seulement si des catégories perso existent) : badges cliquables avec un **×** pour supprimer
   - **Nouvelle catégorie** : champ texte + bouton "Créer" + bouton "✕" pour fermer le panneau
3. Après création : la nouvelle catégorie est **automatiquement sélectionnée** dans le select et le panneau se ferme.
4. Supprimer une catégorie personnalisée **ne supprime pas** les transactions existantes qui l'utilisent. Ces transactions conservent leur `category` ID en localStorage mais sont **exclues des graphiques de répartition** (leur montant n'est pas comptabilisé). Elles restent visibles dans l'historique avec leur description et montant intacts.
5. Les catégories perso apparaissent dans **toute l'app** : select du formulaire, modal d'édition, filtre de l'historique, graphique de répartition, gestion des budgets.
6. Dans les selects, les catégories perso sont regroupées dans un **`<optgroup>`** "Mes catégories" séparé en bas.

### Couleurs automatiques

10 couleurs dans une palette fixe, différentes des 8 couleurs de base :
```js
const CUSTOM_PALETTE = [
  '#9370DB', // violet
  '#FF8C00', // orange
  '#20B2AA', // teal
  '#FF6B6B', // corail
  '#6495ED', // cornflower
  '#F0A500', // ambre
  '#32CD32', // lime
  '#FF69B4', // rose
  '#87CEEB', // ciel
  '#DDA0DD', // prune
];
```
Couleur assignée : `CUSTOM_PALETTE[customCategories.length % CUSTOM_PALETTE.length]` au moment de la création. Le bg et border sont dérivés de la couleur avec opacité (même pattern que `CATEGORIES`).

---

## Architecture

### Nouveau fichier : `src/hooks/useCustomCategories.js`

```js
// Stockage : ledger_custom_categories_v1
// Shape d'une catégorie custom :
{
  id: string,        // UUID
  label: string,
  color: string,     // hex
  bg: string,        // rgba(r,g,b,0.12)
  border: string,    // rgba(r,g,b,0.3)
  isCustom: true,
}

// API exposée :
customCategories            // array
addCustomCategory(label)    // crée avec couleur auto, retourne le nouvel objet catégorie {id, label, color, ...}
deleteCustomCategory(id)    // supprime par id
```

### Modifications `src/App.jsx`

- Importer et utiliser `useCustomCategories()`
- Calculer `allCategories = useMemo(() => [...CATEGORIES, ...customCategories], [customCategories])`
- Calculer `allCategoryMap = useMemo(() => Object.fromEntries(allCategories.map(c => [c.id, c])), [allCategories])`
- Passer `customCategories` à `useTransactions(customCategories)` pour les graphiques
- Passer aux composants :
  - `TransactionForm` : `allCategories`, `addCustomCategory`, `deleteCustomCategory`, `customCategories`
  - `TransactionEditModal` (via TransactionList) : `allCategories`, `allCategoryMap`
  - `BudgetManager` : `allCategories`
  - `TransactionList` : `allCategories`, `allCategoryMap`
- Mettre à jour le calcul `overBudgetCount` (utilise déjà `CATEGORIES` via useMemo) → remplacer par `allCategories`

### Modifications `src/hooks/useTransactions.js`

- Signature : `export function useTransactions(customCategories = [])`
- `computeExpensesByCategory(list, customCategories)` utilise `[...CATEGORIES, ...customCategories]`
- Appel interne mis à jour

### Modifications `src/components/TransactionForm.jsx`

Nouvelles props : `allCategories`, `customCategories`, `addCustomCategory`, `deleteCustomCategory`

Nouveau state local :
- `showCreate` (bool) — panneau ouvert/fermé
- `newCatName` (string) — valeur du champ de création

Logique :
- Remplacer `CATEGORIES` par `allCategories` dans le select
- Utiliser `<optgroup>` pour séparer catégories fixes et perso
- "+" button : `onClick={() => setShowCreate(s => !s)}`
- Sur "Créer" : appeler `const newCat = addCustomCategory(newCatName.trim())`, puis `setForm(f => ({...f, category: newCat.id}))`, fermer le panneau, vider le champ
- Sur "×" d'un badge : appeler `deleteCustomCategory(id)`
- Supprimer l'import direct de `CATEGORIES` (utiliser `allCategories` en prop)

### Modifications `src/components/TransactionEditModal.jsx`

Nouvelles props : `allCategories`, `allCategoryMap`

- Remplacer `CATEGORIES` et `CATEGORY_MAP` par les props
- Supprimer les imports de `CATEGORIES` et `CATEGORY_MAP` depuis constants

### Modifications `src/components/BudgetManager.jsx`

Nouvelle prop : `allCategories`

- Remplacer `CATEGORIES` par `allCategories`
- Supprimer l'import de `CATEGORIES` depuis constants (garder `formatAmount`)

### Modifications `src/components/TransactionList.jsx`

Nouvelles props : `allCategories`, `allCategoryMap`

- Remplacer `CATEGORIES` (dans le filtre catégorie) par `allCategories` avec `<optgroup>`
- Remplacer `CATEGORY_MAP` par `allCategoryMap` pour l'affichage des badges de catégorie

---

## CSS à ajouter (`src/App.css`)

Nouvelles classes dans `src/App.css`, cohérentes avec le design système :

- `.custom-cat-panel` — fond `rgba(201,168,76,0.05)`, bordure `rgba(201,168,76,0.2)`, border-radius `var(--radius-sm)`, padding `0.75rem 0.9rem`
- `.custom-cat-section-label` — `font-size: 0.68rem`, `color: var(--text-3)` ou `var(--gold)`, uppercase, letter-spacing
- `.custom-cat-badge` — badge avec fond coloré (couleur de la catégorie), texte coloré, bouton × inline
- `.custom-cat-input-row` — flex row avec input + bouton Créer + bouton ✕
- `.add-category-btn` — bouton "+" à droite du select : `width: 32px`, `height: 32px`, fond `var(--gold-dim)`, bordure `var(--border-gold)`, couleur `var(--gold)`

---

## Périmètre exclu (YAGNI)

- Renommer une catégorie perso
- Changer la couleur après création
- Ordonner les catégories perso
- Limiter le nombre de catégories créables

---

## Vérification end-to-end

1. Formulaire de dépense → cliquer "+" → panneau s'ouvre
2. Saisir "Abonnements" → cliquer "Créer" → catégorie sélectionnée dans le select, panneau fermé
3. Ajouter une transaction "Netflix 15€" avec la catégorie "Abonnements"
4. Graphique de répartition → "Abonnements" apparaît avec sa couleur
5. Budgets → "Abonnements" apparaît avec possibilité de définir un budget
6. Historique → filtre catégorie inclut "Abonnements"
7. Rouvrir "+" → badge "Abonnements" visible → cliquer × → catégorie supprimée de la liste
8. Les transactions "Abonnements" existantes restent intactes
