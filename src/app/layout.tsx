import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Music Grabber',
  description: 'A modern app to download audio tracks via yt-dlp',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
