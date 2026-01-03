import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingIndicatorProps {
  /**
   * Optional label for screen readers and accessibility
   * @default "Loading"
   */
  label?: string;

  /**
   * Optional size of the spinner icon
   * @default "md" (h-8 w-8)
   */
  size?: "sm" | "md" | "lg";

  /**
   * Optional additional CSS classes
   */
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

/**
 * LoadingIndicator
 * A centered, accessible loading spinner component
 * Uses Loader2 icon from lucide-react with smooth rotation animation
 */
export default function LoadingIndicator({
  label = "Loading",
  size = "md",
  className = "",
}: LoadingIndicatorProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn("flex items-center justify-center", className)}
    >
      <Loader2
        className={`${sizeClasses[size]} animate-spin text-muted-foreground`}
        strokeWidth={2}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
