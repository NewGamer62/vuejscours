# TCG SPA — Trading Card Game

Dans ce TP, vous allez construire une **Single Page Application** Vue 3 pour un jeu de cartes Pokemon en ligne. L'objectif est d'implémenter le frontend complet qui s'appuie sur une API REST et un serveur Socket.io déjà fournis.

L'application permet à un utilisateur de :

- Créer un compte et se connecter
- Gérer des decks de 10 cartes Pokemon
- Rejoindre un lobby de matchmaking en ligne
- Jouer une partie en temps réel contre un autre joueur

> **L'API doit tourner sur `http://localhost:3001` avant de démarrer le projet.**
> Utilisez Docker pour démarrer l'API et la base de données (voir section [Lancer le backend](#lancer-le-backend-avec-docker)).

## Prérequis

### Node.js (v24)

| Système                 | Lien                              |
| ----------------------- | --------------------------------- |
| Windows / macOS / Linux | [nodejs.org](https://nodejs.org/) |

**Via nvm (recommandé)**

| Système       | Lien                                                               |
| ------------- | ------------------------------------------------------------------ |
| macOS / Linux | [nvm](https://github.com/nvm-sh/nvm#installing-and-updating)       |
| Windows       | [nvm-windows](https://github.com/coreybutler/nvm-windows/releases) |

### Docker (pour le backend)

| Système                 | Lien                                                          |
| ----------------------- | ------------------------------------------------------------- |
| Windows / macOS / Linux | [docker.com](https://www.docker.com/products/docker-desktop/) |

> **Compte Docker Hub requis** : sur les réseaux partagés (école, université), Docker peut renvoyer une erreur `pull access denied` en raison du rate limiting des pulls anonymes. Créez un compte gratuit sur [hub.docker.com](https://hub.docker.com/signup) puis connectez-vous avec `docker login` avant de lancer le backend.

### Outils recommandés

- **Éditeur** : [VS Code](https://code.visualstudio.com/) ou [WebStorm](https://www.jetbrains.com/webstorm/)
- **Extension navigateur** : [Vue DevTools](https://devtools.vuejs.org/)

## Installation

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configuration de l'environnement

```bash
cp .env.example .env
```

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

Ces variables pointent vers le backend Docker local. Ne modifiez pas ces valeurs pour le développement.

> **Déploiement Vercel** : le fichier `.env.production` (déjà commité) contient les variables pointant vers le backend hébergé. Le projet Vercel est créé automatiquement au premier déploiement — seul le secret `VERCEL_TOKEN` est nécessaire (voir issue #0).

### 3. Lancer le backend

Un `docker-compose.yml` est fourni pour démarrer l'API et PostgreSQL en une seule commande :

```bash
npm run api:start   # Démarrer l'API et la base de données (arrière-plan)
npm run api:stop    # Arrêter les services
npm run api:reset   # Remettre la base de données à zéro (re-seed)
```

Cela démarre :

- **PostgreSQL** sur le port `5432` avec les données de seed (cartes Pokémon + comptes de test)
- **L'API REST + Socket.io** sur `http://localhost:3001`
- **Documentation Swagger** sur `http://localhost:3001/api-docs` — également disponible en ligne : [tcg-api-csgd.onrender.com/api-docs](https://tcg-api-csgd.onrender.com/api-docs)

**Comptes de test disponibles après le seed :**

| Utilisateur | Email            | Mot de passe |
| ----------- | ---------------- | ------------ |
| red         | red@example.com  | password123  |
| blue        | blue@example.com | password123  |

> Les données PostgreSQL sont persistées dans un volume Docker (`postgres_data`). Pour repartir de zéro : `docker-compose down -v`.

### 4. Démarrer le serveur de développement

```bash
npm run dev
```

L'application est accessible sur **http://localhost:5173**.

## Commandes disponibles

```bash
npm run dev          # Démarrer le serveur de développement
npm run build        # Build de production
npm run lint         # Linter ESLint
npm run lint:fix     # ESLint avec correction automatique
npm run format       # Formater avec Prettier
npm run format:check # Vérifier le formatage
npm run api:start    # Démarrer l'API + base de données (arrière-plan)
npm run api:stop     # Arrêter l'API + base de données
npm run api:reset    # Remettre la base de données à zéro (re-seed)
```

## Rappels techniques

### Naive UI

Tous les composants Naive UI (`NButton`, `NForm`, `NInput`, `NGrid`, `NCard`, `NModal`, etc.) sont enregistrés **globalement** — utilisez-les directement dans les templates sans import.

```vue
<template>
  <NCard title="Mon deck">
    <NSpace vertical>
      <NInput v-model:value="name" placeholder="Nom du deck" />
      <NButton type="primary" @click="handleSubmit">Créer</NButton>
    </NSpace>
  </NCard>
</template>
```

> Documentation : [naiveui.com](https://www.naiveui.com/en-US/os-theme/components/button)

### TypeScript

Le typage est un **prérequis attendu** tout au long du TP. Typez vos props, vos `ref`, et les données reçues de l'API ou des événements Socket.io. Les types de base sont fournis, complétez-les au fur et à mesure.

### useApi

Le composable `useApi()` expose toutes les méthodes HTTP. Le token JWT est injecté automatiquement dans chaque requête.

```ts
const api = useApi()

// Auth
api.signIn({ email, password }) // → AuthResponse
api.signUp({ email, password, username }) // → AuthResponse

// Cartes
api.getCards() // → Card[]

// Decks
api.getMyDecks() // → Deck[]
api.getDeck(id) // → Deck
api.createDeck({ name, cards }) // cards = tableau de 10 cardId
api.updateDeck(id, { name, cards })
api.deleteDeck(id)
```

# Comment réaliser ce TP

## Initialiser les issues — à faire une seule fois

1. Allez sur l'onglet **Actions** de votre dépôt GitHub
2. Sélectionnez le workflow **"Setup repo"**
3. Cliquez sur **"Run workflow"** puis confirmez

Le workflow crée les **issues** du TP.

## Workflow de travail

Pour chaque ticket :

### 1. Récupérer l'issue

Les issues GitHub contiennent l'objectif, les conseils et les exigences de chaque ticket.

### 2. Créer une branche

Depuis l'issue GitHub, utilisez le bouton **"Create a branch"** pour créer une branche dédiée :

```bash
git checkout -b 1-store-authentification
```

### 3. Développer et commiter

```bash
git add .
git commit -m "feat: store d'authentification et guards"
git push origin 1-store-authentification
```

### 4. Ouvrir une Pull Request

1. Créez une PR vers `main` depuis votre branche
2. Le pipeline déploie automatiquement une **preview Vercel** et poste l'URL en commentaire

### 5. Demander une review

Assignez **@vfourny** comme reviewer. Le professeur vérifie les exigences du ticket, la qualité du code et le bon fonctionnement de la preview.

### 6. Merge et notation

Après validation, la PR est mergée dans `main`, l'issue se ferme automatiquement et le ticket est noté.

## Maquettes

Les maquettes de référence sont disponibles sur Figma :

🎨 [Voir les maquettes sur Figma](https://making-rerun-61323218.figma.site/)

## Barème

| #         | Ticket             | Détail                                                                                   | Points |
| --------- | ------------------ | ---------------------------------------------------------------------------------------- | ------ |
| 1         | Authentification   | Store d'authentification + guards + pages connexion et inscription                       | 3      |
| 2         | Decks              | Composants de carte + liste des decks + création + détail et édition                     | 5      |
| 3         | Jeu en temps réel  | Store de jeu + lobby + complétion du store + page de jeu + composants main/actions/modal | 7      |
| 4         | Barre de recherche | Filtrage en temps réel dans le formulaire de deck                                        | 2      |
| 5         | Responsive design  | Adaptation mobile/tablette/desktop sur l'ensemble de l'application                       | 2      |
| 6         | Aperçu des cartes  | Miniatures des cartes dans la liste des decks                                            | 1      |
| **Total** |                    |                                                                                          | **20** |
