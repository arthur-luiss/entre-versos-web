import { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { Link, useSearchParams } from "react-router-dom";

export function Explore() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category");
  const searchQuery = searchParams.get("search") || "";

  const [inputSearch, setInputSearch] = useState(searchQuery);

  // Lista de categorias disponíveis para filtro rápido
  const categories = [
    "SAUDADE",
    "REFLEXÃO",
    "VIDA",
    "AMOR",
    "SUPERAÇÃO",
    "SOLIDÃO",
    "ESPERANÇA",
    "PAZ",
  ];

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch("/api/posts");
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Erro ao carregar obras:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  useEffect(() => {
    setInputSearch(searchQuery);
  }, [searchQuery]);

  // Filtragem combinada (por categoria e/ou termo de busca)
  const filteredPosts = posts.filter((post) => {
    const matchesCategory = categoryFilter
      ? post.category?.toUpperCase() === categoryFilter.toUpperCase()
      : true;

    const matchesSearch = searchQuery
      ? post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    return matchesCategory && matchesSearch;
  });

  const handleDirectSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (inputSearch.trim()) {
      params.set("search", inputSearch.trim());
    } else {
      params.delete("search");
    }
    setSearchParams(params);
  };

  const handleCategorySelect = (cat) => {
    const params = new URLSearchParams(searchParams);
    if (cat === "TODAS") {
      params.delete("category");
    } else {
      params.set("category", cat);
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
    setInputSearch("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-charcoal">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-12 w-full">
        {/* Cabeçalho e Barra de Pesquisa */}
        <div className="mb-8 border-b border-bordercolor pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-serif text-3xl font-semibold mb-2 text-charcoal">
              {searchQuery
                ? `Busca por: "${searchQuery}"`
                : categoryFilter
                  ? `Explorando: ${categoryFilter}`
                  : "Acervo Completo"}
            </h1>
            <p className="text-subtle text-sm">
              {searchQuery || categoryFilter
                ? `Exibindo resultados filtrados no acervo.`
                : "Navegue por todas as obras cadastradas na plataforma."}
            </p>
          </div>

          <form onSubmit={handleDirectSearch} className="flex gap-2">
            <input
              type="text"
              value={inputSearch}
              onChange={(e) => setInputSearch(e.target.value)}
              placeholder="Buscar título, autor..."
              className="px-4 py-2 rounded-xl border border-bordercolor bg-white text-xs text-charcoal focus:outline-none focus:border-terra w-56"
            />
            <button
              type="submit"
              className="bg-terra text-white px-4 py-2 rounded-xl text-xs font-medium hover:opacity-90 transition-opacity"
            >
              Buscar
            </button>
            {(searchQuery || categoryFilter) && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold text-subtle hover:text-charcoal bg-cardbg px-3 py-2 rounded-xl"
              >
                Limpar ✕
              </button>
            )}
          </form>
        </div>

        {/* BARRA DE FILTRO POR TAGS / SENTIMENTOS */}
        <div className="flex flex-wrap items-center gap-2 mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-subtle mr-2">
            Filtrar por:
          </span>

          <button
            onClick={() => handleCategorySelect("TODAS")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors border ${
              !categoryFilter
                ? "bg-terra text-white border-terra"
                : "bg-white text-charcoal border-bordercolor hover:border-terra"
            }`}
          >
            Todas
          </button>

          {categories.map((cat) => {
            const isSelected = categoryFilter?.toUpperCase() === cat;
            // Formata a exibição (ex: SAUDADE -> Saudade)
            const displayName = cat.charAt(0) + cat.slice(1).toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                  isSelected
                    ? "bg-terra text-white border-terra"
                    : "bg-white text-charcoal border-bordercolor hover:border-terra"
                }`}
              >
                {displayName}
              </button>
            );
          })}
        </div>

        {loading ? (
          <p className="text-subtle text-center py-12">Carregando obras...</p>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <p className="text-subtle text-sm">
              Nenhuma obra encontrada com os critérios informados.
            </p>
            <button
              onClick={clearFilters}
              className="text-terra font-semibold hover:underline text-xs"
            >
              Ver acervo completo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
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
      </main>
    </div>
  );
}
