"""Builds public/ebook/guia-venize.pdf from images in /tmp/eb/img (see README note in AGENTS.md).
Last page leaves the broker box empty; the app stamps the broker's details at download time."""
import os
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader

IMG = "/tmp/eb/img"
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "ebook", "guia-venize.pdf")
F = "/usr/share/fonts/truetype/"
pdfmetrics.registerFont(TTFont("Sans", F + "DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("SansB", F + "DejaVuSans-Bold.ttf"))
pdfmetrics.registerFont(TTFont("Serif", F + "DejaVuSerif.ttf"))
pdfmetrics.registerFont(TTFont("SerifB", F + "DejaVuSerif-Bold.ttf"))
pdfmetrics.registerFont(TTFont("SerifI", F + "DejaVuSerif-Italic.ttf"))

W, H = A4
GOLD = (197/255, 160/255, 89/255); DARK = (15/255, 17/255, 21/255); IVORY = (240/255, 234/255, 220/255); MUTED = (170/255, 165/255, 152/255)
M = 42
c = canvas.Canvas(OUT, pagesize=A4)
c.setTitle("Guia de Lançamentos & Oportunidades · Venize Imóveis"); c.setAuthor("Venize Imóveis")
page_no = [0]

def bg():
    c.setFillColorRGB(*DARK); c.rect(0, 0, W, H, fill=1, stroke=0)

_n = [0]
def _jpg(im):
    im.thumbnail((1400, 1400)); _n[0] += 1
    path = f"/tmp/eb/_c{_n[0]}.jpg"; im.save(path, quality=78, optimize=True); return path

def img(name, x, y, w, h, contain=False):
    im = Image.open(os.path.join(IMG, name)).convert("RGB")
    if not contain:
        r = w / h; iw, ih = im.size
        if iw / ih > r:
            nw = int(ih * r); l = (iw - nw) // 2; im = im.crop((l, 0, l + nw, ih))
        else:
            nh = int(iw / r); t = (ih - nh) // 2; im = im.crop((0, t, iw, t + nh))
        c.drawImage(_jpg(im), x, y, w, h)
    else:
        iw, ih = im.size; s = min(w / iw, h / ih); dw, dh = iw * s, ih * s
        c.drawImage(_jpg(im), x + (w - dw) / 2, y + (h - dh) / 2, dw, dh)

def text(s, x, y, font="Sans", size=10, color=IVORY, align="left"):
    c.setFont(font, size); c.setFillColorRGB(*color)
    {"left": c.drawString, "center": c.drawCentredString, "right": c.drawRightString}[align](x, y, s)

def para(s, x, y, w, font="Sans", size=10, color=IVORY, lead=1.55):
    c.setFont(font, size); c.setFillColorRGB(*color)
    for block in s.split("\n"):
        line = ""
        for word in block.split():
            t = (line + " " + word).strip()
            if pdfmetrics.stringWidth(t, font, size) > w:
                c.drawString(x, y, line); y -= size * lead; line = word
            else:
                line = t
        if line: c.drawString(x, y, line); y -= size * lead
        y -= size * 0.5
    return y

def rule(x, y, w=50):
    c.setStrokeColorRGB(*GOLD); c.setLineWidth(1); c.line(x, y, x + w, y)

def bullets(items, x, y, w, size=9.5):
    for it in items:
        c.setFillColorRGB(*GOLD); c.circle(x + 2, y + 3, 1.6, fill=1, stroke=0)
        y = para(it, x + 10, y, w - 10, size=size, lead=1.4) - 1
    return y

def footer():
    page_no[0] += 1
    c.setStrokeColorRGB(*GOLD); c.setLineWidth(0.3); c.line(M, 34, W - M, 34)
    text("VENIZE IMÓVEIS · House Oficial Unik Engenharia", M, 22, size=7, color=GOLD)
    text(str(page_no[0]), W - M, 22, size=7, color=GOLD, align="right")

def header(kicker, title, y=H - 70):
    text(kicker.upper(), M, y, "SansB", 8, GOLD)
    text(title, M, y - 30, "SerifB", 24)
    rule(M, y - 44)
    return y - 64

def specs(rows, x, y, w):
    for k, v in rows:
        text(k.upper(), x, y, "Sans", 7.5, GOLD); text(v, x + w, y, "Sans", 9.5, IVORY, "right")
        c.setStrokeColorRGB(*GOLD); c.setLineWidth(0.2); c.line(x, y - 6, x + w, y - 6); y -= 20
    return y

# 1 · Capa
bg(); img("hero.jpg", 0, H * 0.42, W, H * 0.58)
c.setFillColorRGB(*DARK); c.setFillAlpha(0.35); c.rect(0, H * 0.42, W, H * 0.58, fill=1, stroke=0); c.setFillAlpha(1)
text("V E N I Z E   I M Ó V E I S", W / 2, H - 60, "Serif", 11, GOLD, "center")
y = H * 0.42 - 70
text("Guia de Lançamentos", W / 2, y, "SerifB", 32, IVORY, "center")
text("& Oportunidades", W / 2, y - 40, "SerifB", 32, GOLD, "center")
rule(W / 2 - 40, y - 62, 80)
text("Sobradinho · Brasília/DF", W / 2, y - 86, "SerifI", 13, IVORY, "center")
text("Residencial Vento Serrano  ·  Residencial Torino  ·  Residencial Viverde", W / 2, y - 112, "Sans", 9, MUTED, "center")
text(f"Edição 2026 · Material exclusivo", W / 2, 60, "Sans", 8, GOLD, "center")
c.showPage()

# 2 · Quem somos
bg(); y = header("Quem somos", "A arte de viver bem")
y = para("A Venize Imóveis é uma imobiliária de bairro com padrão de grande incorporadora: proximidade real, informação clara e acompanhamento até a entrega das chaves. Fundada por Jamila Farias e Cyro Luiz, nasceu da união de experiências complementares e do propósito de oferecer um atendimento próximo, transparente e responsável.", M, y, W - 2 * M, size=10.5)
y = para("Somos a House Oficial da Unik Engenharia, atuando diretamente na apresentação e comercialização de seus empreendimentos em Sobradinho, além de imóveis de terceiros, vendas e locações.", M, y, W - 2 * M, size=10.5)
y -= 6
cards = [("Transparência total", "Valores, taxas e prazos apresentados por escrito antes de qualquer assinatura."),
         ("Especialistas na região", "Conhecimento profundo de Sobradinho e Sobradinho II: bloco, andar e posição solar."),
         ("Crédito descomplicado", "Análise de FGTS, subsídio, MCMV e CODHAB com simulação completa e gratuita."),
         ("Pós-venda presente", "Acompanhamento de documentação, obra e entrega das chaves.")]
cw = (W - 2 * M - 14) / 2
for i, (t, d) in enumerate(cards):
    x = M + (i % 2) * (cw + 14); yy = y - (i // 2) * 92
    c.setStrokeColorRGB(*GOLD); c.setLineWidth(0.4); c.roundRect(x, yy - 78, cw, 78, 6)
    text(t, x + 14, yy - 22, "SerifB", 12, GOLD); para(d, x + 14, yy - 40, cw - 28, size=8.8, lead=1.4)
y -= 200
text("A UNIK ENGENHARIA", M, y, "SansB", 8, GOLD)
img("vs_fachada.jpg", M, 60, W - 2 * M, 230)
para("Construtora e incorporadora de Brasília reconhecida por projetos diferenciados, qualidade construtiva e preços acessíveis, com atenção ao detalhe e ao cliente. Empreendimentos entregues incluem Tons do Cerrado, Residencial Sintonia e Residencial Marina. Stand de vendas: Quadra 02, Conjunto B4, Projeção B, Sobradinho/DF.", M, y - 18, W - 2 * M, size=9.5, color=MUTED)
footer(); c.showPage()

# 3 · Vento Serrano
bg(); img("vs_piscina.jpg", 0, H - 250, W, 250)
c.setFillColorRGB(*GOLD); c.roundRect(M, H - 60, 108, 20, 10, fill=1, stroke=0)
text("PRONTO PARA MORAR", M + 54, H - 53, "SansB", 7.5, DARK, "center")
y = H - 290
text("Residencial Vento Serrano", M, y, "SerifB", 26); rule(M, y - 14)
text("Quadra 02, Conjunto B4 · Sobradinho I · O ponto mais alto da cidade", M, y - 32, "SerifI", 10.5, GOLD)
y = para("O nome vem dos ventos frescos e suaves das regiões serranas, associados à tranquilidade e ao bem-estar. No ponto mais alto de Sobradinho I, com vista do nascer ao pôr do sol e fácil acesso às entradas e saídas da cidade, perto de transporte, escolas, academias e supermercados.", M, y - 56, W - 2 * M - 220, size=9.8)
specs([("Unidades", "78 apartamentos"), ("Tipologias", "2 e 3 quartos"), ("Área privativa", "76,10 a 98,50 m²"), ("Suíte", "1 em todas"), ("Vagas", "até 3, cobertas"), ("Elevadores", "2 por prumada"), ("Obra", "100% concluída"), ("A partir de", "R$ 761.000")], W - M - 200, H - 345, 200)
y = min(y, H - 520) - 10
text("O APARTAMENTO", M, y, "SansB", 8, GOLD)
bullets(["Todas as unidades com varanda; 3 quartos com lavabo", "Infraestrutura para ar-condicionado na sala e quartos", "Vidros laminados bronze com tratamento térmico", "Tratamento acústico entre apartamentos", "Bancadas em granito, ralos ocultos, fechadura eletrônica", "Medidores individualizados de água, energia e gás", "Aceita financiamento e FGTS"], M, y - 18, W - 2 * M)
footer(); c.showPage()

# 4 · Vento Serrano lazer
bg(); y = header("Residencial Vento Serrano", "Lazer completo para todas as idades")
gw = (W - 2 * M - 12) / 2; gh = 150
for i, n in enumerate(["vs_piscina.jpg", "vs_churras.jpg", "vs_academia.jpg", "vs_praca.jpg"]):
    img(n, M + (i % 2) * (gw + 12), y - gh - (i // 2) * (gh + 12), gw, gh)
y -= 2 * gh + 34
col = (W - 2 * M - 20) / 2
text("COBERTURA E PILOTIS", M, y, "SansB", 8, GOLD)
bullets(["Piscina com borda infinita e vista panorâmica", "Sauna e academia indoor e outdoor", "Churrasqueira gourmet", "Salão de festas com ilha gourmet, entregue mobiliado e equipado", "Salão de jogos com PlayStation ou Xbox", "Brinquedoteca, praça, playground e pet place"], M, y - 18, col, 9)
text("COMODIDADES", M + col + 20, y, "SansB", 8, GOLD)
bullets(["Bicicletário com 79 suportes e bike wash", "Clean car com recarga para carro elétrico", "Espaço delivery", "Acesso aos halls por biometria", "Laje maciça de 16 cm e normas ABNT de desempenho", "Patrimônio de afetação: mais segurança jurídica"], M + col + 20, y - 18, col, 9)
footer(); c.showPage()

# 5 · Vento Serrano plantas
bg(); y = header("Residencial Vento Serrano", "Plantas")
pw = (W - 2 * M - 14) / 2
for i, n in enumerate(["vs_planta1.jpg", "vs_planta2.jpg"]):
    c.setFillColorRGB(1, 1, 1); c.rect(M + i * (pw + 14), y - pw, pw, pw, fill=1, stroke=0)
    img(n, M + i * (pw + 14), y - pw, pw, pw, contain=True)
y -= pw + 26
img("vs_sala.jpg", M, y - 170, pw, 170); img("vs_quartos.jpg", M + pw + 14, y - 170, pw, 170)
text("Plantas e perspectivas ilustrativas. Consulte unidades disponíveis com seu consultor.", M, y - 192, "SerifI", 8.5, MUTED)
footer(); c.showPage()

# 6 · Torino
bg()
c.setFillColorRGB(*GOLD); c.roundRect(M, H - 60, 98, 20, 10, fill=1, stroke=0)
text("EM CONSTRUÇÃO", M + 49, H - 53, "SansB", 7.5, DARK, "center")
text("Residencial Torino", M, H - 100, "SerifB", 26); rule(M, H - 114)
text("Quadra 02, Conjunto C6, Projeção C · Sobradinho/DF", M, H - 132, "SerifI", 10.5, GOLD)
tw = (W - 2 * M - 16) / 3
for i, n in enumerate(["t_sala.jpg", "t_quarto.jpg", "t_quarto2.jpg"]):
    img(n, M + i * (tw + 8), H - 360, tw, 210)
y = H - 390
c.setStrokeColorRGB(*GOLD); c.setLineWidth(0.6); c.roundRect(M, y - 74, W - 2 * M, 74, 8)
text("ATÉ R$ 45 MIL EM BENEFÍCIOS", M + 16, y - 24, "SansB", 11, GOLD)
para("Para quem se enquadra nos critérios da CODHAB/GDF: subsídio para a entrada e benefício referente ao terreno. Renda familiar entre R$ 6 mil e R$ 13 mil? Consulte as condições.", M + 16, y - 42, W - 2 * M - 32, size=9, lead=1.4)
y -= 100
col = (W - 2 * M - 20) / 2
text("O APARTAMENTO · 44,06 m²", M, y, "SansB", 8, GOLD)
bullets(["2 quartos", "Varanda", "Sala de estar e jantar", "Cozinha com área de serviço", "Banheiro social", "Posição solar nascente"], M, y - 18, col)
text("O CONDOMÍNIO", M + col + 20, y, "SansB", 8, GOLD)
bullets(["4 elevadores", "Portaria", "Espaço para salão de festas", "Brinquedoteca", "Unidades com vaga de garagem (consulte)", "Comércio, escolas e serviços no entorno"], M + col + 20, y - 18, col)
text("A partir de R$ 320.000", M, 70, "SerifB", 16, GOLD)
text("Benefícios dependem do enquadramento nas regras da CODHAB/GDF e não são pagamento em dinheiro.", M, 52, "Sans", 6.8, MUTED)
footer(); c.showPage()

# 7 · Torino planta
bg(); y = header("Residencial Torino", "Planta de 44,06 m²")
c.setFillColorRGB(1, 1, 1); c.rect(M, y - 400, W - 2 * M, 400, fill=1, stroke=0)
img("t_planta.jpg", M, y - 400, W - 2 * M, 400, contain=True)
y -= 430
para("Projeto com ótimo aproveitamento: dois quartos, sala integrada à varanda, cozinha com área de serviço e banheiro social. Ideal para o primeiro imóvel ou para investir em uma região consolidada de Sobradinho.", M, y, W - 2 * M, size=10)
text("Perspectivas ilustrativas. Mobiliário e decoração não inclusos.", M, y - 60, "SerifI", 8.5, MUTED)
footer(); c.showPage()

# 8 · Viverde
bg(); img("viverde.jpg", 0, H - 330, W, 330)
c.setFillColorRGB(*GOLD); c.roundRect(M, H - 360, 112, 20, 10, fill=1, stroke=0)
text("BREVE LANÇAMENTO", M + 56, H - 353, "SansB", 7.5, DARK, "center")
text("Residencial Viverde", M, H - 400, "SerifB", 26); rule(M, H - 414)
text("Sobradinho II · Distrito Federal", M, H - 432, "SerifI", 10.5, GOLD)
y = para("Apartamentos de 1, 2 e 3 quartos com varanda e lazer completo em Sobradinho II. O novo lançamento da Venize Imóveis está chegando, e quem demonstra interesse antecipado é atendido em primeira mão, com acesso às primeiras unidades e condições de lançamento.", M, H - 462, W - 2 * M, size=10.5)
specs([("Tipologias", "1, 2 e 3 quartos"), ("Diferenciais", "Varanda e lazer completo"), ("Entrega prevista", "2029"), ("Valores", "Consulte")], M, y - 14, W - 2 * M)
c.setStrokeColorRGB(*GOLD); c.setLineWidth(0.6); c.roundRect(M, 70, W - 2 * M, 60, 8)
text("Garanta seu atendimento antecipado", W / 2, 106, "SerifB", 13, GOLD, "center")
text("Fale com seu consultor Venize e entre na lista de prioridade do lançamento.", W / 2, 88, "Sans", 9, IVORY, "center")
footer(); c.showPage()

# 9 · Como comprar
bg(); y = header("Passo a passo", "Como conquistar seu imóvel")
steps = [("1. Conversa inicial", "Entendemos seu momento, objetivos e faixa de investimento."),
         ("2. Simulação gratuita", "Analisamos FGTS, subsídios, Minha Casa Minha Vida e CODHAB, com simulação completa."),
         ("3. Visita ao empreendimento", "Apresentação no stand e na unidade: bloco, andar e posição solar."),
         ("4. Proposta transparente", "Valores, taxas e prazos por escrito antes de qualquer assinatura."),
         ("5. Crédito e documentação", "Acompanhamos a aprovação do financiamento e toda a papelada."),
         ("6. Entrega das chaves", "Pós-venda presente até você estar em casa.")]
for t, d in steps:
    text(t, M, y, "SerifB", 13, GOLD); y = para(d, M, y - 18, W - 2 * M, size=10) - 10
img("hero.jpg", M, 60, W - 2 * M, y - 80)
footer(); c.showPage()

# 10 · Contato (caixa do corretor preenchida pelo app)
bg()
text("V E N I Z E   I M Ó V E I S", W / 2, H - 120, "Serif", 11, GOLD, "center")
text("Agende sua apresentação", W / 2, H - 180, "SerifB", 26, IVORY, "center")
rule(W / 2 - 40, H - 198, 80)
c.setStrokeColorRGB(*GOLD); c.setLineWidth(0.6); c.roundRect(M + 40, H - 420, W - 2 * M - 80, 170, 10)
text("SEU CONSULTOR", W / 2, H - 278, "SansB", 8, GOLD, "center")
text("Venize Imóveis", W / 2, 260, "SerifB", 14, IVORY, "center")
text("(61) 99101-8368  ·  (61) 4042-9280", W / 2, 238, "Sans", 10, IVORY, "center")
text("contato@venizeimoveis.com.br  ·  venizeimoveis.com.br", W / 2, 220, "Sans", 10, IVORY, "center")
text("Stand Unik: Quadra 02, Conjunto B4, Projeção B · Sobradinho/DF", W / 2, 202, "Sans", 9, MUTED, "center")
para("Valores, condições e disponibilidade sujeitos a alteração sem aviso prévio. Imagens e plantas ilustrativas. Financiamento sujeito à aprovação de crédito. Informações reunidas dos sites oficiais da Venize Imóveis e da Unik Engenharia.", M + 30, 130, W - 2 * M - 60, size=7.5, color=MUTED, lead=1.4)
footer(); c.showPage()
c.save()
print("ok", OUT)
