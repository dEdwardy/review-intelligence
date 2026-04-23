'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '../lib/supabase/client.js';

export default function SessionActions({ userEmail, nextPath = '/' }) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.refresh();
  }

  if (userEmail) {
    return (
      <div className="masthead__session">
        <span className="masthead__email" title={userEmail}>
          {userEmail}
        </span>
        <Link className="text-link" href="/pricing">
          Pricing
        </Link>
        <button className="text-link" type="button" onClick={handleSignOut}>
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="masthead__session">
      <Link className="text-link" href={`/auth?next=${encodeURIComponent(nextPath)}`}>
        Sign in
      </Link>
      <Link className="text-link" href={`/auth?next=${encodeURIComponent(nextPath)}&mode=signup`}>
        Create account
      </Link>
    </div>
  );
}
