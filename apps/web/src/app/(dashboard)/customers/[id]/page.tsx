"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { useCustomers } from "@/hooks/use-customers"
import { useAppointments } from "@/hooks/use-appointments"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Status } from "@/components/kibo-ui/status"
import { APPOINTMENT_STATUS_CONFIG } from "@/lib/types/appointments"
import {
    ArrowLeft,
    Phone,
    Mail,
    Calendar,
    DollarSign,
    TrendingUp,
    Clock,
    Star
} from "lucide-react"
import Link from "next/link"

export default function CustomerProfilePage() {
    const params = useParams()
    const customerId = params.id as string
    const { getCustomerById } = useCustomers()
    const { appointments } = useAppointments()

    const customer = getCustomerById(customerId)

    const customerAppointments = React.useMemo(() => {
        return appointments.filter(apt => apt.customerId === customerId)
    }, [appointments, customerId])

    if (!customer) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                <p className="text-muted-foreground">Cliente no encontrado</p>
                <Button asChild variant="outline">
                    <Link href="/customers">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver a Clientes
                    </Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="icon">
                    <Link href="/customers">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{customer.name}</h1>
                    <div className="flex items-center gap-4 text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {customer.phone}
                        </span>
                        {customer.email && (
                            <span className="flex items-center gap-1">
                                <Mail className="h-4 w-4" />
                                {customer.email}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Visitas</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{customer.totalVisits}</div>
                        <p className="text-xs text-muted-foreground">turnos completados</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Gastado (LTV)</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            ${customer.totalSpent.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">en servicios</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Frecuencia</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {customer.averageFrequency} días
                        </div>
                        <p className="text-xs text-muted-foreground">entre visitas</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
                        <Star className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${customer.totalVisits > 0
                                ? Math.round(customer.totalSpent / customer.totalVisits).toLocaleString()
                                : 0}
                        </div>
                        <p className="text-xs text-muted-foreground">por visita</p>
                    </CardContent>
                </Card>
            </div>

            {/* Content Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Favorite Services */}
                <Card>
                    <CardHeader>
                        <CardTitle>Servicios Favoritos</CardTitle>
                        <CardDescription>Los servicios más solicitados</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {customer.favoriteServices.length > 0 ? (
                                customer.favoriteServices.map((service, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                        <span>{service}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-sm">Sin servicios registrados</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Appointment History */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Historial de Turnos</CardTitle>
                        <CardDescription>Últimos turnos del cliente</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {customerAppointments.length > 0 ? (
                            <div className="space-y-3">
                                {customerAppointments.slice(0, 5).map(apt => (
                                    <div key={apt.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                                        <div>
                                            <p className="font-medium">{apt.service.name}</p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                {new Date(apt.date).toLocaleDateString("es-AR")} - {apt.startTime}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Status
                                                variant={
                                                    apt.status === "confirmed" ? "success" :
                                                        apt.status === "reserved" ? "warning" :
                                                            apt.status === "cancelled" ? "error" :
                                                                apt.status === "completed" ? "info" :
                                                                    "neutral"
                                                }
                                            >
                                                {APPOINTMENT_STATUS_CONFIG[apt.status].label}
                                            </Status>
                                            <span className="font-semibold text-green-600">
                                                ${apt.service.price.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">Sin turnos registrados</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
