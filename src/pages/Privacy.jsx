import { Navbar } from "../components/Navbar";
import { Link } from "react-router-dom";

export function Privacy() {
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
            Política de Privacidade
          </h1>
          <p className="text-xs text-subtle">
            Última atualização: Setembro de 2026
          </p>
        </div>

        <div className="bg-white border border-bordercolor rounded-3xl p-8 md:p-12 shadow-sm space-y-8 text-subtle leading-relaxed text-sm">
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-semibold text-charcoal">
              1. Introdução
            </h2>
            <p>
              O <strong className="text-terra">Entre Versos</strong> respeita a
              sua privacidade e compromete-se a proteger os dados de seus
              leitores e administradores. Esta Política de Privacidade explica
              de forma transparente como coletamos, usamos e armazenamos
              informações ao utilizar nossa plataforma.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-semibold text-charcoal">
              2. Coleta de Dados
            </h2>
            <p>
              Por ser uma plataforma de leitura contemplativa, coletamos apenas
              o estritamente necessário para o funcionamento do sistema e do
              painel administrativo:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Dados de acesso e autenticação restrita do administrador.</li>
              <li>
                Registros técnicos básicos necessários para a entrega segura das
                páginas (endereço IP e logs de conexão do servidor).
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-semibold text-charcoal">
              3. Armazenamento e Segurança
            </h2>
            <p>
              Os dados gerados no sistema são armazenados localmente em ambiente
              seguro via SQLite. Adotamos medidas técnicas adequadas para
              impedir acessos não autorizados, alterações ou divulgações
              indevidas das informações contidas na base de dados.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-semibold text-charcoal">
              4. Alterações nesta Política
            </h2>
            <p>
              Reservamo-nos o direito de atualizar esta Política de Privacidade
              periodicamente para refletir melhorias técnicas ou exigências
              legais. Recomendamos que você revise esta página de tempos em
              tempos.
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
