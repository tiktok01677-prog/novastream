import {createSignature, getMedia, isSameOriginRequest, securityHeaders} from '../../_shared/media.js';

const encoder = new TextEncoder();

function hex(bytes) {
  return [...new Uint8Array(bytes)].map((value) => value.toString(16).padStart(2, '0')).join('');
}

function encodeRfc3986(value) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
}

async function sha256(value) {
  return hex(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
}

async function hmac(key, value) {
  const bytes = typeof key === 'string' ? encoder.encode(key) : key;
  const cryptoKey = await crypto.subtle.importKey('raw', bytes, {name: 'HMAC', hash: 'SHA-256'}, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(value)));
}

async function createPresignedUrl(media, env, ttl) {
  const accountId = String(env.R2_ACCOUNT_ID ?? '').trim();
  const bucket = String(env.R2_BUCKET_NAME ?? '').trim();
  const accessKeyId = String(env.R2_ACCESS_KEY_ID ?? '').trim();
  const secretAccessKey = String(env.R2_SECRET_ACCESS_KEY ?? '').trim();
  if (!accountId || !bucket || !accessKeyId || !secretAccessKey) return null;

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const date = amzDate.slice(0, 8);
  const region = 'auto';
  const service = 's3';
  const scope = `${date}/${region}/${service}/aws4_request`;
  const host = `${accountId}.r2.cloudflarestorage.com`;
  const canonicalUri = `/${encodeRfc3986(bucket)}/${media.key.split('/').map(encodeRfc3986).join('/')}`;
  const parameters = [
    ['X-Amz-Algorithm', 'AWS4-HMAC-SHA256'],
    ['X-Amz-Credential', `${accessKeyId}/${scope}`],
    ['X-Amz-Date', amzDate],
    ['X-Amz-Expires', String(ttl)],
    ['X-Amz-SignedHeaders', 'host'],
  ];
  const canonicalQuery = parameters.map(([key, value]) => `${encodeRfc3986(key)}=${encodeRfc3986(value)}`).join('&');
  const canonicalRequest = `GET\n${canonicalUri}\n${canonicalQuery}\nhost:${host}\n\nhost\nUNSIGNED-PAYLOAD`;
  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${scope}\n${await sha256(canonicalRequest)}`;
  const dateKey = await hmac(`AWS4${secretAccessKey}`, date);
  const regionKey = await hmac(dateKey, region);
  const serviceKey = await hmac(regionKey, service);
  const signingKey = await hmac(serviceKey, 'aws4_request');
  const signature = hex(await hmac(signingKey, stringToSign));
  return `https://${host}${canonicalUri}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}

export async function onRequestGet({request, env, params}) {
  if (!isSameOriginRequest(request)) {
    return Response.json({error: 'Cross-site downloads are not allowed.'}, {status: 403, headers: securityHeaders()});
  }
  const playbackId = String(params.id ?? '');
  const media = getMedia(playbackId);
  if (!media) {
    return Response.json({error: 'Episode source was not found.'}, {status: 404, headers: securityHeaders()});
  }

  const configuredTtl = Number(env.DOWNLOAD_TTL_SECONDS ?? 21600);
  const ttl = Math.min(Math.max(Number.isFinite(configuredTtl) ? configuredTtl : 21600, 3600), 43200);
  const directUrl = await createPresignedUrl(media, env, ttl);
  const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();
  if (directUrl) {
    return Response.json({url: directUrl, expiresAt, delivery: 'r2-direct'}, {headers: securityHeaders()});
  }

  if (!env.PLAYBACK_SECRET || !env.MEDIA) {
    return Response.json({error: 'Offline downloads are not configured yet.'}, {status: 503, headers: securityHeaders()});
  }
  const expires = Math.floor(Date.now() / 1000) + ttl;
  const signature = await createSignature(playbackId, expires, env.PLAYBACK_SECRET);
  const mediaUrl = new URL(`/media/${encodeURIComponent(playbackId)}`, request.url);
  mediaUrl.searchParams.set('expires', String(expires));
  mediaUrl.searchParams.set('signature', signature);
  return Response.json({url: mediaUrl.toString(), expiresAt: new Date(expires * 1000).toISOString(), delivery: 'pages-proxy'}, {headers: securityHeaders()});
}
