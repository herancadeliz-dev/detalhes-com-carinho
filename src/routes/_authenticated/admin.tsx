import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, ExternalLink, Loader2, LogOut, Pencil, Plus, Trash2, Upload, UserRound, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { maskPhone, onlyDigits } from "@/lib/card-utils";
import { slugify } from "@/lib/slug";
import type { Tables } from "@/integrations/supabase/types";

type BrokerRow = Tables<"brokers">;

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Painel dos Corretores · Venize Imóveis" },
      { name: "description", content: "Cadastre corretores e gere os links dos cartões NFC Venize." },
      { property: "og:title", content: "Painel dos Corretores · Venize" },
      { property: "og:description", content: "Gestão dos cartões NFC dos corretores Venize." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const PUBLIC_ORIGIN = "https://detalhes-com-carinho.lovable.app";
const cardLink = (slug: string) => `${PUBLIC_ORIGIN}/?id=${slug}`;
const empty = { id: "", slug: "", nome: "", creci: "", tel: "", email: "", foto_url: "" as string | null, ativo: true };

function AdminPage() {
  const qc = useQueryClient();
  const nav = useNavigate();
  const [editing, setEditing] = useState<typeof empty | null>(null);

  const roleQ = useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return { admin: false, email: "" };
      const { data } = await supabase.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
      return { admin: !!data, email: u.user.email ?? "" };
    },
  });
  const listQ = useQuery({
    queryKey: ["brokers"],
    enabled: !!roleQ.data?.admin,
    queryFn: async () => {
      const { data, error } = await supabase.from("brokers").select("*").order("nome");
      if (error) throw error;
      return data as BrokerRow[];
    },
  });

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    nav({ to: "/auth", replace: true });
  };

  const remove = async (b: BrokerRow) => {
    if (!confirm(`Excluir ${b.nome}? O cartão dele vai parar de mostrar seus dados.`)) return;
    const { error } = await supabase.from("brokers").delete().eq("id", b.id);
    if (error) return toast.error("Não foi possível excluir");
    toast.success("Corretor excluído");
    qc.invalidateQueries({ queryKey: ["brokers"] });
  };

  const copy = async (slug: string) => {
    await navigator.clipboard.writeText(cardLink(slug));
    toast.success("Link copiado", { description: "Grave este link no cartão NFC." });
  };

  if (roleQ.isLoading) return <Center><Loader2 className="h-6 w-6 animate-spin text-primary" /></Center>;
  if (!roleQ.data?.admin)
    return (
      <Center>
        <p className="font-display text-2xl">Acesso restrito</p>
        <p className="mt-2 text-sm text-muted-foreground">A conta {roleQ.data?.email} não tem permissão de administradora.</p>
        <button onClick={signOut} className="mt-5 text-sm text-primary">Sair</button>
      </Center>
    );

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-5 pb-16 pt-10">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="font-display text-xs tracking-[0.45em] text-primary">VENIZE IMÓVEIS</p>
          <h1 className="mt-1 font-display text-3xl font-semibold">Corretores e Cartões NFC</h1>
        </div>
        <button onClick={signOut} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"><LogOut className="h-4 w-4" /> Sair</button>
      </header>

      <button onClick={() => setEditing({ ...empty })} className="press bg-gold shadow-gold mt-8 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-semibold text-primary-foreground">
        <Plus className="h-5 w-5" /> Novo corretor
      </button>

      <ul className="mt-6 space-y-3">
        {listQ.isLoading && <li className="text-center text-sm text-muted-foreground">Carregando...</li>}
        {listQ.data?.map((b) => (
          <li key={b.id} className="glass flex flex-wrap items-center gap-4 rounded-2xl p-4">
            {b.foto_url ? <img src={b.foto_url} alt={b.nome} className="h-14 w-14 rounded-full object-cover" /> : <span className="grid h-14 w-14 place-items-center rounded-full bg-accent"><UserRound className="h-6 w-6 text-primary" /></span>}
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{b.nome} {!b.ativo && <span className="ml-2 rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">inativo</span>}</p>
              <p className="truncate text-xs text-muted-foreground">CRECI {b.creci} · {maskPhone(b.tel)}</p>
              <p className="truncate text-xs text-primary">{cardLink(b.slug)}</p>
            </div>
            <div className="flex gap-1">
              <IconBtn label="Copiar link do cartão" onClick={() => copy(b.slug)}><Copy className="h-4 w-4" /></IconBtn>
              <IconBtn label="Abrir cartão" onClick={() => window.open(`/?id=${b.slug}`, "_blank")}><ExternalLink className="h-4 w-4" /></IconBtn>
              <IconBtn label="Editar" onClick={() => setEditing({ ...b, foto_url: b.foto_url ?? "" })}><Pencil className="h-4 w-4" /></IconBtn>
              <IconBtn label="Excluir" onClick={() => remove(b)}><Trash2 className="h-4 w-4" /></IconBtn>
            </div>
          </li>
        ))}
        {listQ.data?.length === 0 && <li className="text-center text-sm text-muted-foreground">Nenhum corretor ainda.</li>}
      </ul>

      {editing && <BrokerForm initial={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); qc.invalidateQueries({ queryKey: ["brokers"] }); }} />}
    </main>
  );
}

function BrokerForm({ initial, onClose, onSaved }: { initial: typeof empty; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({ ...initial, tel: maskPhone(initial.tel) });
  const [slugTouched, setSlugTouched] = useState(!!initial.id);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const set = (k: keyof typeof f, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const path = `${crypto.randomUUID()}.${file.name.split(".").pop() || "jpg"}`;
      const { error } = await supabase.storage.from("broker-photos").upload(path, file, { contentType: file.type });
      if (error) throw error;
      const { data, error: e2 } = await supabase.storage.from("broker-photos").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (e2 || !data) throw e2;
      set("foto_url", data.signedUrl);
    } catch {
      toast.error("Não foi possível enviar a foto", { description: "Use JPG ou PNG de até 5 MB." });
    } finally {
      setUploading(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = slugify(f.slug);
    if (!slug) return toast.error("Informe o ID do cartão");
    setBusy(true);
    const row = { slug, nome: f.nome.trim(), creci: f.creci.trim(), tel: onlyDigits(f.tel), email: f.email.trim(), foto_url: f.foto_url || null, ativo: f.ativo };
    const { error } = f.id ? await supabase.from("brokers").update(row).eq("id", f.id) : await supabase.from("brokers").insert(row);
    setBusy(false);
    if (error) return toast.error(error.code === "23505" ? "Esse ID já está em uso por outro corretor" : "Não foi possível salvar");
    toast.success("Corretor salvo");
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="glass max-h-[92vh] w-full max-w-md space-y-3 overflow-y-auto rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">{f.id ? "Editar corretor" : "Novo corretor"}</h2>
          <button type="button" onClick={onClose} aria-label="Fechar"><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        <div className="flex items-center gap-4">
          {f.foto_url ? <img src={f.foto_url} alt="" className="h-20 w-20 rounded-full object-cover" /> : <span className="grid h-20 w-20 place-items-center rounded-full bg-accent"><UserRound className="h-8 w-8 text-primary" /></span>}
          <label className="press glass flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 text-primary" />} {f.foto_url ? "Trocar foto" : "Enviar foto"}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          </label>
        </div>
        <In label="Nome completo" value={f.nome} required onChange={(v) => { set("nome", v); if (!slugTouched) set("slug", slugify(v.split(" ")[0] ?? "")); }} />
        <In label="ID do cartão (vai no link)" value={f.slug} required onChange={(v) => { setSlugTouched(true); set("slug", slugify(v)); }} hint={f.slug ? cardLink(slugify(f.slug)) : "ex.: marcus"} />
        <In label="CRECI" value={f.creci} onChange={(v) => set("creci", v)} />
        <In label="WhatsApp" value={f.tel} required inputMode="tel" onChange={(v) => set("tel", maskPhone(v))} />
        <In label="E-mail" value={f.email} type="email" onChange={(v) => set("email", v)} />
        <label className="flex items-center gap-2 pt-1 text-sm">
          <input type="checkbox" checked={f.ativo} onChange={(e) => set("ativo", e.target.checked)} className="h-4 w-4 accent-[var(--primary)]" /> Cartão ativo
        </label>
        <button disabled={busy || uploading} className="press bg-gold flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-semibold text-primary-foreground disabled:opacity-70">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Salvar
        </button>
      </form>
    </div>
  );
}

function In({ label, value, onChange, hint, ...rest }: { label: string; value: string; onChange: (v: string) => void; hint?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-muted-foreground">{label}</span>
      <input {...rest} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary" />
      {hint && <span className="mt-1 block truncate text-[11px] text-primary">{hint}</span>}
    </label>
  );
}

function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" aria-label={label} title={label} onClick={onClick} className="press grid h-9 w-9 place-items-center rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground">{children}</button>;
}

function Center({ children }: { children: React.ReactNode }) {
  return <main className="flex min-h-screen flex-col items-center justify-center px-5 text-center">{children}</main>;
}
