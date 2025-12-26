"use client"

import * as React from "react"
import type { Appointment, AppointmentStatus } from "@/lib/types/appointments"
import { APPOINTMENT_STATUS_CONFIG } from "@/lib/types/appointments"
import { Calendar, type CalendarEvent } from "@/components/kibo-ui/calendar"

interface AppointmentsCalendarProps {
    appointments: Appointment[]
    onEventClick?: (appointment: Appointment) => void
    onSlotClick?: (date: Date) => void
}

const STATUS_COLORS: Record<AppointmentStatus, string> = {
    reserved: "bg-yellow-500/80 text-white",
    confirmed: "bg-green-500/80 text-white",
    cancelled: "bg-red-500/80 text-white",
    completed: "bg-indigo-500/80 text-white",
    no_show: "bg-gray-500/80 text-white",
}

export function AppointmentsCalendar({
    appointments,
    onEventClick,
    onSlotClick,
}: AppointmentsCalendarProps) {
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
        if (event.data && onEventClick) {
            onEventClick(event.data as Appointment)
        }
    }

    return (
        <Calendar
            events={events}
            view="week"
            onEventClick={handleEventClick}
            onSlotClick={onSlotClick}
            className="h-[600px]"
        />
    )
}
