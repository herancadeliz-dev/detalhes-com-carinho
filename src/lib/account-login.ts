export function normalizeLogin(login: string) {
  const normalized = login.trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9._-]{2,39}$/.test(normalized)) {
    throw new Error("Use de 3 a 40 letras, números, pontos, hífens ou sublinhados no usuário.");
  }
  return normalized;
}

export function loginEmail(login: string) {
  const value = login.trim();
  return value.includes("@") ? value.toLowerCase() : `${normalizeLogin(value)}@usuarios.venize.invalid`;
}