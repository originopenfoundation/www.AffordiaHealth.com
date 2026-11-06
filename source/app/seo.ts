export const SITE_URL = 'https://affordiahealth.com';
export const SEO_UPDATED_AT = new Date('2026-10-15T00:00:00.000Z');

export function canonicalUrl(path = '/') {
  const cleanPath = path.replace(/^\/+|\/+$/g, '');
  const isFile = cleanPath.split('/').at(-1)?.includes('.') ?? false;
  const normalizedPath = path === '/' ? '/' : `/${cleanPath}${isFile ? '' : '/'}`;
  return new URL(normalizedPath, `${SITE_URL}/`).toString();
}
