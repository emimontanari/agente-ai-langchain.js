"use client"

import * as React from "react"
import { useCustomers } from "@/hooks/use-customers"
import type { Customer, CreateCustomerInput } from "@/lib/types/customers"
import { CustomerDialog } from "@/components/features/customers/customer-dialog"
import { DataTable, type Column } from "@/components/kibo-ui/table"
import { Button } from "@/components/ui/button"
import { Plus, MoreHorizontal, Edit, Trash2, Eye, Phone, Mail } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

export default function CustomersPage() {
    const { customers, isLoading, createCustomer, updateCustomer, deleteCustomer } = useCustomers()
    const [dialogOpen, setDialogOpen] = React.useState(false)
    const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null)

    const handleCreate = () => {
        setSelectedCustomer(null)
        setDialogOpen(true)
    }

    const handleEdit = (customer: Customer) => {
        setSelectedCustomer(customer)
        setDialogOpen(true)
    }

    const handleSave = async (data: CreateCustomerInput) => {
        if (selectedCustomer) {
            await updateCustomer({ id: selectedCustomer.id, ...data })
        } else {
            await createCustomer(data)
        }
    }

    const handleDelete = async (customer: Customer) => {
        if (confirm(`¿Estás seguro de eliminar a ${customer.name}?`)) {
            await deleteCustomer(customer.id)
        }
    }

    const columns: Column<typeof customers[0]>[] = [
        {
            key: "name",
            header: "Cliente",
            sortable: true,
            cell: (row) => (
                <div>
                    <Link href={`/customers/${row.id}`} className="font-medium hover:underline">
                        {row.name}
                    </Link>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {row.phone}
                        </span>
                        {row.email && (
                            <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {row.email}
                            </span>
                        )}
                    </div>
                </div>
            ),
        },
        {
            key: "totalVisits",
            header: "Visitas",
            sortable: true,
            cell: (row) => <span className="font-medium">{row.totalVisits}</span>,
        },
        {
            key: "totalSpent",
            header: "Total Gastado",
            sortable: true,
            cell: (row) => (
                <span className="font-semibold text-green-600">
                    ${row.totalSpent.toLocaleString()}
                </span>
            ),
        },
        {
            key: "lastVisit",
            header: "Última Visita",
            sortable: true,
            cell: (row) => row.lastVisit
                ? new Date(row.lastVisit).toLocaleDateString("es-AR")
                : "-",
        },
        {
            key: "favoriteServices",
            header: "Servicios Favoritos",
            cell: (row) => (
                <div className="flex flex-wrap gap-1">
                    {row.favoriteServices.slice(0, 2).map((service, i) => (
                        <span key={i} className="text-xs bg-muted px-2 py-0.5 rounded">
                            {service}
                        </span>
                    ))}
                </div>
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
                        <DropdownMenuItem asChild>
                            <Link href={`/customers/${row.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Perfil
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(row)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => handleDelete(row)}
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
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestiona la información de tus clientes
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Cliente
                </Button>
            </div>

            <DataTable
                data={customers}
                columns={columns}
                searchPlaceholder="Buscar clientes..."
            />

            <CustomerDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                customer={selectedCustomer}
                onSave={handleSave}
            />
        </div>
    )
}
