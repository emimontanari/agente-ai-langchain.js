"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AgentConfigForm } from "@/components/features/agent/agent-config-form"
import { AgentLogsList } from "@/components/features/agent/agent-logs-list"
import { AgentChatPlayground } from "@/components/features/agent/agent-chat-playground"
import { Settings, Activity, Terminal } from "lucide-react"

export default function AgentPage() {
    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Agente AI</h1>
                    <p className="text-muted-foreground mt-1">
                        Configura y monitorea tu asistente inteligente
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Side: Tabs */}
                <div className="lg:col-span-12 xl:col-span-8">
                    <Tabs defaultValue="config" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-flex">
                            <TabsTrigger value="config" className="flex items-center gap-2">
                                <Settings className="h-4 w-4" />
                                Configuración
                            </TabsTrigger>
                            <TabsTrigger value="logs" className="flex items-center gap-2">
                                <Activity className="h-4 w-4" />
                                Activity Logs
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="config" className="border-none p-0 outline-none">
                            <AgentConfigForm />
                        </TabsContent>

                        <TabsContent value="logs" className="border-none p-0 outline-none">
                            <AgentLogsList />
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Side: Chat Playground (Always visible on large screens) */}
                <div className="hidden xl:block xl:col-span-4">
                    <AgentChatPlayground />
                </div>

                {/* Mobile Chat Tab (Optional or separate view on smaller screens) */}
                {/* In this simple implementation, we assume a sidebar playground or separate tab for mobile */}
            </div>
        </div>
    )
}
