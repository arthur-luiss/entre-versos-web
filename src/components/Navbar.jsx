import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchOpen(false);
      setSearchTerm("");
      setMobileMenuOpen(false);
    }
  };

  const isActive = (path) => location.pathname === path;

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
            Poemas
          </Link>
          <Link
            to="/sobre"
            onClick={() => setMobileMenuOpen(false)}
            className={`transition-colors ${isActive("/sobre") ? "text-charcoal font-semibold" : "hover:text-charcoal"}`}
          >
            Sobre
          </Link>
        </nav>
      )}
    </header>
  );
}