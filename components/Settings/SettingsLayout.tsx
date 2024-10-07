import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface SettingsLayoutProps {
  children: React.ReactNode;
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({ children }) => {
  const router = useRouter();

  const isActive = (path: string) => router.pathname === path;

  return (
    <div className="flex">
      <nav className="w-64 min-h-screen bg-gray-100 p-4">
        <h2 className="text-xl font-semibold mb-4">Settings</h2>
        <ul>
          <li className="mb-2">
            <Link href="/settings/profile" className={`block p-2 rounded ${isActive('/settings/profile') ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}>
              Profile
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/settings/account" className={`block p-2 rounded ${isActive('/settings/account') ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}>
              Account
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/settings/notifications" className={`block p-2 rounded ${isActive('/settings/notifications') ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}>
              Notifications
            </Link>
          </li>
        </ul>
      </nav>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
};

export default SettingsLayout;