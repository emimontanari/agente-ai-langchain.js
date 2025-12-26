export type AppointmentStatus =
    | "reserved"
    | "confirmed"
    | "cancelled"
    | "completed"
    | "no_show"

export interface Customer {
    id: string
    name: string
    phone: string
    email?: string
}

export interface Service {
    id: string
    name: string
    duration: number // in minutes
    price: number
}

export interface Barber {
    id: string
    name: string
    specialty?: string
}

export interface Appointment {
    id: string
    customerId: string
    customer: Customer
    serviceId: string
    service: Service
    barberId: string
    barber: Barber
    date: Date
    startTime: string // "HH:mm"
    endTime: string // "HH:mm"
    status: AppointmentStatus
    notes?: string
    createdAt: Date
    updatedAt: Date
}

export interface CreateAppointmentInput {
    customerId: string
    serviceId: string
    barberId: string
    date: Date
    startTime: string
    notes?: string
}

export interface UpdateAppointmentInput {
    id: string
    customerId?: string
    serviceId?: string
    barberId?: string
    date?: Date
    startTime?: string
    status?: AppointmentStatus
    notes?: string
}

export const APPOINTMENT_STATUS_CONFIG: Record<AppointmentStatus, {
    label: string
    color: string
    bgColor: string
}> = {
    reserved: {
        label: "Reservado",
        color: "text-yellow-600",
        bgColor: "bg-yellow-500/10",
    },
    confirmed: {
        label: "Confirmado",
        color: "text-green-600",
        bgColor: "bg-green-500/10",
    },
    cancelled: {
        label: "Cancelado",
        color: "text-red-600",
        bgColor: "bg-red-500/10",
    },
    completed: {
        label: "Completado",
        color: "text-indigo-600",
        bgColor: "bg-indigo-500/10",
    },
    no_show: {
        label: "No asistió",
        color: "text-gray-600",
        bgColor: "bg-gray-500/10",
    },
}
