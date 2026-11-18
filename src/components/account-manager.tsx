import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Plus, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createAccount, listAccounts, changeAccountRole } from "@/lib/accounts.functions";

export function AccountManager() {
  const qc = useQueryClient();
  const list = useServerFn(listAccounts);
  const create = useServerFn(createAccount);
  const change = useServerFn(changeAccountRole);
  const accounts = useQuery({ queryKey: ["accounts"], queryFn: () => list() });
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [admin, setAdmin] = useState(false);
  const [busy, setBusy] = useState(false);
  const report = (error: unknown) => toast.error(error instanceof Error ? error.message : "Não foi possível salvar.");

  return <section className="mt-10 border-t border-border pt-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="font-display text-2xl">Usuários do painel</h2>
      <Button onClick={() => setOpen(!open)} variant="outline"><Plus /> Novo usuário</Button>
    </div>
    {open && <form className="mt-5 space-y-3" onSubmit={async (event) => {
      event.preventDefault(); setBusy(true);
      try { await create({ data: { username, password, admin } }); setPassword(""); setUsername(""); setAdmin(false); setOpen(false); await qc.invalidateQueries({ queryKey: ["accounts"] }); toast.success("Usuário criado"); }
      catch (error) { report(error); } finally { setBusy(false); }
    }}>
      <label className="block text-sm">Usuário<input required autoComplete="off" value={username} onChange={(event) => setUsername(event.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2" /></label>
      <label className="block text-sm">Senha inicial<input required type="password" minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2" /></label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={admin} onChange={(event) => setAdmin(event.target.checked)} /> Administrador</label>
      <Button type="submit" disabled={busy}>{busy && <Loader2 className="animate-spin" />} Criar usuário</Button>
    </form>}
    {accounts.isPending && <p className="mt-4 text-sm text-muted-foreground">Carregando usuários...</p>}
    {accounts.isError && <p role="alert" className="mt-4 text-sm text-destructive">Não foi possível carregar os usuários.</p>}
    <ul className="mt-4 divide-y divide-border">{accounts.data?.map((account) => <li key={account.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
      <div className="min-w-0"><p className="break-all font-medium">{account.self ? "Sua conta" : account.username}</p><p className="text-xs text-muted-foreground">{account.admin ? "Administrador" : "Usuário · sem acesso à gestão"}</p></div>
      {!account.self && <label className="flex items-center gap-2 text-sm"><ShieldCheck className="h-4 w-4 text-primary" /><input aria-label={`Administrador: ${account.username}`} type="checkbox" checked={account.admin} disabled={busy} onChange={async (event) => {
        const next = event.target.checked; setBusy(true);
        try { await change({ data: { userId: account.id, admin: next } }); await qc.invalidateQueries({ queryKey: ["accounts"] }); toast.success("Permissão atualizada"); }
        catch (error) { report(error); } finally { setBusy(false); }
      }} /> Administrador</label>}
    </li>)}</ul>
  </section>;
}