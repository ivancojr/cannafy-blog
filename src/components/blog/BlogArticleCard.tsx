import { Link } from "react-router-dom";

interface BlogArticleCardProps {
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  imageUrl: string;
  slug: string;
  variant?: "default" | "compact";
}

export function BlogArticleCard({
  title,
  excerpt,
  category,
  author,
  date,
  imageUrl,
  slug,
  variant = "default",
}: BlogArticleCardProps) {
  const categorySlug = category
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  if (variant === "compact") {
    return (
      <article className="group flex gap-4 py-4 border-b border-border last:border-0">
        <Link to={`/artigo/${slug}`} className="shrink-0">
          <div className="w-20 h-20 overflow-hidden rounded-xl">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </Link>
        <div className="flex flex-col justify-center min-w-0">
          <Link to={`/categoria/${categorySlug}`}>
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary hover:text-secondary/80 transition-colors">
              {category}
            </span>
          </Link>
          <Link to={`/artigo/${slug}`}>
            <h3 className="font-semibold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors mt-1">
              {title}
            </h3>
          </Link>
          <span className="text-xs text-muted-foreground mt-1">{date}</span>
        </div>
      </article>
    );
  }

  return (
    <article className="group">
      <Link to={`/artigo/${slug}`}>
        <div className="aspect-[16/10] overflow-hidden rounded-2xl mb-4">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </Link>
      <div>
        <Link to={`/categoria/${categorySlug}`}>
          <span className="text-xs font-semibold uppercase tracking-wider text-secondary hover:text-secondary/80 transition-colors">
            {category}
          </span>
        </Link>
        <Link to={`/artigo/${slug}`}>
          <h3 className="font-semibold text-xl leading-tight mb-2 mt-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
        </Link>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{excerpt}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{author}</span>
          <span>&middot;</span>
          <span>{date}</span>
        </div>
      </div>
    </article>
  );
}
