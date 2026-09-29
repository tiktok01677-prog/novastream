import {createSignature, getMedia, isSameOriginRequest, securityHeaders} from '../../_shared/media.js';

export async function onRequestGet({request, env, params}) {
  if (!isSameOriginRequest(request)) {
    return Response.json({error: 'Cross-site playback is not allowed.'}, {status: 403, headers: securityHeaders()});
  }
  const playbackId = String(params.id ?? '');
  if (!getMedia(playbackId)) {
    return Response.json({error: 'Episode source was not found.'}, {status: 404, headers: securityHeaders()});
  }
  if (!env.PLAYBACK_SECRET || !env.MEDIA) {
    return Response.json({error: 'Video service is not configured yet.'}, {status: 503, headers: securityHeaders()});
  }
  const configuredTtl = Number(env.PLAYBACK_TTL_SECONDS ?? 14400);
  const ttl = Math.min(Math.max(Number.isFinite(configuredTtl) ? configuredTtl : 14400, 10800), 21600);
  const expires = Math.floor(Date.now() / 1000) + ttl;
  const signature = await createSignature(playbackId, expires, env.PLAYBACK_SECRET);
  const mediaUrl = new URL(`/media/${encodeURIComponent(playbackId)}`, request.url);
  mediaUrl.searchParams.set('expires', String(expires));
  mediaUrl.searchParams.set('signature', signature);
  return Response.json({url: mediaUrl.toString(), expiresAt: new Date(expires * 1000).toISOString()}, {headers: securityHeaders()});
}
