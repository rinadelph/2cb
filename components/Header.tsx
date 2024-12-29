import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';

export function Header() {
  const { user, signOut } = useAuth();
  
  return (
    <header>
      {user ? (
        <>
          <span>{user.email}</span>
          <button onClick={signOut}>Sign Out</button>
        </>
      ) : (
        <Link href="/login">Sign In</Link>
      )}
    </header>
  );
}