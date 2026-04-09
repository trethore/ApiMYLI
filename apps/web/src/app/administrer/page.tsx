//  "input": {
  //   "login": "camille2",
  //   "email": "camille2@cam.com",
  //   "password": "Camille1234!",
  //   "name": "Camille CAM",
  //   "isArtist": false,
  //   "role" : "admin"
  // }
  
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
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
import { getAllUserQuery, getAllArtistQuery, getAllAdminsQuery, deleteAccountMutation, updateAccountRoleMutation, type ApiAccount } from "@/lib/api-client";

export default function AdminPage() {
  const { isAuthenticated, userRole, token } = useAuth();
  const router = useRouter();

  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
  const [users, setUsers] = useState<ApiAccount[]>([]);
  const [artists, setArtists] = useState<ApiAccount[]>([]);
  const [admins, setAdmins] = useState<ApiAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"users" | "artists" | "admins">("users");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setRedirectCountdown(5);
      return;
    }

    if (userRole !== "admin" && userRole !== "super_admin") {
      setRedirectCountdown(5);
      return;
    }

    fetchAccounts();
  }, [isAuthenticated, userRole, token]);

  useEffect(() => {
    if (redirectCountdown === null) return;

    if (redirectCountdown === 0) {
      const destination = isAuthenticated ? "/" : "/login";
      router.push(destination);
      return;
    }

    const timer = setTimeout(() => {
      setRedirectCountdown(redirectCountdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [redirectCountdown, isAuthenticated, router]);

  const fetchAccounts = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const [allUsers, allArtists, allAdmins] = await Promise.all([
        getAllUserQuery(token),
        getAllArtistQuery(token),
        getAllAdminsQuery(token),
      ]);
      const listeners = allUsers.filter((user) => user.role === "listener");
      setUsers(listeners);
      setArtists(allArtists);
      setAdmins(allAdmins);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch accounts";
      setError(errorMessage);
      console.error("Error fetching accounts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async (accountId: string): Promise<void> => {
    try {
      setIsDeleting(true);
      await deleteAccountMutation(accountId, token);
      setUsers(users.filter((u) => u.accountId !== accountId));
      setArtists(artists.filter((a) => a.accountId !== accountId));
      setAdmins(admins.filter((a) => a.accountId !== accountId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete account";
      setError(errorMessage);
      console.error("Error deleting account:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePromoteUserToAdmin = async (accountId: string): Promise<void> => {
    try {
      setIsDeleting(true);
      const updatedAccount = await updateAccountRoleMutation(accountId, "admin", token);
      setUsers(users.filter((u) => u.accountId !== accountId));
      setAdmins([...admins, updatedAccount]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "erreur dans la promotion";
      setError(errorMessage);
      console.error("Error promoting user:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePromoteUserToSuperAdmin = async (accountId: string): Promise<void> => {
    try {
      setIsDeleting(true);
      const updatedAccount = await updateAccountRoleMutation(accountId, "super_admin", token);
      setUsers(users.filter((u) => u.accountId !== accountId));
      setAdmins([...admins, updatedAccount]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "erreur dans la promotion";
      setError(errorMessage);
      console.error("Error promoting user:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDemoteUser = async (accountId: string): Promise<void> => {
    try {
      setIsDeleting(true);
      const updatedAccount = await updateAccountRoleMutation(accountId, "listener", token);
      setUsers(users.filter((u) => u.accountId !== accountId));
      setAdmins([...admins, updatedAccount]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "erreur dans la retrogradation";
      setError(errorMessage);
      console.error("Error promoting user:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isAuthenticated || (userRole !== "admin" && userRole !== "super_admin")) {
    return (
      <div className="min-h-screen flex flex-col font-sans bg-background text-foreground">
        <Nav />
        <main className="flex-1 flex items-center justify-center pb-24 lg:pb-8">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-full mb-4">
                <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 0v2m0-6h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl mb-2">Accès refusé</h1>
              <p className="text-muted-foreground mb-6">
                Vous n'avez pas les droits nécessaires pour accéder à cette page.
              </p>
              <p className="text-sm text-muted-foreground">
                Redirection dans <span className=" text-foreground">{redirectCountdown}</span> seconde{redirectCountdown !== 1 ? "s" : ""}...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col font-sans bg-background text-foreground">
        <Nav />
        <main className="flex-1 flex items-center justify-center pb-24 lg:pb-8">
          <p className="text-muted-foreground">Chargement...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col font-sans bg-background text-foreground">
        <Nav />
        <main className="flex-1 flex items-center justify-center pb-24 lg:pb-8">
          <div className="text-center max-w-md">
            <p className="text-destructive mb-4">{error}</p>
            <button
              onClick={() => fetchAccounts()}
              className="px-4 py-2 bg-primary rounded hover:opacity-90 transition-opacity"
            >
              Réessayer
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-foreground">
      <Nav />
      <main className="flex-1 lg:pt-8 pb-24 lg:pb-8 mx-4 md:mx-8 lg:mx-48">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-4xl font-[family-name:var(--font-protest-strike)]">
              Panneau d'administration
            </h1>
            <p className="text-muted-foreground mt-2">
              Gérer les utilisateurs, les artistes et les administrateurs.
            </p>
          </div>

          <div className="flex gap-4 border-b border-input">
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 transition-colors ${
                activeTab === "users"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Utilisateurs ({users.length})
            </button>
            <button
              onClick={() => setActiveTab("artists")}
              className={`px-4 py-2 transition-colors ${
                activeTab === "artists"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Artistes ({artists.length})
            </button>
            {userRole === "super_admin" && (
              <button
                onClick={() => setActiveTab("admins")}
                className={`px-4 py-2 transition-colors ${
                  activeTab === "admins"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Administrateurs ({admins.length})
              </button>
            )}
          </div>

          {activeTab === "users" && (
            <div className="flex flex-col gap-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-input">
                      <th className="px-4 py-3 text-left text-foreground">Nom</th>
                      <th className="px-4 py-3 text-left text-foreground">Login</th>
                      <th className="px-4 py-3 text-left text-foreground">Email</th>
                      <th className="px-4 py-3 text-left text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={userRole === "super_admin" ? 4 : 3} className="px-4 py-6 text-center text-muted-foreground">
                          Aucun utilisateur trouvé
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.accountId} className="border-b border-input hover:bg-card/50 transition-colors">
                          <td className="px-4 py-3">{user.name}</td>
                          <td className="px-4 py-3">{user.login}</td>
                          <td className="px-4 py-3">{user.email}</td>
                            <td className="px-4 py-3 flex gap-2">
                              <Button
                                onClick={() => handlePromoteUserToAdmin(user.accountId)}
                                disabled={isDeleting}
                                className="bg-green-700 hover:bg-green-500 text-white"
                              >
                                Promouvoir
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    <Trash2 className="w-3 h-3 mr-1" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-card text-card-foreground border-border">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Absolument sûr ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Cette action est irréversible. Toutes les données seront perdues.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteAccount(user.accountId)}
                                      disabled={isDeleting}
                                      className="bg-destructive hover:bg-destructive/90"
                                    >
                                      {isDeleting ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Suppression…
                                        </>
                                      ) : (
                                        "Supprimer"
                                      )}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "artists" && (
            <div className="flex flex-col gap-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-input">
                      <th className="px-4 py-3 text-left text-foreground">Nom</th>
                      <th className="px-4 py-3 text-left text-foreground">Login</th>
                      <th className="px-4 py-3 text-left text-foreground">Email</th>
                      <th className="px-4 py-3 text-left text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {artists.length === 0 ? (
                      <tr>
                        <td colSpan={userRole === "super_admin" ? 4 : 3} className="px-4 py-6 text-center text-muted-foreground">
                          Aucun artiste trouvé
                        </td>
                      </tr>
                    ) : (
                      artists.map((artist) => (
                        <tr key={artist.accountId} className="border-b border-input hover:bg-card/50 transition-colors">
                          <td className="px-4 py-3">{artist.name}</td>
                          <td className="px-4 py-3">{artist.login}</td>
                          <td className="px-4 py-3">{artist.email}</td>
                          {userRole === "super_admin" && (
                            <td className="px-4 py-3">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    <Trash2 className="w-3 h-3 mr-1" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-card text-card-foreground border-border">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Absolument sûr ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Cette action est irréversible. Toutes les données seront perdues.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteAccount(artist.accountId)}
                                      disabled={isDeleting}
                                      className="bg-destructive hover:bg-destructive/90"
                                    >
                                      {isDeleting ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Suppression…
                                        </>
                                      ) : (
                                        "Supprimer"
                                      )}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "admins" && (
            <div className="flex flex-col gap-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-input">
                      <th className="px-4 py-3 text-left text-foreground">Nom</th>
                      <th className="px-4 py-3 text-left text-foreground">Login</th>
                      <th className="px-4 py-3 text-left text-foreground">Email</th>
                      <th className="px-4 py-3 text-left text-foreground">Rôle</th>
                      <th className="px-4 py-3 text-left text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.length === 0 ? (
                      <tr>
                        <td className="px-4 py-6 text-center text-muted-foreground">
                          Aucun administrateur trouvé
                        </td>
                      </tr>
                    ) : (
                      admins.map((admin) => (
                        <tr key={admin.accountId} className="border-b border-input hover:bg-card/50 transition-colors">
                          <td className="px-4 py-3">{admin.name}</td>
                          <td className="px-4 py-3">{admin.login}</td>
                          <td className="px-4 py-3">{admin.email}</td>
                          <td className="px-4 py-3">{admin.role}</td>
                          {admin.role !== "super_admin" && (
                            <td className="px-4 py-3 flex gap-2">
                              <Button
                                onClick={() => handlePromoteUserToAdmin(admin.accountId)}
                                disabled={isDeleting}
                                className="bg-green-700 hover:bg-green-500 text-white"
                              >
                                Promouvoir
                              </Button>
                              <Button
                                onClick={() => handleDemoteUser(admin.accountId)}
                                disabled={isDeleting}
                                className="bg-yellow-600 hover:bg-yellow-400 text-white"
                              >
                                Rétrograder
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    <Trash2 className="w-3 h-3 mr-1" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-card text-card-foreground border-border">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Absolument sûr ?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Cette action est irréversible. Toutes les données seront supprimées.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteAccount(admin.accountId)}
                                      disabled={isDeleting}
                                      className="bg-destructive hover:bg-destructive/90"
                                    >
                                      {isDeleting ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Suppression…
                                        </>
                                      ) : (
                                        "Supprimer"
                                      )}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}