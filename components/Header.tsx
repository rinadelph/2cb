import React from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-blue-500 text-white p-4">
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/">
          <a className="text-2xl font-bold">Home</a>
        </Link>
        <div className="space-x-4">
          <Link href="/listings">
            <a>Listings</a>
          </Link>
          {user && (
            <Link href="/listings/create">
              <a>Create Listing</a>
            </Link>
          )}
          {user ? (
            <Link href="/profile">
              <a>Profile</a>
            </Link>
          ) : (
            <Link href="/login">
              <a>Login</a>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}