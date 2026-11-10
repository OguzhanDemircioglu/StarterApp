import { homeFor } from './auth.guards';
import { isStaff, roleKey } from './roles';

describe('roles', () => {
  it('treats ADMIN and SUPERADMIN as staff, never USER', () => {
    expect(isStaff('SUPERADMIN')).toBe(true);
    expect(isStaff('ADMIN')).toBe(true);
    expect(isStaff('USER')).toBe(false);
    expect(isStaff(undefined)).toBe(false);
  });

  it('sends staff to the admin panel and graduates to the portal', () => {
    expect(homeFor('SUPERADMIN')).toBe('/admin');
    expect(homeFor('ADMIN')).toBe('/admin');
    expect(homeFor('USER')).toBe('/user');
  });

  it('builds translation keys from the role', () => {
    expect(roleKey('SUPERADMIN')).toBe('role_superadmin');
    expect(roleKey('USER')).toBe('role_user');
  });
});
