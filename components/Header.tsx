import React from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';

export default function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <div className="text-xl font-bold">2Click Broker</div>
          {/* Add navigation items here */}
        </nav>
      </div>
    </header>
  );
}