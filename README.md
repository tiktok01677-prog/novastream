# NovaStream — Private R2 Streaming Web App

NovaStream is a mobile-first Next.js streaming interface for an Android WebView. Version 3 replaces Facebook embeds with private Cloudflare R2 playback through same-origin Pages Functions.

## Included

- Cinematic intro that runs once per app session
- Responsive mobile and desktop artwork
- Native MP4 player with seeking, fullscreen, cinema mode and reload
- Device-local watch-position resume and Continue Watching
- Private R2 bucket; no Facebook login, branding or external navigation
- Four-hour signed playback links generated server-side
- Byte-range responses for fast starts and seeking through long episodes
- Detailed series, season and episode routes
- Static production export in `dist/`
- Search indexing disabled for private/unlisted distribution

## Video mapping

The private R2 bucket must be named `novastream-media` and bound to Pages Functions as `MEDIA`.

| Playback ID | R2 object key | App status |
| --- | --- | --- |
| `fatih-s4-e1` | `season-4/episode-01.mp4` | Available |
| `fatih-s4-e2` | `season-4/episode-02.mp4` | Coming soon |

After uploading Episode 2, change its `available` value to `true` in `data/catalog.ts` and redeploy.

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

Never commit an R2 Access Key ID or Secret Access Key. Pages Functions use the R2 binding and do not require S3 credentials.

## Android WebView

Enable JavaScript, DOM storage and fullscreen custom views. Allow media playback after a user gesture. Keep navigation on the Pages domain inside the WebView and block popup windows. Use WebView history for the Android back button before closing the Activity.
