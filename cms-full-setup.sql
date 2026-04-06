-- 1. Blog User Roles table
CREATE TABLE IF NOT EXISTS blog_user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'user')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE blog_user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own roles"
  ON blog_user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON blog_user_roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM blog_user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 2. Create admin user
SELECT id FROM auth.users WHERE email = 'mentorboxx@gmail.com';

-- If user doesn't exist yet, create via Authentication tab in Dashboard first,
-- then run this to assign admin role:
INSERT INTO blog_user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'mentorboxx@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. Storage bucket for blog images
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view blog images') THEN
    CREATE POLICY "Public can view blog images"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'blog-images');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload blog images') THEN
    CREATE POLICY "Authenticated users can upload blog images"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'blog-images');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can delete blog images') THEN
    CREATE POLICY "Authenticated users can delete blog images"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = 'blog-images');
  END IF;
END $$;
