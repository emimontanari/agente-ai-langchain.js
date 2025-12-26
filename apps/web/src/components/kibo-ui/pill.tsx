import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const pillVariants = cva(
    "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
                secondary:
                    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive:
                    "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
                outline: "text-foreground border border-input hover:bg-accent hover:text-accent-foreground",
                ghost: "hover:bg-accent hover:text-accent-foreground",
            },
            size: {
                sm: "px-2 py-0",
                md: "px-2.5 py-0.5",
                lg: "px-3 py-1 text-sm",
            }
        },
        defaultVariants: {
            variant: "default",
            size: "md",
        },
    }
)

export interface PillProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pillVariants> { }

function Pill({ className, variant, size, ...props }: PillProps) {
    return (
        <div className={cn(pillVariants({ variant, size }), className)} {...props} />
    )
}

export { Pill, pillVariants }
