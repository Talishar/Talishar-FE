import { describe, it, expect } from 'vitest';
import { sanitizeHtml, escapeHtml } from '../sanitizeHtml';

describe('sanitizeHtml', () => {
  describe('basic sanitization', () => {
    it('should sanitize script tags', () => {
      const maliciousHtml = '<script>alert("XSS")</script>';
      const result = sanitizeHtml(maliciousHtml);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
    });

    it('should sanitize dangerous event handlers', () => {
      const maliciousHtml = '<div onclick="alert(\'XSS\')">Click me</div>';
      const result = sanitizeHtml(maliciousHtml);
      expect(result).not.toContain('onclick');
      expect(result).not.toContain('alert');
    });

    it('should preserve safe HTML tags', () => {
      const safeHtml = '<span style="color: red;">Safe content</span><b>Bold text</b>';
      const result = sanitizeHtml(safeHtml);
      expect(result).toContain('<span');
      expect(result).toContain('<b>');
      expect(result).toContain('Safe content');
      expect(result).toContain('Bold text');
    });

    it('should handle empty string', () => {
      const result = sanitizeHtml('');
      expect(result).toBe('');
    });

    it('should handle null/undefined input', () => {
      const result1 = sanitizeHtml(null as any);
      const result2 = sanitizeHtml(undefined as any);
      expect(result1).toBe('');
      expect(result2).toBe('');
    });
  });
});

describe('escapeHtml', () => {
  describe('basic escaping', () => {
    it('should escape HTML characters', () => {
      const text = '<script>alert("XSS")</script>';
      const result = escapeHtml(text);
      expect(result).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    });

    it('should escape all dangerous characters', () => {
      const text = 'Test < > " \' & characters';
      const result = escapeHtml(text);
      expect(result).toBe('Test &lt; &gt; &quot; &#39; &amp; characters');
    });

    it('should handle empty string', () => {
      const result = escapeHtml('');
      expect(result).toBe('');
    });

    it('should handle null/undefined input', () => {
      const result1 = escapeHtml(null as any);
      const result2 = escapeHtml(undefined as any);
      expect(result1).toBe('');
      expect(result2).toBe('');
    });
  });
});
