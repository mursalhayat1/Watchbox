import { afterEach, describe, expect, it, vi } from 'vitest';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  authorizePopupDestination,
  authorizeExternalLink,
  installNavigationProtection,
  validateExplicitHttpsUrl,
  validateNavigationUrl,
  validateProviderUrl,
  validateRegisteredRedirect,
} from '../src/lib/navigation-security';
import { safeAppPath } from '../src/lib/safe-return-path';
import { BASIC_SECURITY_HEADERS, CONTENT_SECURITY_POLICY } from '../server/security-headers';

const vercelConfig = JSON.parse(
  readFileSync(join(process.cwd(), 'vercel.json'), 'utf8'),
) as { headers: Array<{ source: string; headers: Array<{ key: string; value: string }> }> };

let uninstallProtection: (() => void) | undefined;

afterEach(() => {
  uninstallProtection?.();
  uninstallProtection = undefined;
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe('navigation URL validation', () => {
  it('only accepts HTTPS URLs from exact approved provider origins', () => {
    expect(validateProviderUrl('https://vidbolt.pro/movie/550')).toBe('https://vidbolt.pro/movie/550');
    expect(validateProviderUrl('https://vidbolt.pro.attacker.example/movie/550')).toBeNull();
    expect(validateProviderUrl('http://vidbolt.pro/movie/550')).toBeNull();
    expect(validateProviderUrl('javascript:alert(1)')).toBeNull();
    expect(validateProviderUrl('data:text/html,hi')).toBeNull();
  });

  it('allows same-origin and explicitly approved external navigation only', () => {
    const base = 'https://watchbox.example/detail/movie/550';
    expect(validateNavigationUrl('/library', base)?.href)
      .toBe('https://watchbox.example/library');
    expect(validateNavigationUrl('https://www.imdb.com/title/tt123', base)?.origin)
      .toBe('https://www.imdb.com');
    expect(validateNavigationUrl('https://attacker.example', base)).toBeNull();
    expect(validateNavigationUrl('javascript:alert(1)', base)).toBeNull();
    expect(validateNavigationUrl('http://attacker.example', base)).toBeNull();
  });

  it('permits explicit HTTPS destinations only when tied to an app-authorized link', () => {
    const destination = validateExplicitHttpsUrl('https://film-maker.example/');
    expect(destination).toBe('https://film-maker.example/');
    expect(validateExplicitHttpsUrl('http://film-maker.example/')).toBeNull();
    expect(validateExplicitHttpsUrl('javascript:alert(1)')).toBeNull();

    const anchor = document.createElement('a');
    anchor.href = destination!;
    anchor.target = '_blank';
    authorizeExternalLink(anchor, destination);
    document.body.append(anchor);

    uninstallProtection = installNavigationProtection();
    expect(anchor.getAttribute('href')).toBe(destination);
    expect(anchor.relList.contains('noopener')).toBe(true);
    expect(anchor.relList.contains('noreferrer')).toBe(true);
  });

  it('rejects redirects outside the exact registered callback', () => {
    expect(validateRegisteredRedirect(
      'https://client.example/callback?code=abc',
      'https://client.example/callback',
    )).toBe('https://client.example/callback?code=abc');
    expect(validateRegisteredRedirect(
      'https://attacker.example/callback?code=abc',
      'https://client.example/callback',
    )).toBeNull();
    expect(validateRegisteredRedirect(
      'javascript:alert(1)?code=abc',
      'javascript:alert(1)',
    )).toBeNull();
    expect(validateRegisteredRedirect(
      'ftp://client.example/callback?code=abc',
      'ftp://client.example/callback',
    )).toBeNull();
  });

  it('keeps app return paths same-origin', () => {
    expect(safeAppPath('/library?tab=movies')).toBe('/library?tab=movies');
    expect(safeAppPath('//attacker.example')).toBeNull();
    expect(safeAppPath('https://attacker.example')).toBeNull();
    expect(safeAppPath('/\\attacker.example')).toBeNull();
  });
});

describe('security headers', () => {
  it('keeps the Vercel and custom-server CSPs aligned and permits provider frames', () => {
    const header = vercelConfig.headers[0];
    const vercelPolicy = header.headers.find(item => item.key === 'Content-Security-Policy')?.value;
    expect(header.source).toBe('/(.*)');
    expect(vercelPolicy).toBe(CONTENT_SECURITY_POLICY);
    expect(header.headers.find(item => item.key === 'Referrer-Policy')?.value).toBe('strict-origin');
    expect(header.headers.find(item => item.key === 'X-Content-Type-Options')?.value).toBe('nosniff');
    expect(header.headers.find(item => item.key === 'Strict-Transport-Security')?.value)
      .toBe('max-age=31536000; includeSubDomains');
    for (const origin of [
      'https://nxsha.space',
      'https://screenscape.me',
      'https://cinextream.cc',
      'https://vidbolt.pro',
      'https://www.youtube-nocookie.com',
    ]) {
      expect(CONTENT_SECURITY_POLICY).toContain(origin);
    }
    expect(CONTENT_SECURITY_POLICY).not.toContain("frame-src 'none'");
    expect(BASIC_SECURITY_HEADERS['X-Content-Type-Options']).toBe('nosniff');
    expect(BASIC_SECURITY_HEADERS['Referrer-Policy']).toBe('strict-origin');
  });

  it('allows only the exact inline script hash required by index.html', () => {
    const html = readFileSync(join(process.cwd(), 'index.html'), 'utf8');
    const inlineScripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
    expect(inlineScripts).toHaveLength(1);
    const normalized = inlineScripts[0][1].replace(/\r\n?/g, '\n');
    const digest = createHash('sha256').update(normalized).digest('base64');
    expect(CONTENT_SECURITY_POLICY).toContain(`'sha256-${digest}'`);
    expect(CONTENT_SECURITY_POLICY).not.toMatch(/script-src[^;]*'unsafe-inline'/);
    expect(html).not.toMatch(/<script\b[^>]*\son[a-z]+\s*=/i);
  });
});

describe('parent navigation protection', () => {
  it('blocks unsolicited popups and allows one-time authorized destinations', () => {
    const nativeOpen = vi.spyOn(window, 'open').mockReturnValue(null);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    uninstallProtection = installNavigationProtection();

    expect(window.open('https://attacker.example', '_blank')).toBeNull();
    expect(nativeOpen).not.toHaveBeenCalled();

    const youtubeUrl = 'https://www.youtube.com/watch?v=abc';
    expect(window.open(youtubeUrl, '_blank')).toBeNull();
    expect(nativeOpen).not.toHaveBeenCalled();

    expect(authorizePopupDestination(youtubeUrl)).toBe(true);
    window.open(youtubeUrl, '_blank');
    expect(nativeOpen).toHaveBeenCalledWith(
      youtubeUrl,
      '_blank',
      'noopener,noreferrer',
    );
    expect(window.open(youtubeUrl, '_blank')).toBeNull();
    expect(nativeOpen).toHaveBeenCalledTimes(1);
    expect(authorizePopupDestination('javascript:alert(1)')).toBe(false);
    window.open('/library', '_self');
    expect(nativeOpen).toHaveBeenLastCalledWith(
      new URL('/library', window.location.href).href,
      '_self',
      undefined,
    );
    expect(nativeOpen).toHaveBeenCalledTimes(2);
  });

  it('blocks dynamically inserted untrusted links and secures approved blank targets', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    uninstallProtection = installNavigationProtection();

    const malicious = document.createElement('a');
    malicious.href = 'https://attacker.example/ad';
    malicious.target = '_blank';
    malicious.textContent = 'Ad';
    document.body.append(malicious);

    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    malicious.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);

    const approved = document.createElement('a');
    approved.href = 'https://www.themoviedb.org/';
    approved.target = '_blank';
    document.body.append(approved);

    await new Promise(resolve => setTimeout(resolve, 0));
    expect(malicious.hasAttribute('href')).toBe(false);
    expect(malicious.hasAttribute('target')).toBe(false);
    expect(approved.relList.contains('noopener')).toBe(true);
    expect(approved.relList.contains('noreferrer')).toBe(true);
  });
});
