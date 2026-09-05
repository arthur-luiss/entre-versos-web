import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchOpen(false);
      setSearchTerm("");
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="w-full bg-background py-6 px-6 relative">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="font-serif text-xl font-semibold text-terra">
            Entre Versos
          </Link>
        </div>

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
                className="px-3 py-1.5 text-xs rounded-lg border border-bordercolor bg-white text-charcoal focus:outline-none focus:border-terra w-40 md:w-56"
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
    </header>
  );
}
