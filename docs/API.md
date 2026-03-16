# API

## Introduction

Cette API est une API GraphQL exposée par l'application `apps/api`.

- Endpoint local par défaut : `http://localhost:4000/graphql`
- Runtime : Bun
- Base de données : PostgreSQL
- Sessions / tokens : Redis
- Authentification : header `Authorization: Bearer <token>`

## Prérequis

Avant de lancer l'API :

- installer [Bun](https://bun.sh/)
- installer Docker et Docker Compose
- lancer les dependances depuis la racine du monorepo

```bash
docker compose up -d
bun install
```

## Initialiser la base de données

### 1. Configurer les fichiers d'environnement

Il y a 2 fichiers d'environnement à préparer.

#### Fichier racine `/.env`

Il est utilisé par `docker-compose.yml`.

Exemple minimal :

```env
POSTGRES_PORT=5433
```

Vous pouvez le créer depuis l'exemple :

```bash
cp .env.example .env
```

#### Fichier `apps/api/.env`

Il est utilisé par l'application API et les scripts Bun.

Vous pouvez le créer depuis l'exemple :

```bash
cp apps/api/.env.example apps/api/.env
```

Exemple complet :

```env
DATABASE_URL="postgresql://myli:myli@localhost:5433/myli"
REDIS_URL="redis://localhost:6379"
PORT=4000
PASSWORD_PEPPER="IjustUseThisForMyTestButINeedToReplaceItForTheFinalEnvFile"
JWT_SECRET="replace-with-strong-secret"
ARGON2_MEMORY_COST=65536
ARGON2_TIME_COST=3
ARGON2_PARALLELISM=1
GRAPHQL_MAX_DEPTH=5
GRAPHQL_MAX_COMPLEXITY=1000
```

### 2. Signification des variables d'environnement

#### Variables Docker

| Variable        | Obligatoire | Description                                                                        |
| --------------- | ----------- | ---------------------------------------------------------------------------------- |
| `POSTGRES_PORT` | non         | Port exposé localement pour PostgreSQL. La valeur par défaut du projet est `5433`. |

#### Variables API

| Variable                 | Obligatoire | Description                                                                                                                                |
| ------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `DATABASE_URL`           | oui         | URL PostgreSQL utilisée par Prisma et les scripts de seed. En local, utiliser `localhost:5433` si vous gardez la config Docker par défaut. |
| `REDIS_URL`              | oui         | URL de connexion Redis. Par défaut : `redis://localhost:6379`.                                                                             |
| `PORT`                   | non         | Port HTTP de l'API GraphQL. Par défaut : `4000`.                                                                                           |
| `PASSWORD_PEPPER`        | oui         | Valeur secrète ajoutée aux mots de passe avant hash Argon2. Obligatoire pour créer un compte et se connecter.                              |
| `JWT_SECRET`             | oui         | Secret de signature des JWT. Obligatoire pour `login`, `logout` et toutes les mutations authentifiees.                                     |
| `ARGON2_MEMORY_COST`     | non         | Coût mémoire Argon2. Par défaut : `65536`.                                                                                                 |
| `ARGON2_TIME_COST`       | non         | Coût temporel Argon2. Par défaut : `3`.                                                                                                    |
| `ARGON2_PARALLELISM`     | non         | Niveau de parallélisme Argon2. Par défaut : `1`.                                                                                           |
| `GRAPHQL_MAX_DEPTH`      | non         | Profondeur maximale d'une requête GraphQL. Par défaut : `5`.                                                                               |
| `GRAPHQL_MAX_COMPLEXITY` | non         | Complexité maximale d'une requête GraphQL. Par défaut : `1000`.                                                                            |

### 3. Démarrer PostgreSQL et Redis

Depuis la racine du projet :

```bash
docker compose up -d
```

Le compose démarre :

- PostgreSQL sur `localhost:${POSTGRES_PORT:-5433}`
- Redis sur `localhost:6379`

### 4. Générer le client Prisma

```bash
bun run --filter api prisma:generate
```

### 5. Appliquer le schéma de base

Pour un démarrage classique en local :

```bash
bun run --filter api prisma:migrate
```

Cette commande applique les migrations Prisma puis régénère le client.

## Seeder la base

Le projet fournit un seed SQL dans `apps/api/seed/sql`.

### Ce que fait le seed

Le script `bun run --filter api seed` :

- vérifie si le schéma existe déjà
- applique les fichiers SQL de migration Prisma si la base est vide
- exécute les fichiers SQL de seed dans l'ordre

### Important : télécharger les CSV avant le seed

Les scripts SQL utilisent des fichiers CSV dans `apps/api/data`, par exemple :

- `clean_genres.csv`
- `clean_raw_artists.csv`
- `clean_raw_albums.csv`
- `clean_tracks.csv`
- `clean_raw_tracks.csv`
- `clean_echonest.csv`
- `clean_features.csv`
- `clean_answers.csv`

Pour récupérer ces fichiers :

```bash
bun run --filter api seed:download
```

Le script télécharge une archive puis l'extrait dans `apps/api/data`.

### Lancer le seed

```bash
bun run --filter api seed
```

### Séquence complète recommandée

Depuis la racine du repo :

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
docker compose up -d
bun install
bun run --filter api prisma:generate
bun run --filter api prisma:migrate
bun run --filter api seed:download
bun run --filter api seed
bun run --filter api dev
```

## Lancer l'API

```bash
bun run --filter api dev
```

Une fois l'API lancée :

- URL GraphQL : `http://localhost:4000/graphql`
- header d'auth : `Authorization: Bearer <token>`

## Utiliser les mutations

### Requête HTTP type

Exemple avec `curl` :

```bash
curl http://localhost:4000/graphql \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -d '{
    "query": "mutation Example($input: CreatePlaylistInput!) { createPlaylist(input: $input) { playlistId name } }",
    "variables": {
      "input": { "name": "Ma playlist" }
    }
  }'
```

Si une mutation n'exige pas d'authentification, supprimez le header `Authorization`.

## Documentation de toutes les mutations

### `createAccount`

Créer un compte utilisateur.

- Authentification : non
- Retour : `Account!`
- Contraintes : `login` et `email` doivent être uniques
- Mot de passe : au moins 12 caractères, avec au moins une majuscule et un caractère spécial

```graphql
mutation CreateAccount($input: CreateAccountInput!) {
  createAccount(input: $input) {
    accountId
    login
    email
    name
    isArtist
  }
}
```

Variables :

```json
{
  "input": {
    "login": "marie",
    "email": "marie@example.com",
    "password": "SuperMotDePasse!",
    "name": "Marie Dupont",
    "isArtist": false
  }
}
```

### `updateAccount`

Mettre à jour le compte connecté.

- Authentification : oui
- Retour : `Account` (peut être `null` si le compte cible n'existe pas)
- Restriction : `accountId` doit correspondre au compte du token

```graphql
mutation UpdateAccount($accountId: String!, $input: UpdateAccountInput!) {
  updateAccount(accountId: $accountId, input: $input) {
    accountId
    login
    email
    name
    isArtist
  }
}
```

Variables :

```json
{
  "accountId": "3b7c1fd5-8a5c-4bce-91e0-6bcf9c10f111",
  "input": {
    "name": "Marie D.",
    "login": "marie_dupont"
  }
}
```

### `updateArtist`

Mettre à jour le profil artiste rattaché à un compte.

- Authentification : oui
- Retour : `Artist`
- Restriction : `accountId` doit correspondre au compte du token
- Précondition : le compte doit avoir `isArtist = true`

```graphql
mutation UpdateArtist($accountId: String!, $input: UpdateArtistInput!) {
  updateArtist(accountId: $accountId, input: $input) {
    artistId
    name
    artistBio
    artistLocation
    artistLatitude
    artistLongitude
    artistActiveYearBegin
    artistActiveYearEnd
  }
}
```

Variables :

```json
{
  "accountId": "3b7c1fd5-8a5c-4bce-91e0-6bcf9c10f111",
  "input": {
    "artistBio": "Projet electro-pop independant.",
    "artistLocation": "Lyon",
    "artistLatitude": 45.764,
    "artistLongitude": 4.8357,
    "artistActiveYearBegin": 2021
  }
}
```

### `deleteAccount`

Supprimer le compte connecté.

- Authentification : oui
- Retour : `Boolean!`
- Restriction : `accountId` doit correspondre au compte du token

```graphql
mutation DeleteAccount($accountId: String!) {
  deleteAccount(accountId: $accountId)
}
```

Variables :

```json
{
  "accountId": "3b7c1fd5-8a5c-4bce-91e0-6bcf9c10f111"
}
```

### `login`

Authentifier un utilisateur et récupérer un JWT.

- Authentification : non
- Retour : `AuthPayload` ou `null` si email / mot de passe invalide
- Usage : stocker `token` puis l'envoyer dans `Authorization: Bearer <token>`

```graphql
mutation Login($input: LoginInput!) {
  login(input: $input) {
    token
    account {
      accountId
      login
      email
      name
      isArtist
    }
  }
}
```

Variables :

```json
{
  "input": {
    "email": "marie@example.com",
    "password": "SuperMotDePasse!"
  }
}
```

### `logout`

Invalider le token courant en supprimant la session Redis.

- Authentification : oui
- Retour : `Boolean!`

```graphql
mutation Logout {
  logout
}
```

Variables :

```json
{}
```

### `likeTrack`

Ajouter un morceau aux favoris du compte connecté.

- Authentification : oui
- Retour : `Track`

```graphql
mutation LikeTrack($trackId: String!) {
  likeTrack(trackId: $trackId) {
    trackId
    title
    isLiked
    favorites
  }
}
```

Variables :

```json
{
  "trackId": "6a4d3d5c-7ce6-4f2a-b6db-c1cb3a1a2001"
}
```

### `unlikeTrack`

Retirer un morceau des favoris du compte connecté.

- Authentification : oui
- Retour : `Track`

```graphql
mutation UnlikeTrack($trackId: String!) {
  unlikeTrack(trackId: $trackId) {
    trackId
    title
    isLiked
    favorites
  }
}
```

Variables :

```json
{
  "trackId": "6a4d3d5c-7ce6-4f2a-b6db-c1cb3a1a2001"
}
```

### `pinTrack`

Épingler un morceau dans un slot de profil.

- Authentification : oui
- Retour : `PinnedItem`
- Contrainte : `slot` doit être compris entre `1` et `4`

```graphql
mutation PinTrack($slot: Int!, $trackId: String!) {
  pinTrack(slot: $slot, trackId: $trackId) {
    slot
    itemType
    pinnedAt
    track {
      trackId
      title
    }
  }
}
```

Variables :

```json
{
  "slot": 1,
  "trackId": "6a4d3d5c-7ce6-4f2a-b6db-c1cb3a1a2001"
}
```

### `pinAlbum`

Épingler un album dans un slot de profil.

- Authentification : oui
- Retour : `PinnedItem`
- Contrainte : `slot` doit être compris entre `1` et `4`

```graphql
mutation PinAlbum($slot: Int!, $albumId: String!) {
  pinAlbum(slot: $slot, albumId: $albumId) {
    slot
    itemType
    pinnedAt
    album {
      albumId
      title
    }
  }
}
```

Variables :

```json
{
  "slot": 2,
  "albumId": "9a4d3d5c-7ce6-4f2a-b6db-c1cb3a1a2002"
}
```

### `pinArtist`

Épingler un artiste dans un slot de profil.

- Authentification : oui
- Retour : `PinnedItem`
- Contrainte : `slot` doit être compris entre `1` et `4`

```graphql
mutation PinArtist($slot: Int!, $artistId: String!) {
  pinArtist(slot: $slot, artistId: $artistId) {
    slot
    itemType
    pinnedAt
    artist {
      artistId
      name
    }
  }
}
```

Variables :

```json
{
  "slot": 3,
  "artistId": "2a4d3d5c-7ce6-4f2a-b6db-c1cb3a1a2003"
}
```

### `pinPlaylist`

Épingler une playlist dans un slot de profil.

- Authentification : oui
- Retour : `PinnedItem`
- Contrainte : `slot` doit être compris entre `1` et `4`

```graphql
mutation PinPlaylist($slot: Int!, $playlistId: String!) {
  pinPlaylist(slot: $slot, playlistId: $playlistId) {
    slot
    itemType
    pinnedAt
    playlist {
      playlistId
      name
    }
  }
}
```

Variables :

```json
{
  "slot": 4,
  "playlistId": "1a4d3d5c-7ce6-4f2a-b6db-c1cb3a1a2004"
}
```

### `unpinItem`

Libérer un slot épinglé.

- Authentification : oui
- Retour : `Boolean!`
- Contrainte : `slot` doit être compris entre `1` et `4`

```graphql
mutation UnpinItem($slot: Int!) {
  unpinItem(slot: $slot)
}
```

Variables :

```json
{
  "slot": 1
}
```

### `createPlaylist`

Créer une playlist pour le compte connecté.

- Authentification : oui
- Retour : `Playlist!`
- Contrainte : `name` ne doit pas être vide

```graphql
mutation CreatePlaylist($input: CreatePlaylistInput!) {
  createPlaylist(input: $input) {
    playlistId
    name
    ownerDisplayName
    isEditable
    trackCount
  }
}
```

Variables :

```json
{
  "input": {
    "name": "Mes decouvertes"
  }
}
```

### `updatePlaylist`

Renommer une playlist éditable par le compte connecté.

- Authentification : oui
- Retour : `Playlist`
- Contrainte : `name`, s'il est fourni, ne doit pas être vide

```graphql
mutation UpdatePlaylist($playlistId: String!, $input: UpdatePlaylistInput!) {
  updatePlaylist(playlistId: $playlistId, input: $input) {
    playlistId
    name
    trackCount
  }
}
```

Variables :

```json
{
  "playlistId": "1a4d3d5c-7ce6-4f2a-b6db-c1cb3a1a2004",
  "input": {
    "name": "Mes decouvertes 2026"
  }
}
```

### `deletePlaylist`

Supprimer une playlist éditable par le compte connecté.

- Authentification : oui
- Retour : `Boolean!`

```graphql
mutation DeletePlaylist($playlistId: String!) {
  deletePlaylist(playlistId: $playlistId)
}
```

Variables :

```json
{
  "playlistId": "1a4d3d5c-7ce6-4f2a-b6db-c1cb3a1a2004"
}
```

### `addTrackToPlaylist`

Ajouter un morceau à une playlist éditable par le compte connecté.

- Authentification : oui
- Retour : `Playlist`

```graphql
mutation AddTrackToPlaylist($playlistId: String!, $trackId: String!) {
  addTrackToPlaylist(playlistId: $playlistId, trackId: $trackId) {
    playlistId
    name
    trackCount
    tracks {
      trackId
      title
    }
  }
}
```

Variables :

```json
{
  "playlistId": "1a4d3d5c-7ce6-4f2a-b6db-c1cb3a1a2004",
  "trackId": "6a4d3d5c-7ce6-4f2a-b6db-c1cb3a1a2001"
}
```

### `removeTrackFromPlaylist`

Retirer un morceau d'une playlist éditable par le compte connecté.

- Authentification : oui
- Retour : `Playlist`

```graphql
mutation RemoveTrackFromPlaylist($playlistId: String!, $trackId: String!) {
  removeTrackFromPlaylist(playlistId: $playlistId, trackId: $trackId) {
    playlistId
    name
    trackCount
    tracks {
      trackId
      title
    }
  }
}
```

Variables :

```json
{
  "playlistId": "1a4d3d5c-7ce6-4f2a-b6db-c1cb3a1a2004",
  "trackId": "6a4d3d5c-7ce6-4f2a-b6db-c1cb3a1a2001"
}
```

### `recordTrackListen`

Enregistrer une écoute pour le compte connecté.

- Authentification : oui
- Retour : `Boolean!`
- Effet de bord : met à jour l'historique d'écoute et les stats de bibliothèque côté backend

```graphql
mutation RecordTrackListen($trackId: String!) {
  recordTrackListen(trackId: $trackId)
}
```

Variables :

```json
{
  "trackId": "6a4d3d5c-7ce6-4f2a-b6db-c1cb3a1a2001"
}
```

## Conseils pratiques

- Commencez par `createAccount`, puis `login` pour récupérer un token.
- Reutilisez ce token pour toutes les mutations protegees.
- Pour les IDs (`accountId`, `trackId`, `playlistId`, etc.), utilisez les requêtes GraphQL de lecture pour récupérer des valeurs valides.
- Si une mutation retourne `null`, cela signifie généralement que la ressource cible n'existe pas ou n'est pas éditable / visible pour le compte courant.
- Si une mutation échoue avec une erreur GraphQL, vérifiez en priorité les contraintes de validation : mot de passe, unicité email/login, et slot entre `1` et `4`.
