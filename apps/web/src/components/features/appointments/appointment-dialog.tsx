"use client"

import * as React from "react"
import type { Appointment, CreateAppointmentInput } from "@/lib/types/appointments"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface AppointmentDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    appointment?: Appointment | null
    onSave: (data: CreateAppointmentInput) => void
    selectedDate?: Date
}

// Mock data for selects
const MOCK_CUSTOMERS = [
    { id: "c1", name: "Juan Pérez" },
    { id: "c2", name: "María García" },
    { id: "c3", name: "Pedro López" },
    { id: "c4", name: "Ana Martínez" },
]

const MOCK_SERVICES = [
    { id: "s1", name: "Corte + Barba", duration: 45, price: 1500 },
    { id: "s2", name: "Tinte", duration: 90, price: 3200 },
    { id: "s3", name: "Corte", duration: 30, price: 800 },
    { id: "s4", name: "Corte + Peinado", duration: 60, price: 2100 },
]

const MOCK_BARBERS = [
    { id: "b1", name: "Carlos" },
    { id: "b2", name: "María" },
    { id: "b3", name: "Juan" },
]

const TIME_SLOTS = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
]

export function AppointmentDialog({
    open,
    onOpenChange,
    appointment,
    onSave,
    selectedDate,
}: AppointmentDialogProps) {
    const [customerId, setCustomerId] = React.useState(appointment?.customerId || "")
    const [serviceId, setServiceId] = React.useState(appointment?.serviceId || "")
    const [barberId, setBarberId] = React.useState(appointment?.barberId || "")
    const [date, setDate] = React.useState(
        appointment?.date
            ? new Date(appointment.date).toISOString().split("T")[0]
            : selectedDate
                ? selectedDate.toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0]
    )
    const [startTime, setStartTime] = React.useState(appointment?.startTime || "10:00")
    const [notes, setNotes] = React.useState(appointment?.notes || "")

    React.useEffect(() => {
        if (appointment) {
            setCustomerId(appointment.customerId)
            setServiceId(appointment.serviceId)
            setBarberId(appointment.barberId)
            setDate(new Date(appointment.date).toISOString().split("T")[0])
            setStartTime(appointment.startTime)
            setNotes(appointment.notes || "")
        } else {
            setCustomerId("")
            setServiceId("")
            setBarberId("")
            setDate(selectedDate
                ? selectedDate.toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0])
            setStartTime("10:00")
            setNotes("")
        }
    }, [appointment, selectedDate])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        onSave({
            customerId,
            serviceId,
            barberId,
            date: new Date(date),
            startTime,
            notes: notes || undefined,
        })
        onOpenChange(false)
    }

    const isEditing = !!appointment

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Editar Turno" : "Nuevo Turno"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Modifica los detalles del turno"
                            : "Completa los datos para crear un nuevo turno"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Customer */}
                    <div className="space-y-2">
                        <Label htmlFor="customer">Cliente</Label>
                        <Select value={customerId} onValueChange={setCustomerId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar cliente" />
                            </SelectTrigger>
                            <SelectContent>
                                {MOCK_CUSTOMERS.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Service */}
                    <div className="space-y-2">
                        <Label htmlFor="service">Servicio</Label>
                        <Select value={serviceId} onValueChange={setServiceId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar servicio" />
                            </SelectTrigger>
                            <SelectContent>
                                {MOCK_SERVICES.map(s => (
                                    <SelectItem key={s.id} value={s.id}>
                                        {s.name} - ${s.price.toLocaleString()} ({s.duration} min)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Barber */}
                    <div className="space-y-2">
                        <Label htmlFor="barber">Peluquero</Label>
                        <Select value={barberId} onValueChange={setBarberId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar peluquero" />
                            </SelectTrigger>
                            <SelectContent>
                                {MOCK_BARBERS.map(b => (
                                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Fecha</Label>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="time">Hora</Label>
                            <Select value={startTime} onValueChange={setStartTime}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar hora" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TIME_SLOTS.map(t => (
                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Notes */}
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
                        <Button type="submit" disabled={!customerId || !serviceId || !barberId}>
                            {isEditing ? "Guardar Cambios" : "Crear Turno"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
