import { Progress } from "@/components/ui/progress";

interface LoadingIndicatorProps {
  message: string;
}

export const LoadingIndicator = ({ message }: LoadingIndicatorProps) => {
  return (
    <div className="space-y-4">
      <Progress value={100} className="animate-pulse" />
      <p className="text-sm text-muted-foreground text-center">{message}</p>
    </div>
  );
};