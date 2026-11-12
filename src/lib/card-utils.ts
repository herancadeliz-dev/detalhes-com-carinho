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

export async function buildVCard(b: Broker, photoUrl: string) {
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
  return lines.join("\r\n");
}

/** Plain-text vCard (no photo) small enough for a QR code. */
export function vCardText(b: Broker) {
  const [first, ...rest] = b.nome.split(" ");
  return [
    "BEGIN:VCARD", "VERSION:3.0", `N:${rest.join(" ")};${first};;;`, `FN:${b.nome}`, "ORG:Venize Imóveis",
    `TEL;TYPE=CELL:+${intlPhone(b.tel)}`, `EMAIL:${b.email}`, `URL:${VENIZE.site}`, "END:VCARD",
  ].join("\n");
}

/**
 * Opens the phone's own "add contact" sheet when possible (share sheet on iOS/Android),
 * falling back to a regular file download. Returns how it was delivered.
 */
export async function saveContact(b: Broker, photoUrl: string): Promise<"shared" | "downloaded" | "cancelled"> {
  const vcf = await buildVCard(b, photoUrl);
  const name = `${b.nome.replace(/\s+/g, "_")}_Venize.vcf`;
  const file = new File([vcf], name, { type: "text/vcard" });
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (!isIOS && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: b.nome });
      return "shared";
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return "cancelled";
    }
  }
  const blob = new Blob([vcf], { type: "text/vcard;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  return "downloaded";
}
