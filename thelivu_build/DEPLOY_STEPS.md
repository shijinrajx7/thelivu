# Deploy Thelivu to Vercel — step by step

## 1. Extract the ZIP
Extract `thelivu-complete.zip` on your computer. Open the extracted `thelivu` folder. It should contain `package.json`, `pnpm-lock.yaml`, `src/`, `api/`, and `vercel.json`.

## 2. Test locally (recommended)
Install Node.js 20 or newer. In a terminal opened inside the extracted folder, run:

```bash
corepack enable
corepack prepare pnpm@9.15.5 --activate
pnpm install
pnpm test
pnpm build
pnpm dev
```

Open `http://localhost:3000`. No API keys are required for the guest/local tools.

## 3. Upload to GitHub
1. Create a new repository named `thelivu`.
2. Choose **Add file → Upload files**.
3. Open the extracted `thelivu` folder on your computer.
4. Select the contents inside that folder (not the outer ZIP).
5. Drag the files into GitHub and commit to the `main` branch.
6. Do not upload `.env` files containing real secrets or `node_modules/`.

## 4. Import into Vercel
1. Sign in at https://vercel.com/dashboard.
2. Select **Add New → Project**.
3. Import the GitHub repository named `thelivu`.
4. Set Framework Preset to **Vite**.
5. Confirm Install Command `pnpm install --frozen-lockfile`, Build Command `pnpm build`, Output Directory `dist`.
6. Click **Deploy** and wait for the build to finish.

## 5. Add the domain
In Vercel → project `thelivu` → Settings → Domains, add `thelivu.vercel.app`. Vercel may reject it if the hostname is assigned to another project or team. If so, identify and remove it from the old project you own; do not delete any unrelated project or domain.

## Feature coverage
Local URL structure checks, manual claim/source evidence workspace, image/video metadata review, message analysis, static code/OpenAPI review, learning modules, local history, and PDF reports are included. DNS/TLS inspection, live malware/reputation lookups, automatic fact-checking, deepfake detection, and cloud accounts are not enabled. The app discloses these limitations rather than fabricating results.

## Safety
Use security review only on source code and systems you own or are explicitly authorized to assess. This app does not perform exploit attempts or send arbitrary target requests.
