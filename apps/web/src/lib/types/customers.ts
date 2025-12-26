export interface Customer {
    id: string
    name: string
    phone: string
    email?: string
    notes?: string
    createdAt: Date
    updatedAt: Date
}

export interface CustomerWithStats extends Customer {
    totalVisits: number
    totalSpent: number
    lastVisit?: Date
    favoriteServices: string[]
    averageFrequency: number // days between visits
}

export interface CreateCustomerInput {
    name: string
    phone: string
    email?: string
    notes?: string
}

export interface UpdateCustomerInput extends Partial<CreateCustomerInput> {
    id: string
}
