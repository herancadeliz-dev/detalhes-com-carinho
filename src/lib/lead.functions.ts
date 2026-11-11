import { createServerFn } from "@tanstack/react-start";
import { VENIZE } from "./card-utils";

type LeadInput = { nome: string; telefone: string; corretor: string; corretorNome: string };

export const sendLead = createServerFn({ method: "POST" })
  .inputValidator((d: LeadInput) => {
    const nome = String(d?.nome ?? "").trim().slice(0, 120);
    const telefone = String(d?.telefone ?? "").replace(/\D/g, "").slice(0, 13);
    if (nome.length < 3) throw new Error("Informe seu nome completo.");
    if (telefone.length < 10) throw new Error("Informe um WhatsApp válido.");
    return {
      nome,
      telefone,
      corretor: String(d?.corretor ?? "").slice(0, 40),
      corretorNome: String(d?.corretorNome ?? "").slice(0, 120),
    };
  })
  .handler(async ({ data }) => {
    const token = process.env.VENIZE_LEAD_TOKEN;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(VENIZE.leadEndpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        nome: data.nome,
        telefone: data.telefone,
        origem: "cartao_nfc",
        mensagem: "Download do E-book via Cartão NFC",
        corretor: data.corretor,
        corretor_nome: data.corretorNome,
      }),
    });
    if (!res.ok) throw new Error(`Falha no envio (${res.status})`);
    return { ok: true };
  });
