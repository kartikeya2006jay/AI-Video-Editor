// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: "AI Video Studio Pro | Professional Video Enhancement",
  description: "AI-powered video editing with real-time preview, automatic caption generation, and professional enhancement tools",
  keywords: ["video editor", "AI video", "caption generator", "video enhancement", "subtitle maker"],
  authors: [{ name: "AI Video Studio Pro" }],
  openGraph: {
    title: "AI Video Studio Pro",
    description: "Professional video enhancement with real-time preview",
    type: "website",
    url: "https://aivideostudio.pro",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI Video Studio Pro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Video Studio Pro",
    description: "Professional video enhancement with real-time preview",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-gray-950 text-gray-100 overflow-x-hidden min-h-screen page-transition`}
      >
        {/* Animated gradient background */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute top-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute -bottom-40 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-gray-900/30 via-transparent to-gray-900/30" />
        </div>

        {/* Grid pattern overlay */}
        <div className="fixed inset-0 -z-10 grid-pattern opacity-10" />

        {/* Floating particles */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        {/* Main content */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Performance optimization */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Performance optimization
              if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(console.error);
                });
              }
              
              // Smooth scroll behavior
              document.documentElement.style.scrollBehavior = 'smooth';
              
              // Prevent flash of unstyled content
              document.documentElement.classList.add('js-loaded');
            `,
          }}
        />
      </body>
    </html>
  );
}