export function assertAdministrator(isAdmin: boolean | null, error?: unknown) {
  if (error || isAdmin !== true) throw new Error("Acesso restrito aos administradores.");
}

export function assertRoleChange(callerId: string, targetId: string) {
  if (callerId === targetId) throw new Error("Você não pode alterar sua própria permissão.");
}