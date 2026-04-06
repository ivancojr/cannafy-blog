import { Helmet } from "react-helmet-async";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { BlogNewsletter } from "@/components/blog/BlogNewsletter";
import { BlogFeaturedArticle } from "@/components/blog/BlogFeaturedArticle";
import { BlogArticleCard } from "@/components/blog/BlogArticleCard";
import { BlogCategorySection } from "@/components/blog/BlogCategorySection";
import { BlogTrendingBar } from "@/components/blog/BlogTrendingBar";
import { Skeleton } from "@/components/ui/skeleton";
import { CannafyIcon } from "@/components/blog/CannafyIcon";
import {
  useFeaturedBlogArticle,
  useTrendingBlogArticles,
  useBlogArticlesByCategory,
  useLatestBlogArticles,
} from "@/hooks/useBlogArticles";

const BlogIndex = () => {
  const { data: featured, isLoading: featuredLoading } = useFeaturedBlogArticle();
  const { data: trending } = useTrendingBlogArticles(5);
  const { data: cannabisArticles } = useBlogArticlesByCategory("Cannabis Medicinal", 3);
  const { data: saudeArticles } = useBlogArticlesByCategory("Saúde e Bem-estar", 3);
  const { data: tratArticles } = useBlogArticlesByCategory("Tratamentos", 3);
  const { data: latestArticles, isLoading: latestLoading } = useLatestBlogArticles(5);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Blog Cannafy | Cannabis Medicinal, Saúde e Bem-estar</title>
        <meta
          name="description"
          content="Blog da Cannafy — conteúdo confiável sobre cannabis medicinal, tratamentos, pesquisas e saúde. Informação baseada em evidências."
        />
        <link rel="canonical" href="https://blog.cannafy.com.br" />
      </Helmet>

      <BlogHeader />

      {trending && trending.length > 0 && <BlogTrendingBar items={trending} />}

      <main>
        {/* Featured Article Hero */}
        <section className="container mx-auto px-4 py-10">
          {featuredLoading ? (
            <div className="grid md:grid-cols-2 gap-10">
              <Skeleton className="aspect-[4/3] rounded-3xl" />
              <div className="flex flex-col justify-center space-y-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          ) : featured ? (
            <BlogFeaturedArticle {...featured} />
          ) : (
            <div className="text-center py-20">
              <div className="mx-auto mb-6">
                <CannafyIcon className="h-12 w-auto" />
              </div>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
                Blog Cannafy
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Conteúdo confiável sobre cannabis medicinal, saúde e
                bem-estar. Informação baseada em evidências científicas.
              </p>
            </div>
          )}
        </section>

        {/* Content Grid */}
        <section className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {cannabisArticles && cannabisArticles.length > 0 && (
                <BlogCategorySection
                  title="Cannabis Medicinal"
                  categorySlug="cannabis-medicinal"
                  articles={cannabisArticles}
                />
              )}

              {saudeArticles && saudeArticles.length > 0 && (
                <BlogCategorySection
                  title="Saúde e Bem-estar"
                  categorySlug="saude-e-bem-estar"
                  articles={saudeArticles}
                />
              )}

              {tratArticles && tratArticles.length > 0 && (
                <BlogCategorySection
                  title="Tratamentos"
                  categorySlug="tratamentos"
                  articles={tratArticles}
                />
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-8">
              <div>
                <h3 className="font-semibold text-lg mb-4 pb-3 border-b border-border tracking-tight">
                  Últimos artigos
                </h3>
                {latestLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex gap-4">
                        <Skeleton className="w-20 h-20 rounded-xl shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-5 w-full" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : latestArticles && latestArticles.length > 0 ? (
                  <div>
                    {latestArticles.map((article) => (
                      <BlogArticleCard
                        key={article.slug}
                        {...article}
                        variant="compact"
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhum artigo publicado ainda.
                  </p>
                )}
              </div>

              {/* Sidebar Newsletter */}
              <div className="bg-[#f8f5f0] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <CannafyIcon className="h-4 w-auto" />
                  <h3 className="font-semibold text-lg">Newsletter</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  Receba conteúdos sobre cannabis medicinal
                </p>
                <form className="space-y-3">
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    className="w-full px-3 py-2 bg-background text-foreground border border-border rounded-full text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30"
                  />
                  <button
                    type="button"
                    className="w-full px-3 py-2 bg-secondary text-white rounded-full text-sm font-medium hover:bg-secondary/90 transition-colors"
                    onClick={() => {
                      const el = document.getElementById("newsletter");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Assinar
                  </button>
                </form>
              </div>
            </aside>
          </div>
        </section>

        {/* Newsletter Full Width */}
        <div className="container mx-auto px-4 pb-12">
          <BlogNewsletter />
        </div>
      </main>

      <BlogFooter />
    </div>
  );
};

export default BlogIndex;
