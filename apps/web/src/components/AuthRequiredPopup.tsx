"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AuthRequiredPopup() {
  const { isAuthPopupOpen, setAuthPopupOpen } = useAuth();
  const router = useRouter();

  const handleLogin = () => {
    setAuthPopupOpen(false);
    router.push("/login");
  };

  return (
    <AlertDialog open={isAuthPopupOpen} onOpenChange={setAuthPopupOpen}>
      <AlertDialogContent className="bg-card text-card-foreground border-border max-w-sm rounded-[var(--radius)]">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-[family-name:var(--font-protest-strike)] text-2xl mb-2 text-primary">
            Connexion requise
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Vous devez être connecté pour effectuer cette action. Voulez-vous vous connecter
            maintenant ?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLogin}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Se connecter
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
