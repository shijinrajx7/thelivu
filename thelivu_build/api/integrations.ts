import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_request: VercelRequest, response: VercelResponse) {
  response.setHeader('Cache-Control', 'no-store');
  response.status(200).json({
    providers: {
      googleSafeBrowsing: Boolean(process.env.GOOGLE_SAFE_BROWSING_API_KEY),
      virusTotal: Boolean(process.env.VIRUSTOTAL_API_KEY),
      liveThreatFeeds: false,
      factSearch: false,
      imageForensics: false,
      videoForensics: false,
    },
    note: 'Readiness only. No provider was queried and no credential values are returned.',
  });
}
