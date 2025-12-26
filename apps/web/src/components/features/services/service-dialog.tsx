"use client"

import * as React from "react"
import type { Service, CreateServiceInput } from "@/lib/types/services"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface ServiceDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    service?: Service | null
    onSave: (data: CreateServiceInput) => void
}

export function ServiceDialog({
    open,
    onOpenChange,
    service,
    onSave,
}: ServiceDialogProps) {
    const [name, setName] = React.useState(service?.name || "")
    const [description, setDescription] = React.useState(service?.description || "")
    const [duration, setDuration] = React.useState(service?.duration?.toString() || "30")
    const [price, setPrice] = React.useState(service?.price?.toString() || "")

    React.useEffect(() => {
        if (service) {
            setName(service.name)
            setDescription(service.description || "")
            setDuration(service.duration.toString())
            setPrice(service.price.toString())
        } else {
            setName("")
            setDescription("")
            setDuration("30")
            setPrice("")
        }
    }, [service])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        onSave({
            name,
            description: description || undefined,
            duration: parseInt(duration),
            price: parseFloat(price),
        })
        onOpenChange(false)
    }

    const isEditing = !!service

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Editar Servicio" : "Nuevo Servicio"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Modifica los datos del servicio"
                            : "Completa los datos para agregar un nuevo servicio"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre *</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nombre del servicio"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción (opcional)</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descripción del servicio..."
                            rows={2}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="duration">Duración (min) *</Label>
                            <Input
                                id="duration"
                                type="number"
                                min="5"
                                step="5"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="price">Precio (ARS) *</Label>
                            <Input
                                id="price"
                                type="number"
                                min="0"
                                step="100"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="1500"
                                required
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={!name || !duration || !price}>
                            {isEditing ? "Guardar Cambios" : "Agregar Servicio"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
