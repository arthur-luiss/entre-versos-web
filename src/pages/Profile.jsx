import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";

export function Profile() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("likes"); // 'likes', 'comments', ou 'settings'
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para edição de perfil
  const [editName, setEditName] = useState(user?.name || "");
  const [editEmail, setEditEmail] = useState(user?.email || "");
  const [updateMessage, setUpdateMessage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Estados para troca de senha
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const token = localStorage.getItem("@EntreVersos:token");

  // Se não estiver logado, manda para o login
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Busca os dados do usuário
  useEffect(() => {
    async function fetchUserData() {
      if (!user) return;
      try {
        const [likesRes, commentsRes] = await Promise.all([
          fetch(`${API_URL}/api/user/likes`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/api/user/comments`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (likesRes.ok) setLikes(await likesRes.json());
        if (commentsRes.ok) setComments(await commentsRes.json());
      } catch (error) {
        console.error("Erro ao carregar dados do perfil:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [user, API_URL, token]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMessage("");

    try {
      const response = await fetch(`${API_URL}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editName, email: editEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        // Atualiza o contexto (Navbar, etc) com os novos dados
        login(data.user, token);
        setUpdateMessage("Perfil atualizado com sucesso!");
        setTimeout(() => setUpdateMessage(""), 3000);
      } else {
        setUpdateMessage(data.error || "Erro ao atualizar perfil.");
      }
    } catch (err) {
      setUpdateMessage("Erro na conexão com o servidor.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage("");

    if (newPassword.length < 6) {
      setPasswordMessage("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage("As senhas não coincidem.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch(`${API_URL}/api/user/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordMessage("Senha alterada com sucesso!");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordMessage(""), 3000);
      } else {
        setPasswordMessage(data.error || "Erro ao alterar senha.");
      }
    } catch (err) {
      setPasswordMessage("Erro na conexão com o servidor.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-10 md:py-16">
        {/* Cabeçalho do Perfil */}
        <div className="flex items-center gap-6 mb-10">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-terra text-white flex items-center justify-center text-3xl md:text-4xl font-serif font-bold shadow-md">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold text-charcoal">
              {user.name}
            </h1>
            <p className="text-sm text-subtle mt-1">{user.email}</p>
          </div>
        </div>

        {/* Abas de Navegação */}
        <div className="flex border-b border-bordercolor mb-8">
          <button
            onClick={() => setActiveTab("likes")}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "likes"
                ? "border-terra text-terra"
                : "border-transparent text-subtle hover:text-charcoal"
            }`}
          >
            Obras Curtidas ({likes.length})
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "comments"
                ? "border-terra text-terra"
                : "border-transparent text-subtle hover:text-charcoal"
            }`}
          >
            Meus Comentários ({comments.length})
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "settings"
                ? "border-terra text-terra"
                : "border-transparent text-subtle hover:text-charcoal"
            }`}
          >
            Configurações
          </button>
        </div>

        {/* Conteúdo das Abas */}
        {loading ? (
          <p className="text-center text-subtle py-10">
            Carregando a sua biblioteca...
          </p>
        ) : (
          <div className="min-h-[300px]">
            {/* Aba: Curtidas */}
            {activeTab === "likes" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {likes.length === 0 ? (
                  <p className="text-subtle col-span-2 py-4">
                    Você ainda não curtiu nenhuma obra.
                  </p>
                ) : (
                  likes.map((like) => (
                    <Link
                      key={like.id}
                      to={`/leitura/${like.post_id || like.id}`}
                      className="bg-cardbg border border-bordercolor rounded-xl p-5 hover:border-terra transition-colors group"
                    >
                      <span className="text-[10px] font-bold tracking-widest text-terra uppercase mb-2 block">
                        {like.category}
                      </span>
                      <h3 className="font-serif text-xl font-semibold text-charcoal group-hover:text-terra transition-colors">
                        {like.title}
                      </h3>
                      <p className="text-xs text-subtle mt-2">
                        Por {like.author}
                      </p>
                    </Link>
                  ))
                )}
              </div>
            )}

            {/* Aba: Comentários */}
            {activeTab === "comments" && (
              <div className="flex flex-col gap-4">
                {comments.length === 0 ? (
                  <p className="text-subtle py-4">
                    Você ainda não deixou comentários.
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-cardbg border border-bordercolor rounded-xl p-5"
                    >
                      <p className="text-sm text-charcoal italic mb-3">
                        "{comment.content}"
                      </p>
                      <div className="flex justify-between items-center text-xs">
                        <Link
                          to={`/leitura/${comment.post_id}`}
                          className="text-terra font-medium hover:underline"
                        >
                          Na obra: {comment.post_title}
                        </Link>
                        <span className="text-subtle">
                          {new Date(comment.created_at).toLocaleDateString(
                            "pt-BR",
                          )}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Aba: Configurações */}
            {activeTab === "settings" && (
              <div className="max-w-md flex flex-col gap-6">
                {/* Cartão: Dados de perfil */}
                <div className="bg-cardbg border border-bordercolor rounded-xl p-6">
                  <h2 className="text-sm font-semibold text-charcoal mb-4">
                    Dados da conta
                  </h2>
                  <form
                    onSubmit={handleUpdateProfile}
                    className="flex flex-col gap-4"
                  >
                    <div>
                      <label className="text-sm font-medium text-charcoal block mb-1">
                        Nome de leitor
                      </label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-background border border-bordercolor rounded-xl text-charcoal focus:outline-none focus:border-terra transition-colors text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-charcoal block mb-1">
                        E-mail
                      </label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-background border border-bordercolor rounded-xl text-charcoal focus:outline-none focus:border-terra transition-colors text-sm"
                      />
                    </div>

                    {updateMessage && (
                      <div
                        className={`p-3 text-sm rounded-lg ${updateMessage.includes("sucesso") ? "text-green-600 bg-green-500/10" : "text-red-500 bg-red-500/10"}`}
                      >
                        {updateMessage}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="mt-2 w-full bg-terra text-white font-medium py-3 rounded-xl hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
                    >
                      {isUpdating ? "Salvando..." : "Salvar Alterações"}
                    </button>
                  </form>
                </div>

                {/* Cartão: Alterar senha */}
                <div className="bg-cardbg border border-bordercolor rounded-xl p-6">
                  <h2 className="text-sm font-semibold text-charcoal mb-4">
                    Alterar senha
                  </h2>
                  <form
                    onSubmit={handleChangePassword}
                    className="flex flex-col gap-4"
                  >
                    <div>
                      <label className="text-sm font-medium text-charcoal block mb-1">
                        Nova senha
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength="6"
                        className="w-full px-4 py-3 bg-background border border-bordercolor rounded-xl text-charcoal focus:outline-none focus:border-terra transition-colors text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-charcoal block mb-1">
                        Confirmar nova senha
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength="6"
                        className="w-full px-4 py-3 bg-background border border-bordercolor rounded-xl text-charcoal focus:outline-none focus:border-terra transition-colors text-sm"
                      />
                    </div>

                    {passwordMessage && (
                      <div
                        className={`p-3 text-sm rounded-lg ${passwordMessage.includes("sucesso") ? "text-green-600 bg-green-500/10" : "text-red-500 bg-red-500/10"}`}
                      >
                        {passwordMessage}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="mt-2 w-full bg-terra text-white font-medium py-3 rounded-xl hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
                    >
                      {isChangingPassword ? "Alterando..." : "Alterar Senha"}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
