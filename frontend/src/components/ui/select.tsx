
import * as React from "react";
import { cn } from "@/utils/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-gray-200 bg-white dark:bg-dark-bg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-border dark:ring-offset-dark-bg dark:focus:ring-sky-400",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);

Select.displayName = "Select";

export { Select };

