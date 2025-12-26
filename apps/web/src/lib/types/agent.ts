export type AgentTone = "formal" | "informal" | "friendly" | "professional"

export interface AgentConfig {
    id: string
    name: string
    voice: string
    tone: AgentTone
    rules: string[]
    isActive: boolean
    updatedAt: Date
}

export type AgentLogType = "appointment_created" | "appointment_cancelled" | "query_answered" | "handoff" | "error"

export interface AgentLog {
    id: string
    timestamp: Date
    type: AgentLogType
    title: string
    description: string
    status: "success" | "warning" | "error" | "info"
    metadata?: Record<string, any>
}

export interface ChatMessage {
    id: string
    role: "user" | "assistant" | "system"
    content: string
    timestamp: Date
}
