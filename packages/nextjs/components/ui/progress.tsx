import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "~~/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <div className="relative w-full">
    <ProgressPrimitive.Root
      ref={ref}
      className={cn("relative h-3 w-full overflow-hidden rounded-[2px] bg-secondary/30 border border-secondary", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-primary transition-all duration-300"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
    <span className="absolute right-0 -top-5 text-xs font-mono text-muted-foreground">
      {value}%
    </span>
  </div>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
