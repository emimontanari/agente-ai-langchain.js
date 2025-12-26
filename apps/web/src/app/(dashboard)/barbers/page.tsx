"use client"

import * as React from "react"
import { useBarbers } from "@/hooks/use-barbers"
import type { Barber, CreateBarberInput } from "@/lib/types/barbers"
import { DAYS_OF_WEEK } from "@/lib/types/barbers"
import { BarberDialog } from "@/components/features/barbers/barber-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Status } from "@/components/kibo-ui/status"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    Plus,
    MoreVertical,
    Edit,
    Trash2,
    Calendar,
    DollarSign,
    Star,
    Clock,
    Phone,
    Mail
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function BarbersPage() {
    const { barbers, isLoading, createBarber, updateBarber, toggleActive, deleteBarber } = useBarbers()
    const [dialogOpen, setDialogOpen] = React.useState(false)
    const [selectedBarber, setSelectedBarber] = React.useState<Barber | null>(null)

    const handleCreate = () => {
        setSelectedBarber(null)
        setDialogOpen(true)
    }

    const handleEdit = (barber: Barber) => {
        setSelectedBarber(barber)
        setDialogOpen(true)
    }

    const handleSave = async (data: CreateBarberInput) => {
        if (selectedBarber) {
            await updateBarber({ id: selectedBarber.id, ...data })
        } else {
            await createBarber(data)
        }
    }

    const handleDelete = async (barber: Barber) => {
        if (confirm(`¿Estás seguro de eliminar a ${barber.name}?`)) {
            await deleteBarber(barber.id)
        }
    }

    const getInitials = (name: string) => {
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    }

    const formatSchedule = (schedule: typeof barbers[0]["schedule"]) => {
        if (schedule.length === 0) return "Sin horario"
        const days = schedule.map(s => DAYS_OF_WEEK[s.dayOfWeek].slice(0, 3))
        return days.join(", ")
    }


    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Peluqueros</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestiona el equipo de tu peluquería
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Peluquero
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {barbers.map(barber => (
                    <Card key={barber.id} className={!barber.isActive ? "opacity-60" : ""}>
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12">
                                        <AvatarFallback className={barber.isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}>
                                            {getInitials(barber.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-lg">{barber.name}</CardTitle>
                                        {barber.specialty && (
                                            <CardDescription>{barber.specialty}</CardDescription>
                                        )}
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleEdit(barber)}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Editar
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => handleDelete(barber)}
                                            className="text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Eliminar
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Contact Info */}
                            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                {barber.phone && (
                                    <span className="flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        {barber.phone}
                                    </span>
                                )}
                                {barber.email && (
                                    <span className="flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        {barber.email}
                                    </span>
                                )}
                            </div>

                            {/* Schedule */}
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>{formatSchedule(barber.schedule)}</span>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 text-lg font-bold">
                                        <Calendar className="h-4 w-4 text-blue-600" />
                                        {barber.totalAppointments}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Turnos</div>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 text-lg font-bold text-green-600">
                                        <DollarSign className="h-4 w-4" />
                                        {(barber.totalRevenue / 1000).toFixed(0)}k
                                    </div>
                                    <div className="text-xs text-muted-foreground">Ingresos</div>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 text-lg font-bold text-yellow-600">
                                        <Star className="h-4 w-4" />
                                        {barber.averageRating?.toFixed(1) || "-"}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Rating</div>
                                </div>
                            </div>

                            {/* Active Toggle */}
                            <div className="flex items-center justify-between pt-2 border-t">
                                <span className="text-sm text-muted-foreground">Estado</span>
                                <div className="flex items-center gap-2">
                                    <Status variant={barber.isActive ? "success" : "neutral"}>
                                        {barber.isActive ? "Activo" : "Inactivo"}
                                    </Status>
                                    <Switch
                                        checked={barber.isActive}
                                        onCheckedChange={() => toggleActive(barber.id)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>


            <BarberDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                barber={selectedBarber}
                onSave={handleSave}
            />
        </div>
    )
}
