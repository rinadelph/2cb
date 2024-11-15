import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  Building2,
  ListPlus,
  Settings,
  Users,
  Activity,
  DollarSign,
  ArrowUpRight
} from 'lucide-react';

const DashboardPage: NextPage = () => {
  const router = useRouter();

  const stats = [
    {
      title: "Total Listings",
      value: "0",
      description: "Active listings this month",
      icon: Building2,
      action: () => router.push('/listings'),
    },
    {
      title: "Total Views",
      value: "0",
      description: "Listing views this month",
      icon: Activity,
      action: () => router.push('/analytics'),
    },
    {
      title: "Total Leads",
      value: "0",
      description: "New leads this month",
      icon: Users,
      action: () => router.push('/leads'),
    },
    {
      title: "Commission",
      value: "$0",
      description: "Earned this month",
      icon: DollarSign,
      action: () => router.push('/earnings'),
    },
  ];

  const quickActions = [
    {
      title: "Create Listing",
      description: "Add a new property listing",
      icon: ListPlus,
      action: () => router.push('/listings/create'),
    },
    {
      title: "Settings",
      description: "Manage your account settings",
      icon: Settings,
      action: () => router.push('/settings'),
    },
  ];

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto p-6">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back! Here&apos;s an overview of your activity.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </CardTitle>
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">
                        {stat.value}
                      </div>
                      <p className="text-xs text-muted-foreground pt-1">
                        {stat.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="grid gap-6 sm:grid-cols-2">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <Card 
                    className="hover:shadow-lg transition-all cursor-pointer group"
                    onClick={action.action}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{action.title}</CardTitle>
                            <CardDescription>{action.description}</CardDescription>
                          </div>
                        </div>
                        <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardHeader>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;