"use client";

import Nav from "@/components/Nav";
import SectionTitle from "@/components/SectionTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";

export default function AboutPage() {
  const [activeSection, setActiveSection] = useState("mentions");

  useEffect(() => {
    // Si l'URL contient #contact, on active la section contact
    if (window.location.hash === "#contact") {
      setActiveSection("contact");
    }
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
                  <p className="mt-4"><strong>Directeur de la publication :</strong> Antoine TOULLEC<br/><strong>Email de contact :</strong> <a href="mailto:antoine.toullec@etudiant.univ-rennes.fr" className="text-primary hover:underline">antoine.toullec@etudiant.univ-rennes.fr</a></p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">Hébergement</h3>
                  <p><strong>Hébergeur :</strong> IUT Lannion<br/>
                  <strong>Adresse :</strong> 7 Rue Édouard Branly, 22300 Lannion<br/>
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
                  <p><strong>Base légale :</strong> L’exécution du contrat (abonnement), le consentement (newsletter, cookies), et l'obligation légale.</p>
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
                <CardTitle className="text-3xl font-[family-name:var(--font-protest-strike)] text-primary font-light">Conditions Générales d'Utilisation</CardTitle>
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
                  <p className="text-muted-foreground">En collaboration avec MouveYourLife – MYLi<br/>Localisation : Lannion (22300), France</p>
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
