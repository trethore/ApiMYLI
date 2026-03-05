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
               <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
                 <p><strong>Editeur du site :</strong> Projet Étudiant MYLI</p>
                 <p><strong>Hébergement :</strong> Ce site est un prototype hébergé dans le cadre scolaire.</p>
                 <p>Plateforme d'écoute musicale éducative.</p>
                 <p>Ces mentions légales sont des textes de remplissage pour les besoins d'un projet de fin d'année universitaire. Aucune donnée commerciale n'est traitée. Les droits et les oeuvres restent la propriété de leurs créateurs respectifs.</p>
               </CardContent>
             </Card>
          )}

          {activeSection === "cgu" && (
             <Card className="bg-card border-border shadow-md">
               <CardHeader>
                 <CardTitle className="text-3xl font-[family-name:var(--font-protest-strike)] text-primary font-light">Conditions Générales d'Utilisation</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
                 <p>En utilisant ce service, vous acceptez les conditions suivantes :</p>
                 <ul className="list-disc pl-5 mt-2 space-y-1">
                   <li>Respect des autres utilisateurs dans toutes les interactions.</li>
                   <li>Ne pas utiliser ce service pour stocker ou transmettre des contenus illégaux.</li>
                   <li>Les informations personnelles sont stockées dans le cadre strict du respect de confidentialité lié au projet.</li>
                 </ul>
               </CardContent>
             </Card>
          )}

          {activeSection === "contact" && (
             <Card className="bg-card border-border shadow-md" id="contact">
               <CardHeader>
                 <CardTitle className="text-3xl font-[family-name:var(--font-protest-strike)] text-primary font-light">Contact</CardTitle>
               </CardHeader>
               <CardContent className="space-y-6">
                 <p className="text-muted-foreground">Pour toute question sur le projet, veuillez nous contacter aux adresses suivantes :</p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="p-4 rounded-lg bg-background-secondary border border-border">
                     <p className="text-sm text-muted-foreground mb-1">Membre 1</p>
                     <p className="font-medium">contact1@muse.fr</p>
                   </div>
                   <div className="p-4 rounded-lg bg-background-secondary border border-border">
                     <p className="text-sm text-muted-foreground mb-1">Membre 2</p>
                     <p className="font-medium">contact2@muse.fr</p>
                   </div>
                   <div className="p-4 rounded-lg bg-background-secondary border border-border">
                     <p className="text-sm text-muted-foreground mb-1">Membre 3</p>
                     <p className="font-medium">contact3@muse.fr</p>
                   </div>
                   <div className="p-4 rounded-lg bg-background-secondary border border-border">
                     <p className="text-sm text-muted-foreground mb-1">Membre 4</p>
                     <p className="font-medium">contact4@muse.fr</p>
                   </div>
                   <div className="p-4 rounded-lg bg-background-secondary border border-border">
                     <p className="text-sm text-muted-foreground mb-1">Membre 5</p>
                     <p className="font-medium">contact5@muse.fr</p>
                   </div>
                   <div className="p-4 rounded-lg bg-background-secondary border border-border">
                     <p className="text-sm text-muted-foreground mb-1">Membre 6</p>
                     <p className="font-medium">contact6@muse.fr</p>
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
