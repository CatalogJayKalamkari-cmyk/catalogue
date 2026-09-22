export const SUPER_ADMIN_EMAIL = 'pavan.pda6@gmail.com';

export function isSuperAdminEmail(email?: string | null): boolean {
  return email === SUPER_ADMIN_EMAIL;
}
