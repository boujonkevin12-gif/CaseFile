import Link from "next/link";
import { Search, MessageSquareText, ScanSearch, Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/session";

export default async function LandingPage() {
  const user = await getCurrentUser();

  const features = [
    {
      icon: ScanSearch,
      title: "Investigá casos",
      text: "Recorré cada escena del crimen y encontrá lo que otros pasaron por alto.",
    },
    {
      icon: MessageSquareText,
      title: "Interrogá sospechosos",
      text: "Cada respuesta puede sostenerse o desarmarse frente a la evidencia correcta.",
    },
    {
      icon: Fingerprint,
      title: "Encontrá evidencias",
      text: "Pistas físicas, testimonios y documentos arman el expediente del caso.",
    },
    {
      icon: Search,
      title: "Descubrí al culpable",
      text: "Acusá cuando estés listo. La decisión no se puede deshacer.",
    },
  ];

  return (
    <main className="flex flex-1 flex-col">
      <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero-casefile.png')" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-void/30"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 72% 62% at 50% 46%, rgba(8,8,10,0.38) 0%, rgba(8,8,10,0.82) 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 shadow-[inset_0_0_20vw_rgba(0,0,0,0.6)]"
        />

        <div className="relative z-10 flex flex-col items-center animate-fade-up">
          <span className="mb-6 font-mono-tag text-xs text-ink-faint [text-shadow:0_1px_10px_rgba(0,0,0,0.9)]">
            EXPEDIENTE ABIERTO · ACCESO RESTRINGIDO
          </span>
          <h1 className="font-display text-6xl font-medium tracking-tight text-ink [text-shadow:0_2px_24px_rgba(0,0,0,0.9)] sm:text-8xl">
            CASEFILE
          </h1>
          <p className="mt-5 font-display text-xl italic text-ink-dim [text-shadow:0_1px_14px_rgba(0,0,0,0.9)] sm:text-2xl">
            Todos esconden algo.
          </p>
          <p className="mt-6 max-w-md text-balance text-sm leading-relaxed text-ink-dim [text-shadow:0_1px_10px_rgba(0,0,0,0.85)]">
            Recibís un caso, investigás la escena, interrogás a los sospechosos y armás tu propia
            teoría. Cuando estés seguro, acusás. Un solo intento, una sola verdad.
          </p>

          <Link href={user ? "/dashboard" : "/dashboard"} className="mt-10">
            <Button variant="primary" size="lg" className="uppercase">
              Empezar a investigar
            </Button>
          </Link>
        </div>
      </section>

      <section className="border-t border-hairline bg-panel/40 px-6 py-14">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="flex flex-col gap-3 border-l border-hairline pl-4">
              <f.icon size={20} className="text-gold" strokeWidth={1.5} />
              <h3 className="font-display text-lg text-ink">{f.title}</h3>
              <p className="text-sm leading-relaxed text-ink-dim">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-hairline px-6 py-6 text-center font-mono-tag text-[11px] text-ink-faint">
        CASEFILE — investigación ficticia con fines de entretenimiento
      </footer>
    </main>
  );
}
