import Link from "next/link";
import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-foreground">
      <Nav />
      <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-9xl font-bold font-[family-name:var(--font-protest-strike)] bg-gradient-to-r from-[var(--color-muse-sky-blue)] to-[var(--color-muse-pink)] bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="text-2xl sm:text-4xl font-bold mt-4 mb-8">Oups ! Page introuvable</h2>
        <p className="text-muted-foreground mb-8 max-w-md text-lg">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Button
          asChild
          className="bg-gradient-to-r from-[var(--color-muse-sky-blue)] to-[var(--color-muse-pink)] text-foreground font-bold text-lg py-6 px-8 rounded-full hover:scale-105 transition-transform hover:cursor-pointer"
        >
          <Link href="/">Retour à l'accueil</Link>
        </Button>
      </main>
    </div>
  );
}
