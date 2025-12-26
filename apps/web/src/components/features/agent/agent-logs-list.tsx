"use client"

import * as React from "react"
import { useAgent } from "@/hooks/use-agent"
import { Status } from "@/components/kibo-ui/status"
import { RelativeTime } from "@/components/kibo-ui/relative-time"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Calendar,
    MessageSquare,
    AlertCircle,
    Clock,
    CheckCircle2,
    XCircle
} from "lucide-react"

const LOG_ICONS = {
    appointment_created: CheckCircle2,
    appointment_cancelled: XCircle,
    query_answered: MessageSquare,
    handoff: AlertCircle,
    error: AlertCircle,
}

export function AgentLogsList() {
    const { logs } = useAgent()

    return (
        <Card className="h-[calc(100vh-200px)]">
            <CardHeader>
                <CardTitle>Historial de Actividad</CardTitle>
                <CardDescription>
                    Últimas interacciones procesadas por el agente de IA
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-320px)] px-6">
                    <div className="space-y-4 pb-6">
                        {logs.map((log) => {
                            const Icon = LOG_ICONS[log.type] || Clock
                            return (
                                <div
                                    key={log.id}
                                    className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                >
                                    <div className={`mt-1 p-2 rounded-full border ${log.status === "success" ? "bg-green-500/10 text-green-600 border-green-200" :
                                            log.status === "warning" ? "bg-yellow-500/10 text-yellow-600 border-yellow-200" :
                                                log.status === "error" ? "bg-red-500/10 text-red-600 border-red-200" :
                                                    "bg-blue-500/10 text-blue-600 border-blue-200"
                                        }`}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold text-sm">{log.title}</p>
                                            <RelativeTime date={log.timestamp} />
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {log.description}
                                        </p>
                                        <div className="pt-1">
                                            <Status variant={log.status as any} size="sm">
                                                {log.type.replace("_", " ").toUpperCase()}
                                            </Status>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
