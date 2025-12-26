import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const statusVariants = cva(
    "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium transition-colors",
    {
        variants: {
            variant: {
                default: "bg-primary/10 text-primary",
                success: "bg-green-500/10 text-green-600 dark:text-green-500",
                warning: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500",
                error: "bg-red-500/10 text-red-600 dark:text-red-500",
                info: "bg-blue-500/10 text-blue-600 dark:text-blue-500",
                neutral: "bg-muted text-muted-foreground",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface StatusProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusVariants> {
    dot?: boolean
}

function Status({ className, variant, dot = true, children, ...props }: StatusProps) {
    return (
        <div className={cn(statusVariants({ variant }), className)} {...props}>
            {dot && (
                <span
                    className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        variant === "default" && "bg-primary",
                        variant === "success" && "bg-green-600 dark:bg-green-500",
                        variant === "warning" && "bg-yellow-600 dark:bg-yellow-500",
                        variant === "error" && "bg-red-600 dark:bg-red-500",
                        variant === "info" && "bg-blue-600 dark:bg-blue-500",
                        variant === "neutral" && "bg-muted-foreground"
                    )}
                />
            )}
            {children}
        </div>
    )
}

export { Status, statusVariants }
