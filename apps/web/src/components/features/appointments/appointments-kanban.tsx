"use client"

import * as React from "react"
import type { Appointment, AppointmentStatus } from "@/lib/types/appointments"
import { APPOINTMENT_STATUS_CONFIG } from "@/lib/types/appointments"
import { Kanban, type KanbanColumn, type KanbanItem } from "@/components/kibo-ui/kanban"
import { AppointmentCard } from "./appointment-card"

interface AppointmentKanbanItem extends KanbanItem {
    appointment: Appointment
}

interface AppointmentsKanbanProps {
    appointments: Appointment[]
    onStatusChange?: (appointmentId: string, newStatus: AppointmentStatus) => void
    onEdit?: (appointment: Appointment) => void
    onDelete?: (appointment: Appointment) => void
}

const KANBAN_COLUMNS: KanbanColumn<AppointmentKanbanItem>[] = [
    { id: "reserved", title: "Reservados", color: "#eab308" },
    { id: "confirmed", title: "Confirmados", color: "#22c55e" },
    { id: "completed", title: "Completados", color: "#6366f1" },
    { id: "cancelled", title: "Cancelados", color: "#ef4444" },
    { id: "no_show", title: "No asistido", color: "#6b7280" },
]

export function AppointmentsKanban({
    appointments,
    onStatusChange,
    onEdit,
    onDelete,
}: AppointmentsKanbanProps) {
    const items: AppointmentKanbanItem[] = React.useMemo(() => {
        return appointments.map(apt => ({
            id: apt.id,
            columnId: apt.status,
            appointment: apt,
        }))
    }, [appointments])

    const handleItemMove = (itemId: string, fromColumnId: string, toColumnId: string) => {
        onStatusChange?.(itemId, toColumnId as AppointmentStatus)
    }

    const handleItemClick = (item: AppointmentKanbanItem) => {
        onEdit?.(item.appointment)
    }

    return (
        <Kanban
            columns={KANBAN_COLUMNS}
            items={items}
            onItemMove={handleItemMove}
            onItemClick={handleItemClick}
            renderItem={(item) => (
                <AppointmentCard
                    appointment={item.appointment}
                    onEdit={onEdit}
                    onStatusChange={(apt, status) => onStatusChange?.(apt.id, status as AppointmentStatus)}
                    onDelete={onDelete}
                />
            )}
        />
    )
}
