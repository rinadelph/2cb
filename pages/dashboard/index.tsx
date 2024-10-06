import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Layout } from '../../components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const DashboardPage: NextPage = () => {
  const router = useRouter();

  return (
    <Layout>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Manage Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/listings/manage')} className="w-full">
              Go to Listings
            </Button>
          </CardContent>
        </Card>
        {/* Add more dashboard cards here */}
      </div>
    </Layout>
  );
};

export default DashboardPage;