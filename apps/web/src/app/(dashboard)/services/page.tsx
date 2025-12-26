"use client"

import * as React from "react"
import { useServices } from "@/hooks/use-services"
import type { Service, CreateServiceInput } from "@/lib/types/services"
import { ServiceDialog } from "@/components/features/services/service-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Status } from "@/components/kibo-ui/status"
import {
    Plus,
    MoreVertical,
    Edit,
    Trash2,
    Clock,
    DollarSign,
    Scissors
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ServicesPage() {
    const { services, isLoading, createService, updateService, toggleActive, deleteService } = useServices()
    const [dialogOpen, setDialogOpen] = React.useState(false)
    const [selectedService, setSelectedService] = React.useState<Service | null>(null)

    const handleCreate = () => {
        setSelectedService(null)
        setDialogOpen(true)
    }

    const handleEdit = (service: Service) => {
        setSelectedService(service)
        setDialogOpen(true)
    }

    const handleSave = async (data: CreateServiceInput) => {
        if (selectedService) {
            await updateService({ id: selectedService.id, ...data })
        } else {
            await createService(data)
        }
    }

    const handleDelete = async (service: Service) => {
        if (confirm(`¿Estás seguro de eliminar el servicio "${service.name}"?`)) {
            await deleteService(service.id)
        }
    }


    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Servicios</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestiona los servicios de tu peluquería
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Servicio
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {services.map(service => (
                    <Card key={service.id} className={!service.isActive ? "opacity-60" : "relative"}>
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${service.isActive ? "bg-primary/10" : "bg-muted"}`}>
                                        <Scissors className={`h-5 w-5 ${service.isActive ? "text-primary" : "text-muted-foreground"}`} />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{service.name}</CardTitle>
                                        {service.description && (
                                            <CardDescription className="line-clamp-1">
                                                {service.description}
                                            </CardDescription>
                                        )}
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" >
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleEdit(service)}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Editar
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => handleDelete(service)}
                                            className="text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Eliminar
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        {service.duration} min
                                    </span>
                                    <span className={`flex items-center gap-1 font-semibold ${service.isActive ? "text-green-600" : ""}`}>
                                        <DollarSign className="h-4 w-4" />
                                        {service.price.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Status variant={service.isActive ? "success" : "neutral"}>
                                        {service.isActive ? "Activo" : "Inactivo"}
                                    </Status>
                                    <Switch
                                        checked={service.isActive}
                                        onCheckedChange={() => toggleActive(service.id)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>


            <ServiceDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                service={selectedService}
                onSave={handleSave}
            />
        </div>
    )
}
