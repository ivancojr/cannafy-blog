import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { BlogNewsletter } from "@/components/blog/BlogNewsletter";
import { BlogArticleCard } from "@/components/blog/BlogArticleCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { CannafyIcon } from "@/components/blog/CannafyIcon";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const CATEGORY_MAP: Record<string, string> = {
  "cannabis-medicinal": "Cannabis Medicinal",
  "saude-e-bem-estar": "Saúde e Bem-estar",
  "tratamentos": "Tratamentos",
  "legislacao": "Legislação",
  "pesquisas": "Pesquisas",
  "depoimentos": "Depoimentos",
};

const BlogCategoryPage = () => {
  const { category: categorySlug } = useParams<{ category: string }>();
  const categoryName = CATEGORY_MAP[categorySlug || ""] || categorySlug || "";

  const { data: articles, isLoading } = useQuery({
    queryKey: ["blog-category-articles", categoryName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_articles")
        .select("*")
        .eq("published", true)
        .eq("category", categoryName)
        .order("published_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!categoryName,
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return format(new Date(dateString), "d MMM yyyy", { locale: ptBR });
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{categoryName} | Blog Cannafy</title>
        <meta
          name="description"
          content={`Artigos sobre ${categoryName} - Blog Cannafy`}
        />
        <link
          rel="canonical"
          href={`https://blog.cannafy.com.br/categoria/${categorySlug}`}
        />
      </Helmet>

      <BlogHeader />

      <main>
        <section className="container mx-auto px-4 py-10">
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-secondary transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Link>
            <div className="flex items-center gap-3">
              <CannafyIcon className="h-8 w-auto" />
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
                {categoryName}
              </h1>
            </div>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[16/10] rounded-2xl" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ))}
            </div>
          ) : articles && articles.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article: any) => (
                <BlogArticleCard
                  key={article.id}
                  title={article.title}
                  excerpt={article.excerpt || ""}
                  category={article.category}
                  author={article.author_name}
                  date={formatDate(article.published_at || article.created_at)}
                  imageUrl={
                    article.featured_image ||
                    "https://images.unsplash.com/photo-1584912902902-cf74d5e4d4b8?w=800&auto=format&fit=crop&q=80"
                  }
                  slug={article.slug}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="mx-auto mb-6">
                <CannafyIcon className="h-12 w-auto" />
              </div>
              <p className="text-muted-foreground text-lg">
                Nenhum artigo nesta categoria ainda.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-secondary hover:underline mt-4 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para o blog
              </Link>
            </div>
          )}
        </section>

        <div className="container mx-auto px-4 pb-12">
          <BlogNewsletter />
        </div>
      </main>

      <BlogFooter />
    </div>
  );
};

export default BlogCategoryPage;
