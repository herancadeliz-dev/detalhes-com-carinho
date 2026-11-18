import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdministrator, assertRoleChange } from "@/lib/account-permissions";
import { normalizeLogin, loginEmail } from "@/lib/account-login";

export const listAccounts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    assertAdministrator(data, error);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: users, error: userError } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const { data: roles, error: roleError } = await supabaseAdmin.from("user_roles").select("user_id, role");
    if (userError || roleError) throw new Error("Não foi possível carregar os usuários.");
    return users.users.map((user) => ({
      id: user.id,
      username: user.id === context.userId ? "Sua conta" : String(user.user_metadata?.["username"] ?? "Conta sem nome de usuário"),
      admin: roles?.some((role) => role.user_id === user.id && role.role === "admin") ?? false,
      self: user.id === context.userId,
    }));
  });

export const createAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ username: z.string().transform(normalizeLogin), password: z.string().min(8).max(128), admin: z.boolean() }))
  .handler(async ({ data, context }) => {
    const { data: admin, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    assertAdministrator(admin, error);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: result, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: loginEmail(data.username), password: data.password, email_confirm: true,
      user_metadata: { username: data.username },
    });
    if (createError || !result.user) throw new Error("Não foi possível criar a conta. Confira o usuário e a senha ou escolha outro usuário.");
    if (data.admin) {
      const { error: grantError } = await supabaseAdmin.from("user_roles").insert({ user_id: result.user.id, role: "admin" });
      if (grantError) {
        await supabaseAdmin.auth.admin.deleteUser(result.user.id);
        throw new Error("Não foi possível conceder acesso administrativo; a conta não foi mantida.");
      }
    }
    return { ok: true };
  });

export const changeAccountRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ userId: z.string().uuid(), admin: z.boolean() }))
  .handler(async ({ data, context }) => {
    const { data: admin, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    assertAdministrator(admin, error);
    assertRoleChange(context.userId, data.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = data.admin
      ? await supabaseAdmin.from("user_roles").upsert({ user_id: data.userId, role: "admin" }, { onConflict: "user_id,role" })
      : await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId).eq("role", "admin");
    if (result.error) throw new Error("Não foi possível alterar a permissão.");
    return { ok: true };
  });