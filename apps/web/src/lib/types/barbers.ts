export interface WorkSchedule {
    dayOfWeek: number // 0-6, 0 = Sunday
    startTime: string // "HH:mm"
    endTime: string // "HH:mm"
}

export interface Barber {
    id: string
    name: string
    phone?: string
    email?: string
    specialty?: string
    schedule: WorkSchedule[]
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

export interface BarberWithStats extends Barber {
    totalAppointments: number
    completedAppointments: number
    totalRevenue: number
    averageRating?: number
}

export interface CreateBarberInput {
    name: string
    phone?: string
    email?: string
    specialty?: string
    schedule: WorkSchedule[]
}

export interface UpdateBarberInput extends Partial<CreateBarberInput> {
    id: string
    isActive?: boolean
}

export const DAYS_OF_WEEK = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
]
