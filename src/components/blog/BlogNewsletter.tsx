import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { CannafyIcon } from "@/components/blog/CannafyIcon";

const emailSchema = z.string().email("Por favor, insira um email válido").max(255);

export function BlogNewsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = emailSchema.safeParse(email.trim());
    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }

    setStatus("loading");

    try {
      const { error } = await supabase
        .from("blog_newsletter_subscribers")
        .insert({ email: validation.data.toLowerCase() });

      if (error) {
        if (error.code === "23505") {
          toast.info("Este email já está inscrito na nossa newsletter!");
        } else {
          toast.error("Ocorreu um erro. Tente novamente.");
        }
        setStatus("idle");
      } else {
        setStatus("success");
        toast.success("Inscrição realizada com sucesso!");
        setTimeout(() => {
          setStatus("idle");
          setEmail("");
        }, 3000);
      }
    } catch {
      toast.error("Ocorreu um erro. Tente novamente.");
      setStatus("idle");
    }
  };

  return (
    <section
      id="newsletter"
      className="bg-gradient-to-br from-[#1a3a3a] via-[#223b40] to-[#1a3535] rounded-3xl p-8 md:p-12 my-12 relative overflow-hidden"
    >
      <div className="absolute top-4 right-4 opacity-10">
        <CannafyIcon className="h-24 w-auto" />
      </div>

      <div className="max-w-2xl mx-auto text-center relative z-10">
        <span className="inline-flex items-center gap-2 text-primary text-sm font-semibold mb-4">
          <CannafyIcon className="h-4 w-auto" />
          Newsletter Cannafy
        </span>
        <h2 className="font-semibold text-3xl md:text-4xl text-white mb-4 tracking-tight">
          Fique por dentro
        </h2>
        <p className="text-white/70 mb-8 text-lg leading-relaxed">
          Receba conteúdo confiável sobre cannabis medicinal, novidades em
          pesquisas e dicas de saúde. Sem spam, apenas informação relevante.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="flex-1 px-4 py-3 bg-white/10 text-white border border-white/20 rounded-full text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 backdrop-blur-sm"
            required
            disabled={status !== "idle"}
          />
          <button
            type="submit"
            disabled={status !== "idle"}
            className="px-8 py-3 bg-primary text-foreground font-semibold rounded-full text-sm hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
          >
            {status === "idle"
              ? "Assinar"
              : status === "loading"
              ? "Inscrevendo..."
              : "Inscrito!"}
          </button>
        </form>
      </div>
    </section>
  );
}
