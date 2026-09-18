import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
    <header className="w-full bg-background py-4 md:py-6 px-4 md:px-6 relative z-50">
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
            Poemas
          </Link>
          <Link
            to="/sobre"
            className={`transition-colors ${isActive("/sobre") ? "text-charcoal font-semibold" : "hover:text-charcoal"}`}
          >
            Sobre
          </Link>
        </nav>

        <div className="flex items-center relative">
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar versos..."
                autoFocus
                className="px-3 py-1.5 text-xs rounded-lg border border-bordercolor bg-white text-charcoal focus:outline-none focus:border-terra w-36 sm:w-40 md:w-56"
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
        </div>
      </div>

      {/* Menu Dropdown para Celular e Tablet */}
      {mobileMenuOpen && (
        <nav className="md:hidden absolute top-full left-0 w-full bg-background border-b border-bordercolor shadow-md py-4 px-6 flex flex-col gap-4 font-sans text-sm font-medium text-subtle transition-all">
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
