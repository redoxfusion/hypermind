import BottomNavBar from "@/app/components/Navbar";
import { ClerkProvider } from "@clerk/nextjs";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

export default function DashboardLayout({ children }) {
  return (
    <ClerkProvider>
      <html>
        <body>
          <div className="flex flex-col min-h-screen bg-indigo-600">
          <NextTopLoader />
            {children}
            <BottomNavBar />
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
