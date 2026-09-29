const MEDIA_CATALOG = Object.freeze({
  'fatih-s4-e1': {key: 'season-4/episode-01.mp4', contentType: 'video/mp4'},
  'fatih-s4-e2': {key: 'season-4/episode-02.mp4', contentType: 'video/mp4'},
});

const encoder = new TextEncoder();

function toBase64Url(bytes) {
  let binary = '';
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function hmac(value, secret) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), {name: 'HMAC', hash: 'SHA-256'}, false, ['sign']);
  return toBase64Url(await crypto.subtle.sign('HMAC', key, encoder.encode(value)));
}

function safeEqual(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string' || left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

export function getMedia(playbackId) {
  return MEDIA_CATALOG[playbackId] ?? null;
}

export async function createSignature(playbackId, expires, secret) {
  return hmac(`${playbackId}.${expires}`, secret);
}

export async function verifySignature(playbackId, expires, signature, secret) {
  if (!Number.isSafeInteger(expires) || expires <= Math.floor(Date.now() / 1000)) return false;
  return safeEqual(await createSignature(playbackId, expires, secret), signature);
}

export function isSameOriginRequest(request) {
  const url = new URL(request.url);
  const origin = request.headers.get('Origin');
  if (request.headers.get('Sec-Fetch-Site') === 'cross-site') return false;
  return !origin || origin === url.origin;
}

export function securityHeaders(extra = {}) {
  return {
    'Cache-Control': 'private, no-store, max-age=0',
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
    ...extra,
  };
}
