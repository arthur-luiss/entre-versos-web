import { useState, useEffect } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";

export function AdminDashboard() {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    return <Navigate to="/admin" replace />;
  }

  // Estados: Obras
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

  // Funções de Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Publicando...");
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, author, category, content, type }),
      });
      if (response.ok) {
        setStatus("Obra publicada com sucesso!");
        setTitle("");
        setAuthor("");
        setContent("");
        fetchData();
        setTimeout(() => setStatus(""), 3000);
      } else {
        handleAuthError(response.status);
        setStatus("Erro ao publicar.");
      }
    } catch (error) {
      setStatus("Erro de conexão.");
    }
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
    <div className="min-h-screen bg-background flex flex-col font-sans text-charcoal">
      <header className="w-full bg-white border-b border-bordercolor py-4 px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-serif text-lg font-semibold text-terra">
            Entre Versos
          </span>
          <span className="text-xs bg-cardbg px-2.5 py-1 rounded-md text-subtle font-medium">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium">
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

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full space-y-16">
        {/* Banner Principal */}
        <div>
          <div className="mb-6">
            <h1 className="font-serif text-3xl font-semibold text-charcoal">
              Mensagem de Boas-vindas
            </h1>
            <p className="text-sm text-subtle mt-1">
              Altere o texto grande exibido no topo da página inicial.
            </p>
          </div>
          <form
            onSubmit={handleSaveHero}
            className="bg-white border border-bordercolor rounded-3xl p-8 md:p-10 shadow-sm space-y-6"
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
            <div className="flex items-center justify-between pt-4 border-t border-bordercolor">
              <span className="text-sm font-medium text-terra">
                {heroStatus}
              </span>
              <button
                type="submit"
                className="bg-terra text-white font-medium px-8 py-3 rounded-xl hover:opacity-90 transition-opacity text-sm"
              >
                Atualizar Banner
              </button>
            </div>
          </form>
        </div>

        {/* Frase do Dia */}
        <div>
          <div className="mb-6">
            <h1 className="font-serif text-3xl font-semibold text-charcoal">
              Frase do Dia
            </h1>
          </div>
          <form
            onSubmit={handleSaveQuote}
            className="bg-white border border-bordercolor rounded-3xl p-8 md:p-10 shadow-sm space-y-6"
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
            <div className="flex items-center justify-between pt-4 border-t border-bordercolor">
              <span className="text-sm font-medium text-terra">
                {quoteStatus}
              </span>
              <button
                type="submit"
                className="bg-terra text-white font-medium px-8 py-3 rounded-xl hover:opacity-90 transition-opacity text-sm"
              >
                Atualizar Frase
              </button>
            </div>
          </form>
        </div>

        {/* Nova Publicação (Mantido igual) */}
        <div>
          <div className="mb-6">
            <h1 className="font-serif text-3xl font-semibold text-charcoal">
              Nova Publicação
            </h1>
          </div>
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-bordercolor rounded-3xl p-8 md:p-10 shadow-sm space-y-6"
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
            <div className="flex items-center justify-between pt-4 border-t border-bordercolor">
              <span className="text-sm font-medium text-terra">{status}</span>
              <button
                type="submit"
                className="bg-terra text-white font-medium px-8 py-3 rounded-xl hover:opacity-90 transition-opacity text-sm"
              >
                Publicar obra
              </button>
            </div>
          </form>
        </div>

        {/* Lista de Obras (Mantido igual) */}
        <div>
          <h2 className="font-serif text-2xl font-semibold text-charcoal mb-6 border-b border-bordercolor pb-4">
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
                  className="bg-white border border-bordercolor rounded-xl p-5 flex items-center justify-between hover:shadow-sm transition-shadow"
                >
                  <div>
                    <h3 className="font-serif font-semibold text-charcoal">
                      {post.title}
                    </h3>
                    <p className="text-xs text-subtle mt-1">
                      {post.author} • {post.category}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors"
                  >
                    Excluir
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
