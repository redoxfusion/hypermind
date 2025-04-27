import BottomNavBar from '@/app/components/Navbar';

export default function DashboardLayout({ children }) {
  return (
    <html>
      <body>
    <div className="flex flex-col min-h-screen bg-indigo-600">
      {children}
      <BottomNavBar />
    </div>
    </body>
    </html>
  );
}
