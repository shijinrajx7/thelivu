import type { Assessment, Finding, ScanRecord } from './types';

const id = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export interface WebsiteAnalysis {
  record: ScanRecord;
  hostname: string;
  registrableEstimate: string;
  originalUrl: string;
}

function registrableEstimate(hostname: string): string {
  const labels = hostname.replace(/^\[|\]$/g, '').split('.').filter(Boolean);
  if (labels.length < 2) return hostname;
  const commonSecondLevel = new Set(['co.uk', 'org.uk', 'com.au', 'co.in', 'org.in', 'com.br', 'co.jp', 'com.sg']);
  const suffix2 = labels.slice(-2).join('.');
  return labels.slice(-(commonSecondLevel.has(suffix2) ? 3 : 2)).join('.');
}

export function stripSensitiveUrl(input: string): string {
  try {
    const url = new URL(input);
    url.search = '';
    url.hash = '';
    url.username = '';
    url.password = '';
    return url.toString().replace(/\/$/, '');
  } catch {
    return 'Website URL';
  }
}

export function analyzeWebsiteUrl(input: string): WebsiteAnalysis {
  const trimmed = input.trim();
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error('Enter a complete URL such as https://example.com.');
  }
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Only HTTP and HTTPS URLs are accepted.');
  if (!url.hostname || /[\s\\]/.test(url.hostname)) throw new Error('The URL host is not valid.');

  const hostname = url.hostname.toLowerCase();
  const labels = hostname.replace(/^\[|\]$/g, '').split('.').filter(Boolean);
  const findings: Finding[] = [];
  const add = (title: string, detail: string, severity: Finding['severity'], evidence?: string) => findings.push({ id: id(), title, detail, severity, evidence, source: 'Local URL structure check' });

  if (url.username || url.password) add('Credentials embedded in URL', 'The URL contains text before the host that can make the destination misleading. Verify the hostname carefully and avoid entering credentials on an untrusted page.', 'high', 'URL user-info component present');
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) || hostname.startsWith('[')) add('Address literal used as host', 'The destination uses a numeric IP address instead of a recognizable domain. This is not proof of harm, but it reduces useful domain identity and reputation context.', 'medium', 'Hostname is an IPv4/IPv6 literal');
  if (hostname.startsWith('xn--') || labels.some((part) => part.startsWith('xn--'))) add('Internationalized/punycode hostname', 'The hostname uses an encoded internationalized label. Compare the displayed characters with the real brand/domain before continuing.', 'medium', hostname);
  if (labels.length >= 5) add('Deep subdomain structure', `The host has ${labels.length} labels; nested subdomains can obscure the registered organization. Inspect the registrable-domain estimate carefully.`, 'low', hostname);
  if (hostname.includes('..') || /%2e|%40|%2f/i.test(trimmed)) add('Encoded or unusual URL characters', 'Encoded delimiters or repeated dots may be used to make a URL difficult to read. Decode and inspect it before opening.', 'medium', 'Encoded delimiter or repeated-dot indicator');

  const root = registrableEstimate(hostname);
  const brandDomains: Record<string, string> = { google: 'google.com', paypal: 'paypal.com', amazon: 'amazon.com', microsoft: 'microsoft.com', apple: 'apple.com', netflix: 'netflix.com', facebook: 'facebook.com', instagram: 'instagram.com' };
  const brandHit = Object.keys(brandDomains).find((brand) => hostname.includes(brand) && !hostname.endsWith(brandDomains[brand]));
  if (brandHit) add('Possible brand-name lookalike', `The hostname contains “${brandHit}” but does not end with the usual ${brandDomains[brandHit]} domain. This heuristic can be wrong; verify the exact registered domain.`, 'medium', hostname);

  const paramNames = [...url.searchParams.keys()].map((key) => key.toLowerCase());
  const riskyParams = paramNames.filter((key) => /^(redirect|redirect_uri|return|returnto|continue|next|url|target|token|session|auth|access_token)$/i.test(key));
  if (riskyParams.length) add('Sensitive or redirect-style parameters', 'The URL includes parameter names commonly used for redirects or session/authentication flows. Parameter names alone do not show that the site is malicious; avoid sharing private query values.', 'low', `${riskyParams.length} parameter name(s); values omitted`);
  if (/^https?:$/.test(url.protocol) && url.port && !['80', '443'].includes(url.port)) add('Non-standard web port', `The URL uses port ${url.port}. A non-standard port can be legitimate, but verify it was expected.`, 'low', `Port ${url.port}`);

  let assessment: Assessment = 'Inconclusive';
  if (findings.some((f) => f.severity === 'high')) assessment = 'High Risk';
  else if (findings.some((f) => f.severity === 'medium')) assessment = 'Suspicious';
  const safeUrl = stripSensitiveUrl(trimmed);
  const record: ScanRecord = {
    id: id(), type: 'website', label: safeUrl, assessment,
    summary: findings.length ? `${findings.length} local structural indicator(s); no reputation provider was queried.` : 'No structural warning was found locally; reputation, DNS, TLS, redirects and threat feeds were not checked.',
    checkedAt: new Date().toISOString(), findings,
    coverage: ['Local URL structure heuristics only', 'Threat reputation not checked', 'DNS/RDAP/TLS not checked', 'Website content not fetched', 'Redirects not followed'],
  };
  return { record, hostname, registrableEstimate: root, originalUrl: safeUrl };
}

interface MessageRule { label: string; pattern: RegExp; severity: Finding['severity']; explanation: string; }
const messageRules: MessageRule[] = [
  { label: 'Urgency or pressure', pattern: /\b(urgent|immediately|act now|within 24 hours|account will be (?:blocked|suspended)|last warning|final notice)\b/i, severity: 'medium', explanation: 'Pressure to act quickly can discourage independent verification.' },
  { label: 'Credential or verification-code request', pattern: /\b(password|one[- ]time password|\botp\b|verification code|pin code|login code)\b/i, severity: 'high', explanation: 'Unexpected requests for passwords, PINs, or one-time codes should be treated as highly sensitive.' },
  { label: 'Payment or gift-card request', pattern: /\b(gift card|crypto(?:currency)?|wire transfer|pay now|processing fee|payment required|bank details)\b/i, severity: 'medium', explanation: 'Unexpected payment instructions or unusual payment methods deserve verification through a separate trusted channel.' },
  { label: 'Impersonation or authority claim', pattern: /\b(we are (?:your )?(?:bank|support|security team)|government department|police officer|delivery partner|account security team)\b/i, severity: 'low', explanation: 'A sender can claim an official identity; confirm it using a contact method you already trust.' },
  { label: 'Threat or reward language', pattern: /\b(you have won|prize claim|legal action|arrest warrant|refund waiting|your parcel is held)\b/i, severity: 'medium', explanation: 'Threats and unexpected rewards are common social-engineering hooks.' },
];

export function analyzeMessage(text: string): { findings: Finding[]; links: string[]; assessment: Assessment } {
  const findings: Finding[] = [];
  for (const rule of messageRules) {
    const match = text.match(rule.pattern);
    if (match) findings.push({ id: id(), title: rule.label, detail: rule.explanation, severity: rule.severity, evidence: match[0], source: 'Local message-text heuristic' });
  }
  const links = [...new Set(text.match(/https?:\/\/[^\s<>"']+/gi) ?? [])].slice(0, 20);
  for (const link of links) {
    try {
      const parsed = new URL(link);
      if (parsed.hostname.startsWith('xn--') || parsed.hostname.split('.').some((part) => part.startsWith('xn--')) || /^\d{1,3}(\.\d{1,3}){3}$/.test(parsed.hostname)) {
        findings.push({ id: id(), title: 'Unusual link host', detail: 'This embedded link uses a numeric or punycode host. Do not open it until you have independently verified the destination.', severity: 'medium', evidence: parsed.hostname, source: 'Local link-structure check' });
      }
    } catch { /* malformed link remains visible for manual review */ }
  }
  if (links.length > 0) findings.push({ id: id(), title: `${links.length} embedded link${links.length === 1 ? '' : 's'}`, detail: 'A link in a message can hide its destination. Inspect the actual hostname before opening; these links were not fetched.', severity: 'info', evidence: links.map((link) => { try { return new URL(link).hostname; } catch { return 'Unparsed URL'; } }).join(', '), source: 'Local link extraction' });
  const assessment: Assessment = findings.some((f) => f.severity === 'high') ? 'High Risk' : findings.some((f) => f.severity === 'medium') ? 'Suspicious' : 'Inconclusive';
  return { findings, links, assessment };
}

export interface SecurityReviewResult { findings: Finding[]; summary: string; sourceKind: 'openapi' | 'code'; scannedLines: number; }
const keyOf = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, '');

function reviewOpenApi(spec: Record<string, unknown>): Finding[] {
  const findings: Finding[] = [];
  const paths = (spec.paths && typeof spec.paths === 'object' ? spec.paths : {}) as Record<string, unknown>;
  const components = (spec.components && typeof spec.components === 'object' ? spec.components : {}) as Record<string, unknown>;
  const securitySchemes = (components.securitySchemes && typeof components.securitySchemes === 'object' ? components.securitySchemes : {}) as Record<string, unknown>;
  const rootSecurity = Array.isArray(spec.security) && spec.security.length > 0;
  let operations = 0;
  let unconstrainedNumbers = 0;
  let unformattedAddresses = 0;
  const add = (title: string, detail: string, severity: Finding['severity'], evidence: string) => findings.push({ id: id(), title, detail, severity, evidence, source: 'Local OpenAPI schema review' });

  const walkSchema = (schema: unknown, path: string, depth = 0) => {
    if (!schema || typeof schema !== 'object' || depth > 8) return;
    const value = schema as Record<string, unknown>;
    const type = String(value.type ?? '').toLowerCase();
    const fields = value.properties && typeof value.properties === 'object' ? value.properties as Record<string, unknown> : {};
    for (const [name, child] of Object.entries(fields)) walkSchema(child, `${path}.${name}`, depth + 1);
    const normalized = keyOf(path.split('.').at(-1) ?? '');
    const addressLike = /(ipaddress|ipv4|ipv6|ipaddr|remoteaddr|clientip|networkaddress)/.test(normalized);
    const portLike = /(^|)(port|portnumber)$/.test(normalized);
    const numericLike = type === 'integer' || type === 'number' || /(count|offset|limit|page|size|id)$/.test(normalized);
    if (numericLike && value.minimum === undefined && value.maximum === undefined) {
      unconstrainedNumbers++;
      add('Numeric input has no declared bounds', `The OpenAPI field ${path} is numeric but has no minimum/maximum constraints. Define the valid range and enforce it server-side to reduce overflow and resource-abuse risk.`, 'medium', `${path} (${type || 'inferred numeric field'})`);
    }
    if (addressLike && !['ipv4', 'ipv6', 'ip'].includes(String(value.format ?? '').toLowerCase())) {
      unformattedAddresses++;
      add('IP-like field lacks an explicit format', `The OpenAPI field ${path} looks like an IP address but does not declare an IPv4/IPv6 format. Validate each address family and its component ranges in application code.`, 'medium', path);
    }
    if (portLike && (typeof value.maximum !== 'number' || value.maximum > 65535 || typeof value.minimum !== 'number' || value.minimum < 1)) {
      add('Port range is missing or broader than expected', `The field ${path} appears to represent a network port. Declare a suitable range (usually 1–65535, or a narrower application-specific range) and validate it server-side.`, 'low', path);
    }
  };

  const methods = new Set(['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace']);
  for (const [route, rawPathItem] of Object.entries(paths)) {
    if (!rawPathItem || typeof rawPathItem !== 'object') continue;
    const pathItem = rawPathItem as Record<string, unknown>;
    for (const [method, rawOperation] of Object.entries(pathItem)) {
      if (!methods.has(method.toLowerCase()) || !rawOperation || typeof rawOperation !== 'object') continue;
      operations++;
      const operation = rawOperation as Record<string, unknown>;
      const routeName = `${method.toUpperCase()} ${route}`;
      if (!rootSecurity && !Object.keys(securitySchemes).length && !(Array.isArray(operation.security) && operation.security.length)) {
        // Only report once below, so do not emit per-operation noise.
      }
      for (const parameter of [...(Array.isArray(pathItem.parameters) ? pathItem.parameters : []), ...(Array.isArray(operation.parameters) ? operation.parameters : [])]) {
        if (!parameter || typeof parameter !== 'object') continue;
        const p = parameter as Record<string, unknown>;
        walkSchema(p.schema, `${routeName} ${String(p.in ?? 'parameter')}.${String(p.name ?? 'unnamed')}`);
      }
      const body = operation.requestBody as Record<string, unknown> | undefined;
      const content = body?.content as Record<string, unknown> | undefined;
      const jsonBody = content?.['application/json'] as Record<string, unknown> | undefined;
      walkSchema(jsonBody?.schema, `${routeName} requestBody`);
    }
  }
  if (!operations) add('No API operations were parsed', 'The document has no recognizable OpenAPI path operations. Confirm that it is a valid OpenAPI JSON document.', 'info', 'paths: 0');
  if (!rootSecurity && !Object.keys(securitySchemes).length && operations) add('No API authentication scheme is declared', 'The specification does not declare an API security scheme or top-level security requirement. This may be intentional for a public API; verify sensitive operations separately.', 'medium', 'components.securitySchemes missing or unused');
  if (!unconstrainedNumbers && !unformattedAddresses) add('No unbounded numeric/IP fields found', 'The inspected request schemas did not reveal unbounded numeric or unformatted IP-like fields. Static review cannot verify runtime validation.', 'info', `${operations} operation(s) inspected`);
  add('SQL injection is not assessable from OpenAPI alone', 'An API contract does not reveal how database queries are constructed. Review the server-side source for parameterized queries and never concatenate untrusted input into SQL.', 'info', 'No server implementation was provided');
  return findings;
}

export function analyzeSecurityArtifact(text: string): SecurityReviewResult {
  const trimmed = text.trim();
  if (!trimmed) throw new Error('Paste code or an OpenAPI JSON document to review.');
  const lines = trimmed.split(/\r?\n/);
  let parsed: unknown;
  try { parsed = JSON.parse(trimmed); } catch { parsed = null; }
  if (parsed && typeof parsed === 'object' && ('openapi' in parsed || 'swagger' in parsed || 'paths' in parsed)) {
    const findings = reviewOpenApi(parsed as Record<string, unknown>);
    return { findings, summary: `Inspected an OpenAPI-style document locally. ${findings.length} static observation(s); no endpoint was contacted.`, sourceKind: 'openapi', scannedLines: lines.length };
  }

  const findings: Finding[] = [];
  const add = (title: string, detail: string, severity: Finding['severity'], lineNo: number, evidence: string) => findings.push({ id: id(), title, detail, severity, evidence: `Line ${lineNo}: ${evidence.slice(0, 180)}`, source: 'Local source-text heuristic' });
  let queryBuilderCandidate = false;
  let validatedInput = false;
  let authSeen = false;
  let rateLimitSeen = false;
  const queryLine = /(?:\b(?:query|execute|raw)\s*\()|(?:\$queryRaw|\.where\s*\()/i;
  const sqlVerb = /\b(select|insert\s+into|update\s+\w+\s+set|delete\s+from)\b/i;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (queryLine.test(line) && sqlVerb.test(line)) {
      queryBuilderCandidate = true;
      const interpolation = /\+\s*(?:req\.|request\.|params\.|query\.|body\.)|\$\{\s*(?:req\.|request\.|params\.|query\.|body\.)|\b(?:req|request)\.(?:body|query|params)\b/i.test(line);
      if (interpolation) add('Potential unsafe SQL construction', 'This line appears to build a SQL statement near request-derived input. Prefer parameterized queries or prepared statements and validate inputs with a schema. This is a text heuristic, not proof of exploitability.', 'high', i + 1, line.trim());
    }
    if (/(zod|z\.object|joi|yup|ajv|validate\(|schema\.parse|safeParse|express-validator|class-validator)/i.test(line)) validatedInput = true;
    if (/(authenticate|authorization|requireAuth|verifyToken|jwt|passport|securitySchemes|\.use\(auth)/i.test(line)) authSeen = true;
    if (/(rateLimit|rate.limit|throttle|express-rate-limit)/i.test(line)) rateLimitSeen = true;
    if (/(req|request)\.(body|query|params)\b/i.test(line) && /(parseInt|Number\(|parseFloat)/i.test(line) && !/(min|max|safeParse|validate|schema)/i.test(line)) {
      add('Request number conversion may need bounds', 'The code converts a request value to a number; ensure finite, integer, range, and overflow constraints are enforced before using it.', 'medium', i + 1, line.trim());
    }
    if (/(stack\s*:|err(?:or)?\.stack|send\(.*err(?:or)?\.message)/i.test(line)) add('Possible internal error detail exposure', 'Returning stack traces or raw error messages can disclose implementation details. Return a generic response and keep diagnostic detail server-side.', 'low', i + 1, line.trim());
  }
  if (queryBuilderCandidate && !findings.some((f) => f.title === 'Potential unsafe SQL construction')) {
    findings.push({ id: id(), title: 'SQL query construction needs review', detail: 'Query-like code was found, but the text did not clearly show whether values are parameterized. Confirm that all user input uses bound parameters.', severity: 'low', source: 'Local source-text heuristic' });
  }
  if (!validatedInput) findings.push({ id: id(), title: 'No recognizable input-schema validation found', detail: 'The snippet does not contain a recognized validation marker. Confirm that untrusted path, query, header, and body fields are validated against an explicit schema before use.', severity: 'medium', source: 'Local source-text heuristic' });
  if (!authSeen) findings.push({ id: id(), title: 'No recognizable authorization check found', detail: 'No common authentication/authorization marker was found in this snippet. Public endpoints may be intentional; check access control for sensitive operations.', severity: 'low', source: 'Local source-text heuristic' });
  if (!rateLimitSeen) findings.push({ id: id(), title: 'Rate-limit policy not visible', detail: 'The snippet does not show a common rate-limiter. Consider per-user/IP limits for costly or sensitive endpoints; static text alone cannot assess upstream controls.', severity: 'info', source: 'Local source-text heuristic' });
  if (!findings.length) findings.push({ id: id(), title: 'No obvious pattern matched', detail: 'The local heuristics found no recognized issue. This does not establish that the application is secure; review dependencies, runtime configuration, authorization, and tests.', severity: 'info', source: 'Local source-text heuristic' });
  return { findings, summary: `Reviewed ${lines.length} line(s) locally. These pattern checks may miss issues or produce false positives; no target was contacted.`, sourceKind: 'code', scannedLines: lines.length };
}
