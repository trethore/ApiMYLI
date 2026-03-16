"use client";

import * as React from "react";
import { User, LogOut, Trash2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Nav from "@/components/Nav";
import SectionTitle from "@/components/SectionTitle";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { usePlayer } from "@/context/PlayerContext";

export default function Settings() {
  const { isAuthenticated, user, logout, updateUser, deleteAccount, isLoading, error, clearError } =
    useAuth();
  const { clearPlayer } = usePlayer();
  const router = useRouter();

  const [editLogin, setEditLogin] = useState("");
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/register");
    } else if (user) {
      setEditLogin(user.login);
      setEditName(user.name);
      setEditEmail(user.email);
    }
  }, [isAuthenticated, router, user]);

  const handleLogout = async () => {
    clearPlayer();
    await logout();
  };

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError("");
    clearError();
    await updateUser({ login: editLogin, name: editName });
    if (!error) {
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteAccount = async () => {
    clearPlayer();
    await deleteAccount();
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-foreground">
      <Nav />
      <main className="flex-1 p-8 pb-24 text-center max-w-3xl mx-auto w-full space-y-8">
        <SectionTitle title="Paramètres du compte" className="text-left mt-0 text-4xl" />

        {/* Profile Section */}
        <Card className="text-left bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-[family-name:var(--font-protest-strike)] font-light text-primary">
              <User className="w-5 h-5" /> Profil
            </CardTitle>
            <CardDescription>Vos informations personnelles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pseudo :</span>
                <span className="font-medium">{user?.login}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nom :</span>
                <span className="font-medium">{user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email :</span>
                <span className="font-medium">{user?.email}</span>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {/* Edit Profile Dialog */}
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Modifier le profil</Button>
                </DialogTrigger>
                <DialogContent className="bg-card text-card-foreground border-border">
                  <DialogHeader>
                    <DialogTitle>Modifier le profil</DialogTitle>
                    <DialogDescription>Modifiez vos informations ci-dessous.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleEditProfile} className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-login">Pseudo</Label>
                      <Input
                        id="edit-login"
                        value={editLogin}
                        onChange={(e) => setEditLogin(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Nom</Label>
                      <Input
                        id="edit-name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-email">Email</Label>
                      <Input
                        id="edit-email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        disabled
                        className="opacity-60 cursor-not-allowed"
                      />
                      <p className="text-xs text-muted-foreground">
                        L&apos;email ne peut pas être modifié.
                      </p>
                    </div>
                    {editError && <p className="text-sm text-destructive">{editError}</p>}
                    <DialogFooter>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sauvegarde…
                          </>
                        ) : (
                          "Sauvegarder"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Logout Alert Dialog */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="secondary" className="gap-2">
                    <LogOut className="w-4 h-4" /> Se déconnecter
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card text-card-foreground border-border">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Vous serez déconnecté de votre session actuelle.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout}>Se déconnecter</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="text-left bg-card border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-[family-name:var(--font-protest-strike)] font-light text-destructive">
              <Trash2 className="w-5 h-5" /> Zone de danger
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Supprimer le compte</Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card text-card-foreground border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle>Absolument sûr ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. Toutes vos données seront perdues.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={isLoading}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Suppression…
                      </>
                    ) : (
                      "Supprimer mon compte"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
