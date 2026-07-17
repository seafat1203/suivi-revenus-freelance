# Suivi des revenus en portage

Application web personnelle pour suivre des revenus mensuels en portage salarial : jours travaillés, chiffre d'affaires, frais de gestion, salaire France, bonus UK, titres restaurant, remboursements et net reçu.

Le projet est pensé pour un usage simple. Il peut fonctionner en mode local avec `localStorage`, ou en mode cloud avec Supabase pour synchroniser les données entre plusieurs appareils après connexion.

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
- Authentification email/mot de passe avec Supabase
- Synchronisation cloud avec Supabase Database
- Import des données locales vers Supabase
- Interface responsive desktop et mobile

## Stack technique

- Next.js
- TypeScript
- App Router
- Tailwind CSS
- React Hooks
- Lucide Icons
- localStorage
- Supabase

## Installation locale

```bash
npm install
npm run dev
```

L'application est ensuite disponible sur :

```bash
http://localhost:3000
```

Sans configuration Supabase, l'application fonctionne en mode local uniquement.

## Configuration Supabase

Créer un projet Supabase, puis ouvrir `SQL Editor` et exécuter le script :

```text
supabase/schema.sql
```

Ce script crée deux tables :

- `monthly_income_records`
- `income_settings`

Il active aussi les règles RLS pour que chaque utilisateur ne puisse lire et modifier que ses propres données.

Créer ensuite un fichier `.env.local` :

```bash
cp .env.example .env.local
```

Renseigner les valeurs Supabase :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
```

Les valeurs se trouvent dans Supabase :

```text
Project Settings → API
```

Redémarrer ensuite le serveur local :

```bash
npm run dev
```

Quand Supabase est configuré, l'application affiche un écran de connexion. Les utilisateurs peuvent créer un compte puis retrouver leurs données depuis un autre navigateur ou un autre appareil.

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
6. Ajouter les variables d'environnement dans `Settings` → `Environment Variables` :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
7. Cliquer sur `Deploy`.

Sans ces variables, l'application fonctionne en mode local uniquement. Avec ces variables, elle utilise Supabase pour la connexion et la synchronisation.

## Accéder à l'application

Après le déploiement, Vercel fournit une URL du type :

```text
https://nom-du-projet.vercel.app
```

Ouvrir cette URL dans le navigateur pour utiliser l'application. Si Supabase est configuré, les utilisateurs doivent se connecter et leurs données seront synchronisées dans Supabase. Sinon, les données restent enregistrées dans le `localStorage` du navigateur pour ce domaine Vercel.

Chaque utilisateur peut aussi forker le dépôt GitHub, le déployer dans son propre compte Vercel, puis utiliser sa propre URL.

## Confidentialité et modes d'utilisation

Pour des données personnelles ou financières réelles, il est recommandé de forker ce dépôt et de créer votre propre projet Supabase ainsi que votre propre projet Vercel.

Si vous utilisez une instance déployée par quelqu'un d'autre, vos données seront stockées dans le projet Supabase de cette personne. L'administrateur du projet Supabase peut voir :

- votre email de compte
- votre identifiant utilisateur
- vos enregistrements mensuels
- vos paramètres de calcul
- vos notes

L'administrateur ne peut pas voir votre mot de passe en clair. Supabase stocke les mots de passe de manière sécurisée, sous forme non lisible.

En pratique :

- Pour tester rapidement, vous pouvez utiliser une instance existante si vous acceptez que l'administrateur puisse voir les données saisies.
- Pour une utilisation personnelle ou confidentielle, fork du dépôt + Supabase personnel + Vercel personnel est l'option recommandée.

## Stockage des données

En mode local, les données sont stockées dans le navigateur de l'utilisateur :

- `portage-income-records` : enregistrements mensuels
- `portage-income-settings` : paramètres de calcul

Important :

- Les données ne sont pas synchronisées entre appareils.
- Les données ne sont pas stockées sur Vercel.
- Changer de navigateur ou vider les données du navigateur peut supprimer les données locales.
- Chaque domaine a son propre espace `localStorage`.

En mode Supabase, les données sont stockées dans les tables Supabase et liées au compte connecté. Elles peuvent alors être retrouvées depuis un autre navigateur ou un autre appareil.

## Importer les données locales vers Supabase

Si vous avez déjà utilisé l'application en mode local :

1. Configurer Supabase.
2. Redémarrer l'application.
3. Se connecter.
4. Cliquer sur `Importer local`.

Les données présentes dans le `localStorage` du navigateur courant seront copiées dans Supabase.

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
  cloud-storage.ts
  constants.ts
  storage.ts
  supabase.ts
supabase/
  schema.sql
types/
  income.ts
```

## Limites de cette version

Cette version ne contient volontairement pas :

- API backend personnalisée
- Upload de fiches de paie
- OCR
- Gestion avancée multi-organisation

Pour un usage personnel ou une petite démonstration, cette approche reste simple à déployer et facile à adapter.
