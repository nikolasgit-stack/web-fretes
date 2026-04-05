const DEFAULT_API_URL = 'http://localhost:3001/api';

export function resolveApiBaseUrl(input?: string): string {
  const configured = (input ?? '').trim();

  if (/^https?:\/\//i.test(configured)) {
    return configured.replace(/\/$/, '');
  }

  return DEFAULT_API_URL;
}
