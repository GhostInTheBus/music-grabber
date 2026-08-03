import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JungleBeatz',
  description: 'Feed the primates a URL. They will bring you the loot!',
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
