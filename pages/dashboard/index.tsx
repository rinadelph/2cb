import { Layout } from "@/components/Layout";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { StatCard } from "@/components/dashboard/stat-card";
import { ActionCard } from "@/components/dashboard/action-card";
import { ListingCard } from "@/components/listings/ListingCard";
import {
  Building2,
  Activity,
  Users,
  DollarSign,
  ListPlus,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { authLogger } from "@/lib/auth/auth-logger";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useListings } from "@/hooks/useListings";
import { Button } from "@/components/ui/button";
import React from "react";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { listings } = useListings();

  authLogger.debug('Dashboard rendering:', {
    user: user?.email
  });

  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollAreaRef.current) return;
    
    const scrollAmount = 350; // Width of one card
    const currentScroll = scrollAreaRef.current.scrollLeft;
    const targetScroll = direction === 'left' 
      ? currentScroll - scrollAmount 
      : currentScroll + scrollAmount;

    scrollAreaRef.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };

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
      description: "Your listings haven&apos;t received any views yet",
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
      <div className="container max-w-7xl mx-auto p-6 space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-2"
        >
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}!` : '!'}
          </h1>
          <p className="text-lg text-muted-foreground">
            Here&apos;s an overview of your activity.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
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
              transition={{ duration: 0.5, delay: 0.4 + (i * 0.1) }}
            >
              <ActionCard {...action} />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Featured Listings</h2>
              <p className="text-sm text-muted-foreground">
                Browse through available properties
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.push('/listings')}
              className="hover:bg-accent"
            >
              View All
            </Button>
          </div>
          
          <div className="relative group">
            <ScrollArea className="w-full">
              <div className="flex space-x-6 pb-4">
                {listings?.map((listing, i) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="w-[350px] flex-none"
                  >
                    <ListingCard listing={listing} />
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
            
            {listings?.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute -left-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-background/80 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-accent"
                  onClick={() => scroll('left')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute -right-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-background/80 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-accent"
                  onClick={() => scroll('right')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}