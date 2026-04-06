-- Blog Articles table
CREATE TABLE IF NOT EXISTS blog_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL DEFAULT '',
  featured_image TEXT,
  category TEXT NOT NULL DEFAULT 'Cannabis Medicinal',
  author_id UUID REFERENCES auth.users(id),
  author_name TEXT NOT NULL DEFAULT 'Cannafy',
  published BOOLEAN NOT NULL DEFAULT false,
  featured BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_blog_articles_slug ON blog_articles(slug);
CREATE INDEX idx_blog_articles_category ON blog_articles(category);
CREATE INDEX idx_blog_articles_published ON blog_articles(published, published_at DESC);
CREATE INDEX idx_blog_articles_featured ON blog_articles(featured) WHERE featured = true;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_blog_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER blog_articles_updated_at
  BEFORE UPDATE ON blog_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_articles_updated_at();

-- RLS
ALTER TABLE blog_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Blog articles are publicly readable when published"
  ON blog_articles FOR SELECT
  USING (published = true);

CREATE POLICY "Authenticated users can manage blog articles"
  ON blog_articles FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Blog Newsletter Subscribers table
CREATE TABLE IF NOT EXISTS blog_newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  source TEXT DEFAULT 'blog',
  confirmed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_blog_newsletter_email ON blog_newsletter_subscribers(email);

-- RLS
ALTER TABLE blog_newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe to blog newsletter"
  ON blog_newsletter_subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view blog subscribers"
  ON blog_newsletter_subscribers FOR SELECT
  TO authenticated
  USING (true);
