"use client"

import * as React from "react"
import type { Barber, BarberWithStats, CreateBarberInput, UpdateBarberInput } from "@/lib/types/barbers"

const MOCK_BARBERS: BarberWithStats[] = [
    {
        id: "b1",
        name: "Carlos Rodríguez",
        phone: "+54 11 1111-1111",
        email: "carlos@peluqueria.com",
        specialty: "Cortes modernos",
        schedule: [
            { dayOfWeek: 1, startTime: "09:00", endTime: "18:00" },
            { dayOfWeek: 2, startTime: "09:00", endTime: "18:00" },
            { dayOfWeek: 3, startTime: "09:00", endTime: "18:00" },
            { dayOfWeek: 4, startTime: "09:00", endTime: "18:00" },
            { dayOfWeek: 5, startTime: "09:00", endTime: "18:00" },
        ],
        isActive: true,
        createdAt: new Date("2023-01-01"),
        updatedAt: new Date(),
        totalAppointments: 245,
        completedAppointments: 238,
        totalRevenue: 367500,
        averageRating: 4.8,
    },
    {
        id: "b2",
        name: "María López",
        phone: "+54 11 2222-2222",
        email: "maria@peluqueria.com",
        specialty: "Coloración y tintes",
        schedule: [
            { dayOfWeek: 1, startTime: "10:00", endTime: "19:00" },
            { dayOfWeek: 2, startTime: "10:00", endTime: "19:00" },
            { dayOfWeek: 3, startTime: "10:00", endTime: "19:00" },
            { dayOfWeek: 4, startTime: "10:00", endTime: "19:00" },
            { dayOfWeek: 5, startTime: "10:00", endTime: "19:00" },
            { dayOfWeek: 6, startTime: "09:00", endTime: "14:00" },
        ],
        isActive: true,
        createdAt: new Date("2023-03-15"),
        updatedAt: new Date(),
        totalAppointments: 189,
        completedAppointments: 182,
        totalRevenue: 582400,
        averageRating: 4.9,
    },
    {
        id: "b3",
        name: "Juan Martínez",
        phone: "+54 11 3333-3333",
        specialty: "Barbería clásica",
        schedule: [
            { dayOfWeek: 2, startTime: "08:00", endTime: "16:00" },
            { dayOfWeek: 3, startTime: "08:00", endTime: "16:00" },
            { dayOfWeek: 4, startTime: "08:00", endTime: "16:00" },
            { dayOfWeek: 5, startTime: "08:00", endTime: "16:00" },
            { dayOfWeek: 6, startTime: "08:00", endTime: "14:00" },
        ],
        isActive: true,
        createdAt: new Date("2023-06-01"),
        updatedAt: new Date(),
        totalAppointments: 156,
        completedAppointments: 150,
        totalRevenue: 225000,
        averageRating: 4.7,
    },
]

export function useBarbers() {
    const [barbers, setBarbers] = React.useState<BarberWithStats[]>(MOCK_BARBERS)
    const [isLoading, setIsLoading] = React.useState(false)

    const createBarber = async (input: CreateBarberInput): Promise<Barber> => {
        setIsLoading(true)
        await new Promise(resolve => setTimeout(resolve, 500))

        const newBarber: BarberWithStats = {
            id: `b${Date.now()}`,
            ...input,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            totalAppointments: 0,
            completedAppointments: 0,
            totalRevenue: 0,
        }

        setBarbers(prev => [...prev, newBarber])
        setIsLoading(false)
        return newBarber
    }

    const updateBarber = async (input: UpdateBarberInput): Promise<Barber | null> => {
        setIsLoading(true)
        await new Promise(resolve => setTimeout(resolve, 500))

        let updated: Barber | null = null
        setBarbers(prev => prev.map(b => {
            if (b.id === input.id) {
                updated = { ...b, ...input, updatedAt: new Date() }
                return updated as BarberWithStats
            }
            return b
        }))

        setIsLoading(false)
        return updated
    }

    const toggleActive = async (id: string): Promise<void> => {
        setIsLoading(true)
        await new Promise(resolve => setTimeout(resolve, 300))

        setBarbers(prev => prev.map(b => {
            if (b.id === id) {
                return { ...b, isActive: !b.isActive, updatedAt: new Date() }
            }
            return b
        }))

        setIsLoading(false)
    }

    const deleteBarber = async (id: string): Promise<void> => {
        setIsLoading(true)
        await new Promise(resolve => setTimeout(resolve, 300))
        setBarbers(prev => prev.filter(b => b.id !== id))
        setIsLoading(false)
    }

    const getBarberById = (id: string): BarberWithStats | undefined => {
        return barbers.find(b => b.id === id)
    }

    return {
        barbers,
        isLoading,
        createBarber,
        updateBarber,
        toggleActive,
        deleteBarber,
        getBarberById,
    }
}
