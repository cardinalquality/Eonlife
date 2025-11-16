/**
 * Sanitization and XSS Protection Utilities
 * Provides comprehensive HTML sanitization and XSS prevention
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitization profiles for different use cases
 */
export const SanitizationProfiles = {
  // Strict: No HTML allowed
  STRICT: {
    ALLOWED_TAGS: [] as string[],
    ALLOWED_ATTR: [] as string[],
    KEEP_CONTENT: true
  },

  // Basic: Only basic text formatting
  BASIC: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'p'],
    ALLOWED_ATTR: [] as string[]
  },

  // Standard: Common formatting and links
  STANDARD: {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'u', 'br', 'p',
      'a', 'span', 'div',
      'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['href', 'title', 'class', 'id']
  },

  // Rich: Full rich text editor support
  RICH: {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'u', 'br', 'p',
      'a', 'span', 'div',
      'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'code', 'pre',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'img', 'video', 'audio',
      'hr', 'sub', 'sup', 'mark'
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'class', 'id', 'style',
      'src', 'alt', 'width', 'height',
      'controls', 'autoplay', 'loop'
    ]
  }
};

/**
 * Sanitize HTML content
 */
export function sanitizeHtml(
  dirty: string,
  profile: keyof typeof SanitizationProfiles = 'STANDARD'
): string {
  const config = SanitizationProfiles[profile];

  return DOMPurify.sanitize(dirty, {
    ...config,
    // Additional security options
    SAFE_FOR_TEMPLATES: true,
    SAFE_FOR_XML: false,
    USE_PROFILES: { html: true },
    FORCE_BODY: false,
    SANITIZE_DOM: true,
    SANITIZE_NAMED_PROPS: true,
    // Remove any data: or javascript: URLs
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  });
}

/**
 * Sanitize user-generated content (strict)
 */
export function sanitizeUserContent(content: string): string {
  return sanitizeHtml(content, 'BASIC');
}

/**
 * Sanitize rich text content
 */
export function sanitizeRichText(content: string): string {
  return sanitizeHtml(content, 'RICH');
}

/**
 * Strip all HTML tags
 */
export function stripHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true
  });
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };

  return text.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char]);
}

/**
 * Unescape HTML entities
 */
export function unescapeHtml(text: string): string {
  const htmlUnescapeMap: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#x2F;': '/'
  };

  return text.replace(/&(?:amp|lt|gt|quot|#x27|#x2F);/g, (entity) => htmlUnescapeMap[entity]);
}

/**
 * Sanitize URL to prevent javascript: and data: attacks
 */
export function sanitizeUrl(url: string): string {
  const trimmedUrl = url.trim().toLowerCase();

  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'about:'];

  for (const protocol of dangerousProtocols) {
    if (trimmedUrl.startsWith(protocol)) {
      return 'about:blank';
    }
  }

  // Allow only http(s), mailto, tel
  const allowedProtocols = /^(https?:|mailto:|tel:|sms:|\/)/i;

  if (!allowedProtocols.test(trimmedUrl) && trimmedUrl.includes(':')) {
    return 'about:blank';
  }

  return url;
}

/**
 * Sanitize filename to prevent directory traversal
 */
export function sanitizeFilename(filename: string): string {
  // Remove path separators and null bytes
  let clean = filename.replace(/[/\\?\0\*:"|<>]/g, '');

  // Remove leading dots and spaces
  clean = clean.replace(/^[.\s]+/, '');

  // Limit length
  if (clean.length > 255) {
    const ext = clean.split('.').pop() || '';
    const name = clean.substring(0, 255 - ext.length - 1);
    clean = `${name}.${ext}`;
  }

  // If filename is now empty, use default
  if (!clean) {
    clean = 'unnamed';
  }

  return clean;
}

/**
 * Sanitize SQL input (for use with raw queries - prefer parameterized queries)
 * NOTE: This is NOT a replacement for parameterized queries!
 */
export function sanitizeSqlInput(input: string): string {
  // This should ONLY be used as a last resort
  // Always prefer parameterized queries
  console.warn('sanitizeSqlInput used - prefer parameterized queries instead');

  return input
    .replace(/'/g, "''") // Escape single quotes
    .replace(/;/g, '') // Remove semicolons
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove block comments
    .replace(/\*\//g, '');
}

/**
 * Prevent NoSQL injection for MongoDB-like queries
 */
export function sanitizeNoSqlInput(input: any): any {
  if (typeof input === 'string') {
    return input;
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeNoSqlInput);
  }

  if (input !== null && typeof input === 'object') {
    // Remove operators that start with $
    const sanitized: any = {};
    for (const key in input) {
      if (!key.startsWith('$')) {
        sanitized[key] = sanitizeNoSqlInput(input[key]);
      }
    }
    return sanitized;
  }

  return input;
}

/**
 * Sanitize JSON input
 */
export function sanitizeJson(input: string): any {
  try {
    const parsed = JSON.parse(input);
    return sanitizeNoSqlInput(parsed);
  } catch (error) {
    throw new Error('Invalid JSON input');
  }
}

/**
 * Sanitize command-line arguments to prevent command injection
 */
export function sanitizeCommandArg(arg: string): string {
  // Only allow alphanumeric, underscores, hyphens, and dots
  return arg.replace(/[^a-zA-Z0-9_.-]/g, '');
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim().replace(/[^\w@.+-]/g, '');
}

/**
 * Remove null bytes from string (prevents null byte injection)
 */
export function removeNullBytes(str: string): string {
  return str.replace(/\0/g, '');
}

/**
 * Sanitize CSV content to prevent CSV injection
 */
export function sanitizeCsvCell(cell: string): string {
  // Remove leading special characters that could cause CSV injection
  let sanitized = cell.replace(/^[=+\-@\t\r]/g, '');

  // Escape quotes
  sanitized = sanitized.replace(/"/g, '""');

  // Wrap in quotes if contains comma, newline, or quote
  if (/[,\n"]/.test(sanitized)) {
    sanitized = `"${sanitized}"`;
  }

  return sanitized;
}

/**
 * Comprehensive input sanitization
 */
export interface SanitizedInput {
  original: string;
  sanitized: string;
  wasModified: boolean;
  removedPatterns: string[];
}

/**
 * Sanitize input with detailed report
 */
export function sanitizeInput(
  input: string,
  options: {
    allowHtml?: boolean;
    htmlProfile?: keyof typeof SanitizationProfiles;
    maxLength?: number;
  } = {}
): SanitizedInput {
  const original = input;
  const removedPatterns: string[] = [];
  let sanitized = input;

  // Remove null bytes
  if (/\0/.test(sanitized)) {
    sanitized = removeNullBytes(sanitized);
    removedPatterns.push('null bytes');
  }

  // Sanitize HTML if needed
  if (options.allowHtml) {
    const htmlSanitized = sanitizeHtml(sanitized, options.htmlProfile);
    if (htmlSanitized !== sanitized) {
      removedPatterns.push('dangerous HTML');
    }
    sanitized = htmlSanitized;
  }

  // Trim whitespace
  sanitized = sanitized.trim();

  // Limit length
  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
    removedPatterns.push('excess length');
  }

  return {
    original,
    sanitized,
    wasModified: original !== sanitized,
    removedPatterns
  };
}
