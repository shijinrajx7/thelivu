import { describe, expect, it } from 'vitest';
import { analyzeSecurityArtifact } from '../src/lib/analyzers';

describe('defensive static API review', () => {
  it('flags request-derived SQL concatenation as a potential issue', () => {
    const result = analyzeSecurityArtifact("db.query('SELECT * FROM users WHERE id = ' + req.params.id)");
    expect(result.findings.some((finding) => finding.title === 'Potential unsafe SQL construction')).toBe(true);
  });
  it('flags unbounded numeric and unformatted IP-like OpenAPI fields', () => {
    const result = analyzeSecurityArtifact(JSON.stringify({ openapi: '3.1.0', paths: { '/users/{userId}': { get: { parameters: [{ in: 'path', name: 'userId', schema: { type: 'integer' } }, { in: 'query', name: 'clientIp', schema: { type: 'string' } }] } } } }));
    expect(result.findings.some((finding) => finding.title === 'Numeric input has no declared bounds')).toBe(true);
    expect(result.findings.some((finding) => finding.title === 'IP-like field lacks an explicit format')).toBe(true);
    expect(result.summary).toContain('no endpoint was contacted');
  });
});
