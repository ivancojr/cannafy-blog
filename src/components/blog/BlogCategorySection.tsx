import { Link } from "react-router-dom";
import { BlogArticleCard } from "./BlogArticleCard";
import { ArrowRight } from "lucide-react";

interface Article {
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  imageUrl: string;
  slug: string;
}

interface BlogCategorySectionProps {
  title: string;
  categorySlug: string;
  articles: Article[];
  showMore?: boolean;
}

export function BlogCategorySection({
  title,
  categorySlug,
  articles,
  showMore = true,
}: BlogCategorySectionProps) {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-border">
        <h2 className="font-semibold text-2xl md:text-3xl tracking-tight">
          {title}
        </h2>
        {showMore && (
          <Link
            to={`/categoria/${categorySlug}`}
            className="flex items-center gap-1.5 text-sm font-medium text-secondary hover:text-secondary/80 transition-colors group"
          >
            Ver mais
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article) => (
          <BlogArticleCard key={article.slug} {...article} />
        ))}
      </div>
    </section>
  );
}
