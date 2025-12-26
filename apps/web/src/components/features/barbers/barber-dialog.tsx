"use client"

import * as React from "react"
import type { Barber, CreateBarberInput, WorkSchedule } from "@/lib/types/barbers"
import { DAYS_OF_WEEK } from "@/lib/types/barbers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
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

interface BarberDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    barber?: Barber | null
    onSave: (data: CreateBarberInput) => void
}

const TIME_OPTIONS = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
]

export function BarberDialog({
    open,
    onOpenChange,
    barber,
    onSave,
}: BarberDialogProps) {
    const [name, setName] = React.useState(barber?.name || "")
    const [phone, setPhone] = React.useState(barber?.phone || "")
    const [email, setEmail] = React.useState(barber?.email || "")
    const [specialty, setSpecialty] = React.useState(barber?.specialty || "")
    const [schedule, setSchedule] = React.useState<WorkSchedule[]>(
        barber?.schedule || []
    )

    React.useEffect(() => {
        if (barber) {
            setName(barber.name)
            setPhone(barber.phone || "")
            setEmail(barber.email || "")
            setSpecialty(barber.specialty || "")
            setSchedule(barber.schedule)
        } else {
            setName("")
            setPhone("")
            setEmail("")
            setSpecialty("")
            setSchedule([])
        }
    }, [barber])

    const toggleDay = (dayOfWeek: number, checked: boolean) => {
        if (checked) {
            setSchedule(prev => [
                ...prev,
                { dayOfWeek, startTime: "09:00", endTime: "18:00" }
            ])
        } else {
            setSchedule(prev => prev.filter(s => s.dayOfWeek !== dayOfWeek))
        }
    }

    const updateSchedule = (dayOfWeek: number, field: "startTime" | "endTime", value: string) => {
        setSchedule(prev => prev.map(s =>
            s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s
        ))
    }

    const isDayEnabled = (dayOfWeek: number) => {
        return schedule.some(s => s.dayOfWeek === dayOfWeek)
    }

    const getScheduleForDay = (dayOfWeek: number) => {
        return schedule.find(s => s.dayOfWeek === dayOfWeek)
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        onSave({
            name,
            phone: phone || undefined,
            email: email || undefined,
            specialty: specialty || undefined,
            schedule,
        })
        onOpenChange(false)
    }

    const isEditing = !!barber

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Editar Peluquero" : "Nuevo Peluquero"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Modifica los datos del peluquero"
                            : "Completa los datos para agregar un nuevo peluquero"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
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
                            <Label htmlFor="specialty">Especialidad</Label>
                            <Input
                                id="specialty"
                                value={specialty}
                                onChange={(e) => setSpecialty(e.target.value)}
                                placeholder="Ej: Cortes modernos"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+54 11 1234-5678"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@example.com"
                            />
                        </div>
                    </div>

                    {/* Schedule */}
                    <div className="space-y-3">
                        <Label>Horario de Trabajo</Label>
                        <div className="space-y-2 border rounded-lg p-3">
                            {DAYS_OF_WEEK.map((day, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <Checkbox
                                        id={`day-${i}`}
                                        checked={isDayEnabled(i)}
                                        onCheckedChange={(checked) => toggleDay(i, !!checked)}
                                    />
                                    <label htmlFor={`day-${i}`} className="w-24 text-sm">
                                        {day}
                                    </label>
                                    {isDayEnabled(i) && (
                                        <div className="flex items-center gap-2">
                                            <Select
                                                value={getScheduleForDay(i)?.startTime || "09:00"}
                                                onValueChange={(v) => updateSchedule(i, "startTime", v)}
                                            >
                                                <SelectTrigger className="w-24 h-8">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {TIME_OPTIONS.map(t => (
                                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <span className="text-muted-foreground">a</span>
                                            <Select
                                                value={getScheduleForDay(i)?.endTime || "18:00"}
                                                onValueChange={(v) => updateSchedule(i, "endTime", v)}
                                            >
                                                <SelectTrigger className="w-24 h-8">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {TIME_OPTIONS.map(t => (
                                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={!name}>
                            {isEditing ? "Guardar Cambios" : "Agregar Peluquero"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
