import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_request: VercelRequest, response: VercelResponse) {
  response.setHeader('Cache-Control', 'no-store');
  response.status(200).json({ ok: true, service: 'thelivu', checks: { outboundUrlFetch: false, externalProviders: 'not-run-by-this-endpoint' } });
}
