import { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { Link } from "react-router-dom";

export function Home() {
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState({ content: "Carregando...", author: "" });
  const [heroText, setHeroText] = useState(
    "Algumas palavras não precisam ser ditas. Precisam ser sentidas.",
  );

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Busca os destaques
        const resPosts = await fetch("http://localhost:3001/api/posts");
        if (resPosts.ok) {
          const dataPosts = await resPosts.json();
          setRecentPosts(dataPosts.slice(0, 3));
        }

        // 2. Busca a Frase do Dia
        const resQuote = await fetch("http://localhost:3001/api/quote");
        if (resQuote.ok) {
          const dataQuote = await resQuote.json();
          setQuote(dataQuote);
        }

        // 3. Busca a Mensagem do Banner (Hero)
        const resHero = await fetch("http://localhost:3001/api/hero");
        if (resHero.ok) {
          const dataHero = await resHero.json();
          setHeroText(dataHero.content);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-charcoal">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-6 py-8 w-full flex flex-col gap-16">
        {/* HERO SECTION */}
        <section className="w-full bg-[#F5EFEB] border border-bordercolor rounded-3xl py-16 px-8 text-center flex flex-col items-center relative overflow-hidden">
          <div className="text-terra text-5xl font-serif mb-4 leading-none">
            “
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-normal italic max-w-2xl mb-8 leading-relaxed text-charcoal">
            "{heroText}"
          </h1>
          <a
            href="#destaques"
            className="bg-terra text-white font-medium px-8 py-3 rounded-full hover:opacity-90 transition-opacity text-sm inline-block"
          >
            Comece a ler
          </a>
        </section>

        {/* SEÇÃO: OBRAS EM DESTAQUE */}
        <section id="destaques" className="w-full">
          <div className="flex justify-between items-baseline mb-8">
            <h2 className="font-serif text-2xl font-semibold text-charcoal">
              Obras em destaque
            </h2>
            <Link
              to="/explore"
              className="text-sm font-semibold text-terra hover:underline flex items-center gap-1"
            >
              Explorar acervo →
            </Link>
          </div>

          {loading ? (
            <p className="text-subtle text-center py-8">
              Carregando destaques...
            </p>
          ) : recentPosts.length === 0 ? (
            <p className="text-subtle text-center py-8">
              Ainda não há obras publicadas.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white border border-bordercolor rounded-2xl p-6 flex flex-col justify-between hover:shadow-sm transition-shadow h-full min-h-[220px]"
                >
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-terra uppercase">
                      {post.category}
                    </span>
                    <h3 className="font-serif text-xl font-semibold mt-2 mb-3 text-charcoal line-clamp-1">
                      {post.title}
                    </h3>
                    {/* line-clamp-3 limita o texto a 3 linhas com reticências no final */}
                    <p className="font-serif text-sm italic text-subtle mb-6 leading-relaxed line-clamp-3">
                      {post.content}
                    </p>
                  </div>
                  <div>
                    <div className="border-t border-cardbg pt-4 flex justify-between items-center text-xs mt-auto">
                      <span className="text-subtle truncate max-w-[120px]">
                        {post.author}
                      </span>
                      <Link
                        to={`/leitura/${post.id}`}
                        className="font-semibold text-terra hover:underline flex items-center gap-1 shrink-0"
                      >
                        Ler obra →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* SEÇÃO INFERIOR: FRASE DO DIA + EXPLORE POR SENTIMENTOS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pb-12">
          {/* Frase do Dia Card Dinâmico */}
          <div className="bg-[#EFE7E1] border border-bordercolor rounded-2xl p-8 flex flex-col justify-between h-full min-h-[220px]">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-terra uppercase">
                FRASE DO DIA
              </span>
              <p className="font-serif text-xl italic text-charcoal mt-4 mb-6 leading-relaxed">
                "{quote.content}"
              </p>
            </div>
            <span className="text-xs text-subtle">— {quote.author}</span>
          </div>

          <div className="flex flex-col justify-center">
            <h3 className="font-serif text-2xl font-semibold text-charcoal mb-2">
              Explore por sentimentos
            </h3>
            <p className="text-sm text-subtle mb-6">
              Navegue pelas palavras que traduzem o que você sente agora.
            </p>

            <div className="flex flex-wrap gap-3">
              {[
                "Amor",
                "Saudade",
                "Vida",
                "Superação",
                "Solidão",
                "Reflexão",
                "Esperança",
                "Paz",
              ].map((tag) => (
                <Link
                  key={tag}
                  to={`/explore?category=${tag.toUpperCase()}`}
                  className="px-5 py-2 rounded-full border border-bordercolor text-xs font-medium text-charcoal bg-white hover:border-terra transition-colors cursor-pointer inline-block"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* RODAPÉ */}
      <footer className="border-t border-bordercolor py-8 px-12 flex flex-col md:flex-row items-center justify-between text-xs text-subtle gap-4">
        <div>
          <span className="font-serif font-semibold text-terra text-sm">
            Entre Versos
          </span>
          <p className="mt-1">
            © 2026 Entre Versos. Palavras que encontram sentimentos.
          </p>
        </div>
        <div className="flex gap-6 font-medium text-charcoal">
          <Link to="/sobre" className="hover:text-terra transition-colors">
            Sobre
          </Link>
          <Link
            to="/privacidade"
            className="hover:text-terra transition-colors"
          >
            Privacidade
          </Link>
          <Link to="/termos" className="hover:text-terra transition-colors">
            Termos de Uso
          </Link>
        </div>
      </footer>
    </div>
  );
}
