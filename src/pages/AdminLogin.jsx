import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("adminToken", data.token);
        navigate("/admin/dashboard");
      } else {
        setError(data.error || "Credenciais inválidas.");
      }
    } catch (err) {
      console.error("Erro de conexão:", err);
      setError("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center font-sans text-charcoal px-6 relative transition-colors duration-500">
      {/* Botão de Alternância de Tema */}
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleTheme}
          className="text-charcoal hover:opacity-75 transition-opacity p-2.5 rounded-full border border-bordercolor bg-cardbg shadow-sm focus:outline-none"
          aria-label="Alternar tema"
        >
          {isDark ? (
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </button>
      </div>

      <div className="w-full max-w-md bg-cardbg transition-colors duration-500 border border-bordercolor rounded-3xl p-8 md:p-10 shadow-sm">
        <div className="text-center mb-8">
          <Link
            to="/"
            className="font-serif text-2xl font-semibold text-terra inline-block mb-2"
          >
            Entre Versos
          </Link>
          <h1 className="text-sm font-semibold uppercase tracking-wider text-subtle">
            Painel Administrativo
          </h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl mb-6 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-subtle mb-2">
              Usuário
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Digite seu usuário"
              className="w-full px-4 py-3 rounded-xl border border-bordercolor bg-background text-sm text-charcoal focus:outline-none focus:border-terra transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-subtle mb-2">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-bordercolor bg-background text-sm text-charcoal focus:outline-none focus:border-terra transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-terra text-white font-medium py-3 rounded-xl hover:opacity-90 transition-opacity text-sm mt-2 disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar no Painel"}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-xs text-subtle hover:text-charcoal transition-colors"
          >
            ← Voltar para o site público
          </Link>
        </div>
      </div>
    </div>
  );
}
