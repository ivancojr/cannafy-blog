import { Link } from "react-router-dom";

interface BlogFeaturedArticleProps {
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  imageUrl: string;
  slug: string;
}

export function BlogFeaturedArticle({
  title,
  excerpt,
  category,
  author,
  date,
  imageUrl,
  slug,
}: BlogFeaturedArticleProps) {
  const categorySlug = category
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return (
    <article className="group">
      <Link to={`/artigo/${slug}`} className="block">
        <div className="grid md:grid-cols-2 gap-6 md:gap-10">
          <div className="relative aspect-[16/10] md:aspect-[4/3] overflow-hidden rounded-3xl">
            <img
              src={imageUrl}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>

          <div className="flex flex-col justify-center">
            <Link
              to={`/categoria/${categorySlug}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-block"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-secondary bg-secondary/10 px-3 py-1 rounded-full">
                {category}
              </span>
            </Link>
            <h2 className="font-semibold text-3xl md:text-4xl lg:text-5xl leading-[1.1] mb-4 mt-3 group-hover:text-primary transition-colors tracking-tight">
              {title}
            </h2>
            <p className="text-muted-foreground text-lg mb-5 line-clamp-3 leading-relaxed">
              {excerpt}
            </p>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-xs">
                {author.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-foreground">{author}</span>
              <span>&middot;</span>
              <span>{date}</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
