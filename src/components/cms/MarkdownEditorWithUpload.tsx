import { useState, useCallback, useRef } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MarkdownEditorWithUploadProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MarkdownEditorWithUpload({ value, onChange }: MarkdownEditorWithUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, envie apenas imagens');
      return null;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('O tamanho máximo é 5MB');
      return null;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `content/${fileName}`;

    const { error } = await supabase.storage.from('blog-images').upload(filePath, file);
    if (error) {
      toast.error(`Erro no upload: ${error.message}`);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage.from('blog-images').getPublicUrl(filePath);
    return publicUrl;
  };

  const insertImageMarkdown = (url: string, altText: string = 'imagem') => {
    onChange(value + `\n![${altText}](${url})\n`);
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;

    setIsUploading(true);
    toast.info('Enviando imagem...');

    for (const file of files) {
      const url = await uploadImage(file);
      if (url) insertImageMarkdown(url, file.name.replace(/\.[^/.]+$/, ''));
    }

    setIsUploading(false);
    toast.success(`${files.length} imagem(ns) adicionada(s)`);
  }, [value, onChange]);

  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;

        setIsUploading(true);
        toast.info('Enviando imagem...');

        const url = await uploadImage(file);
        if (url) insertImageMarkdown(url, 'imagem-colada');

        setIsUploading(false);
        toast.success('Imagem adicionada ao conteúdo');
        break;
      }
    }
  }, [value, onChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <div
      ref={editorRef}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onPaste={handlePaste}
      className="relative"
    >
      {isUploading && (
        <div className="absolute inset-0 bg-background/80 z-50 flex items-center justify-center rounded-md">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-secondary border-t-transparent rounded-full mx-auto mb-2" />
            <span className="text-sm text-muted-foreground">Enviando imagem...</span>
          </div>
        </div>
      )}
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || '')}
        height={500}
        preview="live"
      />
      <p className="text-xs text-muted-foreground mt-2">
        Arraste imagens ou cole (Ctrl+V) para fazer upload automaticamente
      </p>
    </div>
  );
}
