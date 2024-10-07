import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Add header, navigation, etc. here */}
      <main className="container mx-auto py-8">{children}</main>
      {/* Add footer here */}
    </div>
  );
};