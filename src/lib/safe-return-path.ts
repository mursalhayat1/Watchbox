export function safeAppPath(candidate: string | null | undefined): string | null {
  if (!candidate || !candidate.startsWith('/') || candidate.startsWith('//') || candidate.includes('\\') || /[\u0000-\u001f]/.test(candidate)) {
    return null;
  }
  try {
    const url = new URL(candidate, 'https://watchbox.invalid');
    if (url.origin !== 'https://watchbox.invalid') return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function authCallbackUrl(returnTo: string | null | undefined): string {
  const safePath = safeAppPath(returnTo);
  const nestedReturn = safePath && safePath !== '/' ? `?next=${encodeURIComponent(safePath)}` : '';
  return `${window.location.origin}/auth/callback${nestedReturn}`;
}

export function loginUrlFor(returnTo: string | null | undefined): string {
  const safePath = safeAppPath(returnTo);
  return safePath ? `/login?next=${encodeURIComponent(safePath)}` : '/login';
}
