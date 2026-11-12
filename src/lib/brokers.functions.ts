import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type PublicBroker = { slug: string; nome: string; creci: string; tel: string; email: string; foto_url: string | null };

export const getBrokerBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => ({ slug: String(input.slug ?? "").trim().toLowerCase().slice(0, 80) }))
  .handler(async ({ data }): Promise<PublicBroker | null> => {
    if (!data.slug) return null;
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const sb = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });
    const { data: row, error } = await sb
      .from("brokers")
      .select("slug, nome, creci, tel, email, foto_url")
      .eq("slug", data.slug)
      .eq("ativo", true)
      .maybeSingle();
    if (error) console.error("getBrokerBySlug", error.message);
    return row ?? null;
  });
