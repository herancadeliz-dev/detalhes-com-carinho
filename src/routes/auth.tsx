import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
        nav({ to: "/admin" });
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password: pass, options: { emailRedirectTo: `${window.location.origin}/admin` } });
        if (error) throw error;
        if (data.session) nav({ to: "/admin" });
        else toast.success("Conta criada", { description: "Confirme pelo link enviado ao seu e-mail e depois entre." });
      }
    } catch (err) {
      toast.error("Não foi possível entrar", { description: err instanceof Error ? err.message : "" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-5">
      <p className="mb-2 text-center font-display text-sm tracking-[0.45em] text-primary">VENIZE IMÓVEIS</p>
      <h1 className="text-center font-display text-3xl font-semibold">Painel dos Cartões</h1>
      <form onSubmit={submit} className="glass mt-8 space-y-3 rounded-3xl p-6">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" autoComplete="email"
          className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary" />
        <input type="password" required minLength={6} value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Senha" autoComplete={mode === "in" ? "current-password" : "new-password"}
          className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary" />
        <button disabled={busy} className="press bg-gold flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-semibold text-primary-foreground">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} {mode === "in" ? "Entrar" : "Criar conta"}
        </button>
        <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="w-full pt-1 text-xs text-muted-foreground hover:text-foreground">
          {mode === "in" ? "Primeiro acesso? Criar conta" : "Já tenho conta · Entrar"}
        </button>
      </form>
      <p className="mt-4 text-center text-[11px] text-muted-foreground">A primeira conta criada vira a administradora do painel.</p>
    </main>
  );
}
