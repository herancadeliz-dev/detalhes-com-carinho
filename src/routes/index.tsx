import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  BadgeCheck, Phone, Instagram, MapPin, UserPlus, MessageCircle, Download,
  Lock, ShieldCheck, Sparkles, Loader2, CheckCircle2, BedDouble, Bath, Building2,
} from "lucide-react";
import corretorImg from "@/assets/corretor.jpg";
import torinoImg from "@/assets/torino.jpg";
import viverdeImg from "@/assets/viverde.jpg";
import ventoImg from "@/assets/vento-serrano.jpg";
import { VENIZE, downloadVCard, maskPhone, whatsappUrl, onlyDigits, type Broker } from "@/lib/card-utils";

type Search = { nome?: string | undefined; creci?: string | undefined; tel?: string | undefined; email?: string | undefined; foto?: string | undefined };

export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>): Search => {
    const str = (v: unknown) => (typeof v === "string" || typeof v === "number" ? String(v) : undefined);
    return { nome: str(s["nome"]), creci: str(s["creci"]), tel: str(s["tel"]), email: str(s["email"]), foto: str(s["foto"]) };
  },
  head: () => ({
    meta: [
      { title: "Cartão Digital · Venize Imóveis Alto Padrão" },
      { name: "description", content: "Salve o contato do seu consultor Venize Imóveis e receba o guia exclusivo de lançamentos de alto padrão." },
      { property: "og:title", content: "Cartão Digital · Venize Imóveis" },
      { property: "og:description", content: "Consultoria imobiliária de alto padrão. Receba o guia exclusivo de lançamentos." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CardPage,
});

const EMPREENDIMENTOS = [
  { nome: "Residencial Torino", tag: "Lançamento", desc: "Alto padrão em localização nobre.", img: torinoImg, chips: ["3 e 4 Quartos", "Suítes", "Rooftop"] },
  { nome: "Residencial Viverde", tag: "Lazer completo", desc: "Conforto, lazer de clube e sofisticação.", img: viverdeImg, chips: ["2 e 3 Quartos", "Suítes", "Piscina"] },
  { nome: "Residencial Vento Serrano", tag: "Pronto para morar", desc: "Acabamentos nobres e vista para a serra.", img: ventoImg, chips: ["3 Quartos", "2 Suítes", "Pronto"] },
];

function CardPage() {
  const s = Route.useSearch();
  const broker: Broker = {
    nome: s.nome?.trim() || "Luciano Venize",
    creci: s.creci?.trim() || "12345-DF",
    tel: onlyDigits(s.tel ?? "") || "61999999999",
    email: s.email?.trim() || "contato@venizeimoveis.com.br",
    id: s.creci?.trim() || "demo",
  };
  const photo = s.foto || corretorImg;
  const telFmt = maskPhone(broker.tel);
  const waMsg = "Olá, peguei seu cartão de visita da Venize e gostaria de conhecer as oportunidades de imóveis.";

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-5 pb-10 pt-10">
      <Profile broker={broker} photo={photo} />
      <Actions broker={broker} photo={photo} telFmt={telFmt} waMsg={waMsg} />
      <EbookSection broker={broker} />
      <Showcase broker={broker} />
      <Footer />
    </main>
  );
}

function Profile({ broker, photo }: { broker: Broker; photo: string }) {
  return (
    <header className="rise flex flex-col items-center text-center">
      <p className="mb-8 font-display text-sm tracking-[0.45em] text-primary">VENIZE IMÓVEIS</p>
      <div className="relative">
        <div className="halo rounded-full p-1">
          <img src={photo} alt={broker.nome} width={816} height={816} className="h-36 w-36 rounded-full object-cover" />
        </div>
        <span className="bg-gold absolute bottom-1 right-1 grid h-9 w-9 place-items-center rounded-full text-primary-foreground ring-4 ring-background" title="Corretor verificado Venize">
          <BadgeCheck className="h-5 w-5" />
        </span>
      </div>
      <h1 className="mt-6 font-display text-4xl font-semibold leading-tight">{broker.nome}</h1>
      <p className="mt-1 text-sm text-muted-foreground">Consultor Imobiliário de Alto Padrão</p>
      <div className="mt-4 flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-xs tracking-wider text-accent-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-primary" /> CRECI {broker.creci} · Verificado Venize
      </div>
    </header>
  );
}

function Actions({ broker, photo, telFmt, waMsg }: { broker: Broker; photo: string; telFmt: string; waMsg: string }) {
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    await downloadVCard(broker, photo);
    setSaving(false);
    toast.success("Contato pronto", { description: "Abra o arquivo para salvar na sua agenda." });
  };
  const secondary = [
    { icon: Phone, label: "Ligar", href: `tel:+55${broker.tel}` },
    { icon: Instagram, label: "Instagram", href: VENIZE.instagram },
    { icon: MapPin, label: "Stand", href: VENIZE.mapa },
  ];
  return (
    <section className="rise mt-9 space-y-3" style={{ animationDelay: ".1s" }}>
      <a href={whatsappUrl(broker.tel, waMsg)} target="_blank" rel="noreferrer"
        className="press flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-whatsapp font-semibold text-whatsapp-foreground shadow-lg">
        <MessageCircle className="h-5 w-5" /> Falar no WhatsApp
      </a>
      <button onClick={save} disabled={saving}
        className="press bg-gold shadow-gold flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl font-semibold text-primary-foreground">
        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus className="h-5 w-5" />} Salvar na Agenda
      </button>
      <div className="grid grid-cols-3 gap-3 pt-1">
        {secondary.map(({ icon: Icon, label, href }) => (
          <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
            className="press glass flex flex-col items-center gap-1.5 rounded-2xl py-4 text-xs text-muted-foreground hover:text-foreground">
            <Icon className="h-5 w-5 text-primary" />{label}
          </a>
        ))}
      </div>
      <p className="pt-1 text-center text-xs text-muted-foreground">{telFmt} · {broker.email}</p>
    </section>
  );
}

function EbookCover() {
  return (
    <div className="mx-auto w-40 [perspective:900px]">
      <div className="relative aspect-[3/4] w-full rounded-r-md rounded-l-sm bg-background shadow-gold [transform:rotateY(-22deg)_rotateX(4deg)] transition-transform duration-700 hover:[transform:rotateY(-8deg)]">
        <div className="bg-gold absolute inset-y-0 left-0 w-2 rounded-l-sm opacity-80" />
        <div className="absolute inset-3 left-5 flex flex-col items-center justify-between border border-border py-4 text-center">
          <span className="font-display text-[8px] tracking-[0.35em] text-primary">VENIZE IMÓVEIS</span>
          <div>
            <p className="font-display text-lg font-semibold leading-tight">Guia de<br />Lançamentos</p>
            <div className="gold-rule mx-auto my-2 w-12" />
            <p className="font-display text-[10px] italic text-primary">Oportunidades de<br />Alto Padrão</p>
          </div>
          <span className="text-[7px] tracking-widest text-muted-foreground">EDIÇÃO EXCLUSIVA</span>
        </div>
      </div>
    </div>
  );
}

function EbookSection({ broker }: { broker: Broker }) {
  const [nome, setNome] = useState("");
  const [tel, setTel] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nome.trim().split(/\s+/).length < 2) { toast.error("Informe seu nome completo."); return; }
    if (onlyDigits(tel).length < 10) { toast.error("Informe um WhatsApp válido."); return; }
    setState("sending");
    try {
      const nomeFormatado = nome.trim().replace(/\s+/g, " ");
      const telefoneSoNumeros = onlyDigits(tel);
      const corretorNome = broker.nome;
      const res = await fetch(VENIZE.leadEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nomeFormatado,
          telefone: telefoneSoNumeros,
          origem: "site",
          mensagem: `Download do E-book via Cartão NFC — Corretor: ${corretorNome}`,
        }),
      });
      const json = (await res.json().catch(() => null)) as { ok?: boolean } | null;
      if (res.status !== 200 || json?.ok !== true) throw new Error("lead rejected");
      setState("done");
    } catch {
      setState("idle");
      toast.error("Não conseguimos enviar agora", { description: "Tente novamente ou fale direto pelo WhatsApp." });
    }
  };

  const download = async () => {
    const { downloadEbook } = await import("@/lib/ebook-pdf");
    await downloadEbook(broker);
  };

  return (
    <section className="rise glass mt-12 overflow-hidden rounded-3xl p-6" style={{ animationDelay: ".2s" }}>
      <div className="mb-5 flex items-center justify-center gap-2 text-[11px] font-semibold tracking-[0.25em] text-primary">
        <Sparkles className="h-3.5 w-3.5" /> MATERIAL EXCLUSIVO
      </div>
      <EbookCover />
      <h2 className="mt-7 text-center font-display text-3xl font-semibold leading-tight">
        Guia de Lançamentos <span className="text-gold">& Oportunidades</span>
      </h2>
      <p className="mt-3 text-center text-sm leading-relaxed text-muted-foreground">
        Receba agora a seleção restrita dos melhores empreendimentos da região (Residencial Torino, Viverde e Vento Serrano), incluindo plantas, faixas de preço e condições exclusivas de lançamento.
      </p>

      {state === "done" ? (
        <div className="rise mt-6 rounded-2xl border border-border bg-accent/40 p-5 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
          <p className="mt-2 font-display text-2xl">Obrigado, {nome.split(" ")[0]}!</p>
          <p className="mt-1 text-sm text-muted-foreground">Seu acesso foi liberado. {broker.nome.split(" ")[0]} entrará em contato pelo WhatsApp.</p>
          <button onClick={download} className="press bg-gold shadow-gold mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-2xl py-4 font-semibold text-primary-foreground">
            <Download className="h-5 w-5" /> Baixar E-book em PDF
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-3">
          <Field label="Nome completo" value={nome} onChange={setNome} autoComplete="name" placeholder="Como devemos chamar você?" />
          <Field label="WhatsApp" value={tel} onChange={(v) => setTel(maskPhone(v))} autoComplete="tel" inputMode="tel" placeholder="(99) 99999-9999" />
          <button disabled={state === "sending"} className="press bg-gold shadow-gold flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-semibold text-primary-foreground disabled:opacity-70">
            {state === "sending" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
            {state === "sending" ? "Liberando acesso..." : "Quero receber o E-book"}
          </button>
          <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <Lock className="h-3 w-3" /> Seus dados estão protegidos conforme a LGPD.
          </p>
        </form>
      )}
    </section>
  );
}

function Field(props: { label: string; value: string; onChange: (v: string) => void; placeholder: string; autoComplete: string; inputMode?: "tel" }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium tracking-wide text-accent-foreground">{props.label}</span>
      <input value={props.value} onChange={(e) => props.onChange(e.target.value)} placeholder={props.placeholder}
        autoComplete={props.autoComplete} inputMode={props.inputMode} required
        className="h-13 w-full rounded-xl border border-input bg-background/60 px-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground/60 outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30" />
    </label>
  );
}

function Showcase({ broker }: { broker: Broker }) {
  return (
    <section className="rise mt-14" style={{ animationDelay: ".3s" }}>
      <p className="text-center text-[11px] font-semibold tracking-[0.3em] text-primary">VITRINE</p>
      <h2 className="mt-2 text-center font-display text-3xl font-semibold">Empreendimentos em destaque</h2>
      <div className="-mx-5 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none]">
        {EMPREENDIMENTOS.map((e) => (
          <article key={e.nome} className="glass w-[82%] shrink-0 snap-center overflow-hidden rounded-3xl">
            <div className="relative h-44">
              <img src={e.img} alt={e.nome} loading="lazy" width={1024} height={768} className="h-full w-full object-cover" />
              <span className="bg-gold absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">{e.tag}</span>
            </div>
            <div className="p-5">
              <h3 className="font-display text-2xl font-semibold">{e.nome}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{e.desc}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {e.chips.map((c, i) => {
                  const Icon = [BedDouble, Bath, Building2][i] ?? Building2;
                  return (
                    <span key={c} className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] text-accent-foreground">
                      <Icon className="h-3 w-3 text-primary" />{c}
                    </span>
                  );
                })}
              </div>
              <a href={whatsappUrl(broker.tel, `Olá, ${broker.nome.split(" ")[0]}! Peguei seu cartão da Venize e gostaria de solicitar uma apresentação do ${e.nome}.`)}
                target="_blank" rel="noreferrer"
                className="press mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-primary py-3 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground">
                <MessageCircle className="h-4 w-4" /> Solicitar Apresentação
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mt-12 text-center">
      <div className="gold-rule mb-8" />
      <p className="font-display text-2xl tracking-[0.35em] text-gold">VENIZE</p>
      <p className="text-[10px] tracking-[0.5em] text-muted-foreground">IMÓVEIS</p>
      <div className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full border border-border px-4 py-2 text-xs text-accent-foreground">
        <ShieldCheck className="h-4 w-4 text-primary" /> Atendimento exclusivo e confidencial
      </div>
      <p className="mx-auto mt-5 max-w-xs text-[11px] leading-relaxed text-muted-foreground">
        Seus dados são usados apenas para contato sobre os empreendimentos apresentados, conforme a Lei Geral de Proteção de Dados (LGPD). Valores e disponibilidade sujeitos a alteração.
      </p>
      <p className="mt-4 text-[10px] text-muted-foreground/70">© {new Date().getFullYear()} Venize Imóveis</p>
    </footer>
  );
}
