import {getMedia, securityHeaders, verifySignature} from '../_shared/media.js';

async function authorize(request, env, params) {
  const url = new URL(request.url);
  const playbackId = String(params.id ?? '');
  const media = getMedia(playbackId);
  const expires = Number(url.searchParams.get('expires'));
  const signature = url.searchParams.get('signature') ?? '';
  if (!media || !env.PLAYBACK_SECRET || !env.MEDIA) return null;
  return await verifySignature(playbackId, expires, signature, env.PLAYBACK_SECRET) ? media : null;
}

function objectHeaders(object, contentType) {
  const headers = new Headers(securityHeaders({
    'Accept-Ranges': 'bytes',
    'Content-Disposition': 'inline',
    'Content-Type': object.httpMetadata?.contentType || contentType,
    'Cross-Origin-Resource-Policy': 'same-origin',
  }));
  if (object.httpEtag) headers.set('ETag', object.httpEtag);
  return headers;
}

export async function onRequestGet({request, env, params}) {
  const media = await authorize(request, env, params);
  if (!media) return new Response('Playback link is invalid or expired.', {status: 403, headers: securityHeaders()});
  const object = await env.MEDIA.get(media.key, {range: request.headers});
  if (!object) return new Response('Video file was not found in storage.', {status: 404, headers: securityHeaders()});
  const headers = objectHeaders(object, media.contentType);
  if (object.range) {
    const start = object.range.offset;
    const end = start + object.range.length - 1;
    headers.set('Content-Range', `bytes ${start}-${end}/${object.size}`);
    headers.set('Content-Length', String(object.range.length));
    return new Response(object.body, {status: 206, headers});
  }
  headers.set('Content-Length', String(object.size));
  return new Response(object.body, {status: 200, headers});
}

export async function onRequestHead({request, env, params}) {
  const media = await authorize(request, env, params);
  if (!media) return new Response(null, {status: 403, headers: securityHeaders()});
  const object = await env.MEDIA.head(media.key);
  if (!object) return new Response(null, {status: 404, headers: securityHeaders()});
  const headers = objectHeaders(object, media.contentType);
  headers.set('Content-Length', String(object.size));
  return new Response(null, {status: 200, headers});
}
