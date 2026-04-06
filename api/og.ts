import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ppegxswwvngevejcrrqi.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
const SITE_URL = 'https://blog.cannafy.com.br';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;
const DEFAULT_TITLE = 'Blog Cannafy | Cannabis Medicinal, Saúde e Bem-estar';
const DEFAULT_DESCRIPTION = 'Conteúdo confiável sobre cannabis medicinal, tratamentos, pesquisas e saúde. Informação baseada em evidências científicas.';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const slug = req.query.slug as string;

  let title = DEFAULT_TITLE;
  let description = DEFAULT_DESCRIPTION;
  let image = DEFAULT_OG_IMAGE;
  let url = SITE_URL;

  if (slug) {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/blog_articles?slug=eq.${encodeURIComponent(slug)}&published=eq.true&select=title,excerpt,featured_image,slug&limit=1`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const article = data[0];
        title = article.title;
        description = article.excerpt || DEFAULT_DESCRIPTION;
        image = article.featured_image || DEFAULT_OG_IMAGE;
        url = `${SITE_URL}/blog/artigo/${article.slug}`;
      }
    } catch (e) {
      // Fall back to defaults
    }
  }

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" href="${SITE_URL}/favicon.ico" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(image)}" />
  <meta property="og:url" content="${escapeHtml(url)}" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Blog Cannafy" />
  <meta property="og:locale" content="pt_BR" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(image)}" />
</head>
<body></body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  return res.status(200).send(html);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
