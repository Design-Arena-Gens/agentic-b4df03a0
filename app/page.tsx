"use client";

import { useState } from 'react';

export default function HomePage() {
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);
    setError(null);

    try {
      const res = await fetch('/api/instagram/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, caption })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to publish');
      }

      setStatus(`Published successfully. Media ID: ${data.mediaId}`);
      setImageUrl('');
      setCaption('');
    } catch (err: any) {
      setError(err.message || 'Unexpected error');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="card">
      <h1 className="h1">Instagram Auto Uploader</h1>
      <p className="p">Paste a public image URL and optional caption to auto-publish via the Instagram Graph API.</p>

      <form className="form" onSubmit={handleSubmit}>
        <div>
          <label className="label" htmlFor="imageUrl">Image URL</label>
          <input
            id="imageUrl"
            className="input"
            placeholder="https://... (must be publicly accessible)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            required
            type="url"
            inputMode="url"
          />
          <div className="helper">Image must be accessible without auth and be JPEG/PNG, per API rules.</div>
        </div>

        <div>
          <label className="label" htmlFor="caption">Caption (optional)</label>
          <textarea
            id="caption"
            className="textarea"
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>

        <button className="button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Publishing?' : 'Publish to Instagram'}
        </button>

        {status && <div className="status success">{status}</div>}
        {error && <div className="status error">{error}</div>}
      </form>

      <div className="note">
        Configure environment variables: <code>IG_USER_ID</code> and <code>IG_ACCESS_TOKEN</code> (Instagram Graph API).
      </div>
      <div className="footer">This uses the official Instagram Graph API for Business/Creator accounts.</div>
    </div>
  );
}
