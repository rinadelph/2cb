import { Metadata } from "next";
import { PropertyMapProvider } from '@/components/providers/property-map-provider';

export const metadata: Metadata = {
  title: '2Click Broker',
  description: 'Property management and brokerage platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <PropertyMapProvider>
          {children}
        </PropertyMapProvider>
      </body>
    </html>
  );
}
