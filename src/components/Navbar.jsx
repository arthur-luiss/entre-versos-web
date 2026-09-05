import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="w-full bg-white border-b border-bordercolor relative z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          onClick={closeMenu}
          className="font-serif text-xl font-bold text-terra hover:opacity-90 transition-opacity"
        >
          Entre Versos
        </Link>

        {/* Menu Desktop */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link
            to="/"
            className={`${
              location.pathname === "/" ? "text-terra" : "text-subtle"
            } hover:text-charcoal transition-colors`}
          >
            Início
          </Link>
          <Link
            to="/explorar"
            className={`${
              location.pathname === "/explorar" ? "text-terra" : "text-subtle"
            } hover:text-charcoal transition-colors`}
          >
            Poemas
          </Link>
          <Link
            to="/sobre"
            className={`${
              location.pathname === "/sobre" ? "text-terra" : "text-subtle"
            } hover:text-charcoal transition-colors`}
          >
            Sobre
          </Link>
        </div>

        {/* Botão Hambúrguer (Mobile) */}
        <button
          className="md:hidden p-2 text-charcoal hover:bg-cardbg rounded-lg transition-colors focus:outline-none"
          onClick={toggleMenu}
          aria-label="Abrir menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Menu Mobile (Dropdown) */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-bordercolor shadow-lg py-4 px-6 flex flex-col gap-4 animate-in slide-in-from-top-2">
          <Link
            to="/"
            onClick={closeMenu}
            className={`text-base font-medium ${
              location.pathname === "/" ? "text-terra" : "text-subtle"
            }`}
          >
            Início
          </Link>
          <Link
            to="/explorar"
            onClick={closeMenu}
            className={`text-base font-medium ${
              location.pathname === "/explorar" ? "text-terra" : "text-subtle"
            }`}
          >
            Poemas
          </Link>
          <Link
            to="/sobre"
            onClick={closeMenu}
            className={`text-base font-medium ${
              location.pathname === "/sobre" ? "text-terra" : "text-subtle"
            }`}
          >
            Sobre
          </Link>
        </div>
      )}
    </nav>
  );
}
