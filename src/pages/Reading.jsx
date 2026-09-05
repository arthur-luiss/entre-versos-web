import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";

export function Reading() {
  const { id } = useParams(); // Captura o ID da URL
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await fetch(`/api/posts/${id}`);
        if (response.ok) {
          const data = await response.json();
          setPost(data);
        }
      } catch (error) {
        console.error("Erro ao carregar a obra:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [id]);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-charcoal">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-16 w-full flex flex-col">
        <div className="mb-6 md:mb-8">
          <Link
            to="/explore"
            className="text-xs font-semibold text-subtle hover:text-charcoal transition-colors flex items-center gap-1"
          >
            ← Voltar para o acervo
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20 text-subtle">
            Carregando obra...
          </div>
        ) : !post ? (
          <div className="text-center py-20 text-subtle">
            Obra não encontrada.
          </div>
        ) : (
          <>
            <div className="text-center mb-8 md:mb-12 px-2">
              <span className="text-[10px] font-bold tracking-widest text-terra uppercase bg-cardbg px-3 py-1.5 rounded-full inline-block mb-3 md:mb-4">
                {post.category}
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold mb-2 md:mb-3 text-charcoal break-words">
                {post.title}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-subtle">
                Por{" "}
                <span className="text-charcoal font-semibold">
                  {post.author}
                </span>
              </p>
            </div>

            {/* O whitespace-pre-wrap mantém as quebras de linha do poema */}
            <article className="font-serif text-base sm:text-lg md:text-xl text-charcoal leading-loose bg-white border border-bordercolor rounded-2xl md:rounded-3xl p-6 sm:p-10 md:p-16 shadow-sm mb-8 md:mb-12 text-center whitespace-pre-wrap overflow-x-auto">
              {post.content}
            </article>

            <div className="border-t border-bordercolor pt-6 md:pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-subtle gap-3">
              <span>Publicado no acervo de Entre Versos</span>
              <button
                onClick={() => navigator.clipboard.writeText(post.content)}
                className="hover:text-charcoal transition-colors font-medium cursor-pointer"
              >
                Copiar texto
              </button>
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-bordercolor py-6 md:py-8 px-6 md:px-12 text-center text-xs text-subtle">
        © 2026 Entre Versos. Palavras que encontram sentimentos.
      </footer>
    </div>
  );
}