import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  className?: string;
}

export function ActionCard({ 
  title, 
  description, 
  icon: Icon, 
  onClick,
  className 
}: ActionCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "group cursor-pointer transition-all duration-200",
        "hover:bg-accent/5",
        className
      )}
    >
      <CardHeader>
        <div className="flex items-center space-x-4">
          <div className="p-2 rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">
              {title}
            </CardTitle>
            <CardDescription>
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
} 