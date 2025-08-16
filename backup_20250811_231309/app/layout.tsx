import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/themes.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AppProviders } from "@/contexts/AppProviders";
import SkipLinks from "@/components/SkipLinks";
import { DevOnlyLocalModeIndicator } from "@/components/dev/LocalModeIndicator";
import { GlobalLoadingIndicator } from "@/components/ui/GlobalLoadingIndicator";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0ea5e9' },
    { media: '(prefers-color-scheme: dark)', color: '#0ea5e9' }
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL('https://income-clarity.app'),
  title: "Income Clarity - Live Off Your Portfolio",
  description: "Accessible dividend income lifestyle management tool that shows your real net income after taxes and expenses",
  
  // PWA Configuration
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Income Clarity",
    startupImage: [
      {
        url: "/icons/apple-splash-2048-2732.jpg",
        media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/icons/apple-splash-1668-2224.jpg", 
        media: "(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/icons/apple-splash-1536-2048.jpg",
        media: "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/icons/apple-splash-1125-2436.jpg",
        media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/icons/apple-splash-1242-2688.jpg",
        media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/icons/apple-splash-750-1334.jpg",
        media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/icons/apple-splash-640-1136.jpg",
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
    ],
  },
  
  // Open Graph for social sharing
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://income-clarity.app",
    title: "Income Clarity - Live Off Your Portfolio",
    description: "Dividend income lifestyle management tool that shows your real net income after taxes and expenses",
    siteName: "Income Clarity",
    images: [
      {
        url: "/icons/icon-512x512.svg",
        width: 1200,
        height: 630,
        alt: "Income Clarity Dashboard",
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Income Clarity - Live Off Your Portfolio",
    description: "Dividend income lifestyle management tool that shows your real net income after taxes and expenses",
    images: ["/icons/icon-512x512.svg"],
  },
  
  // Additional PWA metadata
  icons: {
    icon: [
      { url: "/icons/icon-16x16.svg", sizes: "16x16", type: "image/svg+xml" },
      { url: "/icons/icon-32x32.svg", sizes: "32x32", type: "image/svg+xml" },
      { url: "/icons/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icons/icon-512x512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
  },
  
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "format-detection": "telephone=no",
    "msapplication-TileColor": "#0ea5e9",
    "msapplication-config": "/browserconfig.xml",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Critical CSS for preventing FOUC - moved to globals.css to avoid hydration issues */}
        
        {/* CRITICAL HOTFIX: Button interaction fix for production */}
        <link rel="stylesheet" href="/button-fix.css" />
        
        {/* Production debugging - remove after fix confirmed */}
        {process.env.NODE_ENV === 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // console.log('Button Fix Applied - Production Mode');
                // Test button functionality on load
                document.addEventListener('DOMContentLoaded', function() {
                  const buttons = document.querySelectorAll('button, [role="button"], .btn');
                  // console.log('Found ' + buttons.length + ' buttons');
                  // buttons.forEach((btn, i) => {
                  //   if (!btn.disabled && !btn.getAttribute('aria-disabled')) {
                  //     btn.style.outline = '1px solid rgba(0,255,0,0.3)';
                  //     console.log('Button ' + i + ' should be clickable');
                  //   }
                  // });
                });
              `
            }}
          />
        )}
        
        {/* Accessibility meta tags */}
        <meta name="color-scheme" content="light dark" />
        <meta name="theme-color" content="#0ea5e9" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0ea5e9" media="(prefers-color-scheme: dark)" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <AppProviders>
            <SkipLinks />
            <GlobalLoadingIndicator position="top" />
            <div id="app-root" role="application" aria-label="Income Clarity Application">
              {children}
            </div>
            <DevOnlyLocalModeIndicator position="bottom-right" />
          </AppProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
