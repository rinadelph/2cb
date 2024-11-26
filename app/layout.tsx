import { Metadata } from "next";
import { Layout } from "@/components/layout/layout";

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
        {children}
      </body>
    </html>
  );
}
