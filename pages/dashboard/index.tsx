import { Layout } from "@/components/Layout";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { StatCard } from "@/components/dashboard/stat-card";
import { ActionCard } from "@/components/dashboard/action-card";
import {
  Building2,
  Activity,
  Users,
  DollarSign,
  ListPlus,
  Settings,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { authLogger } from "@/lib/auth/auth-logger";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  authLogger.debug('Dashboard rendering:', {
    user: user?.email
  });

  const stats = [
    {
      title: "Total Listings",
      value: "0",
      description: "Add your first property listing to get started",
      icon: Building2,
      action: () => router.push('/listings/create'),
      emptyState: {
        message: "Create your first property listing",
        cta: "Add Listing"
      }
    },
    {
      title: "Total Views",
      value: "0",
      description: "Your listings haven't received any views yet",
      icon: Activity,
      emptyState: {
        message: "Share your listings to get views",
        cta: "View Analytics"
      }
    },
    {
      title: "Total Leads",
      value: "0",
      description: "No leads generated yet",
      icon: Users,
      emptyState: {
        message: "Start collecting leads",
        cta: "View Leads"
      }
    },
    {
      title: "Commission",
      value: "$0",
      description: "Track your earnings",
      icon: DollarSign,
      emptyState: {
        message: "Start tracking your commissions",
        cta: "View Earnings"
      }
    }
  ];

  const actions = [
    {
      title: "Create Listing",
      description: "Add a new property listing to your portfolio",
      icon: ListPlus,
      onClick: () => router.push('/listings/create')
    },
    {
      title: "Settings",
      description: "Configure your account and preferences",
      icon: Settings,
      onClick: () => router.push('/settings')
    }
  ];

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto p-6 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}!` : '!'}
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your activity.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.5,
                delay: i * 0.1 
              }}
            >
              <StatCard {...stat} />
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {actions.map((action, i) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.5,
                delay: 0.4 + (i * 0.1)
              }}
            >
              <ActionCard {...action} />
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
}