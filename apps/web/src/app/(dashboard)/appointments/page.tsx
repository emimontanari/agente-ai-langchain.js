"use client"

import * as React from "react"
import { useAppointments } from "@/hooks/use-appointments"
import type { Appointment, AppointmentStatus, CreateAppointmentInput } from "@/lib/types/appointments"
import { AppointmentsTable } from "@/components/features/appointments/appointments-table"
import { AppointmentsCalendar } from "@/components/features/appointments/appointments-calendar"
import { AppointmentsKanban } from "@/components/features/appointments/appointments-kanban"
import { AppointmentDialog } from "@/components/features/appointments/appointment-dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    CalendarDays,
    List,
    Kanban as KanbanIcon,
    Plus,
    Filter,
} from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type ViewMode = "list" | "calendar" | "kanban"

export default function AppointmentsPage() {
    const {
        appointments,
        isLoading,
        createAppointment,
        updateAppointment,
        updateStatus,
        deleteAppointment,
    } = useAppointments()

    const [view, setView] = React.useState<ViewMode>("list")
    const [dialogOpen, setDialogOpen] = React.useState(false)
    const [selectedAppointment, setSelectedAppointment] = React.useState<Appointment | null>(null)
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>()
    const [statusFilter, setStatusFilter] = React.useState<string>("all")

    const filteredAppointments = React.useMemo(() => {
        if (statusFilter === "all") return appointments
        return appointments.filter(apt => apt.status === statusFilter)
    }, [appointments, statusFilter])

    const handleCreate = () => {
        setSelectedAppointment(null)
        setSelectedDate(undefined)
        setDialogOpen(true)
    }

    const handleEdit = (appointment: Appointment) => {
        setSelectedAppointment(appointment)
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

    const handleStatusChange = async (appointment: Appointment, status: string) => {
        await updateStatus(appointment.id, status as AppointmentStatus)
    }

    const handleKanbanStatusChange = async (appointmentId: string, newStatus: AppointmentStatus) => {
        await updateStatus(appointmentId, newStatus)
    }

    const handleDelete = async (appointment: Appointment) => {
        if (confirm("¿Estás seguro de que deseas eliminar este turno?")) {
            await deleteAppointment(appointment.id)
        }
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Turnos</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestiona los turnos de tu peluquería
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Turno
                </Button>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4">
                {/* View Switcher */}
                <Tabs value={view} onValueChange={(v: string) => setView(v as ViewMode)}>
                    <TabsList>
                        <TabsTrigger value="list" className="gap-2">
                            <List className="h-4 w-4" />
                            Lista
                        </TabsTrigger>
                        <TabsTrigger value="calendar" className="gap-2">
                            <CalendarDays className="h-4 w-4" />
                            Calendario
                        </TabsTrigger>
                        <TabsTrigger value="kanban" className="gap-2">
                            <KanbanIcon className="h-4 w-4" />
                            Kanban
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Filters */}
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtrar por estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los estados</SelectItem>
                            <SelectItem value="reserved">Reservados</SelectItem>
                            <SelectItem value="confirmed">Confirmados</SelectItem>
                            <SelectItem value="completed">Completados</SelectItem>
                            <SelectItem value="cancelled">Cancelados</SelectItem>
                            <SelectItem value="no_show">No asistió</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1">
                {view === "list" && (
                    <AppointmentsTable
                        appointments={filteredAppointments}
                        onEdit={handleEdit}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDelete}
                    />
                )}

                {view === "calendar" && (
                    <AppointmentsCalendar
                        appointments={filteredAppointments}
                        onEventClick={handleEdit}
                        onSlotClick={handleSlotClick}
                    />
                )}

                {view === "kanban" && (
                    <AppointmentsKanban
                        appointments={filteredAppointments}
                        onStatusChange={handleKanbanStatusChange}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )}
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
