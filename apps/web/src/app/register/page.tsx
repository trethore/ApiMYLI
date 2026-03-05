"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Nav from "@/components/Nav";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Check, X } from "lucide-react";

type PasswordRule = {
  label: string;
  test: (pw: string) => boolean;
};

const PASSWORD_RULES: PasswordRule[] = [
  { label: "Au moins 12 caractères", test: (pw) => pw.length >= 12 },
  { label: "Au moins une majuscule (A-Z)", test: (pw) => /[A-Z]/.test(pw) },
  { label: "Au moins une minuscule (a-z)", test: (pw) => /[a-z]/.test(pw) },
  { label: "Au moins un chiffre (0-9)", test: (pw) => /[0-9]/.test(pw) },
  {
    label: "Au moins un caractère spécial (!@#$%^&*)",
    test: (pw) => /[!@#$%^&*]/.test(pw),
  },
];

export default function RegisterPage() {
  const { register, isLoading, error, clearError } = useAuth();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);

  const passwordChecks = useMemo(
    () => PASSWORD_RULES.map((rule) => ({ ...rule, valid: rule.test(password) })),
    [password],
  );
  const allRulesValid = passwordChecks.every((r) => r.valid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    clearError();

    if (!allRulesValid) {
      setLocalError("Le mot de passe ne respecte pas toutes les règles.");
      return;
    }
    if (password !== confirmPassword) {
      setLocalError("Les mots de passe ne correspondent pas.");
      return;
    }
    await register(username, email, password, name);
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-foreground">
      <Nav />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-background-secondary border-border">
          <CardHeader>
            <CardTitle className="text-2xl font-[family-name:var(--font-protest-strike)] text-center text-primary">
              Rejoignez MUSE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Pseudo */}
              <div className="space-y-2">
                <Label htmlFor="username">Pseudo</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="martin22"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-input text-foreground border-input"
                />
              </div>

              {/* Nom */}
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Martin Dupont"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-input text-foreground border-input"
                />
              </div>

              {/* Email */}
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

              {/* Mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordTouched(true);
                    }}
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

                {/* Règles de mot de passe */}
                {passwordTouched && (
                  <ul className="mt-2 space-y-1 text-xs">
                    {passwordChecks.map((rule) => (
                      <li
                        key={rule.label}
                        className={`flex items-center gap-1.5 transition-colors ${
                          rule.valid ? "text-muted-foreground" : "text-pink-500"
                        }`}
                      >
                        {rule.valid ? (
                          <Check size={12} className="shrink-0 text-green-500" />
                        ) : (
                          <X size={12} className="shrink-0 text-pink-500" />
                        )}
                        {rule.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Confirmer le mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-input text-foreground border-input pr-10"
                  />
                </div>
              </div>

              {displayError && (
                <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
                  {displayError}
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
                    Inscription…
                  </>
                ) : (
                  "S'inscrire"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              Vous avez déjà un compte ?{" "}
              <Link href="/login" className="text-secondary hover:underline">
                Connectez-vous ici
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
