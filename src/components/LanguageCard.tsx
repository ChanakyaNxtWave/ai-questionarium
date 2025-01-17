import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface LanguageCardProps {
  icon: LucideIcon;
  name: string;
  onClick: () => void;
  className?: string;
}

export const LanguageCard = ({ icon: Icon, name, onClick, className }: LanguageCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300",
        "border border-gray-200 hover:border-primary/20",
        "group flex flex-col items-center justify-center gap-4",
        "hover:animate-card-hover",
        className
      )}
    >
      <Icon className="w-12 h-12 text-primary group-hover:text-primary-hover transition-colors" />
      <span className="text-lg font-semibold text-gray-800 group-hover:text-primary-hover transition-colors">
        {name}
      </span>
    </button>
  );
};