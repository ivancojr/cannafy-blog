import { TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

interface TrendingItem {
  title: string;
  slug: string;
}

interface BlogTrendingBarProps {
  items: TrendingItem[];
}

export function BlogTrendingBar({ items }: BlogTrendingBarProps) {
  return (
    <div className="bg-[#f8f5f0] border-b border-border py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2 shrink-0">
            <TrendingUp className="w-4 h-4 text-secondary" />
            <span className="font-medium text-sm text-foreground">Em alta</span>
          </div>
          <div className="h-4 w-px bg-border shrink-0" />
          <div className="flex items-center gap-6">
            {items.map((item, index) => (
              <Link
                key={item.slug}
                to={`/blog/artigo/${item.slug}`}
                className="flex items-center gap-3 shrink-0 group"
              >
                <span className="text-sm font-bold text-secondary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors line-clamp-1 max-w-[200px]">
                  {item.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
