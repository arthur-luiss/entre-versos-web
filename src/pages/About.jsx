import { Navbar } from "../components/Navbar";

export function About() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-charcoal">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-16 w-full flex flex-col items-center text-center">
        <h1 className="font-serif text-3xl md:text-4xl font-semibold mb-3 md:mb-4 text-charcoal">
          O Manifesto
        </h1>
        <p className="font-serif text-base md:text-lg italic text-subtle mb-6 md:mb-8 px-4">
          "Acreditamos que a literatura não precisa de ruídos."
        </p>
        <div className="bg-cardbg transition-colors duration-500 border border-bordercolor rounded-2xl p-6 sm:p-8 text-left text-subtle leading-relaxed space-y-4 text-sm md:text-base">
          <p>
            Em um mundo hiperconectado e barulhento, o{" "}
            <strong className="text-terra">Entre Versos</strong> nasce como um
            refúgio estático e contemplativo. Um espaço digital dedicado
            exclusivamente ao encontro entre palavras marcantes e leitores
            atentos.
          </p>
          <p>
            Curamos e organizamos o melhor da poesia clássica e contemporânea
            sem métricas vazias, sem distrações e sem pressa.
          </p>
        </div>
      </main>
    </div>
  );
}
