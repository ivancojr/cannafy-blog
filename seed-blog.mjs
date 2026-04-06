import { readFileSync, writeFileSync } from 'fs';

const json = JSON.parse(readFileSync('/Users/Ivan/Downloads/cannafy-blog-export.json', 'utf-8'));

const MONTH_MAP = {
  'Janeiro': '01', 'Fevereiro': '02', 'Março': '03', 'Marco': '03',
  'Abril': '04', 'Maio': '05', 'Junho': '06',
  'Julho': '07', 'Agosto': '08', 'Setembro': '09',
  'Outubro': '10', 'Novembro': '11', 'Dezembro': '12',
};

function parseDate(dateStr) {
  // "19 de Janeiro de 2026" → "2026-01-19"
  const match = dateStr.match(/(\d+)\s+de\s+(\w+)\s+de\s+(\d{4})/);
  if (!match) return null;
  const [, day, monthName, year] = match;
  const month = MONTH_MAP[monthName];
  if (!month) return null;
  return `${year}-${month}-${day.padStart(2, '0')}T12:00:00Z`;
}

function categorize(title, slug, content) {
  const text = `${title} ${slug} ${content}`.toLowerCase();
  if (/legisla|anvisa|viaj|regula|lei |legal|judi/i.test(text) && /viaj|transport|regra/i.test(text)) return 'Legislação';
  if (/pesquis|estud|cienti|evidên/i.test(text) && !/tratament|como com/i.test(text)) return 'Pesquisas';
  if (/tratament|passo|dose|como com|iniciar|guia.*complet|preco|custo/i.test(text)) return 'Tratamentos';
  if (/saúde|bem-estar|qualidade.*vida|sono|insônia|ansied|dor/i.test(text)) return 'Saúde e Bem-estar';
  return 'Cannabis Medicinal';
}

function escapeSQL(str) {
  return str.replace(/'/g, "''");
}

let sql = '-- Blog Cannafy seed data\n\n';

json.posts.forEach((post, i) => {
  const publishedAt = parseDate(post.date);
  const category = categorize(post.title, post.slug, post.contentText || '');
  const excerpt = escapeSQL(post.metaDescription || '');
  const title = escapeSQL(post.title);
  const content = escapeSQL(post.contentText || '');
  const author = escapeSQL(post.author || 'Cannafy');
  const slug = post.slug;
  const featuredImage = post.featuredImage || '';
  const featured = i === 0 ? 'true' : 'false';

  sql += `INSERT INTO blog_articles (title, slug, excerpt, content, featured_image, category, author_name, published, featured, published_at, created_at)
VALUES (
  '${title}',
  '${slug}',
  '${excerpt}',
  '${content}',
  '${featuredImage}',
  '${category}',
  '${author}',
  true,
  ${featured},
  ${publishedAt ? `'${publishedAt}'` : 'now()'},
  ${publishedAt ? `'${publishedAt}'` : 'now()'}
)
ON CONFLICT (slug) DO NOTHING;\n\n`;
});

writeFileSync('/Users/Ivan/cannafy-blog/seed-blog.sql', sql);
console.log(`Generated ${json.posts.length} INSERT statements → seed-blog.sql`);
