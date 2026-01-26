import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Igor Szuniewicz | Game Audio Designer',
  description: 'Portfolio of Igor Szuniewicz - Game Audio Designer, Composer & Sound Engineer',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
