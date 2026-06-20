export const ADMIN_EMAIL = "kuretinamahsivaya7@gmail.com";

export function isAdminEmail(email?: string | null): boolean {
  return !!email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
