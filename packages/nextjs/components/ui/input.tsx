import * as React from "react";

import { cn } from "~~/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-none border-0 border-b-2 border-foreground bg-transparent px-2 py-2 text-base font-sans font-light placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:shadow-[0_2px_0_0] focus-visible:shadow-secondary/30 disabled:cursor-not-allowed disabled:opacity-50 transition-all md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
