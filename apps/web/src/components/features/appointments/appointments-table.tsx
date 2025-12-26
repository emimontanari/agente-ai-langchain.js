"use client"

import * as React from "react"
import type { Appointment } from "@/lib/types/appointments"
import { APPOINTMENT_STATUS_CONFIG } from "@/lib/types/appointments"
import { DataTable, type Column } from "@/components/kibo-ui/table"
import { Status } from "@/components/kibo-ui/status"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Trash2, CheckCircle, XCircle, Clock } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AppointmentsTableProps {
    appointments: Appointment[]
    onEdit?: (appointment: Appointment) => void
    onStatusChange?: (appointment: Appointment, status: string) => void
    onDelete?: (appointment: Appointment) => void
}

export function AppointmentsTable({
    appointments,
    onEdit,
    onStatusChange,
    onDelete,
}: AppointmentsTableProps) {
    const columns: Column<Appointment>[] = [
        {
            key: "customer.name",
            header: "Cliente",
            sortable: true,
            cell: (row) => (
                <div>
                    <p className="font-medium">{row.customer.name}</p>
                    <p className="text-xs text-muted-foreground">{row.customer.phone}</p>
                </div>
            ),
        },
        {
            key: "service.name",
            header: "Servicio",
            sortable: true,
            cell: (row) => (
                <div>
                    <p>{row.service.name}</p>
                    <p className="text-xs text-muted-foreground">{row.service.duration} min</p>
                </div>
            ),
        },
        {
            key: "barber.name",
            header: "Peluquero",
            sortable: true,
            cell: (row) => row.barber.name,
        },
        {
            key: "date",
            header: "Fecha",
            sortable: true,
            cell: (row) => (
                <div>
                    <p>{new Date(row.date).toLocaleDateString("es-AR")}</p>
                    <p className="text-xs text-muted-foreground">{row.startTime} - {row.endTime}</p>
                </div>
            ),
        },
        {
            key: "status",
            header: "Estado",
            sortable: true,
            cell: (row) => {
                const config = APPOINTMENT_STATUS_CONFIG[row.status]
                return (
                    <Status
                        variant={
                            row.status === "confirmed" ? "success" :
                                row.status === "reserved" ? "warning" :
                                    row.status === "cancelled" ? "error" :
                                        row.status === "completed" ? "info" :
                                            "neutral"
                        }
                    >
                        {config.label}
                    </Status>
                )
            },
        },
        {
            key: "service.price",
            header: "Precio",
            sortable: true,
            cell: (row) => (
                <span className="font-semibold text-green-600">
                    ${row.service.price.toLocaleString()}
                </span>
            ),
        },
        {
            key: "actions",
            header: "",
            cell: (row) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit?.(row)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onStatusChange?.(row, "confirmed")}>
                            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                            Confirmar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onStatusChange?.(row, "completed")}>
                            <CheckCircle className="h-4 w-4 mr-2 text-indigo-600" />
                            Completar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onStatusChange?.(row, "cancelled")}>
                            <XCircle className="h-4 w-4 mr-2 text-red-600" />
                            Cancelar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onStatusChange?.(row, "no_show")}>
                            <Clock className="h-4 w-4 mr-2 text-gray-600" />
                            No asistió
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => onDelete?.(row)}
                            className="text-destructive"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
            className: "w-[50px]",
        },
    ]

    return (
        <DataTable
            data={appointments}
            columns={columns}
            searchPlaceholder="Buscar turnos..."
        />
    )
}
