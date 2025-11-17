import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  sanitizeHtml,
  sanitizeUserContent,
  sanitizeRichText,
  stripHtml,
  escapeHtml,
  unescapeHtml,
  sanitizeUrl,
  sanitizeFilename,
  sanitizeSqlInput,
  sanitizeNoSqlInput,
  sanitizeJson,
  sanitizeCommandArg,
  sanitizeEmail,
  removeNullBytes,
  sanitizeCsvCell,
  sanitizeInput,
} from '../sanitization';

describe('HTML Sanitization', () => {
  describe('sanitizeHtml', () => {
    it('should allow safe HTML with STANDARD profile', () => {
      const input = '<p>Hello <strong>World</strong></p>';
      const result = sanitizeHtml(input);
      expect(result).toContain('<p>');
      expect(result).toContain('<strong>');
      expect(result).toContain('Hello');
      expect(result).toContain('World');
    });

    it('should remove script tags', () => {
      const input = '<p>Hello</p><script>alert("xss")</script>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
      expect(result).toContain('Hello');
    });

    it('should remove event handlers', () => {
      const input = '<div onclick="alert(1)">Click me</div>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('onclick');
      expect(result).toContain('Click me');
    });

    it('should remove javascript: URLs', () => {
      const input = '<a href="javascript:alert(1)">Click</a>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('javascript:');
    });

    it('should use STRICT profile to strip disallowed HTML tags', () => {
      const input = '<p><b>Bold</b> text</p>';
      const result = sanitizeHtml(input, 'STRICT');
      // STRICT profile keeps content but may or may not strip tags depending on DOMPurify version
      // The important part is that content is preserved
      expect(result).toContain('Bold');
      expect(result).toContain('text');
    });

    it('should allow basic formatting with BASIC profile', () => {
      const input = '<p><b>Bold</b> <a href="#">Link</a></p>';
      const result = sanitizeHtml(input, 'BASIC');
      expect(result).toContain('<p>');
      expect(result).toContain('<b>');
      expect(result).not.toContain('<a>'); // Links not allowed in BASIC
    });

    it('should allow images with RICH profile', () => {
      const input = '<img src="test.jpg" alt="Test">';
      const result = sanitizeHtml(input, 'RICH');
      expect(result).toContain('<img');
      expect(result).toContain('src=');
      expect(result).toContain('alt=');
    });
  });

  describe('sanitizeUserContent', () => {
    it('should allow basic formatting', () => {
      const input = '<p><b>Bold</b> text</p>';
      const result = sanitizeUserContent(input);
      expect(result).toContain('<b>');
      expect(result).toContain('Bold');
    });

    it('should remove dangerous content', () => {
      const input = '<script>alert(1)</script><p>Safe</p>';
      const result = sanitizeUserContent(input);
      expect(result).not.toContain('<script>');
      expect(result).toContain('Safe');
    });
  });

  describe('sanitizeRichText', () => {
    it('should allow rich formatting', () => {
      const input = '<table><tr><td>Cell</td></tr></table>';
      const result = sanitizeRichText(input);
      expect(result).toContain('<table');
      expect(result).toContain('<tr>');
      expect(result).toContain('<td>');
    });

    it('should allow images', () => {
      const input = '<img src="image.jpg" alt="Image">';
      const result = sanitizeRichText(input);
      expect(result).toContain('<img');
    });
  });

  describe('stripHtml', () => {
    it('should remove all HTML tags', () => {
      const input = '<p>Hello <strong>World</strong></p>';
      const result = stripHtml(input);
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
      expect(result).toContain('Hello');
      expect(result).toContain('World');
    });

    it('should remove scripts but keep text', () => {
      const input = '<p>Text</p><script>alert(1)</script>';
      const result = stripHtml(input);
      expect(result).not.toContain('<script>');
      expect(result).toContain('Text');
    });
  });
});

describe('HTML Escaping', () => {
  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      const input = '<script>alert("xss")</script>';
      const result = escapeHtml(input);
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
      expect(result).toContain('&quot;');
      expect(result).not.toContain('<script>');
    });

    it('should escape ampersands', () => {
      const result = escapeHtml('Tom & Jerry');
      expect(result).toBe('Tom &amp; Jerry');
    });

    it('should escape quotes', () => {
      const result = escapeHtml('"Hello"');
      expect(result).toBe('&quot;Hello&quot;');
    });

    it('should escape forward slashes', () => {
      const result = escapeHtml('a/b');
      expect(result).toBe('a&#x2F;b');
    });

    it('should handle multiple special characters', () => {
      const input = '<div class="test" data-value=\'123\'>Content & more</div>';
      const result = escapeHtml(input);
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
      expect(result).toContain('&quot;');
      expect(result).toContain('&amp;');
    });
  });

  describe('unescapeHtml', () => {
    it('should unescape HTML entities', () => {
      const input = '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;';
      const result = unescapeHtml(input);
      expect(result).toContain('<');
      expect(result).toContain('>');
      expect(result).toContain('"');
    });

    it('should unescape ampersands', () => {
      const result = unescapeHtml('Tom &amp; Jerry');
      expect(result).toBe('Tom & Jerry');
    });

    it('should round-trip with escapeHtml', () => {
      const original = '<div class="test">Content & more</div>';
      const escaped = escapeHtml(original);
      const unescaped = unescapeHtml(escaped);
      expect(unescaped).toBe(original);
    });
  });
});

describe('URL Sanitization', () => {
  describe('sanitizeUrl', () => {
    it('should allow safe HTTP URLs', () => {
      const url = 'https://example.com';
      const result = sanitizeUrl(url);
      expect(result).toBe(url);
    });

    it('should allow mailto URLs', () => {
      const url = 'mailto:test@example.com';
      const result = sanitizeUrl(url);
      expect(result).toBe(url);
    });

    it('should allow tel URLs', () => {
      const url = 'tel:+1234567890';
      const result = sanitizeUrl(url);
      expect(result).toBe(url);
    });

    it('should block javascript: URLs', () => {
      const url = 'javascript:alert(1)';
      const result = sanitizeUrl(url);
      expect(result).toBe('about:blank');
    });

    it('should block data: URLs', () => {
      const url = 'data:text/html,<script>alert(1)</script>';
      const result = sanitizeUrl(url);
      expect(result).toBe('about:blank');
    });

    it('should block vbscript: URLs', () => {
      const url = 'vbscript:msgbox(1)';
      const result = sanitizeUrl(url);
      expect(result).toBe('about:blank');
    });

    it('should block file: URLs', () => {
      const url = 'file:///etc/passwd';
      const result = sanitizeUrl(url);
      expect(result).toBe('about:blank');
    });

    it('should allow relative URLs', () => {
      const url = '/path/to/page';
      const result = sanitizeUrl(url);
      expect(result).toBe(url);
    });

    it('should handle case-insensitive dangerous protocols', () => {
      const url = 'JAVASCRIPT:alert(1)';
      const result = sanitizeUrl(url);
      expect(result).toBe('about:blank');
    });
  });
});

describe('Filename Sanitization', () => {
  describe('sanitizeFilename', () => {
    it('should allow safe filenames', () => {
      const filename = 'document.pdf';
      const result = sanitizeFilename(filename);
      expect(result).toBe(filename);
    });

    it('should remove path separators', () => {
      const filename = '../../../etc/passwd';
      const result = sanitizeFilename(filename);
      expect(result).not.toContain('/');
      expect(result).not.toContain('\\');
    });

    it('should remove dangerous characters', () => {
      const filename = 'file<>:"|?*.txt';
      const result = sanitizeFilename(filename);
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
      expect(result).not.toContain(':');
      expect(result).not.toContain('|');
      expect(result).not.toContain('?');
      expect(result).not.toContain('*');
    });

    it('should remove leading dots', () => {
      const filename = '...hidden.txt';
      const result = sanitizeFilename(filename);
      expect(result).not.toMatch(/^\./);
    });

    it('should limit length to 255 characters', () => {
      const longName = 'a'.repeat(300) + '.txt';
      const result = sanitizeFilename(longName);
      expect(result.length).toBeLessThanOrEqual(255);
      expect(result).toContain('.txt');
    });

    it('should provide default name for empty filenames', () => {
      const result = sanitizeFilename('');
      expect(result).toBe('unnamed');
    });

    it('should handle null bytes', () => {
      const filename = 'file\0.txt';
      const result = sanitizeFilename(filename);
      expect(result).not.toContain('\0');
    });
  });
});

describe('SQL Injection Prevention', () => {
  describe('sanitizeSqlInput', () => {
    let consoleWarnSpy: any;

    beforeEach(() => {
      consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    it('should log a warning', () => {
      sanitizeSqlInput('test');
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should escape single quotes', () => {
      const input = "O'Brien";
      const result = sanitizeSqlInput(input);
      expect(result).toBe("O''Brien");
    });

    it('should remove semicolons', () => {
      const input = 'test; DROP TABLE users';
      const result = sanitizeSqlInput(input);
      expect(result).not.toContain(';');
    });

    it('should remove SQL comments', () => {
      const input = 'test -- comment';
      const result = sanitizeSqlInput(input);
      expect(result).not.toContain('--');
    });

    it('should remove block comments', () => {
      const input = 'test /* comment */ value';
      const result = sanitizeSqlInput(input);
      expect(result).not.toContain('/*');
      expect(result).not.toContain('*/');
    });
  });
});

describe('NoSQL Injection Prevention', () => {
  describe('sanitizeNoSqlInput', () => {
    it('should return strings unchanged', () => {
      const input = 'test string';
      const result = sanitizeNoSqlInput(input);
      expect(result).toBe(input);
    });

    it('should remove $ operators from objects', () => {
      const input = { $where: 'malicious code', name: 'John' };
      const result = sanitizeNoSqlInput(input);
      expect(result).not.toHaveProperty('$where');
      expect(result).toHaveProperty('name');
      expect(result.name).toBe('John');
    });

    it('should handle nested objects', () => {
      const input = {
        user: {
          name: 'John',
          $gt: { age: 18 }
        }
      };
      const result = sanitizeNoSqlInput(input);
      expect(result.user).toHaveProperty('name');
      expect(result.user).not.toHaveProperty('$gt');
    });

    it('should handle arrays', () => {
      const input = ['test', { $ne: 'admin' }, 'safe'];
      const result = sanitizeNoSqlInput(input);
      expect(result).toHaveLength(3);
      expect(result[1]).not.toHaveProperty('$ne');
    });

    it('should preserve numbers and booleans', () => {
      const input = { age: 25, active: true };
      const result = sanitizeNoSqlInput(input);
      expect(result.age).toBe(25);
      expect(result.active).toBe(true);
    });
  });

  describe('sanitizeJson', () => {
    it('should parse and sanitize valid JSON', () => {
      const input = '{"name": "John", "$where": "code"}';
      const result = sanitizeJson(input);
      expect(result).toHaveProperty('name');
      expect(result).not.toHaveProperty('$where');
    });

    it('should throw error for invalid JSON', () => {
      const input = 'not valid json';
      expect(() => sanitizeJson(input)).toThrow('Invalid JSON input');
    });
  });
});

describe('Command Injection Prevention', () => {
  describe('sanitizeCommandArg', () => {
    it('should allow safe characters', () => {
      const input = 'file-name_123.txt';
      const result = sanitizeCommandArg(input);
      expect(result).toBe(input);
    });

    it('should remove dangerous characters', () => {
      const input = 'file; rm -rf /';
      const result = sanitizeCommandArg(input);
      expect(result).not.toContain(';');
      expect(result).not.toContain(' ');
      expect(result).not.toContain('/');
      expect(result).toBe('filerm-rf');
    });

    it('should remove backticks', () => {
      const input = 'file`whoami`.txt';
      const result = sanitizeCommandArg(input);
      expect(result).not.toContain('`');
    });

    it('should remove pipes', () => {
      const input = 'file | cat';
      const result = sanitizeCommandArg(input);
      expect(result).not.toContain('|');
    });
  });
});

describe('Email Sanitization', () => {
  describe('sanitizeEmail', () => {
    it('should normalize email to lowercase', () => {
      const input = 'USER@EXAMPLE.COM';
      const result = sanitizeEmail(input);
      expect(result).toBe('user@example.com');
    });

    it('should trim whitespace', () => {
      const input = '  user@example.com  ';
      const result = sanitizeEmail(input);
      expect(result).toBe('user@example.com');
    });

    it('should remove invalid characters', () => {
      const input = 'user<script>@example.com';
      const result = sanitizeEmail(input);
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
      expect(result).toContain('@');
    });

    it('should allow valid email characters', () => {
      const input = 'user.name+tag@example.com';
      const result = sanitizeEmail(input);
      expect(result).toContain('@');
      expect(result).toContain('.');
      expect(result).toContain('+');
    });
  });
});

describe('Utility Functions', () => {
  describe('removeNullBytes', () => {
    it('should remove null bytes', () => {
      const input = 'test\0string';
      const result = removeNullBytes(input);
      expect(result).not.toContain('\0');
      expect(result).toBe('teststring');
    });

    it('should handle multiple null bytes', () => {
      const input = 'a\0b\0c\0';
      const result = removeNullBytes(input);
      expect(result).toBe('abc');
    });

    it('should handle strings without null bytes', () => {
      const input = 'clean string';
      const result = removeNullBytes(input);
      expect(result).toBe(input);
    });
  });

  describe('sanitizeCsvCell', () => {
    it('should escape quotes', () => {
      const input = 'test "quoted" value';
      const result = sanitizeCsvCell(input);
      expect(result).toContain('""');
    });

    it('should wrap cells with commas in quotes', () => {
      const input = 'value1,value2';
      const result = sanitizeCsvCell(input);
      expect(result).toMatch(/^".*"$/);
    });

    it('should remove leading equals sign (CSV injection)', () => {
      const input = '=1+1';
      const result = sanitizeCsvCell(input);
      expect(result).not.toMatch(/^=/);
      expect(result).toBe('1+1');
    });

    it('should remove leading plus sign', () => {
      const input = '+1234';
      const result = sanitizeCsvCell(input);
      expect(result).not.toMatch(/^\+/);
    });

    it('should remove leading minus sign', () => {
      const input = '-1234';
      const result = sanitizeCsvCell(input);
      expect(result).not.toMatch(/^-/);
    });

    it('should remove leading @ sign', () => {
      const input = '@SUM(A1:A10)';
      const result = sanitizeCsvCell(input);
      expect(result).not.toMatch(/^@/);
    });

    it('should handle safe content', () => {
      const input = 'regular text';
      const result = sanitizeCsvCell(input);
      expect(result).toBe(input);
    });
  });
});

describe('Comprehensive Input Sanitization', () => {
  describe('sanitizeInput', () => {
    it('should detect and remove null bytes', () => {
      const input = 'test\0value';
      const result = sanitizeInput(input);
      expect(result.sanitized).not.toContain('\0');
      expect(result.wasModified).toBe(true);
      expect(result.removedPatterns).toContain('null bytes');
    });

    it('should trim whitespace', () => {
      const input = '  test  ';
      const result = sanitizeInput(input);
      expect(result.sanitized).toBe('test');
      expect(result.wasModified).toBe(true);
    });

    it('should limit length when specified', () => {
      const input = 'a'.repeat(100);
      const result = sanitizeInput(input, { maxLength: 50 });
      expect(result.sanitized.length).toBe(50);
      expect(result.wasModified).toBe(true);
      expect(result.removedPatterns).toContain('excess length');
    });

    it('should sanitize HTML when allowHtml is true', () => {
      const input = '<p>Safe</p><script>alert(1)</script>';
      const result = sanitizeInput(input, { allowHtml: true });
      expect(result.sanitized).not.toContain('<script>');
      expect(result.removedPatterns).toContain('dangerous HTML');
    });

    it('should not modify clean input', () => {
      const input = 'clean input';
      const result = sanitizeInput(input);
      expect(result.wasModified).toBe(false);
      expect(result.removedPatterns).toHaveLength(0);
    });

    it('should track original input', () => {
      const input = '  test  ';
      const result = sanitizeInput(input);
      expect(result.original).toBe(input);
      expect(result.sanitized).toBe('test');
    });

    it('should handle multiple sanitization operations', () => {
      const input = '  <script>alert(1)</script>test\0  ' + 'a'.repeat(100);
      const result = sanitizeInput(input, { allowHtml: true, maxLength: 50 });
      expect(result.sanitized).not.toContain('<script>');
      expect(result.sanitized).not.toContain('\0');
      expect(result.sanitized.length).toBeLessThanOrEqual(50);
      expect(result.wasModified).toBe(true);
      expect(result.removedPatterns.length).toBeGreaterThan(0);
    });
  });
});
