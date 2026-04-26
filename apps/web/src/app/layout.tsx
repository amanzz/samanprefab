import { Outfit } from 'next/font/google';
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import HeaderHeightProvider from '@/components/layout/HeaderHeightProvider';
import LayoutContent from '@/components/layout/LayoutContent';

import QueryContext from '@/context/QueryContext';

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Saman Prefab | Portable Cabins & Modular Structures Manufacturer India",
    template: "%s | Saman Prefab"
  },
  description: "Leading manufacturer of high-fidelity portable cabins, worker housing, and prefab office solutions in India. Precision engineered modular structures.",
  keywords: ["portable cabins", "worker housing", "prefab office", "modular structures", "Saman Prefab"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`} suppressHydrationWarning>
        <QueryContext>
          <ThemeProvider>
            <SidebarProvider>
              <LayoutContent>{children}</LayoutContent>
            </SidebarProvider>
          </ThemeProvider>
        </QueryContext>
      </body>
    </html>
  );
}
