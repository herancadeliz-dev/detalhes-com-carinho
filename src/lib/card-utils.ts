export type Broker = { nome: string; creci: string; tel: string; email: string; id: string };

export const VENIZE = {
  site: "https://venizeimoveis.com.br",
  instagram: "https://instagram.com/venizeimoveis",
  mapa: "https://maps.google.com/?q=Venize+Imóveis",
  leadEndpoint: "https://venizeimoveis.com.br/.netlify/functions/createLead",
};

export const onlyDigits = (v: string) => v.replace(/\D/g, "");

export function maskPhone(v: string) {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function intlPhone(tel: string) {
  const d = onlyDigits(tel);
  return d.startsWith("55") ? d : `55${d}`;
}

export function whatsappUrl(tel: string, msg: string) {
  return `https://wa.me/${intlPhone(tel)}?text=${encodeURIComponent(msg)}`;
}

async function toBase64(url: string) {
  try {
    const blob = await (await fetch(url)).blob();
    return await new Promise<string>((res) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result).split(",")[1] ?? "");
      r.readAsDataURL(blob);
    });
  } catch {
    return "";
  }
}

export async function downloadVCard(b: Broker, photoUrl: string) {
  const photo = await toBase64(photoUrl);
  const [first, ...rest] = b.nome.split(" ");
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${rest.join(" ")};${first};;;`,
    `FN:${b.nome}`,
    "ORG:Venize Imóveis",
    `TITLE:Consultor Imobiliário de Alto Padrão · CRECI ${b.creci}`,
    `TEL;TYPE=CELL,VOICE:+${intlPhone(b.tel)}`,
    `EMAIL;TYPE=WORK:${b.email}`,
    `URL:${VENIZE.site}`,
    photo ? `PHOTO;ENCODING=b;TYPE=JPEG:${photo}` : "",
    "END:VCARD",
  ].filter(Boolean);
  const blob = new Blob([lines.join("\r\n")], { type: "text/vcard;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${b.nome.replace(/\s+/g, "_")}_Venize.vcf`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
