import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, envie apenas imagens');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('O tamanho máximo é 5MB');
      return;
    }

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `covers/${fileName}`;

    const { error } = await supabase.storage.from('blog-images').upload(filePath, file);

    if (error) {
      toast.error(`Erro no upload: ${error.message}`);
    } else {
      const { data: { publicUrl } } = supabase.storage.from('blog-images').getPublicUrl(filePath);
      onChange(publicUrl);
      toast.success('Imagem enviada com sucesso');
    }
    setIsUploading(false);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(false); }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative">
          <img src={value} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
          <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => onChange('')}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200
            ${isDragOver ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
        >
          <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" id="cover-upload" disabled={isUploading} />
          <label htmlFor="cover-upload" className="cursor-pointer">
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Enviando...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Arraste uma imagem ou clique para enviar</span>
              </div>
            )}
          </label>
        </div>
      )}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">ou cole URL:</span>
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://..." className="flex-1 text-xs h-8" />
      </div>
    </div>
  );
}
