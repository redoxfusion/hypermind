import BottomNavBar from "@/app/components/Navbar";
import { ClerkProvider } from "@clerk/nextjs";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

export const metadata = {
  title: "Hypermind",
  description: "Your AI-powered personal assistant and multi games platform",
  manifest: "/manifest.json", // this works in Next 15
};

export default function DashboardLayout({ children }) {
  return (
    <ClerkProvider>
      <html>
        <head>
          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#4F46E5" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black" />
          <meta name="apple-mobile-web-app-title" content="Hypermind" />
          <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
          {/* Add favicon if needed */}
          <link rel="icon" href="/favicon.ico" />
          <meta name="description" content={metadata.description} />
          <title>{metadata.title}</title>
        </head>
        <body>
          <div className="flex flex-col min-h-screen bg-indigo-600">
          <NextTopLoader color="#ffffff" />
            {children}
            <BottomNavBar />
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
