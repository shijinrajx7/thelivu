# Thelivu release notes and honest coverage

## Implemented in this package
- Thelivu identity, responsive application shell, navigation, intro, theme preferences, and mobile layout.
- Dashboard, URL structural review and comparison, claim evidence workspace, image metadata review, video metadata/frame review, message review, static source/OpenAPI security review, learning modules, history, reports, settings, and official advisory source directory.
- Browser-local storage, privacy-aware summaries, PDF report export, and clear-local-data controls.
- Vercel SPA rewrite and Vite production build configuration.

## Not configured / not claimed
- Live DNS, TLS certificate, WHOIS/domain age, redirect chain, malware/phishing reputation, or IP reputation checks.
- Live threat feeds or automatic web fact-checking.
- Automated image manipulation, AI-image, reverse-image, audio, or deepfake detection.
- Runtime SQL injection testing, exploit validation, or remote penetration testing.
- Supabase account creation, password recovery, remote sync, or cloud account deletion until the owner configures and tests a Supabase project and policies.

## Release verification
Run `pnpm install`, `pnpm typecheck`, `pnpm test`, and `pnpm build` before publishing. Test every route and the upload, clear, export, and navigation actions in a real browser. Provider-backed features must stay unavailable until a provider is selected, credentials are stored server-side, privacy consent is implemented, and integration tests pass.
