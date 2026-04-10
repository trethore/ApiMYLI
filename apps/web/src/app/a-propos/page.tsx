"use client";

import Nav from "@/components/Nav";
import SectionTitle from "@/components/SectionTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function AboutPage() {
  const [activeSection, setActiveSection] = useState("mentions");
  useEffect(() => {
    setActiveSection(window.location.hash === "#contact" ? "contact" : "mentions");
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-foreground">
      <Nav />
      {/* Container principal */}
      <main className="flex-1 flex flex-col lg:flex-row p-8 pb-24 max-w-6xl mx-auto w-full gap-8 mt-16">

        {/* Menu Gauche */}
        <div className="w-full lg:w-1/4 flex flex-col space-y-4">
          <SectionTitle title="À propos" className="text-left mt-0 text-3xl mb-2" />
          <nav className="flex flex-col space-y-2 flex-grow">
            <button
              onClick={() => setActiveSection("api")}
              className={`text-left px-4 py-3 rounded-md transition-colors ${activeSection === "api" ? "bg-primary text-primary-foreground font-medium" : "bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground border border-border"}`}
            >
              API
            </button>
            <button
              onClick={() => setActiveSection("mentions")}
              className={`text-left px-4 py-3 rounded-md transition-colors ${activeSection === "mentions" ? "bg-primary text-primary-foreground font-medium" : "bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground border border-border"}`}
            >
              Mentions légales
            </button>
            <button
              onClick={() => setActiveSection("rgpd")}
              className={`text-left px-4 py-3 rounded-md transition-colors ${activeSection === "rgpd" ? "bg-primary text-primary-foreground font-medium" : "bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground border border-border"}`}
            >
              Confidentialité (RGPD)
            </button>
            <button
              onClick={() => setActiveSection("cgu")}
              className={`text-left px-4 py-3 rounded-md transition-colors ${activeSection === "cgu" ? "bg-primary text-primary-foreground font-medium" : "bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground border border-border"}`}
            >
              CGU
            </button>
            <button
              onClick={() => setActiveSection("contact")}
              className={`text-left px-4 py-3 rounded-md transition-colors ${activeSection === "contact" ? "bg-primary text-primary-foreground font-medium" : "bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground border border-border"}`}
            >
              Contact
            </button>
          </nav>
        </div>

        {/* Contenu Droite */}
        <div className="w-full lg:w-3/4">

          {activeSection === "api" && (
            <Card className="bg-card border-border shadow-md">
              <CardHeader>
                <CardTitle className="text-3xl font-[family-name:var(--font-protest-strike)] text-primary font-light">Documentation API</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 text-muted-foreground leading-relaxed">

                {/* Introduction */}
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">Introduction</h3>
                  <p>Cette API est une API GraphQL exposée par l&apos;application <code className="bg-muted px-1 rounded text-sm">apps/api</code>.</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Endpoint local par défaut :</strong> <code className="bg-muted px-1 rounded text-sm">http://localhost:4000/graphql</code></li>
                    <li><strong>Runtime :</strong> Bun</li>
                    <li><strong>Base de données :</strong> PostgreSQL</li>
                    <li><strong>Sessions / tokens :</strong> Redis</li>
                    <li><strong>Authentification :</strong> header <code className="bg-muted px-1 rounded text-sm">Authorization: Bearer &lt;token&gt;</code></li>
                  </ul>
                </div>

                {/* Prérequis */}
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">Prérequis</h3>
                  <p>Avant de lancer l&apos;API :</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>installer <a href="https://bun.sh/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Bun</a></li>
                    <li>installer Docker et Docker Compose</li>
                    <li>lancer les dépendances depuis la racine du monorepo</li>
                  </ul>
                  <pre className="bg-muted rounded-md p-4 text-sm overflow-x-auto mt-2"><code>{`docker compose up -d\nbun install`}</code></pre>
                </div>

                {/* Variables d'environnement */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-foreground">Initialiser la base de données</h3>

                  <h4 className="font-semibold text-foreground">1. Configurer les fichiers d&apos;environnement</h4>
                  <p>Fichier racine <code className="bg-muted px-1 rounded text-sm">/.env</code> (utilisé par docker-compose) :</p>
                  <pre className="bg-muted rounded-md p-4 text-sm overflow-x-auto"><code>{`cp .env.example .env`}</code></pre>
                  <pre className="bg-muted rounded-md p-4 text-sm overflow-x-auto"><code>{`POSTGRES_PORT=5433`}</code></pre>

                  <p>Fichier <code className="bg-muted px-1 rounded text-sm">apps/api/.env</code> (utilisé par l&apos;API et les scripts) :</p>
                  <pre className="bg-muted rounded-md p-4 text-sm overflow-x-auto"><code>{`cp apps/api/.env.example apps/api/.env`}</code></pre>
                  <pre className="bg-muted rounded-md p-4 text-sm overflow-x-auto"><code>{`DATABASE_URL="postgresql://myli:myli@localhost:5433/myli"\nREDIS_URL="redis://localhost:6379"\nPORT=4000\nPASSWORD_PEPPER="IjustUseThisForMyTestButINeedToReplaceItForTheFinalEnvFile"\nJWT_SECRET="replace-with-strong-secret"\nARGON2_MEMORY_COST=65536\nARGON2_TIME_COST=3\nARGON2_PARALLELISM=1\nGRAPHQL_MAX_DEPTH=5\nGRAPHQL_MAX_COMPLEXITY=1000`}</code></pre>

                  <h4 className="font-semibold text-foreground">2. Variables d&apos;environnement</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 pr-4 text-foreground">Variable</th>
                          <th className="text-left py-2 pr-4 text-foreground">Obligatoire</th>
                          <th className="text-left py-2 text-foreground">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {[
                          ["DATABASE_URL", "oui", "URL PostgreSQL utilisée par Prisma et les scripts de seed. En local, utiliser localhost:5433 si vous gardez la config Docker par défaut."],
                          ["REDIS_URL", "oui", "URL de connexion Redis. Par défaut : redis://localhost:6379."],
                          ["PORT", "non", "Port HTTP de l&apos;API GraphQL. Par défaut : 4000."],
                          ["PASSWORD_PEPPER", "oui", "Valeur secrète ajoutée aux mots de passe avant hash Argon2."],
                          ["JWT_SECRET", "oui", "Secret de signature des JWT. Obligatoire pour login, logout et toutes les mutations authentifiées."],
                          ["ARGON2_MEMORY_COST", "non", "Coût mémoire Argon2. Par défaut : 65536."],
                          ["ARGON2_TIME_COST", "non", "Coût temporel Argon2. Par défaut : 3."],
                          ["ARGON2_PARALLELISM", "non", "Niveau de parallélisme Argon2. Par défaut : 1."],
                          ["GRAPHQL_MAX_DEPTH", "non", "Profondeur maximale d'une requête GraphQL. Par défaut : 5."],
                          ["GRAPHQL_MAX_COMPLEXITY", "non", "Complexité maximale d'une requête GraphQL. Par défaut : 1000."],
                        ].map(([v, req, desc]) => (
                          <tr key={v}>
                            <td className="py-2 pr-4"><code className="bg-muted px-1 rounded text-xs">{v}</code></td>
                            <td className="py-2 pr-4">{req}</td>
                            <td className="py-2">{desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <h4 className="font-semibold text-foreground">3–5. Démarrage</h4>
                  <pre className="bg-muted rounded-md p-4 text-sm overflow-x-auto"><code>{`docker compose up -d\nbun run --filter api prisma:generate\nbun run --filter api prisma:migrate`}</code></pre>

                  <h4 className="font-semibold text-foreground">Seeder la base</h4>
                  <p>Télécharger les CSV puis lancer le seed :</p>
                  <pre className="bg-muted rounded-md p-4 text-sm overflow-x-auto"><code>{`bun run --filter api seed:download\nbun run --filter api seed`}</code></pre>
                </div>

                {/* Séquence complète */}
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">Séquence complète recommandée</h3>
                  <pre className="bg-muted rounded-md p-4 text-sm overflow-x-auto"><code>{`cp .env.example .env\ncp apps/api/.env.example apps/api/.env\ndocker compose up -d\nbun install\nbun run --filter api prisma:generate\nbun run --filter api prisma:migrate\nbun run --filter api seed:download\nbun run --filter api seed\nbun run --filter api dev`}</code></pre>
                </div>

                {/* Lancer l&apos;API */}
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">Lancer l&apos;API</h3>
                  <pre className="bg-muted rounded-md p-4 text-sm overflow-x-auto"><code>{`bun run --filter api dev`}</code></pre>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>URL GraphQL : <code className="bg-muted px-1 rounded text-sm">http://localhost:4000/graphql</code></li>
                    <li>Header d&apos;auth : <code className="bg-muted px-1 rounded text-sm">Authorization: Bearer &lt;token&gt;</code></li>
                  </ul>
                </div>

                {/* Requête HTTP type */}
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">Requête HTTP type</h3>
                  <p>Exemple avec <code className="bg-muted px-1 rounded text-sm">curl</code> :</p>
                  <pre className="bg-muted rounded-md p-4 text-sm overflow-x-auto"><code>{`curl http://localhost:4000/graphql \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer <token>' \\
  -d '{
    "query": "mutation Example($input: CreatePlaylistInput!) { createPlaylist(input: $input) { playlistId name } }",
    "variables": {
      "input": { "name": "Ma playlist" }
    }
  }'`}</code></pre>
                  <p>Si une mutation n&apos;exige pas d&apos;authentification, supprimez le header <code className="bg-muted px-1 rounded text-sm">Authorization</code>.</p>
                </div>

                {/* Documentation des mutations */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-foreground">Documentation de toutes les mutations</h3>

                  {/* createAccount */}
                  <div className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3"><code className="text-base font-bold text-foreground">createAccount</code><span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-500/20 text-green-400">✓ Public</span></div>
                    <p>Créer un compte utilisateur.</p>
                    <ul className="list-disc pl-5 space-y-0.5 text-sm"><li>Retour : <code className="bg-muted px-1 rounded text-xs">Account!</code></li><li>Contraintes : <code className="bg-muted px-1 rounded text-xs">login</code> et <code className="bg-muted px-1 rounded text-xs">email</code> doivent être uniques</li><li>Mot de passe : au moins 12 caractères, avec au moins une majuscule et un caractère spécial</li></ul>
                    <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{`mutation CreateAccount($input: CreateAccountInput!) {
  createAccount(input: $input) {
    accountId
    login
    email
    name
    isArtist
  }
}`}</code></pre>
                    <p className="text-sm font-medium text-foreground">Variables :</p>
                    <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{`{
  "input": {
    "login": "marie",
    "email": "marie@example.com",
    "password": "SuperMotDePasse!",
    "name": "Marie Dupont",
    "isArtist": false
  }
}`}</code></pre>
                  </div>

                  {/* updateAccount */}
                  <div className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3"><code className="text-base font-bold text-foreground">updateAccount</code><span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-500/20 text-amber-400">🔒 Auth requise</span></div>
                    <p>Mettre à jour le compte connecté.</p>
                    <ul className="list-disc pl-5 space-y-0.5 text-sm"><li>Retour : <code className="bg-muted px-1 rounded text-xs">Account</code> (peut être <code className="bg-muted px-1 rounded text-xs">null</code> si le compte n&apos;existe pas)</li><li>Restriction : <code className="bg-muted px-1 rounded text-xs">accountId</code> doit correspondre au compte du token</li></ul>
                    <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{`mutation UpdateAccount($accountId: String!, $input: UpdateAccountInput!) {
  updateAccount(accountId: $accountId, input: $input) {
    accountId
    login
    email
    role
    name
    isArtist
  }
}`}</code></pre>
                    <p className="text-sm font-medium text-foreground">Variables :</p>
                    <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{`{
  "accountId": "3b7c1fd5-8a5c-4bce-91e0-6bcf9c10f111",
  "input": {
    "name": "Marie D.",
    "login": "marie_dupont"
  }
}`}</code></pre>
                  </div>

                  {/* updateArtist */}
                  <div className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3"><code className="text-base font-bold text-foreground">updateArtist</code><span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-500/20 text-amber-400">🔒 Auth requise</span></div>
                    <p>Mettre à jour le profil artiste rattaché à un compte.</p>
                    <ul className="list-disc pl-5 space-y-0.5 text-sm"><li>Retour : <code className="bg-muted px-1 rounded text-xs">Artist</code></li><li>Restriction : <code className="bg-muted px-1 rounded text-xs">accountId</code> doit correspondre au compte du token</li><li>Précondition : le compte doit avoir <code className="bg-muted px-1 rounded text-xs">isArtist = true</code></li></ul>
                    <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{`mutation UpdateArtist($accountId: String!, $input: UpdateArtistInput!) {
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
}`}</code></pre>
                    <p className="text-sm font-medium text-foreground">Variables :</p>
                    <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{`{
  "accountId": "3b7c1fd5-8a5c-4bce-91e0-6bcf9c10f111",
  "input": {
    "artistBio": "Projet electro-pop independant.",
    "artistLocation": "Lyon",
    "artistLatitude": 45.764,
    "artistLongitude": 4.8357,
    "artistActiveYearBegin": 2021
  }
}`}</code></pre>
                  </div>

                  {/* deleteAccount */}
                  <div className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3"><code className="text-base font-bold text-foreground">deleteAccount</code><span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-500/20 text-amber-400">🔒 Auth requise</span></div>
                    <p>Supprimer le compte connecté.</p>
                    <ul className="list-disc pl-5 space-y-0.5 text-sm"><li>Retour : <code className="bg-muted px-1 rounded text-xs">Boolean!</code></li><li>Restriction : <code className="bg-muted px-1 rounded text-xs">accountId</code> doit correspondre au compte du token</li></ul>
                    <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{`mutation DeleteAccount($accountId: String!) {
  deleteAccount(accountId: $accountId)
}`}</code></pre>
                    <p className="text-sm font-medium text-foreground">Variables :</p>
                    <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{`{
  "accountId": "3b7c1fd5-8a5c-4bce-91e0-6bcf9c10f111"
}`}</code></pre>
                  </div>

                  {/* login */}
                  <div className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3"><code className="text-base font-bold text-foreground">login</code><span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-500/20 text-green-400">✓ Public</span></div>
                    <p>Authentifier un utilisateur et récupérer un JWT.</p>
                    <ul className="list-disc pl-5 space-y-0.5 text-sm"><li>Retour : <code className="bg-muted px-1 rounded text-xs">AuthPayload</code> ou <code className="bg-muted px-1 rounded text-xs">null</code> si email / mot de passe invalide</li><li>Usage : stocker <code className="bg-muted px-1 rounded text-xs">token</code> puis l&apos;envoyer dans <code className="bg-muted px-1 rounded text-xs">Authorization: Bearer &lt;token&gt;</code></li></ul>
                    <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{`mutation Login($input: LoginInput!) {
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
}`}</code></pre>
                    <p className="text-sm font-medium text-foreground">Variables :</p>
                    <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{`{
  "input": {
    "email": "marie@example.com",
    "password": "SuperMotDePasse!"
  }
}`}</code></pre>
                  </div>

                  {/* logout */}
                  <div className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3"><code className="text-base font-bold text-foreground">logout</code><span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-500/20 text-amber-400">🔒 Auth requise</span></div>
                    <p>Invalider le token courant en supprimant la session Redis.</p>
                    <ul className="list-disc pl-5 space-y-0.5 text-sm"><li>Retour : <code className="bg-muted px-1 rounded text-xs">Boolean!</code></li></ul>
                    <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{`mutation Logout {
  logout
}`}</code></pre>
                    <p className="text-sm font-medium text-foreground">Variables :</p>
                    <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{`{}`}</code></pre>
                  </div>

                  {/* likeTrack */}
                  <div className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3"><code className="text-base font-bold text-foreground">likeTrack</code><span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-500/20 text-amber-400">🔒 Auth requise</span></div>
                    <p>Ajouter un morceau aux favoris du compte connecté.</p>
                    <ul className="list-disc pl-5 space-y-0.5 text-sm"><li>Retour : <code className="bg-muted px-1 rounded text-xs">Track</code></li></ul>
                    <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{`mutation LikeTrack($trackId: String!) {
  likeTrack(trackId: $trackId) {
    trackId
    title
    isLiked
    favorites
  }
}`}</code></pre>
                    <p className="text-sm font-medium text-foreground">Variables :</p>
                    <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{`{
  "trackId": "6a4d3d5c-7ce6-4f2a-b6db-c1cb3a1a2001"
}`}</code></pre>
                  </div>

                  {/* unlikeTrack */}
                  <div className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3"><code className="text-base font-bold text-foreground">unlikeTrack</code><span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-500/20 text-amber-400">🔒 Auth requise</span></div>
                    <p>Retirer un morceau des favoris du compte connecté.</p>
                    <ul className="list-disc pl-5 space-y-0.5 text-sm"><li>Retour : <code className="bg-muted px-1 rounded text-xs">Track</code></li></ul>
                    <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{`mutation UnlikeTrack($trackId: String!) {
  unlikeTrack(trackId: $trackId) {
    trackId
    title
    isLiked
    favorites
  }
}`}</code></pre>
                    <p className="text-sm font-medium text-foreground">Variables :</p>
                    <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{`{
  "trackId": "6a4d3d5c-7ce6-4f2a-b6db-c1cb3a1a2001"
}`}</code></pre>
                  </div>

                  {/* pinTrack */}
                  <div className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3"><code className="text-base font-bold text-foreground">pinTrack</code><span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-500/20 text-amber-400">🔒 Auth requise</span></div>
                    <p>Épingler un morceau dans un slot de profil.</p>
                    <ul className="list-disc pl-5 space-y-0.5 text-sm"><li>Retour : <code className="bg-muted px-1 rounded text-xs">PinnedItem</code></li><li>Contrainte : <code className="bg-muted px-1 rounded text-xs">slot</code> doit être compris entre <code className="bg-muted px-1 rounded text-xs">1</code> et <code className="bg-muted px-1 rounded text-xs">4</code></li></ul>
                    <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{`mutation PinTrack($slot: Int!, $trackId: String!) {
  pinTrack(slot: $slot, trackId: $trackId) {
    slot
    itemType
    pinnedAt
    track {
      trackId
      title
    }
  }
}`}</code></pre>
                    <p className="text-sm font-medium text-foreground">Variables :</p>
                    <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{`{
  "slot": 1,
  "trackId": "6a4d3d5c-7ce6-4f2a-b6db-c1cb3a1a2001"
}`}</code></pre>
                  </div>

                  {/* pinAlbum */}
                  <div className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3"><code className="text-base font-bold text-foreground">pinAlbum</code><span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-500/20 text-amber-400">🔒 Auth requise</span></div>
                    <p>Épingler un album dans un slot de profil.</p>
                    <ul className="list-disc pl-5 space-y-0.5 text-sm"><li>Retour : <code className="bg-muted px-1 rounded text-xs">PinnedItem</code></li><li>Contrainte : <code className="bg-muted px-1 rounded text-xs">slot</code> doit être compris entre <code className="bg-muted px-1 rounded text-xs">1</code> et <code className="bg-muted px-1 rounded text-xs">4</code></li></ul>
                    <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{`mutation PinAlbum($slot: Int!, $albumId: String!) {
  pinAlbum(slot: $slot, albumId: $albumId) {
    slot
    itemType
    pinnedAt
    album {
      albumId
      title
    }
  }
}`}</code></pre>
                    <p className="text-sm font-medium text-foreground">Variables :</p>
                    <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{`{
  "slot": 2,
  "albumId": "9a4d3d5c-7ce6-4f2a-b6db-c1cb3a1a2002"
}`}</code></pre>
                  </div>

                  {/* pinArtist */}
                  <div className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3"><code className="text-base font-bold text-foreground">pinArtist</code><span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-500/20 text-amber-400">🔒 Auth requise</span></div>
                    <p>Épingler un artiste dans un slot de profil.</p>
                    <ul className="list-disc pl-5 space-y-0.5 text-sm"><li>Retour : <code className="bg-muted px-1 rounded text-xs">PinnedItem</code></li><li>Contrainte : <code className="bg-muted px-1 rounded text-xs">slot</code> entre 1 et 4</li></ul>
                    <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{`mutation PinArtist($slot: Int!, $artistId: String!) {
  pinArtist(slot: $slot, artistId: $artistId) {
    slot
    itemType
    pinnedAt
    artist {
      artistId
      name
    }
  }
}`}</code></pre>
                    <p className="text-sm font-medium text-foreground">Variables :</p>
                    <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{`{
  "slot": 3,
  "artistId": "2a4d3d5c-7ce6-4f2a-b6db-c1cb3a1a2003"
}`}</code></pre>
                  </div>

                  {/* pinPlaylist */}
                  <div className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3"><code className="text-base font-bold text-foreground">pinPlaylist</code><span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-500/20 text-amber-400">🔒 Auth requise</span></div>
                    <p>Épingler une playlist dans un slot de profil.</p>
                    <ul className="list-disc pl-5 space-y-0.5 text-sm"><li>Retour : <code className="bg-muted px-1 rounded text-xs">PinnedItem</code></li><li>Contrainte : <code className="bg-muted px-1 rounded text-xs">slot</code> entre 1 et 4</li></ul>
                    <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{`mutation PinPlaylist($slot: Int!, $playlistId: String!) {
  pinPlaylist(slot: $slot, playlistId: $playlistId) {
    slot
    itemType
    pinnedAt
    playlist {
      playlistId
      name
    }
  }
}`}</code></pre>
                    <p className="text-sm font-medium text-foreground">Variables :</p>
                    <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{`{
  "slot": 4,
  "playlistId": "1a4d3d5c-7ce6-4f2a-b6db-c1cb3a1a2004"
}`}</code></pre>
                  </div>

                  {/* unpinItem */}
                  <div className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3"><code className="text-base font-bold text-foreground">unpinItem</code><span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-500/20 text-amber-400">🔒 Auth requise</span></div>
                    <p>Libérer un slot épinglé.</p>
                    <ul className="list-disc pl-5 space-y-0.5 text-sm"><li>Retour : <code className="bg-muted px-1 rounded text-xs">Boolean!</code></li><li>Contrainte : <code className="bg-muted px-1 rounded text-xs">slot</code> entre 1 et 4</li></ul>
                    <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{`mutation UnpinItem($slot: Int!) {
  unpinItem(slot: $slot)
}`}</code></pre>
                    <p className="text-sm font-medium text-foreground">Variables :</p>
                    <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{`{
  "slot": 1
}`}</code></pre>
                  </div>

                  {/* createPlaylist */}
                  <div className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3"><code className="text-base font-bold text-foreground">createPlaylist</code><span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-500/20 text-amber-400">🔒 Auth requise</span></div>
                    <p>Créer une playlist pour le compte connecté.</p>
                    <ul className="list-disc pl-5 space-y-0.5 text-sm"><li>Retour : <code className="bg-muted px-1 rounded text-xs">Playlist!</code></li><li>Contrainte : <code className="bg-muted px-1 rounded text-xs">name</code> ne doit pas être vide</li></ul>
                    <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{`mutation CreatePlaylist($input: CreatePlaylistInput!) {
  createPlaylist(input: $input) {
    playlistId
    name
    ownerDisplayName
    isEditable
    trackCount
  }
}`}</code></pre>
                    <p className="text-sm font-medium text-foreground">Variables :</p>
                    <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{`{
  "input": {
    "name": "Mes decouvertes"
  }
}`}</code></pre>
                  </div>

                  {/* updatePlaylist */}
                  <div className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3"><code className="text-base font-bold text-foreground">updatePlaylist</code><span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-500/20 text-amber-400">🔒 Auth requise</span></div>
                    <p>Renommer une playlist éditable par le compte connecté.</p>
                    <ul className="list-disc pl-5 space-y-0.5 text-sm"><li>Retour : <code className="bg-muted px-1 rounded text-xs">Playlist</code></li><li>Contrainte : <code className="bg-muted px-1 rounded text-xs">name</code>, s&apos;il est fourni, ne doit pas être vide</li></ul>
                    <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{`mutation UpdatePlaylist($playlistId: String!, $input: UpdatePlaylistInput!) {
  updatePlaylist(playlistId: $playlistId, input: $input) {
    playlistId
    name
    trackCount
  }
}`}</code></pre>
                    <p className="text-sm font-medium text-foreground">Variables :</p>
                    <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{`{
  "playlistId": "1a4d3d5c-7ce6-4f2a-b6db-c1cb3a1a2004",
  "input": {
    "name": "Mes decouvertes 2026"
  }
}`}</code></pre>
                  </div>

                  {/* deletePlaylist */}
                  <div className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3"><code className="text-base font-bold text-foreground">deletePlaylist</code><span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-500/20 text-amber-400">🔒 Auth requise</span></div>
                    <p>Supprimer une playlist éditable par le compte connecté.</p>
                    <ul className="list-disc pl-5 space-y-0.5 text-sm"><li>Retour : <code className="bg-muted px-1 rounded text-xs">Boolean!</code></li></ul>
                    <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{`mutation DeletePlaylist($playlistId: String!) {
  deletePlaylist(playlistId: $playlistId)
}`}</code></pre>
                    <p className="text-sm font-medium text-foreground">Variables :</p>
                    <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{`{
  "playlistId": "1a4d3d5c-7ce6-4f2a-b6db-c1cb3a1a2004"
}`}</code></pre>
                  </div>

                  {/* addTrackToPlaylist */}
                  <div className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3"><code className="text-base font-bold text-foreground">addTrackToPlaylist</code><span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-500/20 text-amber-400">🔒 Auth requise</span></div>
                    <p>Ajouter un morceau à une playlist éditable par le compte connecté.</p>
                    <ul className="list-disc pl-5 space-y-0.5 text-sm"><li>Retour : <code className="bg-muted px-1 rounded text-xs">Playlist</code></li></ul>
                    <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{`mutation AddTrackToPlaylist($playlistId: String!, $trackId: String!) {
  addTrackToPlaylist(playlistId: $playlistId, trackId: $trackId) {
    playlistId
    name
    trackCount
    tracks {
      trackId
      title
    }
  }
}`}</code></pre>
                    <p className="text-sm font-medium text-foreground">Variables :</p>
                    <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{`{
  "playlistId": "1a4d3d5c-7ce6-4f2a-b6db-c1cb3a1a2004",
  "trackId": "6a4d3d5c-7ce6-4f2a-b6db-c1cb3a1a2001"
}`}</code></pre>
                  </div>

                  {/* removeTrackFromPlaylist */}
                  <div className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3"><code className="text-base font-bold text-foreground">removeTrackFromPlaylist</code><span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-500/20 text-amber-400">🔒 Auth requise</span></div>
                    <p>Retirer un morceau d&apos;une playlist éditable par le compte connecté.</p>
                    <ul className="list-disc pl-5 space-y-0.5 text-sm"><li>Retour : <code className="bg-muted px-1 rounded text-xs">Playlist</code></li></ul>
                    <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{`mutation RemoveTrackFromPlaylist($playlistId: String!, $trackId: String!) {
  removeTrackFromPlaylist(playlistId: $playlistId, trackId: $trackId) {
    playlistId
    name
    trackCount
    tracks {
      trackId
      title
    }
  }
}`}</code></pre>
                    <p className="text-sm font-medium text-foreground">Variables :</p>
                    <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{`{
  "playlistId": "1a4d3d5c-7ce6-4f2a-b6db-c1cb3a1a2004",
  "trackId": "6a4d3d5c-7ce6-4f2a-b6db-c1cb3a1a2001"
}`}</code></pre>
                  </div>

                  {/* recordTrackListen */}
                  <div className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3"><code className="text-base font-bold text-foreground">recordTrackListen</code><span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-500/20 text-amber-400">🔒 Auth requise</span></div>
                    <p>Enregistrer une écoute pour le compte connecté.</p>
                    <ul className="list-disc pl-5 space-y-0.5 text-sm"><li>Retour : <code className="bg-muted px-1 rounded text-xs">Boolean!</code></li><li>Effet de bord : met à jour l&apos;historique d&apos;écoute et les stats de bibliothèque côté backend</li></ul>
                    <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{`mutation RecordTrackListen($trackId: String!) {
  recordTrackListen(trackId: $trackId)
}`}</code></pre>
                    <p className="text-sm font-medium text-foreground">Variables :</p>
                    <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto"><code>{`{
  "trackId": "6a4d3d5c-7ce6-4f2a-b6db-c1cb3a1a2001"
}`}</code></pre>
                  </div>

                </div>

                {/* Conseils */}
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">Conseils pratiques</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Commencez par <code className="bg-muted px-1 rounded text-xs">createAccount</code>, puis <code className="bg-muted px-1 rounded text-xs">login</code> pour récupérer un token.</li>
                    <li>Réutilisez ce token pour toutes les mutations protégées.</li>
                    <li>Pour les IDs (<code className="bg-muted px-1 rounded text-xs">accountId</code>, <code className="bg-muted px-1 rounded text-xs">trackId</code>, <code className="bg-muted px-1 rounded text-xs">playlistId</code>, etc.), utilisez les requêtes GraphQL de lecture pour récupérer des valeurs valides.</li>
                    <li>Si une mutation retourne <code className="bg-muted px-1 rounded text-xs">null</code>, cela signifie généralement que la ressource cible n&apos;existe pas ou n&apos;est pas éditable / visible pour le compte courant.</li>
                    <li>Si une mutation échoue avec une erreur GraphQL, vérifiez en priorité les contraintes de validation : mot de passe, unicité email/login, et slot entre <code className="bg-muted px-1 rounded text-xs">1</code> et <code className="bg-muted px-1 rounded text-xs">4</code>.</li>
                  </ul>
                </div>

              </CardContent>
            </Card>
          )}

          {activeSection === "mentions" && (
            <Card className="bg-card border-border shadow-md">
              <CardHeader>
                <CardTitle className="text-3xl font-[family-name:var(--font-protest-strike)] text-primary font-light">Mentions Légales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 text-muted-foreground leading-relaxed">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">Éditeur du site</h3>
                  <p>Le site MUSE (Music Unlimited Streaming Experience) est édité par :</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li><strong>Nom / Dénomination sociale :</strong> MouveYourLife – MYLi</li>
                    <li><strong>Forme juridique :</strong> SARL</li>
                    <li><strong>Capital social :</strong> 5000€</li>
                    <li><strong>Siège social :</strong> Lannion (22300), France</li>
                    <li><strong>Numéro SIRET :</strong> 98256563200014</li>
                    <li><strong>RCS :</strong> Lannion, 22300</li>
                    <li><strong>Numéro TVA intracommunautaire :</strong> FR68212201131</li>
                  </ul>
                  <p className="mt-4"><strong>Directeur de la publication :</strong> Antoine TOULLEC<br /><strong>Email de contact :</strong> <a href="mailto:antoine.toullec@etudiant.univ-rennes.fr" className="text-primary hover:underline">antoine.toullec@etudiant.univ-rennes.fr</a></p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">Hébergement</h3>
                  <p><strong>Hébergeur :</strong> IUT Lannion<br />
                    <strong>Adresse :</strong> 7 Rue Édouard Branly, 22300 Lannion<br />
                    <strong>Téléphone :</strong> 02 96 46 93 00</p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">Propriété intellectuelle</h3>
                  <p>L’ensemble des contenus présents sur la plateforme MUSE (textes, graphismes, logos, interface, base de données, design, code source) est protégé par le droit de la propriété intellectuelle.</p>
                  <p>Toute reproduction, distribution, modification ou exploitation sans autorisation écrite préalable est strictement interdite.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "rgpd" && (
            <Card className="bg-card border-border shadow-md">
              <CardHeader>
                <CardTitle className="text-3xl font-[family-name:var(--font-protest-strike)] text-primary font-light">Politique de Confidentialité (RGPD)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 text-muted-foreground leading-relaxed">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">Données collectées</h3>
                  <p>MUSE peut collecter les données suivantes :</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Nom et prénom</li>
                    <li>Adresse email</li>
                    <li>Mot de passe (chiffré)</li>
                    <li>Données de connexion</li>
                    <li>Adresse IP</li>
                    <li>Historique d’écoute</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">Finalités du traitement</h3>
                  <p>Les données sont collectées afin de :</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Créer et gérer les comptes utilisateurs</li>
                    <li>Fournir le service de streaming musical</li>
                    <li>Gérer les abonnements</li>
                    <li>Améliorer l’expérience utilisateur</li>
                    <li>Assurer la sécurité de la plateforme</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">Base légale & Durée de conservation</h3>
                  <p><strong>Base légale :</strong> L’exécution du contrat (abonnement), le consentement (newsletter, cookies), et l&apos;obligation légale.</p>
                  <p><strong>Durée de conservation :</strong> Pendant la durée de l’abonnement, ou jusqu’à 3 ans après la dernière activité, et selon les obligations légales pour les données comptables.</p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">Droits des utilisateurs</h3>
                  <p>Conformément au RGPD, vous disposez des droits suivants : accès, rectification, effacement, opposition, et portabilité.</p>
                  <p>Toute demande peut être adressée à : <a href="mailto:antoine.toullec@etudiant.univ-rennes.fr" className="text-primary hover:underline">antoine.toullec@etudiant.univ-rennes.fr</a></p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "cgu" && (
            <Card className="bg-card border-border shadow-md">
              <CardHeader>
                <CardTitle className="text-3xl font-[family-name:var(--font-protest-strike)] text-primary font-light">Conditions Générales d&apos;Utilisation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 text-muted-foreground leading-relaxed">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">Objet & Création de compte</h3>
                  <p>Les présentes CGU définissent les conditions d’accès et d’utilisation de la plateforme MUSE.</p>
                  <p>L’utilisateur doit fournir des informations exactes lors de l’inscription. Il est responsable de la confidentialité de ses identifiants.</p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">Accès au service</h3>
                  <p>MUSE propose un service de streaming musical accessible via abonnement ou offre gratuite (selon formule).</p>
                  <p>La disponibilité du service est assurée 24h/24, sauf maintenance ou cas de force majeure.</p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">Règles d’utilisation</h3>
                  <p>Il est interdit de :</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Copier ou redistribuer les contenus musicaux</li>
                    <li>Tenter d’extraire la base de données</li>
                    <li>Contourner les mesures de sécurité</li>
                    <li>Utiliser la plateforme à des fins illégales</li>
                  </ul>
                  <p className="mt-4">MUSE se réserve le droit de suspendre ou supprimer un compte en cas de violation des CGU.</p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">Médiation et Droit applicable</h3>
                  <p>En cas de litige, l’utilisateur peut recourir gratuitement à un médiateur de la consommation conformément aux dispositions du Code de la consommation. Les coordonnées du médiateur seront communiquées sur demande.</p>
                  <p>Les présentes mentions légales, CGU et CGV sont soumises au droit français. Tout litige relève de la compétence des tribunaux français.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "contact" && (
            <Card className="bg-card border-border shadow-md" id="contact">
              <CardHeader>
                <CardTitle className="text-3xl font-[family-name:var(--font-protest-strike)] text-primary font-light">Contact & Équipe technique</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-2 mb-6">
                  <p className="text-lg font-medium text-foreground">MUSE – Music Unlimited Streaming Experience</p>
                  <p className="text-muted-foreground">En collaboration avec MouveYourLife – MYLi<br />Localisation : Lannion (22300), France</p>
                </div>

                <p className="text-muted-foreground">La plateforme est développée et maintenue par une équipe de 5 développeurs :</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-background/50 border border-border flex flex-col items-start hover:bg-muted/50 transition-colors">
                    <p className="text-foreground font-semibold mb-1">Lilian BROSSARD</p>
                    <a href="mailto:lilian.brossard@etudiant.univ-rennes.fr" className="text-sm text-primary hover:underline break-all">lilian.brossard@etudiant.univ-rennes.fr</a>
                  </div>
                  <div className="p-4 rounded-lg bg-background/50 border border-border flex flex-col items-start hover:bg-muted/50 transition-colors">
                    <p className="text-foreground font-semibold mb-1">Titouan RÉTHORÉ</p>
                    <a href="mailto:titouan.rethore@etudiant.univ-rennes.fr" className="text-sm text-primary hover:underline break-all">titouan.rethore@etudiant.univ-rennes.fr</a>
                  </div>
                  <div className="p-4 rounded-lg bg-background/50 border border-border flex flex-col items-start hover:bg-muted/50 transition-colors">
                    <p className="text-foreground font-semibold mb-1">Dylan BUREL</p>
                    <a href="mailto:dylan.burel1@etudiant.univ-rennes.fr" className="text-sm text-primary hover:underline break-all">dylan.burel1@etudiant.univ-rennes.fr</a>
                  </div>
                  <div className="p-4 rounded-lg bg-background/50 border border-border flex flex-col items-start hover:bg-muted/50 transition-colors">
                    <p className="text-foreground font-semibold mb-1">Matthieu LE BOUT</p>
                    <a href="mailto:matthieu.le-bout@etudiant.univ-rennes.fr" className="text-sm text-primary hover:underline break-all">matthieu.le-bout@etudiant.univ-rennes.fr</a>
                  </div>
                  <div className="p-4 rounded-lg bg-background/50 border border-border flex flex-col items-start hover:bg-muted/50 transition-colors md:col-span-2 md:w-1/2 md:justify-self-center">
                    <p className="text-foreground font-semibold mb-1">Antoine TOULLEC</p>
                    <a href="mailto:antoine.toullec@etudiant.univ-rennes.fr" className="text-sm text-primary hover:underline break-all">antoine.toullec@etudiant.univ-rennes.fr</a>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
