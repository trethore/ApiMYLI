"use client";

import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Nav from "@/components/Nav";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { login, isLoading, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await login(email, password);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-foreground">
      <Nav />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-background-secondary border-border">
          <CardHeader>
            <CardTitle className="text-2xl font-[family-name:var(--font-protest-strike)] text-center text-primary">
              Connectez-vous à MUSE
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="martin@proton.me"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-input text-foreground border-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-input text-foreground border-input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion…
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              Vous n&apos;avez pas de compte ?{" "}
              <Link href="/register" className="text-secondary hover:underline">
                Inscrivez-vous ici
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
