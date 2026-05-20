import type { ReactNode } from 'react';

export const metadata = {
  title: 'VibeInvite Invitation',
  description: 'A VibeInvite invitation'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
