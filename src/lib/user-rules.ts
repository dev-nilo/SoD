export type UserRole = "admin" | "user";

export const USER_ROLES: UserRole[] = ["admin", "user"];

export type Permission = "manage-users" | "edit-catalog" | "edit-sod-curation" | "view-all-activity";

/**
 * Plain users run the analyses (Validador, SoD, Comparador) and read the
 * reference data; everything that changes what *other* users' analyses see
 * — users, the VAR catalog, the SoD curation — is admin-only.
 */
export function can(role: UserRole, _permission: Permission): boolean {
  return role === "admin";
}

export function isUserRole(value: unknown): value is UserRole {
  return USER_ROLES.includes(value as UserRole);
}

export const MIN_PASSWORD_LENGTH = 8;

export function validateNewPassword(password: string): string | null {
  return password.length < MIN_PASSWORD_LENGTH
    ? `A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`
    : null;
}

export interface NewUserInput {
  username: string;
  fullName: string;
  password: string;
  role: string;
}

/** Returns a pt-BR error message, or null when the input is acceptable. */
export function validateNewUser(input: NewUserInput): string | null {
  if (!/^[a-z0-9._-]{3,40}$/.test(input.username)) {
    return "Nome de usuário inválido: use 3 a 40 caracteres minúsculos, números, ponto, hífen ou sublinhado.";
  }
  if (!input.fullName.trim()) return "Informe o nome completo.";
  if (!isUserRole(input.role)) return "Perfil de acesso inválido.";
  return validateNewPassword(input.password);
}

export interface UserStanding {
  id: number;
  role: UserRole;
  active: boolean;
}

export type UserChange = { role?: UserRole; active?: boolean } | "delete";

/**
 * Guards the two ways an admin can lock everyone out: changing their own
 * standing, or taking away the last active admin. Returns a pt-BR error
 * message, or null when the change is allowed.
 */
export function checkUserChange(
  actor: { id: number },
  target: UserStanding,
  change: UserChange,
  allUsers: UserStanding[]
): string | null {
  const removesStanding =
    change === "delete" || change.active === false || (change.role !== undefined && change.role !== "admin");
  if (!removesStanding) return null;

  if (actor.id === target.id) {
    return "Você não pode desativar, rebaixar ou excluir a sua própria conta.";
  }

  const targetIsActiveAdmin = target.role === "admin" && target.active;
  const otherActiveAdmins = allUsers.filter((u) => u.id !== target.id && u.role === "admin" && u.active);
  if (targetIsActiveAdmin && otherActiveAdmins.length === 0) {
    return "Não é possível remover o último administrador ativo.";
  }
  return null;
}
