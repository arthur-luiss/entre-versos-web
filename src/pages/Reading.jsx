import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";

export function Reading() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados de Interatividade
  const [likes, setLikes] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Estado e Referência para o sistema de Respostas (Menções)
  const [replyTo, setReplyTo] = useState(null);
  const commentInputRef = useRef(null);

  // Controla quais threads de resposta estão expandidas (por id do comentário principal)
  const [expandedThreads, setExpandedThreads] = useState({});
  const toggleThread = (commentId) => {
    setExpandedThreads((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
  const token = localStorage.getItem("@EntreVersos:token");

  useEffect(() => {
    async function fetchData() {
      try {
        const postRes = await fetch(`${API_URL}/api/posts/${id}`);
        if (postRes.ok) {
          const postData = await postRes.json();
          setPost(postData);
        }

        const userQuery = user ? `?userId=${user.id}` : "";
        const likesRes = await fetch(`${API_URL}/api/posts/${id}/likes${userQuery}`);
        if (likesRes.ok) {
          const likesData = await likesRes.json();
          setLikes(likesData.total);
          setUserLiked(likesData.userLiked);
        }

        const commentsRes = await fetch(`${API_URL}/api/posts/${id}/comments`);
        if (commentsRes.ok) {
          const commentsData = await commentsRes.json();
          setComments(commentsData);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, user, API_URL]);

  const handleLike = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    const previousLiked = userLiked;
    const previousLikes = likes;

    setUserLiked(!previousLiked);
    setLikes(previousLiked ? previousLikes - 1 : previousLikes + 1);

    try {
      const response = await fetch(`${API_URL}/api/posts/${id}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Erro ao curtir");
    } catch (err) {
      console.error(err);
      setUserLiked(previousLiked);
      setLikes(previousLikes);
    }
  };

  // Função para focar no input e preparar a resposta
  const handleReplyClick = (authorName) => {
    if (!user) {
      navigate("/login");
      return;
    }
    setReplyTo(authorName);
    // Pequeno delay para garantir que a rolagem aconteça após a renderização
    setTimeout(() => {
      commentInputRef.current?.focus();
      commentInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    // Se estiver respondendo a alguém, adiciona o "@Nome -" no início do texto
    const finalContent = replyTo ? `@${replyTo} - ${newComment}` : newComment;

    setSubmittingComment(true);
    try {
      const response = await fetch(`${API_URL}/api/posts/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: finalContent }),
      });

      if (response.ok) {
        const data = await response.json();
        const commentToAdd = {
          ...data.comment,
          author_name: user.name,
        };
        setComments([commentToAdd, ...comments]);
        setNewComment("");
        setReplyTo(null); // Limpa o estado de resposta
      }
    } catch (err) {
      console.error("Erro ao enviar comentário", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Tem certeza que deseja apagar este comentário?")) return;

    try {
      const response = await fetch(`${API_URL}/api/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setComments(comments.filter((c) => c.id !== commentId));
      }
    } catch (err) {
      console.error("Erro ao apagar comentário", err);
    }
  };

  // Função para formatar o texto do comentário destacando a menção (@Nome)
  const renderCommentContent = (content) => {
    const match = content.match(/^@(.+?) - ([\s\S]*)$/);
    if (match) {
      return (
        <p className="text-sm text-charcoal leading-relaxed">
          <span className="text-terra font-semibold">@{match[1]}</span>{" "}
          {match[2]}
        </p>
      );
    }
    return <p className="text-sm text-charcoal leading-relaxed">{content}</p>;
  };

  // Agrupa as respostas (comentários com "@Nome - ") sob o comentário principal
  // do autor mencionado, para exibi-las juntas na mesma "caixinha".
  const { topLevelComments, repliesByParentId } = useMemo(() => {
    const top = [];
    const replies = [];

    comments.forEach((c) => {
      if (/^@(.+?) - /.test(c.content)) {
        replies.push(c);
      } else {
        top.push(c);
      }
    });

    const map = {};
    replies.forEach((reply) => {
      const match = reply.content.match(/^@(.+?) - /);
      const mentionedName = match[1];
      // Procura o comentário principal (mais antigo) desse autor.
      // `comments` vem do mais novo pro mais antigo, então percorremos ao contrário.
      const parent = [...top].reverse().find((c) => c.author_name === mentionedName);
      const parentId = parent ? parent.id : "sem-vinculo";
      if (!map[parentId]) map[parentId] = [];
      map[parentId].push(reply);
    });

    // Ordena cada thread da resposta mais antiga para a mais nova
    Object.keys(map).forEach((key) => map[key].reverse());

    return { topLevelComments: top, repliesByParentId: map };
  }, [comments]);

  // Respostas cujo comentário original não foi encontrado (ex.: já apagado)
  const orphanReplies = repliesByParentId["sem-vinculo"] || [];

  const likeBtnClass = userLiked
    ? "text-terra flex items-center gap-2 font-medium transition-transform active:scale-95"
    : "text-subtle hover:text-terra flex items-center gap-2 font-medium transition-all active:scale-95";

  return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-10 md:py-16">
        <Link
          to="/explore"
          className="text-sm text-subtle hover:text-charcoal transition-colors"
        >
          ← Voltar para o acervo
        </Link>

        {loading ? (
          <p className="text-center text-subtle mt-16">
            Carregando obra e sentimentos...
          </p>
        ) : !post ? (
          <p className="text-center text-subtle mt-16">Obra não encontrada.</p>
        ) : (
          <>
            {/* Cabeçalho da Obra */}
            <header className="mt-8 mb-6">
              <span className="text-xs font-medium text-terra uppercase tracking-wide">
                {post.category}
              </span>
              <h1 className="font-serif text-3xl md:text-4xl font-semibold text-charcoal mt-2">
                {post.title}
              </h1>
              <p className="text-sm text-subtle mt-2">
                Por{" "}
                <span className="text-charcoal font-medium">{post.author}</span>
              </p>
            </header>

            {/* Conteúdo da Obra */}
            <div className="font-serif text-lg leading-relaxed text-charcoal whitespace-pre-line mb-8">
              {post.content}
            </div>

            {/* Barra de Ações (Copiar e Curtir) */}
            <div className="flex items-center justify-between border-t border-b border-bordercolor py-4 mb-10">
              <button
                onClick={() => navigator.clipboard.writeText(post.content)}
                className="text-xs font-medium text-subtle hover:text-charcoal transition-colors"
              >
                Copiar texto
              </button>

              <button onClick={handleLike} className={likeBtnClass}>
                <span>{userLiked ? "❤️" : "🤍"}</span>
                <span>{likes}</span>
              </button>
            </div>

            {/* Seção de Comentários */}
            <section>
              <h2 className="font-serif text-xl font-semibold text-charcoal mb-5 flex items-center gap-2">
                Comentários
                <span className="font-sans text-xs font-medium text-subtle bg-cardbg border border-bordercolor rounded-full px-2 py-0.5">
                  {comments.length}
                </span>
              </h2>

              {/* Formulário de Comentário */}
              {user ? (
                <div className="mb-8">
                  <form
                    onSubmit={handleCommentSubmit}
                    className="rounded-2xl border border-bordercolor bg-cardbg/60 focus-within:border-terra/50 transition-colors overflow-hidden"
                  >
                    {replyTo && (
                      <div className="flex items-center justify-between border-b border-bordercolor px-4 py-2 text-xs text-subtle bg-terra/5">
                        <span>
                          Respondendo a{" "}
                          <span className="text-terra font-semibold">@{replyTo}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setReplyTo(null)}
                          className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-bordercolor/50 hover:text-charcoal transition-colors font-bold"
                          aria-label="Cancelar resposta"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    <textarea
                      ref={commentInputRef}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={
                        replyTo
                          ? "Escreva a sua resposta..."
                          : "Deixe o seu sentimento sobre esta obra..."
                      }
                      required
                      rows="3"
                      className="w-full px-4 py-3 bg-transparent text-charcoal focus:outline-none resize-none text-sm placeholder:text-subtle"
                    />
                    <div className="flex justify-end px-3 pb-3">
                      <button
                        type="submit"
                        disabled={submittingComment || !newComment.trim()}
                        className="px-5 py-2 bg-terra text-white text-sm font-medium rounded-full hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {submittingComment ? "A publicar..." : "Publicar"}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-wrap bg-cardbg border border-dashed border-bordercolor rounded-2xl px-4 py-4 mb-8 text-sm text-subtle">
                  <span>Faça login para interagir e deixar a sua marca nesta obra.</span>
                  <Link
                    to="/login"
                    className="text-terra font-semibold hover:opacity-70 transition-opacity"
                  >
                    Entrar ou Cadastrar
                  </Link>
                </div>
              )}

              {/* Lista de Comentários */}
              <div className="flex flex-col gap-3">
                {comments.length === 0 ? (
                  <p className="text-sm text-subtle text-center py-6 border border-dashed border-bordercolor rounded-2xl">
                    Ninguém comentou ainda. Seja o primeiro!
                  </p>
                ) : (
                  [...topLevelComments, ...orphanReplies].map((comment) => {
                    const threadReplies = repliesByParentId[comment.id] || [];
                    const isExpanded = !!expandedThreads[comment.id];

                    return (
                      <div
                        key={comment.id}
                        className="group border border-bordercolor/70 hover:border-terra/30 bg-cardbg/40 rounded-2xl px-4 py-4 transition-colors"
                      >
                        <div className="flex gap-3">
                          {/* Avatar */}
                          <div className="shrink-0 w-9 h-9 rounded-full bg-terra/10 text-terra text-sm font-semibold flex items-center justify-center">
                            {comment.author_name.charAt(0).toUpperCase()}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-1.5">
                              <div className="flex items-baseline gap-2 min-w-0 flex-wrap">
                                <span className="text-sm font-semibold text-charcoal truncate">
                                  {comment.author_name}
                                </span>
                                <span className="text-xs text-subtle">
                                  {new Date(comment.created_at).toLocaleDateString("pt-PT")}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                                {/* Botão de Responder (Aparece para todos logados ou redireciona pro login) */}
                                <button
                                  onClick={() => handleReplyClick(comment.author_name)}
                                  className="text-xs text-subtle hover:text-terra hover:bg-terra/10 font-medium px-2 py-1 rounded-full transition-colors"
                                >
                                  Responder
                                </button>

                                {/* Botão de Apagar (Apenas para o autor do comentário) */}
                                {user && user.id === comment.user_id && (
                                  <button
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="text-xs text-subtle hover:text-red-500 hover:bg-red-500/10 font-medium px-2 py-1 rounded-full transition-colors"
                                    title="Apagar comentário"
                                  >
                                    Apagar
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Renderiza o comentário formatado com a menção destacada */}
                            {renderCommentContent(comment.content)}
                          </div>
                        </div>

                        {/* Thread de respostas, recolhida por padrão */}
                        {threadReplies.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-bordercolor/50 pl-[3rem]">
                            <button
                              onClick={() => toggleThread(comment.id)}
                              className="flex items-center gap-2 text-xs text-subtle hover:text-terra font-medium transition-colors"
                            >
                              <span className="w-4 h-px bg-bordercolor" />
                              {isExpanded
                                ? "Ocultar respostas"
                                : `Ver ${threadReplies.length > 1 ? "todas as" : ""} ${threadReplies.length} resposta${
                                    threadReplies.length > 1 ? "s" : ""
                                  }`}
                            </button>

                            {isExpanded && (
                              <div className="mt-3 flex flex-col gap-3 pl-4 border-l-2 border-bordercolor/40">
                                {threadReplies.map((reply) => (
                                  <div key={reply.id} className="flex gap-2.5">
                                    <div className="shrink-0 w-7 h-7 rounded-full bg-terra/10 text-terra text-xs font-semibold flex items-center justify-center">
                                      {reply.author_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-3 mb-1">
                                        <div className="flex items-baseline gap-2 min-w-0 flex-wrap">
                                          <span className="text-xs font-semibold text-charcoal truncate">
                                            {reply.author_name}
                                          </span>
                                          <span className="text-[11px] text-subtle">
                                            {new Date(reply.created_at).toLocaleDateString("pt-PT")}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                          <button
                                            onClick={() => handleReplyClick(reply.author_name)}
                                            className="text-[11px] text-subtle hover:text-terra hover:bg-terra/10 font-medium px-2 py-0.5 rounded-full transition-colors"
                                          >
                                            Responder
                                          </button>
                                          {user && user.id === reply.user_id && (
                                            <button
                                              onClick={() => handleDeleteComment(reply.id)}
                                              className="text-[11px] text-subtle hover:text-red-500 hover:bg-red-500/10 font-medium px-2 py-0.5 rounded-full transition-colors"
                                              title="Apagar comentário"
                                            >
                                              Apagar
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                      {renderCommentContent(reply.content)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </>
        )}
      </div>

      <footer className="text-center text-xs text-subtle py-8">
        © 2026 Entre Versos. Palavras que encontram sentimentos.
      </footer>
    </div>
  );
}