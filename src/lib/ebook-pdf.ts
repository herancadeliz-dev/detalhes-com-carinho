import { maskPhone, type Broker } from "./card-utils";

/** Real Venize e-book (public/ebook, built by scripts/build_ebook.py) with the broker stamped on the last page. */
export async function downloadEbook(b: Broker) {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const bytes = await (await fetch("/ebook/guia-venize.pdf")).arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  const page = doc.getPages().at(-1)!;
  const { width: W, height: H } = page.getSize();
  const serif = await doc.embedFont(StandardFonts.TimesRomanBold);
  const sans = await doc.embedFont(StandardFonts.Helvetica);
  const gold = rgb(197 / 255, 160 / 255, 89 / 255);
  const ivory = rgb(240 / 255, 234 / 255, 220 / 255);
  const center = (t: string, y: number, font: typeof sans, size: number, color = ivory) => {
    const safe = t.replace(/[^\x20-\xFF]/g, "");
    page.drawText(safe, { x: (W - font.widthOfTextAtSize(safe, size)) / 2, y, size, font, color });
  };
  center(b.nome, H - 322, serif, 22);
  center(`Consultor Imobiliário · CRECI ${b.creci}`, H - 346, sans, 10, gold);
  center(`WhatsApp ${maskPhone(b.tel)}`, H - 372, sans, 11);
  center(b.email, H - 392, sans, 10);
  const out = await doc.save();
  const url = URL.createObjectURL(new Blob([out as BlobPart], { type: "application/pdf" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "Guia_Lancamentos_Venize_Imoveis.pdf";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
