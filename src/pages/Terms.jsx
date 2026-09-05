import { Navbar } from "../components/Navbar";
import { Link } from "react-router-dom";

export function Terms() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-charcoal">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 w-full flex flex-col">
        <div className="mb-8">
          <Link
            to="/"
            className="text-xs font-semibold text-subtle hover:text-charcoal transition-colors flex items-center gap-1"
          >
            ← Voltar para o início
          </Link>
        </div>

        <div className="mb-12 border-b border-bordercolor pb-6">
          <span className="text-[10px] font-bold tracking-widest text-terra uppercase bg-cardbg px-3 py-1.5 rounded-full inline-block mb-4">
            LEGAL
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-semibold mb-3 text-charcoal">
            Termos de Uso
          </h1>
          <p className="text-xs text-subtle">
            Última atualização: Setembro de 2026
          </p>
        </div>

        <div className="bg-white border border-bordercolor rounded-3xl p-8 md:p-12 shadow-sm space-y-8 text-subtle leading-relaxed text-sm">
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-semibold text-charcoal">
              1. Aceitação dos Termos
            </h2>
            <p>
              Ao acessar e navegar pelo{" "}
              <strong className="text-terra">Entre Versos</strong>, você
              concorda expressamente com estes Termos de Uso. Caso não concorde
              com qualquer diretriz descrita, recomendamos que interrompa o uso
              da plataforma imediatamente.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-semibold text-charcoal">
              2. Propriedade Intelectual
            </h2>
            <p>
              Todo o conteúdo literário, curadoria, poemas clássicos ou
              autorais, frases, design, identidade visual e códigos presentes no
              site são protegidos por leis de propriedade intelectual. É
              proibida a reprodução comercial total ou parcial sem autorização
              prévia.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-semibold text-charcoal">
              3. Conduta do Usuário
            </h2>
            <p>
              O usuário compromete-se a utilizar a plataforma de maneira ética e
              em conformidade com a legislação vigente, abstendo-se de tentar
              burlar mecanismos de segurança do painel administrativo ou injetar
              códigos maliciosos na aplicação.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-semibold text-charcoal">
              4. Isenção de Responsabilidade
            </h2>
            <p>
              O <strong className="text-terra">Entre Versos</strong> é um espaço
              dedicado à contemplação literária. Trabalhamos para manter o
              acervo estável e disponível, mas não nos responsabilizamos por
              eventuais instabilidades técnicas temporárias de conexão ou falhas
              de rede fora de nosso controle direto.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-bordercolor py-8 px-12 text-center text-xs text-subtle">
        © 2026 Entre Versos. Palavras que encontram sentimentos.
      </footer>
    </div>
  );
}
