import { assignableRoles, canManage, hasRole } from './roles';

describe('roles', () => {
  it('follows the backend hierarchy: SUPERADMIN > ADMIN > USER and SUPERADMIN > OWNER', () => {
    expect(hasRole('SUPERADMIN', 'USER')).toBe(true);
    expect(hasRole('SUPERADMIN', 'OWNER')).toBe(true);
    expect(hasRole('ADMIN', 'USER')).toBe(true);
    expect(hasRole('ADMIN', 'OWNER')).toBe(false);
    expect(hasRole('OWNER', 'USER')).toBe(false);
    expect(hasRole('USER', 'ADMIN')).toBe(false);
    expect(hasRole(null, 'USER')).toBe(false);
  });

  it('never offers SUPERADMIN and lets ADMIN assign only USER', () => {
    expect(assignableRoles('SUPERADMIN')).toEqual(['USER', 'ADMIN', 'OWNER']);
    expect(assignableRoles('ADMIN')).toEqual(['USER']);
    expect(assignableRoles('OWNER')).toEqual([]);
  });

  it('lets ADMIN manage only USERs', () => {
    expect(canManage('ADMIN', 'USER')).toBe(true);
    expect(canManage('ADMIN', 'ADMIN')).toBe(false);
    expect(canManage('ADMIN', 'OWNER')).toBe(false);
    expect(canManage('SUPERADMIN', 'ADMIN')).toBe(true);
    expect(canManage('USER', 'USER')).toBe(false);
  });
});
