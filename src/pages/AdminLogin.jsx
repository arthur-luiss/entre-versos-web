import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
        // Salva o token de segurança no navegador
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
    <div className="min-h-screen bg-background flex flex-col justify-center items-center font-sans text-charcoal px-6">
      <div className="w-full max-w-md bg-white border border-bordercolor rounded-3xl p-8 md:p-10 shadow-sm">
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
