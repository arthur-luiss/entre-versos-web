import { useState, useEffect } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";

export function AdminDashboard() {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    return <Navigate to="/admin" replace />;
  }

  // Estados: Tema Escuro
  const [isDark, setIsDark] = useState(false);

  // Estados: Obras
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("SAUDADE");
  const [content, setContent] = useState("");
  const [type, setType] = useState("poema");
  const [status, setStatus] = useState("");
  const [posts, setPosts] = useState([]);

  // Estados: Frase do Dia
  const [quoteContent, setQuoteContent] = useState("");
  const [quoteAuthor, setQuoteAuthor] = useState("");
  const [quoteStatus, setQuoteStatus] = useState("");

  // Estados: Banner Principal
  const [heroContent, setHeroContent] = useState("");
  const [heroStatus, setHeroStatus] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  const fetchData = async () => {
    try {
      const resPosts = await fetch("/api/posts");
      const dataPosts = await resPosts.json();
      setPosts(dataPosts);

      const resQuote = await fetch("/api/quote");
      const dataQuote = await resQuote.json();
      if (dataQuote) {
        setQuoteContent(dataQuote.content || "");
        setQuoteAuthor(dataQuote.author || "");
      }

      const resHero = await fetch("/api/hero");
      const dataHero = await resHero.json();
      if (dataHero) {
        setHeroContent(dataHero.content || "");
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin");
  };

  const handleAuthError = (status) => {
    if (status === 401 || status === 403) handleLogout();
  };

  // Funções de Submit (Criação ou Edição)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(editingId ? "Salvando alterações..." : "Publicando...");

    const url = editingId ? `/api/posts/${editingId}` : "/api/posts";
    const method = editingId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, author, category, content, type }),
      });
      if (response.ok) {
        setStatus(
          editingId
            ? "Obra atualizada com sucesso!"
            : "Obra publicada com sucesso!",
        );
        setTitle("");
        setAuthor("");
        setContent("");
        setEditingId(null);
        fetchData();
        setTimeout(() => setStatus(""), 3000);
      } else {
        handleAuthError(response.status);
        setStatus("Erro ao salvar obra.");
      }
    } catch (error) {
      setStatus("Erro de conexão.");
    }
  };

  const handleEditClick = (post) => {
    setEditingId(post.id);
    setTitle(post.title || "");
    setAuthor(post.author || "");
    setCategory(post.category || "SAUDADE");
    setContent(post.content || "");
    setType(post.type || "poema");
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setAuthor("");
    setContent("");
    setCategory("SAUDADE");
    setType("poema");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Deseja excluir esta obra?")) return;
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) setPosts(posts.filter((p) => p.id !== id));
      else {
        handleAuthError(response.status);
        alert("Erro ao excluir.");
      }
    } catch (error) {
      alert("Erro de conexão.");
    }
  };

  const handleSaveQuote = async (e) => {
    e.preventDefault();
    setQuoteStatus("Salvando...");
    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: quoteContent, author: quoteAuthor }),
      });
      if (response.ok) {
        setQuoteStatus("Frase atualizada!");
        setTimeout(() => setQuoteStatus(""), 3000);
      } else {
        handleAuthError(response.status);
        setQuoteStatus("Erro ao atualizar frase.");
      }
    } catch (error) {
      setQuoteStatus("Erro de conexão.");
    }
  };

  const handleSaveHero = async (e) => {
    e.preventDefault();
    setHeroStatus("Salvando...");
    try {
      const response = await fetch("/api/hero", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: heroContent }),
      });
      if (response.ok) {
        setHeroStatus("Banner atualizado com sucesso!");
        setTimeout(() => setHeroStatus(""), 3000);
      } else {
        handleAuthError(response.status);
        setHeroStatus("Erro ao atualizar banner.");
      }
    } catch (error) {
      setHeroStatus("Erro de conexão.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-charcoal transition-colors duration-500">
      <header className="w-full bg-cardbg transition-colors duration-500 border-b border-bordercolor py-4 px-6 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-serif text-lg font-semibold text-terra">
            Entre Versos
          </span>
          <span className="text-xs bg-cardbg border border-bordercolor px-2.5 py-1 rounded-md text-subtle font-medium">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-4 md:gap-6 text-sm font-medium">
          {/* Botão de Alternância de Tema */}
          <button
            onClick={toggleTheme}
            className="text-charcoal hover:opacity-75 transition-opacity p-2 rounded-full border border-bordercolor bg-cardbg shadow-sm focus:outline-none"
            aria-label="Alternar tema"
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          <Link
            to="/"
            className="text-subtle hover:text-charcoal transition-colors"
          >
            Ver site
          </Link>
          <button
            onClick={handleLogout}
            className="text-terra font-semibold hover:underline"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 md:px-6 py-12 w-full space-y-16">
        {/* Banner Principal */}
        <div>
          <div className="mb-6">
            <h1 className="font-serif text-2xl md:text-3xl font-semibold text-charcoal">
              Mensagem de Boas-vindas
            </h1>
            <p className="text-xs md:text-sm text-subtle mt-1">
              Altere o texto grande exibido no topo da página inicial.
            </p>
          </div>
          <form
            onSubmit={handleSaveHero}
            className="bg-cardbg transition-colors duration-500 border border-bordercolor rounded-3xl p-6 md:p-10 shadow-sm space-y-6"
          >
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-subtle mb-2">
                Texto do Banner
              </label>
              <textarea
                rows="2"
                value={heroContent}
                onChange={(e) => setHeroContent(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-bordercolor bg-background text-sm text-charcoal focus:outline-none focus:border-terra transition-colors font-serif leading-relaxed"
              ></textarea>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-bordercolor gap-3">
              <span className="text-sm font-medium text-terra">
                {heroStatus}
              </span>
              <button
                type="submit"
                className="bg-terra text-white font-medium px-8 py-3 rounded-xl hover:opacity-90 transition-opacity text-sm w-full sm:w-auto"
              >
                Atualizar Banner
              </button>
            </div>
          </form>
        </div>

        {/* Frase do Dia */}
        <div>
          <div className="mb-6">
            <h1 className="font-serif text-2xl md:text-3xl font-semibold text-charcoal">
              Frase do Dia
            </h1>
          </div>
          <form
            onSubmit={handleSaveQuote}
            className="bg-cardbg transition-colors duration-500 border border-bordercolor rounded-3xl p-6 md:p-10 shadow-sm space-y-6"
          >
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-subtle mb-2">
                Texto da Frase
              </label>
              <textarea
                rows="3"
                value={quoteContent}
                onChange={(e) => setQuoteContent(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-bordercolor bg-background text-sm text-charcoal focus:outline-none focus:border-terra transition-colors font-serif leading-relaxed"
              ></textarea>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-subtle mb-2">
                Autor / Origem
              </label>
              <input
                type="text"
                value={quoteAuthor}
                onChange={(e) => setQuoteAuthor(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-bordercolor bg-background text-sm text-charcoal focus:outline-none focus:border-terra transition-colors"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-bordercolor gap-3">
              <span className="text-sm font-medium text-terra">
                {quoteStatus}
              </span>
              <button
                type="submit"
                className="bg-terra text-white font-medium px-8 py-3 rounded-xl hover:opacity-90 transition-opacity text-sm w-full sm:w-auto"
              >
                Atualizar Frase
              </button>
            </div>
          </form>
        </div>

        {/* Nova Publicação / Edição */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h1 className="font-serif text-2xl md:text-3xl font-semibold text-charcoal">
              {editingId ? "Editar Obra" : "Nova Publicação"}
            </h1>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs font-semibold text-subtle hover:text-charcoal bg-cardbg border border-bordercolor px-3 py-1.5 rounded-lg transition-colors"
              >
                Cancelar Edição
              </button>
            )}
          </div>
          <form
            onSubmit={handleSubmit}
            className={`bg-cardbg duration-500 border rounded-3xl p-6 md:p-10 shadow-sm space-y-6 transition-colors ${
              editingId ? "border-terra" : "border-bordercolor"
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-subtle mb-2">
                  Tipo
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-bordercolor bg-background text-sm text-charcoal focus:outline-none focus:border-terra transition-colors"
                >
                  <option value="poema">Poema</option>
                  <option value="frase">Frase</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-subtle mb-2">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-bordercolor bg-background text-sm text-charcoal focus:outline-none focus:border-terra transition-colors"
                >
                  <option value="SAUDADE">Saudade</option>
                  <option value="REFLEXÃO">Reflexão</option>
                  <option value="VIDA">Vida</option>
                  <option value="AMOR">Amor</option>
                  <option value="SUPERAÇÃO">Superação</option>
                  <option value="SOLIDÃO">Solidão</option>
                  <option value="ESPERANÇA">Esperança</option>
                  <option value="PAZ">Paz</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-subtle mb-2">
                  Autor
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-bordercolor bg-background text-sm text-charcoal focus:outline-none focus:border-terra transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-subtle mb-2">
                Título
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-bordercolor bg-background text-sm text-charcoal focus:outline-none focus:border-terra transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-subtle mb-2">
                Texto / Versos
              </label>
              <textarea
                rows="6"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-bordercolor bg-background text-sm text-charcoal focus:outline-none focus:border-terra transition-colors font-serif leading-relaxed"
              ></textarea>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-bordercolor gap-3">
              <span className="text-sm font-medium text-terra">{status}</span>
              <button
                type="submit"
                className="bg-terra text-white font-medium px-8 py-3 rounded-xl hover:opacity-90 transition-opacity text-sm w-full sm:w-auto"
              >
                {editingId ? "Salvar alterações" : "Publicar obra"}
              </button>
            </div>
          </form>
        </div>

        {/* Lista de Obras Publicadas com botão de Editar */}
        <div>
          <h2 className="font-serif text-xl md:text-2xl font-semibold text-charcoal mb-6 border-b border-bordercolor pb-4">
            Obras Publicadas
          </h2>
          {posts.length === 0 ? (
            <p className="text-subtle text-sm">
              Nenhuma obra cadastrada ainda.
            </p>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-cardbg transition-colors duration-500 border border-bordercolor rounded-xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-sm"
                >
                  <div>
                    <h3 className="font-serif font-semibold text-charcoal">
                      {post.title}
                    </h3>
                    <p className="text-xs text-subtle mt-1">
                      {post.author} • {post.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleEditClick(post)}
                      className="text-xs font-semibold text-charcoal bg-background border border-bordercolor hover:border-terra px-4 py-2 rounded-lg transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-xs font-semibold text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900 px-4 py-2 rounded-lg transition-colors"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}