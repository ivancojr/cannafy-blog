import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCMSAuth } from '@/hooks/useCMSAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CannafyIcon } from '@/components/blog/CannafyIcon';

export default function CMSLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useCMSAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast.error(`Erro ao entrar: ${error.message}`);
    } else {
      navigate('/cms');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a3a3a] via-[#223b40] to-[#1a3535] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <CannafyIcon className="h-8 w-auto" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Blog Cannafy</h1>
          <p className="text-muted-foreground text-sm mt-1">Entre com sua conta para gerenciar artigos</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} required className="rounded-xl" />
          </div>
          <Button type="submit" className="w-full rounded-xl bg-secondary hover:bg-secondary/90 text-white" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  );
}
