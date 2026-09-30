# NovaStream — Private R2 Streaming Web App

NovaStream is a mobile-first Next.js streaming interface for an Android WebView. Version 4.1 adds a compact NS intro, three episodes, quota-conscious private Cloudflare R2 playback and the complete web side of Android offline downloads.

## Included

- Cinematic intro that runs once per app session
- Responsive mobile and desktop artwork
- Native MP4 player with seeking, fullscreen, cinema mode, resume and next-episode overlay
- Device-local watch-position resume and Continue Watching
- Session reuse of unexpired signed links to avoid duplicate playback API requests
- Duplicate-click protection, background pause and metadata-only loading
- Private R2 bucket; no Facebook login, branding or external navigation
- Four-hour signed playback links generated server-side
- Byte-range responses for fast starts and seeking through long episodes
- Detailed series, season and episode routes
- Static production export in `dist/`
- Search indexing disabled for private/unlisted distribution
- Downloads screen with progress, pause/resume, cancel, delete and offline-play controls
- Service-worker app-shell cache; private API and video responses are never cached

## Video mapping

The private R2 bucket must be named `novastream-media` and bound to Pages Functions as `MEDIA`.

| Playback ID | R2 object key | App status |
| --- | --- | --- |
| `fatih-s4-e1` | `season-4/episode-01.mp4` | Available |
| `fatih-s4-e2` | `season-4/episode-02.mp4` | Available after upload |
| `fatih-s4-e3` | `season-4/episode-03.mp4` | Available after upload |

Episode 2 and Episode 3 are already enabled in the catalogue. Upload both objects at the exact keys above before testing playback.

## Local commands

```bash
npm install
npm run check
npm run dev
npm run build
```

`npm run build` creates the static website in `dist/`. The native video API runs only on Cloudflare Pages because it requires the private R2 binding.

## Cloudflare Pages configuration

1. Connect this GitHub repository to Cloudflare Pages.
2. Use build command `npm run build` and output directory `dist`.
3. In the Pages project, add an R2 binding named `MEDIA` and select `novastream-media`.
4. Add an encrypted secret named `PLAYBACK_SECRET` containing a new long random value.
5. Optionally add `PLAYBACK_TTL_SECONDS=14400` as a normal environment variable.
6. Redeploy after changing bindings or environment variables.

Never commit secrets to GitHub. Normal streaming uses the private R2 binding and does not require S3 credentials.

## Android offline download bridge

The website never saves an episode into the browser's public Downloads folder. Inside the Android WebView, the episode page requests a short-lived download URL and sends the episode metadata to `window.NovaStreamAndroid.startDownload(...)`. The Android app owns the private file, background progress, pause/resume, offline playback and deletion. Native progress returns to the web UI through `window.NovaStreamDownloads.receive(...)`.

The Downloads page is `/downloads/`. The last native snapshot and static website shell are cached so an interrupted connection does not leave a blank screen. Private `/api/*` and `/media/*` responses are excluded from the service-worker cache.

For the lowest request use, add these encrypted Cloudflare secrets:

- `R2_ACCOUNT_ID`
- `R2_BUCKET_NAME`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- Optional: `DOWNLOAD_TTL_SECONDS` (default `21600`, maximum `43200`)

Create an R2 API token restricted to Object Read for this bucket. If these four R2 values are absent, `/api/download/*` safely falls back to the existing private Pages Function media route.

## Free-quota safeguards

- Static pages do not invoke Functions because `public/_routes.json` includes only `/api/*` and `/media/*`.
- Video is requested only after a user taps Play; there is no autoplay or video prefetch.
- A valid signed playback URL is reused within the browser session until shortly before expiry.
- Repeated Play clicks share one in-flight signing request.
- Backgrounding the app pauses video transfer.
- These controls reduce avoidable requests; real viewing and seeking still use R2 reads and Pages Function requests.

## Android WebView

Enable JavaScript, DOM storage and fullscreen custom views. Allow media playback after a user gesture. Keep navigation on the Pages domain inside the WebView and block popup windows. Use WebView history for the Android back button before closing the Activity.
