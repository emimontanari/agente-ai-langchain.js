"use client"

import * as React from "react"
import type { AgentConfig, AgentLog, ChatMessage, AgentTone } from "@/lib/types/agent"

const MOCK_CONFIG: AgentConfig = {
    id: "agent-1",
    name: "Peluquería AI",
    voice: "Alloy",
    tone: "friendly",
    rules: [
        "Siempre saludar cordialmente.",
        "No dar turnos con menos de 2 horas de anticipación.",
        "Para cancelaciones, pedir el número de teléfono.",
        "Si preguntan por precios complejos, ofrecer hablar con un humano."
    ],
    isActive: true,
    updatedAt: new Date()
}

const MOCK_LOGS: AgentLog[] = [
    {
        id: "l1",
        timestamp: new Date(Date.now() - 300000),
        type: "appointment_created",
        title: "Turno reservado",
        description: "Corte para mañana 15:00 - Cliente: Juan Pérez",
        status: "success"
    },
    {
        id: "l2",
        timestamp: new Date(Date.now() - 720000),
        type: "query_answered",
        title: "Consulta de precios",
        description: "Respondido: Precios de Tinte y Alisados",
        status: "info"
    },
    {
        id: "l3",
        timestamp: new Date(Date.now() - 1800000),
        type: "appointment_cancelled",
        title: "Cancelación procesada",
        description: "Turno del 28/12 cancelado por el cliente",
        status: "warning"
    },
    {
        id: "l4",
        timestamp: new Date(Date.now() - 3600000),
        type: "handoff",
        title: "Derivación a humano",
        description: "Cliente solicita hablar con el dueño por queja",
        status: "warning"
    }
]

export function useAgent() {
    const [config, setConfig] = React.useState<AgentConfig>(MOCK_CONFIG)
    const [logs, setLogs] = React.useState<AgentLog[]>(MOCK_LOGS)
    const [messages, setMessages] = React.useState<ChatMessage[]>([
        {
            id: "m1",
            role: "assistant",
            content: "¡Hola! Soy tu asistente de Peluquería AI. ¿En qué puedo ayudarte hoy?",
            timestamp: new Date()
        }
    ])
    const [isLoading, setIsLoading] = React.useState(false)

    const updateConfig = async (newConfig: Partial<AgentConfig>) => {
        setIsLoading(true)
        await new Promise(resolve => setTimeout(resolve, 500))
        setConfig(prev => ({ ...prev, ...newConfig, updatedAt: new Date() }))
        setIsLoading(false)
    }

    const sendMessage = async (content: string) => {
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: "user",
            content,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMsg])
        setIsLoading(true)

        // Simulate AI response
        await new Promise(resolve => setTimeout(resolve, 1000))

        const assistantMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `Entendido. He procesado tu solicitud: "${content}". ¿Hay algo más en lo que pueda ayudarte?`,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, assistantMsg])
        setIsLoading(false)
    }

    const clearChat = () => {
        setMessages([
            {
                id: "m1",
                role: "assistant",
                content: "Chat reiniciado. ¿En qué puedo ayudarte?",
                timestamp: new Date()
            }
        ])
    }

    return {
        config,
        logs,
        messages,
        isLoading,
        updateConfig,
        sendMessage,
        clearChat
    }
}
