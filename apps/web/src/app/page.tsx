import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.18),_transparent_55%)]" />
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,_hsl(var(--secondary))_0%,_transparent_70%)] opacity-60 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,_hsl(var(--primary)/0.2)_0%,_transparent_70%)] opacity-60 blur-3xl" />

      <main className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-8 px-6 py-16 text-center sm:gap-10">
        <span className="rounded-full border border-border bg-card/70 px-4 py-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Bun + Next + Prisma + GraphQL
        </span>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
          Launch a modern stack with a typed GraphQL core and a rapid UI layer.
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Next.js powers the product surface, Prisma keeps your data model crisp, and GraphQL keeps
          your API approachable. Tailwind and shadcn give you UI components that stay consistent
          from prototype to production.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Button size="lg">Explore the schema</Button>
          <Button size="lg" variant="outline">
            Open API playground
          </Button>
        </div>
        <div className="grid w-full grid-cols-1 gap-4 pt-8 text-left sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card/70 p-5 backdrop-blur">
            <p className="text-sm font-semibold">Next.js App Router</p>
            <p className="mt-2 text-sm text-muted-foreground">
              A structured front-end foundation with server components ready when you are.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card/70 p-5 backdrop-blur">
            <p className="text-sm font-semibold">Prisma + SQLite</p>
            <p className="mt-2 text-sm text-muted-foreground">
              A clear schema, migrations, and a local database that spins up fast.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card/70 p-5 backdrop-blur">
            <p className="text-sm font-semibold">GraphQL Yoga</p>
            <p className="mt-2 text-sm text-muted-foreground">
              A lean GraphQL server with typed resolvers and sensible defaults.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
