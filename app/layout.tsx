import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Instagram Auto Uploader',
  description: 'Automate posting photos to Instagram via the Instagram Graph API.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
