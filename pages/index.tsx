import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, Key, Shield } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user, loading, signIn, signOut } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Layout>
      <div className="relative min-h-screen">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        
        {/* Main Content */}
        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <HeroSection />
            
            {/* Features Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <FeatureCard 
                icon={<Building2 className="h-6 w-6" />}
                title="Property Management"
                description="Efficiently manage your real estate portfolio with our intuitive tools."
              />
              <FeatureCard 
                icon={<Key className="h-6 w-6" />}
                title="Easy Access"
                description="Two-click system for quick and secure access to commission details."
              />
              <FeatureCard 
                icon={<Shield className="h-6 w-6" />}
                title="Secure Platform"
                description="Bank-level security to protect your sensitive information."
              />
            </motion.div>

            {/* CTA Section */}
            <div className="mt-16 text-center">
              {user ? (
                <Button
                  variant="default"
                  size="lg"
                  onClick={signOut}
                  className="group"
                >
                  Sign Out
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="lg"
                  onClick={signIn}
                  className="group"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function HeroSection() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6"
    >
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-foreground">
        Welcome to{' '}
        <span className="text-primary">2Click Broker</span>
      </h1>
      <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
        The modern platform for real estate professionals to manage listings and commissions with confidence
      </p>
    </motion.div>
  );
}

function FeatureCard({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}
