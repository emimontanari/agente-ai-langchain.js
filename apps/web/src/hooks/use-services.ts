"use client"

import * as React from "react"
import { api } from "@/lib/api-config"
import type { Service, CreateServiceInput, UpdateServiceInput } from "@/lib/types/services"

interface ServiceResponse {
    id: string
    name: string
    description?: string
    durationMinutes: number
    priceCents: number
    isActive: boolean
    createdAt: string
    updatedAt: string
}

// Map backend response to frontend type
function mapServiceResponse(s: ServiceResponse): Service {
    return {
        id: s.id,
        name: s.name,
        description: s.description,
        duration: s.durationMinutes,
        price: s.priceCents, // cents
        isActive: s.isActive,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
    }
}

export function useServices() {
    const [services, setServices] = React.useState<Service[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)

    // Load services on mount
    React.useEffect(() => {
        loadServices()
    }, [])

    const loadServices = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await api.get<ServiceResponse[]>("/api/services")
            setServices(data.map(mapServiceResponse))
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error loading services")
            console.error("Error loading services:", err)
        } finally {
            setIsLoading(false)
        }
    }

    const createService = async (input: CreateServiceInput): Promise<Service> => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await api.post<ServiceResponse>("/api/services", {
                name: input.name,
                description: input.description,
                duration: input.duration,
                price: input.price,
            })
            const newService = mapServiceResponse(data)
            setServices(prev => [...prev, newService])
            return newService
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error creating service")
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const updateService = async (input: UpdateServiceInput): Promise<Service | null> => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await api.put<ServiceResponse>(`/api/services/${input.id}`, {
                name: input.name,
                description: input.description,
                duration: input.duration,
                price: input.price,
                isActive: input.isActive,
            })
            const updated = mapServiceResponse(data)
            setServices(prev => prev.map(s => s.id === updated.id ? updated : s))
            return updated
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error updating service")
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const toggleActive = async (id: string): Promise<void> => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await api.patch<ServiceResponse>(`/api/services/${id}/toggle`)
            const updated = mapServiceResponse(data)
            setServices(prev => prev.map(s => s.id === id ? updated : s))
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error toggling service")
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const deleteService = async (id: string): Promise<void> => {
        setIsLoading(true)
        setError(null)
        try {
            await api.delete(`/api/services/${id}`)
            setServices(prev => prev.filter(s => s.id !== id))
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error deleting service")
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    return {
        services,
        isLoading,
        error,
        refetch: loadServices,
        createService,
        updateService,
        toggleActive,
        deleteService,
    }
}

// Export mock services for fallback/testing (can be removed later)
export const MOCK_SERVICES: Service[] = [
    {
        id: "s1",
        name: "Corte",
        description: "Corte de cabello clásico o moderno",
        duration: 30,
        price: 80000,
        isActive: true,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date(),
    },
]
