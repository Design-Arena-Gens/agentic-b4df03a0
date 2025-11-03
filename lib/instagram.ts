export type InstagramEnvironment = {
  igUserId: string;
  accessToken: string;
};

const GRAPH_BASE = 'https://graph.facebook.com/v20.0';

export function getInstagramEnv(): InstagramEnvironment {
  const igUserId = process.env.IG_USER_ID?.trim();
  const accessToken = process.env.IG_ACCESS_TOKEN?.trim();
  if (!igUserId || !accessToken) {
    throw new Error('Missing IG_USER_ID or IG_ACCESS_TOKEN environment variables');
  }
  return { igUserId, accessToken };
}

export async function createMediaContainer(imageUrl: string, caption: string | undefined, env: InstagramEnvironment): Promise<string> {
  const params = new URLSearchParams();
  params.set('image_url', imageUrl);
  if (caption && caption.trim().length > 0) params.set('caption', caption);
  params.set('access_token', env.accessToken);

  const res = await fetch(`${GRAPH_BASE}/${env.igUserId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || 'Failed to create media container');
  }
  if (!data.id) {
    throw new Error('No creation_id returned from Graph API');
  }
  return data.id as string; // creation_id
}

export async function getContainerStatus(creationId: string, env: InstagramEnvironment): Promise<'IN_PROGRESS' | 'FINISHED' | 'ERROR'> {
  const url = `${GRAPH_BASE}/${creationId}?fields=status_code&access_token=${encodeURIComponent(env.accessToken)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || 'Failed to query container status');
  }
  const status = (data?.status_code as string) || 'IN_PROGRESS';
  if (status === 'FINISHED' || status === 'ERROR' || status === 'IN_PROGRESS') return status;
  return 'IN_PROGRESS';
}

export async function publishMedia(creationId: string, env: InstagramEnvironment): Promise<string> {
  const params = new URLSearchParams();
  params.set('creation_id', creationId);
  params.set('access_token', env.accessToken);

  const res = await fetch(`${GRAPH_BASE}/${env.igUserId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || 'Failed to publish media');
  }
  if (!data.id) {
    throw new Error('No media id returned from publish');
  }
  return data.id as string; // media id
}

export async function waitForContainer(creationId: string, env: InstagramEnvironment, timeoutMs = 60000, intervalMs = 2000): Promise<void> {
  const start = Date.now();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const status = await getContainerStatus(creationId, env);
    if (status === 'FINISHED') return;
    if (status === 'ERROR') throw new Error('Media processing failed (status ERROR)');
    if (Date.now() - start > timeoutMs) throw new Error('Timed out waiting for media container to finish');
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}
