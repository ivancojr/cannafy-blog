import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface BlogArticle {
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  imageUrl: string;
  slug: string;
}

interface TrendingArticle {
  title: string;
  slug: string;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return "";
  return format(new Date(dateString), "d MMM yyyy", { locale: ptBR });
};

const mapArticle = (article: any): BlogArticle => ({
  title: article.title,
  excerpt: article.excerpt || "",
  category: article.category,
  author: article.author_name,
  date: formatDate(article.published_at || article.created_at),
  imageUrl:
    article.featured_image ||
    "https://images.unsplash.com/photo-1584912902902-cf74d5e4d4b8?w=800&auto=format&fit=crop&q=80",
  slug: article.slug,
});

export function useFeaturedBlogArticle() {
  return useQuery({
    queryKey: ["blog-featured-article"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_articles")
        .select("*")
        .eq("published", true)
        .eq("featured", true)
        .order("published_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data ? mapArticle(data) : null;
    },
  });
}

export function useTrendingBlogArticles(limit = 5) {
  return useQuery({
    queryKey: ["blog-trending-articles", limit],
    queryFn: async (): Promise<TrendingArticle[]> => {
      const { data, error } = await supabase
        .from("blog_articles")
        .select("title, slug")
        .eq("published", true)
        .order("published_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
  });
}

export function useBlogArticlesByCategory(category: string, limit = 3) {
  return useQuery({
    queryKey: ["blog-articles-by-category", category, limit],
    queryFn: async (): Promise<BlogArticle[]> => {
      const { data, error } = await supabase
        .from("blog_articles")
        .select("*")
        .eq("published", true)
        .eq("category", category)
        .order("published_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []).map(mapArticle);
    },
  });
}

export function useLatestBlogArticles(limit = 5) {
  return useQuery({
    queryKey: ["blog-latest-articles", limit],
    queryFn: async (): Promise<BlogArticle[]> => {
      const { data, error } = await supabase
        .from("blog_articles")
        .select("*")
        .eq("published", true)
        .order("published_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []).map(mapArticle);
    },
  });
}
