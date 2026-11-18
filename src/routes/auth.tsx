import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { loginEmail } from "@/lib/account-login";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acesso ao Painel · Venize Imóveis" },
      { name: "description", content: "Acesso restrito para gerenciar os cartões NFC dos corretores Venize." },
      { property: "og:title", content: "Acesso ao Painel · Venize Imóveis" },
      { property: "og:description", content: "Área restrita da equipe Venize." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
        const { error } = await supabase.auth.signInWithPassword({ email: loginEmail(email), password: pass });
        if (error) throw error;
        nav({ to: "/admin" });
    } catch {
      toast.error("Não foi possível entrar", { description: "Confira o usuário e a senha. Se precisar, solicite a recuperação ao responsável pelo painel." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-5">
      <p className="mb-2 text-center font-display text-sm tracking-[0.45em] text-primary">VENIZE IMÓVEIS</p>
      <h1 className="text-center font-display text-3xl font-semibold">Painel dos Cartões</h1>
      <form onSubmit={submit} className="glass mt-8 space-y-3 rounded-3xl p-6">
        <input type="text" aria-label="Usuário" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Usuário" autoComplete="username"
          className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary" />
        <input type="password" aria-label="Senha" required value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Senha" autoComplete="current-password"
          className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary" />
        <Button disabled={busy} className="press bg-gold flex h-auto w-full items-center justify-center gap-2 py-3.5 font-semibold text-primary-foreground">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Entrar
        </Button>
      </form>
    </main>
  );
}
