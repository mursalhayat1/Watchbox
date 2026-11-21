const PROVIDER_ORIGINS = new Set([
  'https://nxsha.space',
  'https://screenscape.me',
  'https://cinextream.cc',
  'https://vidbolt.pro',
]);

const APPROVED_EXTERNAL_ORIGINS = new Set([
  ...PROVIDER_ORIGINS,
  'https://www.themoviedb.org',
  'https://www.imdb.com',
  'https://www.youtube.com',
  'https://chatgpt.com',
  'https://claude.ai',
]);

const authorizedExternalLinks = new WeakMap<HTMLAnchorElement, string>();
const authorizedPopupDestinations = new Set<string>();

function parseUrl(candidate: unknown, baseHref?: string): URL | null {
  if (typeof candidate !== 'string' && !(candidate instanceof URL)) return null;
  const raw = String(candidate);
  if (!raw || raw !== raw.trim() || /[\u0000-\u001f\u007f]/.test(raw)) return null;
  try {
    const url = baseHref ? new URL(raw, baseHref) : new URL(raw);
    if (url.username || url.password) return null;
    return url;
  } catch {
    return null;
  }
}

export function validateProviderUrl(candidate: string): string | null {
  const url = parseUrl(candidate);
  if (!url || url.protocol !== 'https:' || !PROVIDER_ORIGINS.has(url.origin)) return null;
  return url.href;
}

export function validateNavigationUrl(
  candidate: unknown,
  baseHref = window.location.href,
): URL | null {
  const url = parseUrl(candidate, baseHref);
  if (!url) return null;
  const base = parseUrl(baseHref);
  if (!base) return null;

  if (url.origin === base.origin && (url.protocol === 'https:' || url.protocol === 'http:')) {
    return url;
  }
  if (url.protocol === 'https:' && APPROVED_EXTERNAL_ORIGINS.has(url.origin)) return url;
  return null;
}

export function validateExplicitHttpsUrl(candidate: unknown): string | null {
  const url = parseUrl(candidate);
  return url?.protocol === 'https:' ? url.href : null;
}

export function authorizePopupDestination(candidate: unknown): boolean {
  const safeUrl = validateNavigationUrl(candidate);
  if (!safeUrl) return false;
  authorizedPopupDestinations.add(safeUrl.href);
  return true;
}

export function authorizeExternalLink(
  anchor: HTMLAnchorElement | null,
  destination: string | null,
): void {
  if (!anchor) return;
  if (!destination) {
    authorizedExternalLinks.delete(anchor);
    return;
  }
  const safeDestination = validateExplicitHttpsUrl(destination);
  const currentHref = validateExplicitHttpsUrl(anchor.href);
  if (safeDestination && currentHref === safeDestination) {
    authorizedExternalLinks.set(anchor, safeDestination);
  }
}

function hasExplicitAuthorization(anchor: HTMLAnchorElement): boolean {
  return authorizedExternalLinks.get(anchor) === anchor.href;
}

function secureAnchor(anchor: HTMLAnchorElement): void {
  const destination = anchor.getAttribute('href');
  const safeUrl = validateNavigationUrl(destination);
  if (!safeUrl && !hasExplicitAuthorization(anchor)) {
    anchor.removeAttribute('href');
    anchor.removeAttribute('target');
    return;
  }
  if (anchor.target.toLowerCase() === '_blank') {
    if (!anchor.relList.contains('noopener')) anchor.relList.add('noopener');
    if (!anchor.relList.contains('noreferrer')) anchor.relList.add('noreferrer');
  }
}

function addNoOpener(features: string | undefined): string {
  const tokens = (features ?? '')
    .split(',')
    .map(token => token.trim())
    .filter(token => token && !/^noopener(?:=|$)/i.test(token) && !/^noreferrer(?:=|$)/i.test(token));
  tokens.push('noopener', 'noreferrer');
  return tokens.join(',');
}

export function installNavigationProtection(): () => void {
  const originalOpen = window.open;
  const originalOpenDescriptor = Object.getOwnPropertyDescriptor(window, 'open');
  const guardedOpen: typeof window.open = (candidate, target, features) => {
    const safeUrl = validateNavigationUrl(candidate);
    const selfNavigation = target?.toLowerCase() === '_self';
    const authorizedPopup = safeUrl ? authorizedPopupDestinations.delete(safeUrl.href) : false;
    const sameOriginSelfNavigation = safeUrl?.origin === window.location.origin && selfNavigation;
    if (!safeUrl || (!sameOriginSelfNavigation && !authorizedPopup)) {
      console.warn('WatchBox blocked an untrusted popup destination.');
      return null;
    }
    return originalOpen.call(
      window,
      safeUrl.href,
      target,
      target?.toLowerCase() === '_self' ? features : addNoOpener(features),
    );
  };

  const secureTree = (node: Node) => {
    if (node instanceof HTMLAnchorElement) secureAnchor(node);
    if (node instanceof Element) {
      node.querySelectorAll<HTMLAnchorElement>('a[href]').forEach(secureAnchor);
    }
  };

  const handleClick = (event: MouseEvent) => {
    if (!(event.target instanceof Element)) return;
    const anchor = event.target.closest<HTMLAnchorElement>('a[href]');
    if (!anchor) return;
    const safeUrl = validateNavigationUrl(anchor.getAttribute('href'));
    if (safeUrl || (event.isTrusted && hasExplicitAuthorization(anchor))) {
      if (anchor.target.toLowerCase() === '_blank') {
        if (!anchor.relList.contains('noopener')) anchor.relList.add('noopener');
        if (!anchor.relList.contains('noreferrer')) anchor.relList.add('noreferrer');
      }
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    console.warn('WatchBox blocked an untrusted navigation destination.');
  };

  Object.defineProperty(window, 'open', {
    configurable: true,
    writable: true,
    value: guardedOpen,
  });
  document.addEventListener('click', handleClick, true);
  secureTree(document.documentElement);

  const observer = new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'attributes' && record.target instanceof HTMLAnchorElement) {
        secureAnchor(record.target);
      }
      record.addedNodes.forEach(secureTree);
    }
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['href', 'rel', 'target'],
    childList: true,
    subtree: true,
  });

  return () => {
    observer.disconnect();
    document.removeEventListener('click', handleClick, true);
    if (window.open === guardedOpen) {
      if (originalOpenDescriptor) {
        Object.defineProperty(window, 'open', originalOpenDescriptor);
      } else {
        delete (window as Partial<Window>).open;
      }
    }
  };
}

export function validateRegisteredRedirect(value: string, registeredUri: string): string | null {
  const url = parseUrl(value);
  const registered = parseUrl(registeredUri);
  if (!url || !registered) return null;
  const scheme = url.protocol.slice(0, -1).toLowerCase();
  const safeCustomScheme = /^[a-z][a-z0-9+.-]*$/.test(scheme)
    && !['about', 'blob', 'data', 'file', 'ftp', 'ftps', 'javascript', 'mailto', 'sms', 'tel', 'vbscript', 'ws', 'wss'].includes(scheme);
  const safeTransport = url.protocol === 'https:'
    || (url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))
    || safeCustomScheme;
  if (!safeTransport) return null;
  if (url.protocol !== registered.protocol || url.host !== registered.host || url.pathname !== registered.pathname) return null;
  if (!url.searchParams.has('code') && !url.searchParams.has('error')) return null;
  return url.href;
}
