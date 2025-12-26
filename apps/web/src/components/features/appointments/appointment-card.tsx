"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import type { Appointment } from "@/lib/types/appointments"
import { APPOINTMENT_STATUS_CONFIG } from "@/lib/types/appointments"
import { Status } from "@/components/kibo-ui/status"
import { Clock, User, Scissors, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AppointmentCardProps {
    appointment: Appointment
    onEdit?: (appointment: Appointment) => void
    onStatusChange?: (appointment: Appointment, status: string) => void
    onDelete?: (appointment: Appointment) => void
    className?: string
}

export function AppointmentCard({
    appointment,
    onEdit,
    onStatusChange,
    onDelete,
    className,
}: AppointmentCardProps) {
    const statusConfig = APPOINTMENT_STATUS_CONFIG[appointment.status]

    return (
        <div className={cn("rounded-lg border bg-card p-4 space-y-3", className)}>
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h4 className="font-semibold">{appointment.customer.name}</h4>
                    <p className="text-sm text-muted-foreground">{appointment.customer.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Status
                        variant={
                            appointment.status === "confirmed" ? "success" :
                                appointment.status === "reserved" ? "warning" :
                                    appointment.status === "cancelled" ? "error" :
                                        appointment.status === "completed" ? "info" :
                                            "neutral"
                        }
                    >
                        {statusConfig.label}
                    </Status>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit?.(appointment)}>
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onStatusChange?.(appointment, "confirmed")}>
                                Confirmar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onStatusChange?.(appointment, "completed")}>
                                Completar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onStatusChange?.(appointment, "cancelled")}>
                                Cancelar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onStatusChange?.(appointment, "no_show")}>
                                No asistió
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => onDelete?.(appointment)}
                                className="text-destructive"
                            >
                                Eliminar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Scissors className="h-4 w-4" />
                    <span>{appointment.service.name}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{appointment.barber.name}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                    <Clock className="h-4 w-4" />
                    <span>{appointment.startTime} - {appointment.endTime}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-lg font-bold text-green-600">
                    ${appointment.service.price.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground">
                    {appointment.service.duration} min
                </span>
            </div>
        </div>
    )
}
