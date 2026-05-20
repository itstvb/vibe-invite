import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'VibeInvite',
  description: 'Animated digital invitations'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
