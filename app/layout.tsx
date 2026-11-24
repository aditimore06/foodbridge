import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import DemoControlBar from '@/components/DemoControlBar';
import ToastAlert from '@/components/ToastAlert';

export const metadata: Metadata = {
  title: 'FoodBridge — Surplus Food Rescue & Redistribution Network',
  description: 'Real-time logistics, Haversine matching, and safe-consumption window redistribution connecting food donors with verified shelters.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#F8F7F4] text-[#1C1917] flex flex-col min-h-screen">
        <AppProvider>
          <Navbar />
          <ToastAlert />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28">
            {children}
          </main>
          <DemoControlBar />
        </AppProvider>
      </body>
    </html>
  );
}
