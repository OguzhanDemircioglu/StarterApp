import { Role } from './session.model';

/**
 * Rollerin tek tanımı (backend: security/Role.java). SUPERADMIN, ADMIN'in bütün yetkilerini taşır;
 * ADMIN ve SUPERADMIN (yönetim) USER yetkisi taşımaz: portala giremez.
 */
export const ROLES: Role[] = ['SUPERADMIN', 'ADMIN', 'USER'];

/** Yönetim paneli kullanıcısı mı? */
export function isStaff(role: Role | undefined): boolean {
  return role === 'SUPERADMIN' || role === 'ADMIN';
}

/** Çeviri anahtarı: role_superadmin, role_admin, role_user */
export function roleKey(role: Role): string {
  return `role_${role.toLowerCase()}`;
}

/** Rol etiketinin rengi (nz-tag). */
export function roleColor(role: Role): string {
  return role === 'SUPERADMIN' ? 'red' : role === 'ADMIN' ? 'gold' : 'blue';
}
