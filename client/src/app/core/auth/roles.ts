import { Role } from './session.model';

/**
 * Backend'deki Role enum'unun hiyerarşisinin birebir karşılığı (Security_Roadmap.md §4.1):
 * SUPERADMIN → ADMIN → USER ve SUPERADMIN → OWNER. OWNER, ADMIN/USER yetkilerini miras almaz.
 * Frontend'de sadece görünüm içindir (guard, düğmeleri gizleme); asıl kontrol backend'dedir.
 */
const IMPLIES: Record<Role, Role[]> = {
  SUPERADMIN: ['ADMIN', 'OWNER'],
  ADMIN: ['USER'],
  OWNER: [],
  USER: [],
};

/** {@code role}, {@code required} rolünün yetkilerini taşıyor mu? */
export function hasRole(role: Role | null | undefined, required: Role): boolean {
  if (!role) {
    return false;
  }
  return role === required || IMPLIES[role].some((implied) => hasRole(implied, required));
}

/** Kullanıcının verebileceği roller; SUPERADMIN hiçbir zaman verilemez (UserServiceImpl ile aynı). */
export function assignableRoles(actor: Role | null | undefined): Role[] {
  switch (actor) {
    case 'SUPERADMIN':
      return ['USER', 'ADMIN', 'OWNER'];
    case 'ADMIN':
      return ['USER'];
    default:
      return [];
  }
}

/** Kullanıcı bu kullanıcıyı düzenleyebilir/silebilir mi? (ADMIN sadece USER'ları yönetir.) */
export function canManage(actor: Role | null | undefined, target: Role): boolean {
  return actor === 'SUPERADMIN' || (actor === 'ADMIN' && target === 'USER');
}

export const ROLE_LABEL_KEYS: Record<Role, string> = {
  SUPERADMIN: 'role_superadmin',
  ADMIN: 'role_admin',
  OWNER: 'role_owner',
  USER: 'role_user',
};

export const ROLE_COLORS: Record<Role, string> = {
  SUPERADMIN: 'red',
  ADMIN: 'gold',
  OWNER: 'purple',
  USER: 'blue',
};
