import { NextRequest } from 'next/server';
import { createMediaContainer, getInstagramEnv, publishMedia, waitForContainer } from '../../../../lib/instagram';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const imageUrl: string | undefined = body?.imageUrl;
    const caption: string | undefined = body?.caption;

    if (!imageUrl || typeof imageUrl !== 'string') {
      return Response.json({ error: 'imageUrl is required' }, { status: 400 });
    }

    const env = getInstagramEnv();

    // Step 1: Create container
    const creationId = await createMediaContainer(imageUrl, caption, env);

    // Step 2: Wait for processing
    await waitForContainer(creationId, env);

    // Step 3: Publish
    const mediaId = await publishMedia(creationId, env);

    return Response.json({ ok: true, mediaId });
  } catch (err: any) {
    const message = err?.message || 'Unexpected error';
    return Response.json({ error: message }, { status: 500 });
  }
}
