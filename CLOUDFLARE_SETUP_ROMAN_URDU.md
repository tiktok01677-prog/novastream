# NovaStream Cloudflare Setup — Roman Urdu

## 1. Exposed token foran revoke karein

R2 Overview kholen, **Manage R2 API Tokens** par jayen aur jo token screenshot mein share hua tha usay **Revoke** karein. NovaStream v12 ko S3 Access Key ki zaroorat nahi hai.

## 2. Video ka exact naam check karein

Bucket `novastream-media` ke andar Episode 1 ka object path exact ye hona chahiye:

`season-4/episode-01.mp4`

Capital letters aur spaces use na karein. Agar naam different hai to object ko dobara isi naam se upload karein, ya `functions/_shared/media.js` mein key update karein.

## 3. Code GitHub par upload karein

ZIP extract karke `NovaStream-NextJS` folder ki tamam source files GitHub repository ke root mein upload/push karein. `node_modules` aur `.next` upload na karein.

## 4. Free Cloudflare Pages project banayein

Cloudflare Dashboard mein **Compute > Workers & Pages > Create > Pages > Connect to Git** kholen aur GitHub repository select karein.

- Framework preset: `Next.js (Static HTML Export)` ya `None`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: blank

Deployment complete hone par free `pages.dev` address mil jayega; domain khareedna zaroori nahi.

## 5. Private R2 binding add karein

Pages project ke **Settings > Bindings** mein R2 bucket binding add karein:

- Variable name: `MEDIA`
- R2 bucket: `novastream-media`

## 6. Playback secret add karein

Pages project ke **Settings > Variables and Secrets** mein encrypted secret add karein:

- Name: `PLAYBACK_SECRET`
- Value: apni nayi 64-character random value

Ye value R2 Access Key nahi hai. Isay chat, GitHub ya screenshot mein share na karein.

Optional normal variable:

- Name: `PLAYBACK_TTL_SECONDS`
- Value: `14400`

## 7. Redeploy aur test

Bindings save karne ke baad latest deployment ko dobara deploy karein. Episode 1 khol kar Play dabayen. Player private signed link le kar MP4 ko app ke andar stream karega.

## Episode 2 baad mein

Episode 2 ko `season-4/episode-02.mp4` naam se upload karein. Phir `data/catalog.ts` mein Episode 2 ke `available` ko `false` se `true` karke GitHub par push karein.
