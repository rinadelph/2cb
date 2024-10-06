import React from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';

export const Header: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-extrabold text-indigo-600">
            2Click Broker
          </Link>
          <ul className="flex space-x-4">
            <li><Link href="/" className="text-gray-600 hover:text-indigo-600">Home</Link></li>
            {user && (
              <>
                <li><Link href="/dashboard" className="text-gray-600 hover:text-indigo-600">Dashboard</Link></li>
                <li><Link href="/listings" className="text-gray-600 hover:text-indigo-600">Listings</Link></li>
              </>
            )}
            {!user && (
              <>
                <li><Link href="/auth/login" className="text-gray-600 hover:text-indigo-600">Login</Link></li>
                <li><Link href="/auth/register" className="text-gray-600 hover:text-indigo-600">Register</Link></li>
              </>
            )}
          </ul>
        </div>
      </nav>
    </header>
  );
};