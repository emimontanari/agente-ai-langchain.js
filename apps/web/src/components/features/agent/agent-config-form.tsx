"use client"

import * as React from "react"
import { useAgent } from "@/hooks/use-agent"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Save } from "lucide-react"

export function AgentConfigForm() {
    const { config, updateConfig, isLoading } = useAgent()
    const [localRules, setLocalRules] = React.useState<string[]>(config.rules)

    const handleAddRule = () => {
        setLocalRules([...localRules, ""])
    }

    const handleRemoveRule = (index: number) => {
        setLocalRules(localRules.filter((_, i) => i !== index))
    }

    const handleRuleChange = (index: number, value: string) => {
        const newRules = [...localRules]
        newRules[index] = value
        setLocalRules(newRules)
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        await updateConfig({
            name: formData.get("name") as string,
            voice: formData.get("voice") as string,
            tone: formData.get("tone") as any,
            rules: localRules.filter(r => r.trim() !== "")
        })
    }

    return (
        <form onSubmit={handleSave} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Identidad y Tono</CardTitle>
                    <CardDescription>
                        Configura cómo se presenta y habla el agente
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nombre del Agente</Label>
                        <Input id="name" name="name" defaultValue={config.name} placeholder="E.g. Peluquería AI" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="voice">Voz</Label>
                            <Select name="voice" defaultValue={config.voice}>
                                <SelectTrigger id="voice">
                                    <SelectValue placeholder="Selecciona una voz" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Alloy">Alloy (Neutral)</SelectItem>
                                    <SelectItem value="Echo">Echo (Natural/Maduro)</SelectItem>
                                    <SelectItem value="Shimmer">Shimmer (Suave/Femenino)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="tone">Tono de Voz</Label>
                            <Select name="tone" defaultValue={config.tone}>
                                <SelectTrigger id="tone">
                                    <SelectValue placeholder="Selecciona el tono" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="formal">Formal</SelectItem>
                                    <SelectItem value="informal">Informal</SelectItem>
                                    <SelectItem value="friendly">Amigable</SelectItem>
                                    <SelectItem value="professional">Profesional</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle>Reglas y Comportamiento</CardTitle>
                        <CardDescription>
                            Instrucciones específicas que el agente debe seguir
                        </CardDescription>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddRule}>
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Regla
                    </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                    {localRules.map((rule, index) => (
                        <div key={index} className="flex gap-2">
                            <Input
                                value={rule}
                                onChange={(e) => handleRuleChange(index, e.target.value)}
                                placeholder="E.g. Siempre preguntar por alergias"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => handleRemoveRule(index)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                <div className="space-y-0.5">
                    <Label>Agente Activo</Label>
                    <p className="text-sm text-muted-foreground">
                        Habilita o deshabilita las interacciones automáticas
                    </p>
                </div>
                <Switch
                    checked={config.isActive}
                    onCheckedChange={(checked) => updateConfig({ isActive: checked })}
                />
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Configuración
                </Button>
            </div>
        </form>
    )
}
