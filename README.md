# Suivi des revenus en portage

Application web personnelle pour suivre des revenus mensuels en portage salarial : jours travaillés, chiffre d'affaires, frais de gestion, salaire France, bonus UK, titres restaurant, remboursements et net reçu.

Le projet est pensé pour un usage simple, sans compte utilisateur, sans base de données et sans serveur applicatif. Les données sont stockées localement dans le navigateur avec `localStorage`.

## Fonctionnalités

- Saisie mensuelle des revenus
- Modification et suppression des mois
- Calcul automatique du chiffre d'affaires
- Calcul automatique des frais de gestion
- Calcul automatique des titres restaurant selon le mois précédent
- Paramètres modifiables : TJM par défaut, frais de gestion, titres restaurant par jour
- Vue annuelle avec indicateurs clés
- Graphique de répartition annuelle des revenus
- Composition mensuelle des revenus par catégorie
- Notes libres par mois
- Sauvegarde locale dans le navigateur
- Interface responsive desktop et mobile

## Stack technique

- Next.js
- TypeScript
- App Router
- Tailwind CSS
- React Hooks
- Lucide Icons
- localStorage

## Installation locale

```bash
npm install
npm run dev
```

L'application est ensuite disponible sur :

```bash
http://localhost:3000
```

## Publier le projet sur GitHub

Depuis le dossier du projet :

```bash
git status
git add -A
git commit -m "Initial portage income tracker"
```

Créer ensuite un dépôt GitHub vide, puis ajouter le dépôt distant :

```bash
git remote add origin https://github.com/VOTRE_COMPTE/NOM_DU_DEPOT.git
git branch -M main
git push -u origin main
```

Si vous utilisez GitHub CLI :

```bash
gh auth login
gh repo create NOM_DU_DEPOT --public --source=. --remote=origin --push
```

## Scripts utiles

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
```

## Déploiement sur Vercel

1. Pousser le projet sur GitHub.
2. Aller sur [vercel.com](https://vercel.com).
3. Cliquer sur `Add New...` puis `Project`.
4. Importer le dépôt GitHub.
5. Garder les paramètres par défaut :
   - Framework Preset : `Next.js`
   - Build Command : `npm run build`
   - Install Command : `npm install`
   - Output Directory : laisser vide
6. Cliquer sur `Deploy`.

Aucune variable d'environnement n'est nécessaire pour cette première version.

## Accéder à l'application

Après le déploiement, Vercel fournit une URL du type :

```text
https://nom-du-projet.vercel.app
```

Ouvrir cette URL dans le navigateur pour utiliser l'application. Les données saisies seront enregistrées dans le `localStorage` du navigateur pour ce domaine Vercel.

Chaque utilisateur peut aussi forker le dépôt GitHub, le déployer dans son propre compte Vercel, puis utiliser sa propre URL.

## Stockage des données

Les données sont stockées dans le navigateur de l'utilisateur :

- `portage-income-records` : enregistrements mensuels
- `portage-income-settings` : paramètres de calcul

Important :

- Les données ne sont pas synchronisées entre appareils.
- Les données ne sont pas stockées sur Vercel.
- Changer de navigateur ou vider les données du navigateur peut supprimer les données locales.
- Chaque domaine a son propre espace `localStorage`.

## Règles de calcul

### Chiffre d'affaires

```text
CA = jours travaillés × TJM
```

### Frais de gestion

```text
Frais de gestion = CA × taux de frais de gestion
```

### Titres restaurant

```text
Titres restaurant du mois = jours travaillés du mois précédent × montant journalier
```

Si le mois courant est le premier mois enregistré, les titres restaurant sont à `0 €` sans alerte. Si un mois précédent devrait exister mais manque, l'application affiche un avertissement.

### Revenus salariaux

```text
Revenus salariaux = salaire France + bonus UK
```

### Net reçu

```text
Net reçu = salaire France + bonus UK + titres restaurant + remboursements
```

Le net reçu n'est affiché comme complet que si le salaire France, le bonus UK et les remboursements sont tous renseignés.

## Structure du projet

```text
app/
  layout.tsx
  page.tsx
  globals.css
components/
  IncomeDashboard.tsx
lib/
  calculations.ts
  constants.ts
  storage.ts
types/
  income.ts
```

## Limites de cette version

Cette version ne contient volontairement pas :

- Authentification
- Base de données
- API backend
- Upload de fiches de paie
- OCR
- Synchronisation multi-appareils
- Multi-utilisateur

Pour un usage personnel ou une petite démonstration, cette approche reste simple à déployer et facile à adapter.
