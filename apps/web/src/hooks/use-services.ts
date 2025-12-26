"use client"

import * as React from "react"
import type { Service, CreateServiceInput, UpdateServiceInput } from "@/lib/types/services"

const MOCK_SERVICES: Service[] = [
    {
        id: "s1",
        name: "Corte",
        description: "Corte de cabello clásico o moderno",
        duration: 30,
        price: 800,
        isActive: true,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date(),
    },
    {
        id: "s2",
        name: "Corte + Barba",
        description: "Corte de cabello más arreglo de barba",
        duration: 45,
        price: 1500,
        isActive: true,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date(),
    },
    {
        id: "s3",
        name: "Tinte",
        description: "Coloración completa del cabello",
        duration: 90,
        price: 3200,
        isActive: true,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date(),
    },
    {
        id: "s4",
        name: "Corte + Peinado",
        description: "Corte de cabello con peinado incluido",
        duration: 60,
        price: 2100,
        isActive: true,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date(),
    },
    {
        id: "s5",
        name: "Barba",
        description: "Arreglo y perfilado de barba",
        duration: 20,
        price: 600,
        isActive: true,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date(),
    },
    {
        id: "s6",
        name: "Tratamiento Capilar",
        description: "Tratamiento hidratante para el cabello",
        duration: 45,
        price: 1800,
        isActive: false,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date(),
    },
]

export function useServices() {
    const [services, setServices] = React.useState<Service[]>(MOCK_SERVICES)
    const [isLoading, setIsLoading] = React.useState(false)

    const createService = async (input: CreateServiceInput): Promise<Service> => {
        setIsLoading(true)
        await new Promise(resolve => setTimeout(resolve, 500))

        const newService: Service = {
            id: `s${Date.now()}`,
            ...input,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        setServices(prev => [...prev, newService])
        setIsLoading(false)
        return newService
    }

    const updateService = async (input: UpdateServiceInput): Promise<Service | null> => {
        setIsLoading(true)
        await new Promise(resolve => setTimeout(resolve, 500))

        let updated: Service | null = null
        setServices(prev => prev.map(s => {
            if (s.id === input.id) {
                updated = { ...s, ...input, updatedAt: new Date() }
                return updated
            }
            return s
        }))

        setIsLoading(false)
        return updated
    }

    const toggleActive = async (id: string): Promise<void> => {
        setIsLoading(true)
        await new Promise(resolve => setTimeout(resolve, 300))

        setServices(prev => prev.map(s => {
            if (s.id === id) {
                return { ...s, isActive: !s.isActive, updatedAt: new Date() }
            }
            return s
        }))

        setIsLoading(false)
    }

    const deleteService = async (id: string): Promise<void> => {
        setIsLoading(true)
        await new Promise(resolve => setTimeout(resolve, 300))
        setServices(prev => prev.filter(s => s.id !== id))
        setIsLoading(false)
    }

    return {
        services,
        isLoading,
        createService,
        updateService,
        toggleActive,
        deleteService,
    }
}
