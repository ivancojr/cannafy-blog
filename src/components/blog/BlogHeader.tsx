import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import cannafyLogoDark from "@/assets/cannafy-logo-dark.png";
import cannafyLogoLight from "@/assets/cannafy-logo-light.png";

const NAV_LINKS = [
  { label: "Cannabis Medicinal", href: "/categoria/cannabis-medicinal" },
  { label: "Saúde e Bem-estar", href: "/categoria/saude-e-bem-estar" },
  { label: "Tratamentos", href: "/categoria/tratamentos" },
  { label: "Legislação", href: "/categoria/legislacao" },
  { label: "Pesquisas", href: "/categoria/pesquisas" },
];

export function BlogHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm"
          : "bg-gradient-to-br from-[#1a3a3a] via-[#223b40] to-[#1a3535]"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={scrolled ? cannafyLogoDark : cannafyLogoLight}
              alt="Cannafy Blog"
              className="h-7 lg:h-8 w-auto"
            />
            <span
              className={`text-sm font-semibold tracking-wide ${
                scrolled ? "text-foreground" : "text-white"
              }`}
            >
              Blog
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  scrolled ? "text-foreground/70" : "text-white/80 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="https://cannafy.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className={`hidden sm:inline-flex text-sm font-medium px-4 py-2 rounded-full transition-colors ${
                scrolled
                  ? "bg-secondary text-white hover:bg-secondary/90"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              Agendar consulta
            </a>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`lg:hidden p-2 rounded-lg ${
                scrolled ? "text-foreground" : "text-white"
              }`}
              aria-label="Menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-border">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-foreground/70 hover:text-primary py-2.5 px-3 rounded-lg hover:bg-accent transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <a
              href="https://cannafy.com.br"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-white bg-secondary hover:bg-secondary/90 py-2.5 px-3 rounded-lg transition-colors mt-2 text-center"
            >
              Agendar consulta
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
