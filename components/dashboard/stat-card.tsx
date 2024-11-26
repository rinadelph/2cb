import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  loading?: boolean;
  emptyState?: {
    message: string;
    cta: string;
  };
  action?: () => void;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  loading,
  emptyState,
  action
}: StatCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-7 w-[60px] mb-1" />
          <Skeleton className="h-4 w-[140px]" />
        </CardContent>
      </Card>
    );
  }

  const isEmpty = value === "0" || value === "$0";

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card 
        className={cn(
          "transition-all duration-300",
          isEmpty ? "bg-muted/50" : "hover:shadow-lg",
          action && "cursor-pointer"
        )}
        onClick={action}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className={cn(
            "h-4 w-4",
            isEmpty ? "text-muted-foreground/50" : "text-primary"
          )} />
        </CardHeader>
        <CardContent>
          {isEmpty && emptyState ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {emptyState.message}
              </p>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full"
                onClick={action}
              >
                {emptyState.cta}
              </Button>
            </div>
          ) : (
            <>
              <div className="text-2xl font-bold">{value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
} 