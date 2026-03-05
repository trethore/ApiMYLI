"use client";

import * as React from "react";
import { Moon, Sun, User, LogOut, Trash2 } from "lucide-react";
import { useTheme } from "next-themes";

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
  const { setTheme } = useTheme();
  const { isAuthenticated, user, logout, updateUser } = useAuth();
  const { clearPlayer } = usePlayer();
  const router = useRouter();

  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [deletePassword, setDeletePassword] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/register");
    } else if (user) {
      setEditUsername(user.username);
      setEditEmail(user.email);
    }
  }, [isAuthenticated, router, user]);

  const handleLogout = () => {
    clearPlayer();
    logout();
  };

  const handleEditProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ username: editUsername, email: editEmail });
    setIsEditDialogOpen(false);
  };

  const handleDeleteAccount = () => {
    // Mock validation
    if (deletePassword) {
      handleLogout(); // Logout and clear player
      alert("Compte supprimé (simulation)");
    } else {
      alert("Mot de passe requis");
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-foreground">
      <Nav />
      <main className="flex-1 p-8 pb-24 text-center max-w-3xl mx-auto w-full space-y-8">
        <SectionTitle title="Paramètres du compte" className="text-left mt-0 text-4xl" />

        {/* Appearance Section */}
        <Card className="text-left bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-primary font-[family-name:var(--font-protest-strike)] font-light">
              <Sun className="w-5 h-5 " /> Apparence
            </CardTitle>
            <CardDescription>Gérez le thème de l'application.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span>Thème</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>Clair</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>Sombre</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>Système</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>

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
                <span className="text-muted-foreground">Pseudo:</span>
                <span className="font-medium">{user?.username}</span>
              </div>
            </div>

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
                      <Label htmlFor="username">Pseudo</Label>
                      <Input
                        id="username"
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="col-span-3"
                        disabled // Often emails are immutable
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit">Sauvegarder</Button>
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
                    Cette action est irréversible. Toutes vos données seront perdues. Veuillez
                    entrer votre mot de passe pour confirmer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                  <Input
                    type="password"
                    placeholder="Votre mot de passe"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      if (!deletePassword) {
                        e.preventDefault();
                        alert("Veuillez entrer votre mot de passe");
                      } else {
                        handleDeleteAccount();
                      }
                    }}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Supprimer mon compte
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
