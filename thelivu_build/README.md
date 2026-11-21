# Thelivu — Verify Before You Trust

Thelivu is a privacy-first digital trust workspace built with React, TypeScript and Vite. It provides local, transparent checks and educational tools. It does **not** claim to be a commercial threat-intelligence service or a penetration-testing platform.

## Quick start

Requirements: Node.js 20+ and pnpm 9+ (npm also works).

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000. Production build:

```bash
pnpm build
pnpm test
pnpm preview
```

## Included tools

- **Website Scanner:** parses HTTP/HTTPS URLs and checks visible URL structure locally. It does not open arbitrary URLs, resolve DNS, inspect TLS, follow redirects, or query malware/reputation providers.
- **URL comparison:** compares local structural indicators for two URLs.
- **Claim & News Checker:** lets you record and classify user-supplied sources. It does not fetch sources or automatically fact-check claims.
- **Image Verification:** local image preview, dimensions and readable EXIF inspection. No reverse-image or AI-image detector is claimed.
- **Video Analysis:** local video metadata and optional still-frame capture. No deepfake detector is claimed.
- **Message Checker:** locally reviews suspicious message text and links.
- **Security Review:** static source-text heuristics and OpenAPI document review. It is not a vulnerability scanner and does not attack or contact a target.
- **Cyber Learning Lab:** educational modules and quizzes with local progress.
- **History and Reports:** browser-local summaries and downloadable PDF reports.
- **Threat Intelligence:** curated links to official advisory sources; live feeds are not configured.

## Important safety and coverage notes

All website URL checks are local structural heuristics. An absence of warnings is not a safety verdict. SQL injection review is static source-code pattern analysis; it cannot prove exploitability or security. Use it only on code and systems you own or are authorized to review. No destructive requests, payload execution, credential testing, or third-party exploitation are performed.

No external reputation, DNS, TLS, WHOIS, malware, phishing-feed, or automatic claim-search integration is configured in this package. The interface labels these limitations rather than inventing results. The app does not fetch arbitrary user-provided URLs, which also avoids turning the deployment into an SSRF proxy.

## Release fixes in this package

- History and saved reports refresh immediately after in-app changes.
- Clear-history and erase-data controls also remove legacy `truthscan.*` browser keys, preventing deleted records from reappearing.
- Settings includes a language preference for the translated navigation and dashboard labels.
- Video frame capture handles the initial frame while browser decoding is still completing.
- The previous unused-import TypeScript build errors have been removed.

## Deployment on Vercel

1. Extract this ZIP.
2. Create a GitHub repository and upload the extracted project files (the files inside the folder, not the ZIP itself).
3. In Vercel, choose **Add New → Project**, import the repository.
4. Framework: Vite. Build command: `pnpm build`. Output directory: `dist`. Install command: `pnpm install --frozen-lockfile`.
5. Deploy. No environment variables are required for the guest/local features.

The included `vercel.json` supports client-side routes. The hostname `thelivu.vercel.app` is only available if Vercel allows it to be assigned to your account/project.

## Optional Supabase

`.env.example` documents optional Supabase variables. Auth/cloud features remain disabled until you configure a Supabase project, apply the SQL migration, set secure row-level security policies, and verify the full auth flows. Never commit secrets or put service-role keys in browser variables.

## Privacy

Guest history, reports, preferences and learning progress are stored in local browser storage. Use Settings → Erase data to clear the app's local records. Image and video selections are processed in the browser and are not uploaded by these tools.

## License

Review dependency licenses before redistribution. The source project does not currently declare a single top-level license.
