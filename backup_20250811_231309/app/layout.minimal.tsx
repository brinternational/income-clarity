import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Income Clarity - Emergency Mode",
  description: "Dividend income lifestyle management tool - Emergency Recovery",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white">
        <div className="min-h-screen">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Emergency Recovery Mode</strong>
            <span className="block sm:inline"> - Application is being restored.</span>
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}