import { Link } from "react-router-dom";
import cannafyLogoLight from "@/assets/cannafy-logo-light.png";

const CATEGORIES = [
  { label: "Cannabis Medicinal", href: "/blog/categoria/cannabis-medicinal" },
  { label: "Saúde e Bem-estar", href: "/blog/categoria/saude-e-bem-estar" },
  { label: "Tratamentos", href: "/blog/categoria/tratamentos" },
  { label: "Legislação", href: "/blog/categoria/legislacao" },
  { label: "Pesquisas", href: "/blog/categoria/pesquisas" },
];

export function BlogFooter() {
  return (
    <footer className="bg-gradient-to-br from-[#1a3a3a] via-[#223b40] to-[#1a3535] text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <Link to="/blog" className="flex items-center gap-2 mb-4">
              <img src={cannafyLogoLight} alt="Cannafy" className="h-8 w-auto" />
              <span className="text-sm font-semibold tracking-wide">Blog</span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Conteúdo confiável sobre cannabis medicinal, saúde e bem-estar.
              Informação baseada em evidências científicas.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">
              Categorias
            </h4>
            <nav className="flex flex-col gap-2">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.href}
                  to={cat.href}
                  className="text-sm text-white/60 hover:text-primary transition-colors"
                >
                  {cat.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-white/40 mb-4">
              Cannafy
            </h4>
            <nav className="flex flex-col gap-2">
              <a href="https://cannafy.com.br" className="text-sm text-white/60 hover:text-primary transition-colors">
                Site principal
              </a>
              <a href="https://cannafy.com.br/login?tipo=paciente" className="text-sm text-white/60 hover:text-primary transition-colors">
                Área do paciente
              </a>
              <a href="https://cannafy.com.br" className="text-sm text-white/60 hover:text-primary transition-colors">
                Agendar consulta
              </a>
            </nav>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Cannafy. Todos os direitos reservados.
          </p>
          <p className="text-xs text-white/40">
            As informações deste blog não substituem orientação médica profissional.
          </p>
        </div>
      </div>
    </footer>
  );
}
