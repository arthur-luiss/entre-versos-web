import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const userMenuRef = useRef(null);

  // Estados do sino de notificações
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef(null);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Fecha o menu do usuário e o de notificações ao clicar fora deles
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Busca as notificações do usuário logado, com polling a cada 30 segundos
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const token = localStorage.getItem("@EntreVersos:token");

    async function fetchNotifications() {
      try {
        const response = await fetch(`${API_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          setNotifications(await response.json());
        }
      } catch (error) {
        console.error("Erro ao buscar notificações:", error);
      }
    }

    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 30000);
    return () => clearInterval(intervalId);
  }, [user]);

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchOpen(false);
      setSearchTerm("");
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  const handleNotificationClick = async (notification) => {
    setNotificationsOpen(false);

    if (!notification.is_read) {
      const token = localStorage.getItem("@EntreVersos:token");
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, is_read: true } : n,
        ),
      );
      try {
        await fetch(`${API_URL}/api/notifications/${notification.id}/read`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        console.error("Erro ao marcar notificação como lida:", error);
      }
    }

    if (notification.post_id) {
      navigate(`/leitura/${notification.post_id}`);
    }
  };

  const handleMarkAllAsRead = async () => {
    const token = localStorage.getItem("@EntreVersos:token");
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await fetch(`${API_URL}/api/notifications/read-all`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Erro ao marcar todas as notificações como lidas:", error);
    }
  };

  const notificationIcon = (type) => {
    if (type === "like") return "❤️";
    if (type === "comment") return "💬";
    return "📜";
  };

  const timeAgo = (dateString) => {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return "agora";
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  return (
    <header className="w-full bg-background py-4 md:py-6 px-4 md:px-6 relative z-50 transition-colors duration-500">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Botão Hambúrguer para Celular e Tablet */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-charcoal hover:opacity-70 transition-opacity p-1 focus:outline-none"
            aria-label="Menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          <Link to="/" className="font-serif text-xl font-semibold text-terra">
            Entre Versos
          </Link>
        </div>

        {/* Menu Desktop */}
        <nav className="hidden md:flex items-center gap-8 font-sans text-sm font-medium text-subtle">
          <Link
            to="/"
            className={`transition-colors ${isActive("/") ? "text-charcoal font-semibold" : "hover:text-charcoal"}`}
          >
            Início
          </Link>
          <Link
            to="/explore"
            className={`transition-colors ${isActive("/explore") ? "text-charcoal font-semibold" : "hover:text-charcoal"}`}
          >
            Explore
          </Link>
          <Link
            to="/sobre"
            className={`transition-colors ${isActive("/sobre") ? "text-charcoal font-semibold" : "hover:text-charcoal"}`}
          >
            Sobre
          </Link>
        </nav>

        <div className="flex items-center gap-3 relative">
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar versos..."
                autoFocus
                className="px-3 py-1.5 text-xs rounded-lg border border-bordercolor bg-background text-charcoal focus:outline-none focus:border-terra w-36 sm:w-40 md:w-56 transition-colors"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-xs text-subtle hover:text-charcoal font-bold"
              >
                ✕
              </button>
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="text-charcoal hover:opacity-70 transition-opacity p-1"
              aria-label="Pesquisar"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          )}

          {/* Sino de Notificações (só para usuários logados) */}
          {user && (
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative text-charcoal hover:opacity-70 transition-opacity p-1"
                aria-label="Notificações"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-terra text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-background border border-bordercolor rounded-xl shadow-lg py-2 text-sm">
                  <div className="flex items-center justify-between px-4 py-1.5">
                    <span className="font-semibold text-charcoal">
                      Notificações
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs text-terra hover:opacity-70 transition-opacity font-medium"
                      >
                        Marcar todas como lidas
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-subtle px-4 py-4 text-center">
                        Nenhuma notificação por enquanto.
                      </p>
                    ) : (
                      notifications.map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`w-full text-left px-4 py-2.5 flex items-start gap-2.5 transition-colors hover:bg-bordercolor/30 ${
                            !notification.is_read ? "bg-terra/5" : ""
                          }`}
                        >
                          <span className="text-base leading-none mt-0.5">
                            {notificationIcon(notification.type)}
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className="block text-xs text-charcoal leading-relaxed">
                              {notification.message}
                            </span>
                            <span className="block text-[11px] text-subtle mt-0.5">
                              {timeAgo(notification.created_at)}
                            </span>
                          </span>
                          {!notification.is_read && (
                            <span className="w-2 h-2 rounded-full bg-terra mt-1 shrink-0" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Botão de Alternância de Tema */}
          <button
            onClick={toggleTheme}
            className="text-charcoal hover:opacity-70 transition-opacity p-1 focus:outline-none"
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

          {/* Área de Autenticação (Usuário) */}
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 text-sm text-charcoal hover:opacity-70 transition-opacity"
              >
                <span className="w-7 h-7 rounded-full bg-terra text-white flex items-center justify-center text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden sm:inline">
                  Olá, {user.name.split(" ")[0]}
                </span>
              </button>

              {/* Dropdown do Usuário */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-background border border-bordercolor rounded-lg shadow-lg py-2 text-sm">
                  <p className="px-4 py-1 text-xs text-subtle truncate">
                    {user.email}
                  </p>

                  <Link
                    to="/perfil"
                    onClick={() => setUserMenuOpen(false)}
                    className="block w-full text-left px-4 py-2 text-charcoal hover:bg-bordercolor/30 transition-colors"
                  >
                    Meu Perfil
                  </Link>

                  {/* Dashboard: só aparece para contas administrativas */}
                  {user.is_admin && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="block w-full text-left px-4 py-2 text-charcoal hover:bg-bordercolor/30 transition-colors"
                    >
                      Dashboard
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-terra hover:bg-bordercolor/30 transition-colors"
                  >
                    Sair da conta
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="text-sm text-terra font-medium px-3 py-1.5 rounded-full border border-terra/40 hover:bg-terra hover:text-white hover:border-terra transition-colors"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>

      {/* Menu Dropdown para Celular e Tablet */}
      {mobileMenuOpen && (
        <nav className="md:hidden absolute top-full left-0 w-full bg-background border-b border-bordercolor shadow-md py-4 px-6 flex flex-col gap-4 font-sans text-sm font-medium text-subtle transition-colors duration-500">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`transition-colors ${isActive("/") ? "text-charcoal font-semibold" : "hover:text-charcoal"}`}
          >
            Início
          </Link>
          <Link
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className={`transition-colors ${isActive("/explore") ? "text-charcoal font-semibold" : "hover:text-charcoal"}`}
          >
            Explore
          </Link>
          <Link
            to="/sobre"
            onClick={() => setMobileMenuOpen(false)}
            className={`transition-colors ${isActive("/sobre") ? "text-charcoal font-semibold" : "hover:text-charcoal"}`}
          >
            Sobre
          </Link>

          {/* Link de Login no Mobile (se não logado) */}
          {!user && (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-terra font-medium pt-3 mt-1 border-t border-bordercolor"
            >
              Entrar
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}