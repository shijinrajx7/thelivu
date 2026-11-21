# Thelivu release verification

## Verified in this package
- TypeScript/TSX transpilation syntax check across 25 source files.
- Seven core analyzer smoke assertions: URL parsing, unsupported scheme rejection, sensitive URL redaction, embedded credential warning, message indicators/link extraction, static SQL-construction heuristic, and OpenAPI input-bound checks.
- Source review of route wiring and interactive page handlers.

## Run on your Ubuntu machine before production deployment
From this folder (the folder containing `package.json`):

```bash
pnpm install
pnpm test
pnpm build
pnpm dev
```

Open `http://localhost:3000` and test the checklist below.

## Browser acceptance checklist
- [ ] Sidebar navigation opens every tool page; mobile menu and bottom navigation work.
- [ ] Theme toggle and Settings language selector update the UI.
- [ ] Website scanner accepts HTTP/HTTPS URLs, rejects other schemes, and shows a local result.
- [ ] URL comparison requires two valid URLs and displays both local results.
- [ ] Message checker shows local indicators and extracted links.
- [ ] Claim workspace accepts a claim, lets you add/remove source notes, and creates an evidence summary.
- [ ] Image page previews a selected image, reads supported EXIF metadata, and creates a local report.
- [ ] Video page previews a supported clip, reads duration/dimensions, captures a frame, and creates a local report.
- [ ] Security review accepts pasted code/OpenAPI or a local file and shows static findings. Only review code/systems you own or are authorized to assess.
- [ ] Learning quizzes allow selecting answers, checking them, moving forward, and saving progress.
- [ ] Result panel saves a report, downloads a PDF, and shares/copies a summary where browser support allows.
- [ ] History and Reports update immediately after saving; clear/delete actions work.
- [ ] Settings → Erase data clears current and legacy local records.

## Important limitations
The local tools are functional, but live DNS/TLS/IP reputation, malware/phishing feeds, automatic fact-checking, deepfake detection, cloud authentication/sync, and runtime penetration testing are not configured. The UI must not present those as completed checks. The API/code review is static and non-invasive; it does not send requests to a target or execute SQL injection tests.
