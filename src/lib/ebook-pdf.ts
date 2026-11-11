import type { Broker } from "./card-utils";

const GOLD: [number, number, number] = [197, 160, 89];
const DARK: [number, number, number] = [15, 17, 21];
const IVORY: [number, number, number] = [240, 234, 220];

const EMPREENDIMENTOS = [
  { nome: "Residencial Torino", status: "Lançamento", tipo: "3 e 4 quartos · suítes", area: "98 a 168 m²", preco: "A partir de R$ 890 mil", desc: "Torre de alto padrão em localização nobre, fachada contemporânea, rooftop com vista panorâmica e lobby assinado." },
  { nome: "Residencial Viverde", status: "Em obras", tipo: "2 e 3 quartos · suítes", area: "64 a 112 m²", preco: "A partir de R$ 590 mil", desc: "Lazer completo de clube: piscina com borda infinita, jardins tropicais, academia, espaço gourmet e coworking." },
  { nome: "Residencial Vento Serrano", status: "Pronto para morar", tipo: "3 quartos · 2 suítes", area: "118 a 145 m²", preco: "A partir de R$ 1,15 milhão", desc: "Acabamentos nobres em mármore, esquadrias amplas com vista para a serra e unidades prontas para entrega imediata." },
];

export async function downloadEbook(b: Broker) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210, H = 297;

  const bg = () => { doc.setFillColor(...DARK); doc.rect(0, 0, W, H, "F"); };
  const frame = () => { doc.setDrawColor(...GOLD); doc.setLineWidth(0.3); doc.rect(10, 10, W - 20, H - 20); };
  const footer = (n: number) => {
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...GOLD);
    doc.text("VENIZE IMÓVEIS · Material exclusivo e confidencial", 20, H - 16);
    doc.text(String(n), W - 20, H - 16, { align: "right" });
  };

  // Capa
  bg(); frame();
  doc.setDrawColor(...GOLD); doc.setLineWidth(0.6); doc.line(70, 70, 140, 70);
  doc.setFont("times", "normal"); doc.setFontSize(12); doc.setTextColor(...GOLD);
  doc.text("V E N I Z E   I M Ó V E I S", W / 2, 62, { align: "center" });
  doc.setFont("times", "bold"); doc.setFontSize(34); doc.setTextColor(...IVORY);
  doc.text(["Guia de Lançamentos", "& Oportunidades"], W / 2, 110, { align: "center" });
  doc.setFont("times", "italic"); doc.setFontSize(18); doc.setTextColor(...GOLD);
  doc.text("Imobiliárias de Alto Padrão", W / 2, 140, { align: "center" });
  doc.line(70, 155, 140, 155);
  doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(...IVORY);
  doc.text("Seleção restrita · Edição " + new Date().getFullYear(), W / 2, 168, { align: "center" });
  doc.setFontSize(9); doc.setTextColor(...GOLD);
  doc.text(`Seu consultor: ${b.nome} · CRECI ${b.creci}`, W / 2, H - 40, { align: "center" });

  // Apresentação
  doc.addPage(); bg(); frame();
  doc.setFont("times", "bold"); doc.setFontSize(24); doc.setTextColor(...IVORY);
  doc.text("Uma curadoria para poucos", 20, 40);
  doc.setDrawColor(...GOLD); doc.line(20, 46, 60, 46);
  doc.setFont("helvetica", "normal"); doc.setFontSize(11); doc.setTextColor(...IVORY);
  doc.text(doc.splitTextToSize("Este guia reúne os empreendimentos mais desejados da região, selecionados pela equipe Venize Imóveis pelo potencial de valorização, localização e padrão construtivo. Nas próximas páginas você encontra perfil das unidades, faixas de preço de referência e condições de lançamento. Os valores são de referência e podem variar conforme disponibilidade — fale com seu consultor para uma apresentação personalizada.", 170), 20, 60, { lineHeightFactor: 1.6 });
  footer(2);

  // Empreendimentos
  EMPREENDIMENTOS.forEach((e, i) => {
    doc.addPage(); bg(); frame();
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...GOLD);
    doc.text(e.status.toUpperCase(), 20, 36);
    doc.setFont("times", "bold"); doc.setFontSize(28); doc.setTextColor(...IVORY);
    doc.text(e.nome, 20, 50);
    doc.setDrawColor(...GOLD); doc.line(20, 56, 60, 56);
    doc.setFont("helvetica", "normal"); doc.setFontSize(11);
    doc.text(doc.splitTextToSize(e.desc, 170), 20, 70, { lineHeightFactor: 1.6 });
    const rows: [string, string][] = [["Tipologia", e.tipo], ["Área privativa", e.area], ["Faixa de preço", e.preco], ["Condição de lançamento", "Entrada facilitada e tabela especial"]];
    rows.forEach(([k, v], r) => {
      const y = 105 + r * 18;
      doc.setDrawColor(...GOLD); doc.setLineWidth(0.15); doc.line(20, y + 6, 190, y + 6);
      doc.setFontSize(9); doc.setTextColor(...GOLD); doc.text(k.toUpperCase(), 20, y);
      doc.setFontSize(12); doc.setTextColor(...IVORY); doc.text(v, 190, y, { align: "right" });
    });
    doc.setDrawColor(...GOLD); doc.setLineWidth(0.3); doc.rect(20, 190, 170, 50);
    doc.setFont("times", "italic"); doc.setFontSize(13); doc.setTextColor(...GOLD);
    doc.text("Plantas disponíveis mediante apresentação", W / 2, 218, { align: "center" });
    footer(3 + i);
  });

  // Contato
  doc.addPage(); bg(); frame();
  doc.setFont("times", "bold"); doc.setFontSize(26); doc.setTextColor(...IVORY);
  doc.text("Agende sua apresentação", W / 2, 110, { align: "center" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(12); doc.setTextColor(...GOLD);
  doc.text(`${b.nome} · CRECI ${b.creci}`, W / 2, 130, { align: "center" });
  doc.setTextColor(...IVORY);
  doc.text(`WhatsApp: ${b.tel}   ·   ${b.email}`, W / 2, 142, { align: "center" });
  doc.text("venizeimoveis.com.br", W / 2, 154, { align: "center" });
  footer(6);

  doc.save("Guia_Lancamentos_Venize_Imoveis.pdf");
}
