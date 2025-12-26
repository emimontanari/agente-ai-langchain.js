export interface Service {
    id: string
    name: string
    description?: string
    duration: number // in minutes
    price: number // in ARS
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

export interface CreateServiceInput {
    name: string
    description?: string
    duration: number
    price: number
}

export interface UpdateServiceInput extends Partial<CreateServiceInput> {
    id: string
    isActive?: boolean
}
