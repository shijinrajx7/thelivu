import { describe, expect, it } from 'vitest';
import { analyzeMessage, analyzeWebsiteUrl, stripSensitiveUrl } from '../src/lib/analyzers';

describe('local URL analysis', () => {
  it('accepts HTTP and HTTPS URLs without fetching them', () => {
    const result = analyzeWebsiteUrl('https://example.com/path');
    expect(result.hostname).toBe('example.com');
    expect(result.record.coverage).toContain('Website content not fetched');
    expect(result.record.assessment).toBe('Inconclusive');
  });
  it('rejects non-web schemes', () => {
    expect(() => analyzeWebsiteUrl('javascript:alert(1)')).toThrow('Only HTTP and HTTPS URLs are accepted.');
  });
  it('removes query values from saved target references', () => {
    expect(stripSensitiveUrl('https://example.com/path?token=secret#fragment')).toBe('https://example.com/path');
  });
  it('flags a URL containing embedded credentials', () => {
    expect(analyzeWebsiteUrl('https://user:pass@example.com').record.assessment).toBe('High Risk');
  });
});

describe('message analysis', () => {
  it('detects credential and urgency indicators without transmitting text', () => {
    const result = analyzeMessage('URGENT: verify your password immediately at https://example.com');
    expect(result.findings.some((finding) => finding.title === 'Credential or verification-code request')).toBe(true);
    expect(result.findings.some((finding) => finding.title === 'Urgency or pressure')).toBe(true);
    expect(result.links).toEqual(['https://example.com']);
  });
});
