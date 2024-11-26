import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface ActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
}

export function ActionCard({ title, description, icon: Icon, onClick }: ActionCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 17,
      }}
    >
      <Card 
        onClick={onClick}
        className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20"
      >
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
              <Icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div>
              <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">
                {title}
              </CardTitle>
              <CardDescription className="text-muted-foreground/80">
                {description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    </motion.div>
  );
} 