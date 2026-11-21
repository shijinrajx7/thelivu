# Thelivu — Expanded Implementation Plan

## Product and design

Build a responsive React + Vite + TypeScript digital-trust workspace with the supplied premium cybersecurity design language: navy surfaces, blue/cyan accents, restrained motion, accessible hierarchy, compact evidence cards, custom shield/scan branding, reduced-motion behavior, and English/Malayalam/Hindi UI strings. The desktop layout uses a persistent navigation rail; tablet and mobile layouts use compact/collapsible navigation.

**Principles:** explain what was checked; keep uncertain outcomes uncertain; privacy by default; use meaningful, accessible interactions; never imply an unperformed check. **Brand voice:** “A clean check is not a safety guarantee.” “No reputation provider was queried.” **Signature color:** `#438BFF`; supporting colors and risk states follow the supplied palette.

## Expanded feature coverage

1. **Dashboard/navigation:** overview, global in-app search, recent activity, tool shortcuts, source directory, notifications/preferences, settings, help, responsive navigation and working route links. Do not show invented live counts or incidents.
2. **Website scanner:** accept valid HTTP(S) URLs; inspect URL/domain structure locally (IP host, user-info, suspicious characters/parameters, punycode/lookalike signs, misleading or unusually deep subdomains); explain every finding, timestamp, domain, coverage and next steps. Include paste/clear, scan states, structural URL comparison, history and report actions. Never fetch arbitrary submitted URLs or follow redirects. Reputation, malware/phishing matches, RDAP, DNS, TLS/certificate, registration, expiry and redirect checks are unavailable unless an explicitly configured provider safely performs and returns them. With those absent, clearly show “not checked” and an inconclusive outcome where applicable; never call an item safe because local heuristics found nothing.
3. **Claim/news workspace:** separate fact/opinion/prediction, accept evidence links and notes, compare support/contradiction/context, show dates, link to original user-provided sources, and allow clear insufficient-evidence states. Offer outbound search links. Without a configured retrieval source, do not invent citations, quotations, or automatic search results.
4. **Image verification:** preview selected files, inspect type/size/dimensions and readable metadata, provide reverse-search guidance and a report. Analyze in the browser only and delete the temporary selection after leaving/clearing; no file bytes stored or uploaded. Explain that missing metadata is not proof of tampering. No definitive manipulation or AI-generation claims.
5. **Video awareness:** local video preview and metadata (duration/dimensions), optionally inspect a selected frame in-browser, report technical limits, export a report and avoid definitive deepfake claims. Do not persist/upload media.
6. **Message checker:** local phrase/link scan for urgency, impersonation cues, credential/payment requests and other suspicious language; visibly highlight matched phrases and explain why they matter. Never transmit message text.
7. **Threat intelligence:** build a useful advisory/source hub with filters/categories and links to verified publisher pages. It is not a live incident feed until actual feeds/APIs are configured and tested; never present sample data as live.
8. **Cyber Learning Lab:** fictional scenarios, multiple choice, difficulty selection, explanations, multiple modules, daily challenge based on current date, local progress and achievements. No real threatening content.
9. **Personal security center, history, saved reports and privacy:** guest tools work without accounts. Browser-local summaries/preferences/progress can be searched, saved, exported, and cleared. Do not keep sensitive URL query parameters or uploaded content. Supabase Auth, account-specific reports, notifications and durable history require valid Supabase project configuration; until then, never display a fake login/session or imply data sync.
10. **Advanced utilities:** deterministic plain-language trust explanations based only on known findings; downloadable report with source/limitation/recommendation sections; privacy-preserving share via downloaded report or browser share sheet (no public server link unless a secure backend is configured); browser-based compare; filters/search; notification preferences that work locally without claiming remote notifications. Any admin route remains inaccessible until real server-side authentication and role enforcement are configured.
11. **Database and security handoff:** include a Supabase PostgreSQL schema/migration with ownership-aware RLS policies, indexes and constraints, plus `.env.example` and setup instructions. The initialized project also has Manus-managed MySQL enabled; do not use it in place of the explicitly requested Supabase. Keep provider secrets server-side. Do not implement arbitrary URL proxying. No user data will be written to the managed MySQL database.

## Technical architecture

- React, Vite and TypeScript with a shared app shell, React Router, Lucide React, Framer Motion with reduced-motion support, and Recharts only where visualized data is genuinely derived from local records. Use clear semantic HTML, keyboard focus and touch-sized mobile controls.
- Modular feature pages/components; URL/message/media analyzers run locally in the browser. A small server exposes health and provider-readiness only until specific authenticated integrations are configured. No user-controlled outbound-fetch route.
- `localStorage` stores only guest preferences, quiz progress and non-sensitive scan summaries; omit URL query strings and file bytes. Include explicit erase controls and clear privacy copy.
- `supabase/` contains the optional SQL/RLS migration; app auth and account-specific persistence remain gated on real Supabase configuration. `.env.example` documents public Supabase URL/anon key and server-only provider credentials without values.
- Route inventory at `public/manus-routes.json`; Vite production output at `dist/`; a pinned package manager and reviewed dependency install policy.

## Project structure

- `src/app/`: router, app shell, sidebar/header and route-level layouts.
- `src/features/{dashboard,website,claims,image,video,messages,threats,learning,history,reports,settings,account}/`: dedicated feature screens and interactions.
- `src/components/`: reusable inputs, risk/source badges, evidence cards, dialogs, result panels, progress and empty/error/loading states.
- `src/lib/`: URL/message analysis, local data/privacy, report exports, date utilities, translations and validation.
- `src/styles/`: design tokens, component styles, motion and breakpoints.
- `server/`: health/provider-readiness routes; no arbitrary URL-fetch service.
- `supabase/`: SQL migrations and RLS policies for optional Supabase setup.
- `public/manus-routes.json`: synchronized route manifest.

## Git, Vercel and deployment

1. Develop and preview in the initialized Manus Webdev project.
2. Save the finished change to the current canonical remote (`origin/main`) as the required Manus checkpoint. This remote is not GitHub.
3. For the additional GitHub push requested, connect an authorized GitHub account and use a repository the user selects; default to a private repository if creating one. The current environment has no GitHub login and no GitHub remote yet.
4. For the requested Vercel deployment, connect to the user's Vercel project/account or provide a protected Vercel token via the secure input flow; never place credentials in chat or source. Build and deploy only after required project settings are valid. Do not claim deployment until Vercel reports success.
5. The guest-first build can deploy without Supabase, but login/account persistence and provider-backed reputation/news/fact-search checks stay explicitly unavailable until configured and tested. Deployment does not imply those integrations work.

## Material limits

No Supabase, GitHub, Vercel, reputation, news, search, AI-image, or forensic service credentials have been configured in this task. This implementation can deliver functional guest workflows and deployment artifacts, but cannot honestly claim provider results, account login, live advisories, remote notifications, or external repository/deployment success until authorization, settings, and service responses are confirmed. Website scanning remains client-only unless and until a narrowly scoped, SSRF-resistant provider path is separately implemented.


## Additional feature: Defensive API and input-validation review

Add an **Authorized Security Review** workspace for defensive assessment of the user's own application artifacts. Users can paste or select a local OpenAPI/Swagger JSON document or a code snippet, then run client-side static checks and receive findings tied to relevant paths/lines where available. Checks can identify missing/weakly declared API input constraints, unbounded integer/path/query parameters, absent formats/ranges for IP/network/port-like fields, suspicious SQL construction/string concatenation, missing parameterized-query patterns, and common API-auth/rate-limit/error-handling gaps. For SQL-specific results, use explicit uncertainty labels because static text inspection cannot prove exploitability or safety. The workspace should show severity, evidence, why it matters, practical remediation, confidence/coverage, and a safe report export; never silently upload analyzed code or schemas.

This is a static, local review—not a live vulnerability scanner. It must not issue SQL-injection payloads, fuzz arbitrary endpoints, bypass controls, enumerate targets, or perform destructive requests. Domain-only input may receive a guidance checklist but will not be actively probed. Any future active security test mode must be limited to an explicitly authorized, user-controlled staging target with a separately approved scope and strict rate/method limits; it is not part of this delivery.


## User-approved naming and hosting override

The application and product-facing brand is **Thelivu** (display as “Thelivu”/“THELIVU”), replacing Thelivu throughout the interface and deployment package; retain the tagline “VERIFY BEFORE YOU TRUST.” and the digital-trust purpose. Set the Vercel project name to `thelivu` and request the exact hostname `thelivu.vercel.app`. Domain assignment is contingent on Vercel authorization and name availability; do not claim it is live until Vercel confirms deployment and domain assignment.
