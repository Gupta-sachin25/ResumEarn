import { URL } from 'url';

/**
 * Normalizes and strips tracking parameters from application URLs.
 */
export const normalizeUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return '';

  try {
    let formatted = rawUrl.trim();
    if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      formatted = 'https://' + formatted;
    }

    const parsed = new URL(formatted);
    // Remove typical tracking parameters
    const trackingParams = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'ref', 'source', 'fbclid', 'gclid', 'trk'
    ];
    trackingParams.forEach(param => parsed.searchParams.delete(param));

    // Lowercase host
    parsed.hostname = parsed.hostname.toLowerCase();

    // Remove trailing slash if path is not root
    let cleanUrl = parsed.toString();
    if (cleanUrl.endsWith('/') && parsed.pathname.length > 1) {
      cleanUrl = cleanUrl.slice(0, -1);
    }

    return cleanUrl;
  } catch (err) {
    return rawUrl.trim();
  }
};

/**
 * Validates whether an application URL is well-formed and active.
 */
export const validateJobUrl = async (url) => {
  try {
    const cleanUrl = normalizeUrl(url);
    const parsed = new URL(cleanUrl);

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { isValid: false, reason: 'Invalid protocol' };
    }

    // Try a quick HEAD request with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    try {
      const response = await fetch(cleanUrl, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      clearTimeout(timeoutId);

      // Status 200-399 or even 403 (some career sites block bots) is considered reachable
      const isReachable = response.status < 400 || response.status === 403;
      return {
        isValid: isReachable,
        statusCode: response.status,
        normalizedUrl: cleanUrl
      };
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      // If HEAD fails due to timeout or network block, allow if domain looks well-formed
      return {
        isValid: true,
        statusCode: null,
        normalizedUrl: cleanUrl,
        warning: 'Network probe timed out, but URL syntax is valid'
      };
    }
  } catch (err) {
    return { isValid: false, reason: 'Malformed URL' };
  }
};

