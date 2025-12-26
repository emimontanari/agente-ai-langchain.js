"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface RelativeTimeProps extends React.HTMLAttributes<HTMLSpanElement> {
    date: Date | string | number
    updateInterval?: number
}

function RelativeTime({
    date,
    updateInterval = 60000,
    className,
    ...props
}: RelativeTimeProps) {
    const [relativeTime, setRelativeTime] = React.useState("")

    React.useEffect(() => {
        const calculateRelativeTime = () => {
            const now = new Date()
            const then = new Date(date)
            const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)

            if (diffInSeconds < 60) return "justo ahora"

            const diffInMinutes = Math.floor(diffInSeconds / 60)
            if (diffInMinutes < 60) return `hace ${diffInMinutes} min`

            const diffInHours = Math.floor(diffInMinutes / 60)
            if (diffInHours < 24) return `hace ${diffInHours}h`

            const diffInDays = Math.floor(diffInHours / 24)
            if (diffInDays < 7) return `hace ${diffInDays}d`

            return then.toLocaleDateString()
        }

        setRelativeTime(calculateRelativeTime())

        const intervalId = setInterval(() => {
            setRelativeTime(calculateRelativeTime())
        }, updateInterval)

        return () => clearInterval(intervalId)
    }, [date, updateInterval])

    return (
        <span className={cn("text-xs text-muted-foreground", className)} {...props}>
            {relativeTime}
        </span>
    )
}

export { RelativeTime }
