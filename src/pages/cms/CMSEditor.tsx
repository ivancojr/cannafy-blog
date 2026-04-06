import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useCMSAuth } from '@/hooks/useCMSAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import ImageUpload from '@/components/cms/ImageUpload';
import MarkdownEditorWithUpload from '@/components/cms/MarkdownEditorWithUpload';

const CATEGORIES = [
  'Cannabis Medicinal',
  'Saúde e Bem-estar',
  'Tratamentos',
  'Legislação',
  'Pesquisas',
  'Depoimentos',
];

export default function CMSEditor() {
  const { id } = useParams();
  const { user, isEditor, loading } = useCMSAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [category, setCategory] = useState('Cannabis Medicinal');
  const [published, setPublished] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [authorName, setAuthorName] = useState('Cannafy');

  useEffect(() => {
    if (!loading && !user) navigate('/cms/login');
    else if (!loading && !isEditor) navigate('/blog');
  }, [user, isEditor, loading, navigate]);

  useEffect(() => {
    if (id && isEditor) fetchArticle();
  }, [id, isEditor]);

  const fetchArticle = async () => {
    const { data, error } = await supabase.from('blog_articles').select('*').eq('id', id).maybeSingle();
    if (error) {
      toast.error(`Erro ao carregar artigo: ${error.message}`);
      navigate('/cms');
    } else if (data) {
      setTitle(data.title);
      setSlug(data.slug);
      setExcerpt(data.excerpt || '');
      setContent(data.content);
      setFeaturedImage(data.featured_image || '');
      setCategory(data.category);
      setPublished(data.published);
      setFeatured(data.featured);
      setAuthorName(data.author_name || 'Cannafy');
    }
    setIsLoading(false);
  };

  const generateSlug = (text: string) => {
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!id) setSlug(generateSlug(value));
  };

  const handleSave = async (shouldPublish?: boolean) => {
    if (!title.trim() || !content.trim()) {
      toast.error('Título e conteúdo são obrigatórios');
      return;
    }

    setIsSaving(true);

    const articleData = {
      title,
      slug: slug || generateSlug(title),
      excerpt,
      content,
      featured_image: featuredImage || null,
      category,
      published: shouldPublish !== undefined ? shouldPublish : published,
      featured,
      author_id: user?.id,
      author_name: authorName || 'Cannafy',
      published_at: shouldPublish ? new Date().toISOString() : null,
    };

    let error;
    if (id) {
      const { error: updateError } = await supabase.from('blog_articles').update(articleData).eq('id', id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('blog_articles').insert(articleData);
      error = insertError;
    }

    if (error) {
      toast.error(`Erro ao salvar: ${error.message}`);
    } else {
      toast.success(shouldPublish ? 'Artigo publicado com sucesso' : 'Artigo salvo como rascunho');
      navigate('/cms');
    }
    setIsSaving(false);
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-secondary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild><Link to="/cms"><ArrowLeft className="h-4 w-4" /></Link></Button>
            <h1 className="text-xl font-semibold">{id ? 'Editar Artigo' : 'Novo Artigo'}</h1>
          </div>
          <div className="flex items-center gap-2">
            {published && slug && (
              <Button variant="outline" asChild className="rounded-xl">
                <Link to={`/blog/artigo/${slug}`} target="_blank"><Eye className="h-4 w-4 mr-2" />Ver</Link>
              </Button>
            )}
            <Button variant="outline" onClick={() => handleSave(false)} disabled={isSaving} className="rounded-xl">
              <Save className="h-4 w-4 mr-2" />Salvar Rascunho
            </Button>
            <Button onClick={() => handleSave(true)} disabled={isSaving} className="bg-secondary hover:bg-secondary/90 text-white rounded-xl">
              {isSaving ? 'Salvando...' : 'Publicar'}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Título do artigo" className="text-xl font-semibold rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt">Resumo</Label>
              <Textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Um breve resumo do artigo..." rows={3} className="rounded-xl" />
            </div>
            <div className="space-y-2" data-color-mode="light">
              <Label>Conteúdo (Markdown)</Label>
              <MarkdownEditorWithUpload value={content} onChange={setContent} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="border border-border rounded-2xl p-4 space-y-4 bg-card">
              <h3 className="font-semibold">Configurações</h3>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="url-do-artigo" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Imagem de Capa</Label>
                <ImageUpload value={featuredImage} onChange={setFeaturedImage} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author_name">Autor</Label>
                <Input id="author_name" value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Nome do autor" className="rounded-xl" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="featured">Artigo em Destaque</Label>
                <Switch id="featured" checked={featured} onCheckedChange={setFeatured} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="published">Publicado</Label>
                <Switch id="published" checked={published} onCheckedChange={setPublished} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
