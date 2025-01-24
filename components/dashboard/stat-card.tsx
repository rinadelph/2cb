import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  action?: () => void;
  emptyState?: {
    message: string;
    cta: string;
  };
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  action, 
  emptyState,
  className 
}: StatCardProps) {
  const isEmpty = value === "0" || value === "$0";

  return (
    <Card 
      className={cn(
        "transition-all duration-200",
        isEmpty ? "bg-card/50" : "hover:bg-accent/5",
        action && "cursor-pointer",
        className
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
              variant="ghost" 
              size="sm"
              className="w-full -ml-2 justify-start hover:bg-accent"
              onClick={action}
            >
              {emptyState.cta}
            </Button>
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {description}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
} 