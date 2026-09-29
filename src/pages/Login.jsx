import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Navbar } from "../components/Navbar";

export function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Segunda etapa: PIN de administrador (só aparece se a conta exigir)
  const [requiresAdminPin, setRequiresAdminPin] = useState(false);
  const [adminPin, setAdminPin] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  // URL da API local ou de produção
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    setIsDark(theme === "dark");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin
        ? requiresAdminPin
          ? { email, password, adminPin }
          : { email, password }
        : { name, email, password };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      // Conta administrativa: backend pede o PIN antes de liberar o login
      if (response.status === 428 && data.requiresAdminPin) {
        setRequiresAdminPin(true);
        setError("");
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Ocorreu um erro inesperado.");
      }

      if (isLogin) {
        login(data.user, data.token);
        navigate(-1); // Volta para a página anterior
      } else {
        setIsLogin(true);
        setError("Conta criada com sucesso! Faça o login.");
        setTimeout(() => setError(""), 5000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (loginMode) => {
    setIsLogin(loginMode);
    setError("");
    setRequiresAdminPin(false);
    setAdminPin("");
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      <Navbar />

      <div className="relative flex items-center justify-center px-4 py-16 md:py-24">
        {/* Efeito decorativo */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-terra/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-terra/10 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full max-w-md bg-background border border-bordercolor rounded-2xl shadow-sm p-8">
          <h1 className="font-serif text-2xl font-semibold text-charcoal text-center mb-6">
            {requiresAdminPin
              ? "Verificação adicional"
              : isLogin
                ? "Bem-vindo de volta"
                : "Junte-se a nós"}
          </h1>

          {/* Botões de alternância (ocultos durante a verificação de PIN) */}
          {!requiresAdminPin && (
            <div className="flex gap-1 bg-bordercolor/30 rounded-lg p-1 mb-6">
              <button
                type="button"
                onClick={() => handleModeChange(true)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                  isLogin
                    ? "bg-terra text-white shadow-sm"
                    : "text-subtle hover:text-charcoal"
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => handleModeChange(false)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                  !isLogin
                    ? "bg-terra text-white shadow-sm"
                    : "text-subtle hover:text-charcoal"
                }`}
              >
                Criar Conta
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {requiresAdminPin ? (
              <>
                <p className="text-sm text-subtle -mt-2 mb-1">
                  Esta conta tem acesso administrativo. Informe o PIN para
                  concluir o login.
                </p>
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="adminPin"
                    className="text-xs font-medium text-subtle"
                  >
                    PIN de administrador
                  </label>
                  <input
                    id="adminPin"
                    type="password"
                    inputMode="numeric"
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    placeholder="••••••"
                    autoFocus
                    required
                    className="w-full px-4 py-3 bg-background border border-bordercolor rounded-xl text-charcoal focus:outline-none focus:border-terra transition-colors text-center tracking-[0.5em] text-lg"
                  />
                </div>
              </>
            ) : (
              <>
                {!isLogin && (
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="name"
                      className="text-xs font-medium text-subtle"
                    >
                      Nome
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Como devemos chamá-lo?"
                      required={!isLogin}
                      className="px-4 py-3 bg-background border border-bordercolor rounded-xl text-charcoal focus:outline-none focus:border-terra transition-colors"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="email"
                    className="text-xs font-medium text-subtle"
                  >
                    E-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="px-4 py-3 bg-background border border-bordercolor rounded-xl text-charcoal focus:outline-none focus:border-terra transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="password"
                    className="text-xs font-medium text-subtle"
                  >
                    Palavra-passe
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength="6"
                    className="px-4 py-3 bg-background border border-bordercolor rounded-xl text-charcoal focus:outline-none focus:border-terra transition-colors"
                  />
                </div>
              </>
            )}

            {error && (
              <p className="text-sm text-terra bg-terra/10 border border-terra/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 py-3 bg-terra text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {loading
                ? "Aguarde..."
                : requiresAdminPin
                  ? "Confirmar PIN"
                  : isLogin
                    ? "Entrar"
                    : "Criar Conta"}
            </button>

            {requiresAdminPin && (
              <button
                type="button"
                onClick={() => {
                  setRequiresAdminPin(false);
                  setAdminPin("");
                }}
                className="text-xs text-subtle hover:text-charcoal transition-colors -mt-1"
              >
                ← Voltar
              </button>
            )}
          </form>

          <p className="text-center text-xs text-subtle mt-6">
            <Link to="/" className="hover:text-charcoal transition-colors">
              Voltar para o início
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}