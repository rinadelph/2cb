import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { Layout } from '../components/Layout';  // Changed to named import
import { Button } from '../components/ui/button';  // Keep lowercase 'b' if that's the correct filename

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth(false);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Welcome to 2Click Broker</h1>
        <p className="text-xl text-gray-600 mb-8">The platform for real estate professionals</p>
        {!user && (
          <div className="space-y-4">
            <Button onClick={() => router.push('/auth/login')} className="w-full sm:w-auto">
              Log In
            </Button>
            <Button onClick={() => router.push('/auth/register')} className="w-full sm:w-auto">
              Register
            </Button>
          </div>
        )}
        {user && (
          <div className="space-y-4">
            <Button onClick={() => router.push('/dashboard')} className="w-full sm:w-auto">
              Go to Dashboard
            </Button>
            <Button onClick={() => router.push('/listings')} className="w-full sm:w-auto">
              Listings
            </Button>
            <Button onClick={() => router.push('/settings')} className="w-full sm:w-auto">
              Settings
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}