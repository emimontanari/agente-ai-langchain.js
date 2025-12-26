"use client"

import * as React from "react"
import type { Customer, CreateCustomerInput } from "@/lib/types/customers"
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

interface CustomerDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    customer?: Customer | null
    onSave: (data: CreateCustomerInput) => void
}

export function CustomerDialog({
    open,
    onOpenChange,
    customer,
    onSave,
}: CustomerDialogProps) {
    const [name, setName] = React.useState(customer?.name || "")
    const [phone, setPhone] = React.useState(customer?.phone || "")
    const [email, setEmail] = React.useState(customer?.email || "")
    const [notes, setNotes] = React.useState(customer?.notes || "")

    React.useEffect(() => {
        if (customer) {
            setName(customer.name)
            setPhone(customer.phone)
            setEmail(customer.email || "")
            setNotes(customer.notes || "")
        } else {
            setName("")
            setPhone("")
            setEmail("")
            setNotes("")
        }
    }, [customer])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        onSave({
            name,
            phone,
            email: email || undefined,
            notes: notes || undefined,
        })
        onOpenChange(false)
    }

    const isEditing = !!customer

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Editar Cliente" : "Nuevo Cliente"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Modifica los datos del cliente"
                            : "Completa los datos para agregar un nuevo cliente"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre *</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nombre completo"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono *</Label>
                        <Input
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+54 11 1234-5678"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email (opcional)</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="cliente@email.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notas (opcional)</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Notas adicionales..."
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={!name || !phone}>
                            {isEditing ? "Guardar Cambios" : "Agregar Cliente"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
