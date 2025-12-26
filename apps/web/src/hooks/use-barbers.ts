"use client"

import * as React from "react"
import { api } from "@/lib/api-config"
import type { Barber, BarberWithStats, CreateBarberInput, UpdateBarberInput, WorkSchedule } from "@/lib/types/barbers"

interface ScheduleResponse {
    id: string
    dayOfWeek: number
    startTime: string
    endTime: string
}

interface BarberResponse {
    id: string
    name: string
    phone?: string
    email?: string
    specialty?: string
    isActive: boolean
    createdAt: string
    updatedAt: string
    schedules: ScheduleResponse[]
    totalAppointments: number
    completedAppointments: number
    totalRevenue: number
    averageRating?: number
}

// Map backend response to frontend type
function mapBarberResponse(b: BarberResponse): BarberWithStats {
    return {
        id: b.id,
        name: b.name,
        phone: b.phone,
        email: b.email,
        specialty: b.specialty,
        isActive: b.isActive,
        schedule: b.schedules?.map(s => ({
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
        })) || [],
        createdAt: new Date(b.createdAt),
        updatedAt: new Date(b.updatedAt),
        totalAppointments: b.totalAppointments ?? 0,
        completedAppointments: b.completedAppointments ?? 0,
        totalRevenue: b.totalRevenue ?? 0,
        averageRating: b.averageRating,
    }
}

export function useBarbers() {
    const [barbers, setBarbers] = React.useState<BarberWithStats[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)

    React.useEffect(() => {
        loadBarbers()
    }, [])

    const loadBarbers = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await api.get<BarberResponse[]>("/api/barbers")
            setBarbers(data.map(mapBarberResponse))
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error loading barbers")
            console.error("Error loading barbers:", err)
        } finally {
            setIsLoading(false)
        }
    }

    const createBarber = async (input: CreateBarberInput): Promise<Barber> => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await api.post<BarberResponse>("/api/barbers", input)
            const newBarber = mapBarberResponse(data)
            setBarbers(prev => [...prev, newBarber])
            return newBarber
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error creating barber")
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const updateBarber = async (input: UpdateBarberInput): Promise<Barber | null> => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await api.put<BarberResponse>(`/api/barbers/${input.id}`, input)
            const updated = mapBarberResponse(data)
            setBarbers(prev => prev.map(b => b.id === updated.id ? updated : b))
            return updated
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error updating barber")
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const toggleActive = async (id: string): Promise<void> => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await api.patch<BarberResponse>(`/api/barbers/${id}/toggle`)
            const updated = mapBarberResponse(data)
            setBarbers(prev => prev.map(b => b.id === id ? updated : b))
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error toggling barber")
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const deleteBarber = async (id: string): Promise<void> => {
        setIsLoading(true)
        setError(null)
        try {
            await api.delete(`/api/barbers/${id}`)
            setBarbers(prev => prev.filter(b => b.id !== id))
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error deleting barber")
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const getBarberById = (id: string): BarberWithStats | undefined => {
        return barbers.find(b => b.id === id)
    }

    return {
        barbers,
        isLoading,
        error,
        refetch: loadBarbers,
        createBarber,
        updateBarber,
        toggleActive,
        deleteBarber,
        getBarberById,
    }
}
