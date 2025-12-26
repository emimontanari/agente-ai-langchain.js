"use client"

import * as React from "react"
import { useAppointments } from "@/hooks/use-appointments"
import type { Appointment, CreateAppointmentInput } from "@/lib/types/appointments"
import { Calendar, type CalendarEvent } from "@/components/kibo-ui/calendar"
import { AppointmentDialog } from "@/components/features/appointments/appointment-dialog"
import { APPOINTMENT_STATUS_CONFIG, type AppointmentStatus } from "@/lib/types/appointments"

const STATUS_COLORS: Record<AppointmentStatus, string> = {
    reserved: "bg-yellow-500/80 text-white",
    confirmed: "bg-green-500/80 text-white",
    cancelled: "bg-red-500/80 text-white",
    completed: "bg-indigo-500/80 text-white",
    no_show: "bg-gray-500/80 text-white",
}

export default function CalendarPage() {
    const { appointments, createAppointment, updateAppointment } = useAppointments()

    const [dialogOpen, setDialogOpen] = React.useState(false)
    const [selectedAppointment, setSelectedAppointment] = React.useState<Appointment | null>(null)
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>()

    const events: CalendarEvent[] = React.useMemo(() => {
        return appointments.map(apt => {
            const [hours, minutes] = apt.startTime.split(":").map(Number)
            const start = new Date(apt.date)
            start.setHours(hours, minutes, 0, 0)

            const [endHours, endMinutes] = apt.endTime.split(":").map(Number)
            const end = new Date(apt.date)
            end.setHours(endHours, endMinutes, 0, 0)

            return {
                id: apt.id,
                title: `${apt.customer.name} - ${apt.service.name}`,
                start,
                end,
                color: STATUS_COLORS[apt.status],
                data: apt,
            }
        })
    }, [appointments])

    const handleEventClick = (event: CalendarEvent) => {
        setSelectedAppointment(event.data as Appointment)
        setDialogOpen(true)
    }

    const handleSlotClick = (date: Date) => {
        setSelectedAppointment(null)
        setSelectedDate(date)
        setDialogOpen(true)
    }

    const handleSave = async (data: CreateAppointmentInput) => {
        if (selectedAppointment) {
            await updateAppointment({ id: selectedAppointment.id, ...data })
        } else {
            await createAppointment(data)
        }
    }

    return (
        <div className="flex flex-col gap-6 p-6 h-[calc(100vh-80px)]">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Calendario</h1>
                <p className="text-muted-foreground mt-1">
                    Vista completa de todos los turnos
                </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">Estados:</span>
                {Object.entries(APPOINTMENT_STATUS_CONFIG).map(([key, config]) => (
                    <div key={key} className="flex items-center gap-1.5">
                        <div className={`w-3 h-3 rounded-full ${STATUS_COLORS[key as AppointmentStatus].split(" ")[0]}`} />
                        <span>{config.label}</span>
                    </div>
                ))}
            </div>

            {/* Calendar */}
            <div className="flex-1 border rounded-lg overflow-hidden">
                <Calendar
                    events={events}
                    view="week"
                    onEventClick={handleEventClick}
                    onSlotClick={handleSlotClick}
                />
            </div>

            {/* Dialog */}
            <AppointmentDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                appointment={selectedAppointment}
                selectedDate={selectedDate}
                onSave={handleSave}
            />
        </div>
    )
}
