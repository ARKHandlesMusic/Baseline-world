import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Omniframe 3D Asset & Remotion Studio',
  description:
    'Cel-shaded Anime & Lo-Fi 3D Asset Pipeline and deterministic Remotion video composition studio — Asset #01: Main Street Road Section 1 Primary Ground Plane.',
  openGraph: {
    title: 'Omniframe 3D Asset & Remotion Studio',
    description:
      'Cel-shaded Anime & Lo-Fi 3D Asset Pipeline and deterministic Remotion video composition studio — Asset #01: Main Street Road Section 1 Primary Ground Plane.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Omniframe 3D Asset & Remotion Studio',
    description:
      'Cel-shaded Anime & Lo-Fi 3D Asset Pipeline and deterministic Remotion video composition studio — Asset #01: Main Street Road Section 1 Primary Ground Plane.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="dark">
      <body
        suppressHydrationWarning
        className="bg-[#0D0B14] text-[#F3EFFA] antialiased selection:bg-[#A855F7]/30 selection:text-white overflow-hidden"
      >
        {children}
      </body>
    </html>
  );
}
