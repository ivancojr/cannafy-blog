import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCMSAuth } from '@/hooks/useCMSAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Eye, LogOut, FileText } from 'lucide-react';
import { CannafyIcon } from '@/components/blog/CannafyIcon';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  published: boolean;
  featured: boolean;
  created_at: string;
  author_name: string;
}

export default function CMSDashboard() {
  const { user, isEditor, isAdmin, signOut, loading } = useCMSAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate('/cms/login');
    else if (!loading && !isEditor) {
      toast.error('Você não tem permissão para acessar o CMS');
      navigate('/blog');
    }
  }, [user, isEditor, loading, navigate]);

  useEffect(() => {
    if (isEditor) fetchArticles();
  }, [isEditor]);

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from('blog_articles')
      .select('id, title, slug, category, published, featured, created_at, author_name')
      .order('created_at', { ascending: false });

    if (error) toast.error(`Erro ao carregar artigos: ${error.message}`);
    else setArticles(data || []);
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('blog_articles').delete().eq('id', id);
    if (error) toast.error(`Erro ao deletar: ${error.message}`);
    else { toast.success('Artigo removido com sucesso'); fetchArticles(); }
  };

  const handleLogout = async () => { await signOut(); navigate('/cms/login'); };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-secondary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <CannafyIcon className="h-6 w-auto" />
              <span className="font-semibold text-lg">Cannafy</span>
            </Link>
            <span className="text-muted-foreground text-sm">CMS</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Badge className={isAdmin ? 'bg-secondary text-white' : ''}>{isAdmin ? 'Admin' : 'Editor'}</Badge>
            <Button variant="ghost" size="icon" onClick={handleLogout}><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>
      </header>

      <nav className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex gap-4">
            <Link to="/cms" className="flex items-center gap-2 px-4 py-3 text-foreground border-b-2 border-secondary font-medium">
              <FileText className="h-4 w-4" />Artigos
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Artigos</h1>
          <Button asChild className="bg-secondary hover:bg-secondary/90 text-white rounded-xl">
            <Link to="/cms/editor"><Plus className="h-4 w-4 mr-2" />Novo Artigo</Link>
          </Button>
        </div>

        {articles.length === 0 ? (
          <Card className="rounded-2xl">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">Nenhum artigo ainda</p>
              <Button asChild className="bg-secondary hover:bg-secondary/90 text-white rounded-xl">
                <Link to="/cms/editor"><Plus className="h-4 w-4 mr-2" />Criar primeiro artigo</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <Card key={article.id} className="rounded-2xl">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{article.title}</h3>
                        {article.featured && <Badge className="bg-primary/20 text-primary border-0">Destaque</Badge>}
                        <Badge variant={article.published ? "default" : "outline"} className={article.published ? 'bg-secondary text-white border-0' : ''}>
                          {article.published ? 'Publicado' : 'Rascunho'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{article.category}</span><span>&bull;</span>
                        <span>{article.author_name}</span><span>&bull;</span>
                        <span>{new Date(article.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {article.published && (
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/artigo/${article.slug}`} target="_blank"><Eye className="h-4 w-4" /></Link>
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/cms/editor/${article.id}`}><Pencil className="h-4 w-4" /></Link>
                      </Button>
                      {isAdmin && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Deletar artigo?</AlertDialogTitle>
                              <AlertDialogDescription>Esta ação não pode ser desfeita. O artigo será permanentemente removido.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(article.id)} className="bg-destructive text-destructive-foreground">Deletar</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
