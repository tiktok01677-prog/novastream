# NovaStream Cloudflare Setup — Roman Urdu

## 1. Purana exposed token foran revoke karein

R2 Overview kholen, **Manage R2 API Tokens** par jayen aur jo purana token screenshot mein share hua tha usay **Revoke** karein. Offline download setup ke liye baad mein naya, sirf Object Read permission wala token banayein; purana shared token dobara use na karein.

## 2. Video ka exact naam check karein

Bucket `novastream-media` ke andar video object paths exact ye hone chahiye:

`season-4/episode-01.mp4`

`season-4/episode-02.mp4`

`season-4/episode-03.mp4`

Capital letters aur spaces use na karein. Agar naam different hai to object ko dobara isi naam se upload karein, ya `functions/_shared/media.js` mein key update karein.

## 3. Code GitHub par upload karein

ZIP extract karke `NovaStream-NextJS` folder ki tamam source files GitHub repository ke root mein upload/push karein. `node_modules`, `.next`, `out` aur `dist` upload na karein. `package.json` GitHub repository ke seedhe root par nazar aana chahiye.

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

## Episode upload/replace

Episode 1, 2 aur 3 code mein ready hain. R2 mein upar diye gaye exact paths par files upload karein. Isi path par MP4 replace karne se code update ya redeploy ki zaroorat nahi hoti.

## Free quota bachane wala player

Player video ko khud se autoplay/prefetch nahi karta. User ke Play dabane par hi signed link aur video request hoti hai. Ek valid signed link session mein reuse hota hai, double clicks duplicate request nahi banate aur app background mein jane par video pause ho jati hai. Real viewing aur seeking ki genuine requests ko zero nahi kiya ja sakta.

## Android direct offline downloads (recommended)

Android app ke private offline downloads ko kam requests ke saath chalane ke liye Cloudflare Pages > Settings > Variables and Secrets mein yeh encrypted secrets add karein:

- `R2_ACCOUNT_ID`
- `R2_BUCKET_NAME`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- Optional `DOWNLOAD_TTL_SECONDS=21600`

R2 API token ko sirf `novastream-media` bucket ke **Object Read** permission dein. Website ek temporary signed link banayegi, phir Android app video seedha R2 se apni private app storage mein save karegi. Link maximum 12 hours ka rakha gaya hai.

Agar direct-download secrets abhi add na hon to existing `MEDIA` binding aur `PLAYBACK_SECRET` ke through secure fallback kaam karega. Download button normal browser ke public Downloads folder mein MP4 save nahi karta; yeh NovaStream Android WebView ke native bridge ko command deta hai.
