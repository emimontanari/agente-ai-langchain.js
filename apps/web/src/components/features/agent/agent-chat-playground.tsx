"use client"

import * as React from "react"
import { useAgent } from "@/hooks/use-agent"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Send, Trash2, Bot, User } from "lucide-react"

export function AgentChatPlayground() {
    const { messages, sendMessage, clearChat, isLoading } = useAgent()
    const [input, setInput] = React.useState("")
    const scrollRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return
        sendMessage(input)
        setInput("")
    }

    return (
        <Card className="h-[calc(100vh-200px)] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between border-b py-4">
                <div>
                    <CardTitle className="text-lg">Chat Playground</CardTitle>
                    <CardDescription>Prueba el Agente AI en tiempo real</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={clearChat} title="Limpiar chat">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </CardHeader>

            <CardContent className="flex-1 p-0 flex flex-col min-h-0">
                <ScrollArea className="flex-1 p-4" viewportRef={scrollRef}>
                    <div className="space-y-4">
                        {messages.map((m) => (
                            <div
                                key={m.id}
                                className={`flex gap-3 ${m.role === "assistant" ? "flex-row" : "flex-row-reverse"}`}
                            >
                                <Avatar className={`h-8 w-8 ${m.role === "assistant" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                                    <AvatarFallback>
                                        {m.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                                    </AvatarFallback>
                                </Avatar>
                                <div className={`flex flex-col space-y-1 max-w-[80%] ${m.role === "assistant" ? "items-start" : "items-end"}`}>
                                    <div className={`p-3 rounded-2xl text-sm ${m.role === "assistant"
                                        ? "bg-muted text-foreground rounded-tl-none"
                                        : "bg-primary text-primary-foreground rounded-tr-none"
                                        }`}>
                                        {m.content}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground px-1">
                                        {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <div className="p-4 border-t bg-background">
                    <form onSubmit={handleSend} className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Escribe un mensaje..."
                            disabled={isLoading}
                            className="flex-1"
                        />
                        <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    )
}
