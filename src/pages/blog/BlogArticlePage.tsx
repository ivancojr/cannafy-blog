import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { BlogNewsletter } from "@/components/blog/BlogNewsletter";
import { BlogArticleCard } from "@/components/blog/BlogArticleCard";
import ReactMarkdown from "react-markdown";
import { FaTwitter, FaLinkedin, FaFacebook } from "react-icons/fa";
import { FiLink2, FiArrowLeft, FiClock, FiCalendar } from "react-icons/fi";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CannafyIcon } from "@/components/blog/CannafyIcon";
import { z } from "zod";

const emailSchema = z.string().email().max(255);

const BlogArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [sidebarEmail, setSidebarEmail] = useState("");
  const [sidebarStatus, setSidebarStatus] = useState<"idle" | "loading" | "success">("idle");

  const {
    data: article,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["blog-article", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_articles")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: relatedArticles } = useQuery({
    queryKey: ["blog-related-articles", article?.category, article?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("blog_articles")
        .select("*")
        .eq("published", true)
        .eq("category", article?.category)
        .neq("id", article?.id)
        .limit(3);
      return data || [];
    },
    enabled: !!article,
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copiado!");
  };

  const handleSidebarSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = emailSchema.safeParse(sidebarEmail);
    if (!result.success) {
      toast.error("Por favor, insira um email válido");
      return;
    }
    setSidebarStatus("loading");
    try {
      const { error } = await supabase
        .from("blog_newsletter_subscribers")
        .insert({ email: sidebarEmail.toLowerCase().trim() });
      if (error) {
        if (error.code === "23505") toast.error("Este email já está inscrito");
        else toast.error("Erro ao se inscrever. Tente novamente.");
        setSidebarStatus("idle");
        return;
      }
      setSidebarStatus("success");
      toast.success("Inscrição realizada com sucesso!");
      setTimeout(() => {
        setSidebarStatus("idle");
        setSidebarEmail("");
      }, 3000);
    } catch {
      toast.error("Erro ao se inscrever. Tente novamente.");
      setSidebarStatus("idle");
    }
  };

  const shareOnTwitter = () =>
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article?.title || "")}`,
      "_blank"
    );
  const shareOnLinkedIn = () =>
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
      "_blank"
    );
  const shareOnFacebook = () =>
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
      "_blank"
    );

  const estimateReadTime = (content: string) =>
    `${Math.ceil(content.split(/\s+/).length / 200)} min`;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d 'de' MMMM 'de' yyyy", {
        locale: ptBR,
      });
    } catch {
      return dateString;
    }
  };

  const formatDateShort = (dateString: string) => {
    try {
      return format(new Date(dateString), "d MMM yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <BlogHeader />
        <main className="container mx-auto px-4 py-16 max-w-3xl">
          <Skeleton className="h-5 w-20 mb-4" />
          <Skeleton className="h-14 w-full mb-3" />
          <Skeleton className="h-14 w-3/4 mb-6" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="w-full aspect-[16/9] rounded-3xl mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </main>
        <BlogFooter />
      </div>
    );
  }

  if (!article || error) {
    return (
      <div className="min-h-screen bg-background">
        <BlogHeader />
        <main className="container mx-auto px-4 py-16 text-center">
          <div className="mx-auto mb-6">
            <CannafyIcon className="h-12 w-auto" />
          </div>
          <h1 className="text-4xl font-semibold mb-4">Artigo não encontrado</h1>
          <p className="text-muted-foreground mb-8">
            O artigo que você procura não existe ou foi removido.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-secondary hover:underline font-medium"
          >
            <FiArrowLeft className="w-4 h-4" />
            Voltar para o blog
          </Link>
        </main>
        <BlogFooter />
      </div>
    );
  }

  const imageUrl =
    article.featured_image ||
    "https://images.unsplash.com/photo-1584912902902-cf74d5e4d4b8?w=1200&auto=format&fit=crop&q=80";
  const readTime = estimateReadTime(article.content);
  const publishedDate = article.published_at || article.created_at;
  const canonicalUrl = `https://blog.cannafy.com.br/artigo/${article.slug}`;
  const categorySlug = article.category
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt || article.title,
    image: imageUrl,
    datePublished: publishedDate,
    dateModified: article.updated_at,
    author: { "@type": "Person", name: article.author_name },
    publisher: {
      "@type": "Organization",
      name: "Cannafy",
      logo: {
        "@type": "ImageObject",
        url: "https://blog.cannafy.com.br/assets/cannafy-logo-green.svg",
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    articleSection: article.category,
    wordCount: article.content.split(/\s+/).length,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Blog",
        item: "https://blog.cannafy.com.br",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: article.category,
        item: `https://blog.cannafy.com.br/categoria/${categorySlug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{article.title} | Blog Cannafy</title>
        <meta name="description" content={article.excerpt || article.title} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={article.title} />
        <meta
          property="og:description"
          content={article.excerpt || article.title}
        />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Blog Cannafy" />
        <meta property="article:published_time" content={publishedDate} />
        <meta property="article:author" content={article.author_name} />
        <meta property="article:section" content={article.category} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta
          name="twitter:description"
          content={article.excerpt || article.title}
        />
        <meta name="twitter:image" content={imageUrl} />
        <script type="application/ld+json">
          {JSON.stringify(articleJsonLd)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbJsonLd)}
        </script>
      </Helmet>

      <BlogHeader />

      <main>
        <section className="container mx-auto px-4 pt-8 pb-6">
          <div className="max-w-3xl mx-auto">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link
                to="/"
                className="hover:text-secondary transition-colors"
              >
                Blog
              </Link>
              <span>/</span>
              <Link
                to={`/categoria/${categorySlug}`}
                className="hover:text-secondary transition-colors"
              >
                {article.category}
              </Link>
            </nav>

            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-secondary bg-secondary/10 px-3 py-1 rounded-full mb-3">
              {article.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-semibold leading-[1.1] mb-5 tracking-tight">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="text-lg md:text-xl text-foreground/80 font-medium leading-relaxed mb-6">
                {article.excerpt}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 pb-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-sm">
                  {article.author_name.charAt(0).toUpperCase()}
                </div>
                <p className="text-sm font-medium">{article.author_name}</p>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <FiCalendar className="w-3.5 h-3.5" />
                  {formatDate(publishedDate)}
                </span>
                <span className="flex items-center gap-1.5">
                  <FiClock className="w-3.5 h-3.5" />
                  {readTime} de leitura
                </span>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={shareOnTwitter}
                  className="p-2 text-muted-foreground hover:text-secondary transition-colors rounded-full hover:bg-[#f8f5f0]"
                  aria-label="Compartilhar no Twitter"
                >
                  <FaTwitter className="w-4 h-4" />
                </button>
                <button
                  onClick={shareOnLinkedIn}
                  className="p-2 text-muted-foreground hover:text-secondary transition-colors rounded-full hover:bg-[#f8f5f0]"
                  aria-label="Compartilhar no LinkedIn"
                >
                  <FaLinkedin className="w-4 h-4" />
                </button>
                <button
                  onClick={shareOnFacebook}
                  className="p-2 text-muted-foreground hover:text-secondary transition-colors rounded-full hover:bg-[#f8f5f0]"
                  aria-label="Compartilhar no Facebook"
                >
                  <FaFacebook className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCopyLink}
                  className="p-2 text-muted-foreground hover:text-secondary transition-colors rounded-full hover:bg-[#f8f5f0]"
                  aria-label="Copiar link"
                >
                  <FiLink2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 mb-8">
          <div className="max-w-4xl mx-auto">
            <img
              src={imageUrl}
              alt={article.title}
              className="w-full rounded-3xl aspect-[16/9] object-cover"
            />
          </div>
        </section>

        <section className="container mx-auto px-4 pb-12">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-lg max-w-none prose-headings:tracking-tight prose-headings:text-foreground prose-p:text-foreground/80 prose-a:text-secondary prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl">
              <ReactMarkdown>{article.content}</ReactMarkdown>
            </div>

            {/* Author */}
            <div className="mt-14 pt-8 border-t border-border">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-xl shrink-0">
                  {article.author_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                    Escrito por
                  </p>
                  <h3 className="font-semibold text-xl mb-1">
                    {article.author_name}
                  </h3>
                </div>
              </div>
            </div>

            {/* Inline Newsletter */}
            <div className="mt-10 bg-[#f8f5f0] rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <CannafyIcon className="h-4 w-auto" />
                <h3 className="font-semibold text-xl">Newsletter</h3>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Receba conteúdos sobre cannabis medicinal
              </p>
              <form onSubmit={handleSidebarSubscribe} className="flex gap-3">
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={sidebarEmail}
                  onChange={(e) => setSidebarEmail(e.target.value)}
                  disabled={sidebarStatus !== "idle"}
                  className="flex-1 px-3 py-2 bg-background text-foreground border border-border rounded-full text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={sidebarStatus !== "idle"}
                  className="px-6 py-2 bg-secondary text-white rounded-full text-sm font-medium hover:bg-secondary/90 transition-colors disabled:opacity-50"
                >
                  {sidebarStatus === "idle"
                    ? "Assinar"
                    : sidebarStatus === "loading"
                    ? "..."
                    : "Inscrito!"}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Related Articles */}
        {relatedArticles && relatedArticles.length > 0 && (
          <section className="container mx-auto px-4 py-12 border-t border-border">
            <div className="max-w-5xl mx-auto">
              <h2 className="font-semibold text-2xl md:text-3xl mb-8 tracking-tight">
                Leia também
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedArticles.map((ra: any) => (
                  <BlogArticleCard
                    key={ra.id}
                    title={ra.title}
                    excerpt={ra.excerpt || ""}
                    category={ra.category}
                    author={ra.author_name}
                    date={formatDateShort(ra.published_at || ra.created_at)}
                    imageUrl={
                      ra.featured_image ||
                      "https://images.unsplash.com/photo-1584912902902-cf74d5e4d4b8?w=800&auto=format&fit=crop&q=80"
                    }
                    slug={ra.slug}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        <div className="container mx-auto px-4 pb-12">
          <BlogNewsletter />
        </div>
      </main>

      <BlogFooter />
    </div>
  );
};

export default BlogArticlePage;
