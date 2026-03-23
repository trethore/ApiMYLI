"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";

export default function AdminPage() {
//   const { isAuthenticated, isUserAdmin } = useAuth();
//   const router = useRouter();
//   const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

//   useEffect(() => {
//     if (!isAuthenticated) {
//       setRedirectCountdown(5);
//       return;
//     }

//     if (!isUserAdmin) {
//       setRedirectCountdown(5);
//       return;
//     }
//   }, [isAuthenticated, isUserAdmin]);

//   useEffect(() => {
//     if (redirectCountdown === null) return;

//     if (redirectCountdown === 0) {
//       const destination = isAuthenticated ? "/" : "/login";
//       router.push(destination);
//       return;
//     }

//     const timer = setTimeout(() => {
//       setRedirectCountdown(redirectCountdown - 1);
//     }, 1000);

//     return () => clearTimeout(timer);
//   }, [redirectCountdown, isAuthenticated, router]);

//   if (!isAuthenticated || !isUserAdmin) {
//     return (
//       <div className="min-h-screen flex flex-col font-sans bg-background text-foreground">
//         <Nav />
//         <main className="flex-1 flex items-center justify-center pb-24 lg:pb-8">
//           <div className="text-center max-w-md">
//             <div className="mb-6">
//               <div className="inline-flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-full mb-4">
//                 <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4L3 20h18L12 4z" />
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4"/>
//                     <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
//                 </svg>
//               </div>
//               <h1 className="text-2xl font-bold mb-2">Accès refusé</h1>
//               <p className="text-muted-foreground mb-6">
//                 Vous n'avez pas les droits nécessaires pour accéder à cette page.
//               </p>
//               <p className="text-sm text-muted-foreground">
//                 Redirection dans <span className="font-semibold text-foreground">{redirectCountdown}</span> seconde{redirectCountdown !== 1 ? "s" : ""}...
//               </p>
//             </div>
//           </div>
//         </main>
//       </div>
//     );
//   }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-foreground">
      <Nav />
      <main className="flex-1 lg:pt-8 pb-24 lg:pb-8 mx-4 md:mx-8 lg:mx-48">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-4xl font-bold font-[family-name:var(--font-protest-strike)]">
              Panneau d'administration
            </h1>
            <p className="text-muted-foreground mt-2">
              Gérez les utilisateurs, le contenu et les paramètres de la plateforme.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-6 bg-card rounded-lg border border-border">
              <h2 className="text-xl font-semibold mb-2">Utilisateurs</h2>
              <p className="text-muted-foreground text-sm mb-4">
                Gérer les comptes utilisateurs
              </p>
              <button className="px-4 py-2 bg-primary rounded hover:opacity-90 transition-opacity">
                Gérer
              </button>
            </div>

            <div className="p-6 bg-card rounded-lg border border-border">
              <h2 className="text-xl font-semibold mb-2">Contenu</h2>
              <p className="text-muted-foreground text-sm mb-4">
                Modérer et gérer le contenu
              </p>
              <button className="px-4 py-2 bg-primary rounded hover:opacity-90 transition-opacity">
                Gérer
              </button>
            </div>

            <div className="p-6 bg-card rounded-lg border border-border">
              <h2 className="text-xl font-semibold mb-2">Paramètres</h2>
              <p className="text-muted-foreground text-sm mb-4">
                Configurer les paramètres globaux
              </p>
              <button className="px-4 py-2 bg-primary rounded hover:opacity-90 transition-opacity">
                Gérer
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}