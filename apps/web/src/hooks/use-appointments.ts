"use client"

import * as React from "react"
import { api } from "@/lib/api-config"
import type { Appointment, AppointmentStatus, CreateAppointmentInput, UpdateAppointmentInput } from "@/lib/types/appointments"

interface AppointmentResponse {
    id: string
    customerId?: string
    customer: { id: string; name: string; phone: string; email?: string } | null
    serviceId: string
    service: { id: string; name: string; duration: number; price: number }
    barberId: string
    barber: { id: string; name: string; specialty?: string }
    date: string
    startTime: string
    endTime: string
    status: AppointmentStatus
    notes?: string
    createdAt: string
    updatedAt: string
}

// Map backend response to frontend type
function mapAppointmentResponse(a: AppointmentResponse): Appointment {
    return {
        id: a.id,
        customerId: a.customerId || "",
        customer: a.customer || { id: "", name: "Walk-in", phone: "" },
        serviceId: a.serviceId,
        service: a.service,
        barberId: a.barberId,
        barber: a.barber,
        date: new Date(a.date),
        startTime: a.startTime,
        endTime: a.endTime,
        status: a.status,
        notes: a.notes,
        createdAt: new Date(a.createdAt),
        updatedAt: new Date(a.updatedAt),
    }
}

export function useAppointments() {
    const [appointments, setAppointments] = React.useState<Appointment[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)

    React.useEffect(() => {
        loadAppointments()
    }, [])

    const loadAppointments = async (filters?: { date?: string; barberId?: string; status?: AppointmentStatus }) => {
        setIsLoading(true)
        setError(null)
        try {
            let endpoint = "/api/appointments"
            const params = new URLSearchParams()
            if (filters?.date) params.append("date", filters.date)
            if (filters?.barberId) params.append("barberId", filters.barberId)
            if (filters?.status) params.append("status", filters.status)
            if (params.toString()) endpoint += `?${params.toString()}`

            const data = await api.get<AppointmentResponse[]>(endpoint)
            setAppointments(data.map(mapAppointmentResponse))
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error loading appointments")
            console.error("Error loading appointments:", err)
        } finally {
            setIsLoading(false)
        }
    }

    const createAppointment = async (input: CreateAppointmentInput): Promise<Appointment> => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await api.post<AppointmentResponse>("/api/appointments", {
                customerId: input.customerId,
                barberId: input.barberId,
                serviceId: input.serviceId,
                date: input.date instanceof Date ? input.date.toISOString() : input.date,
                startTime: input.startTime,
                notes: input.notes,
            })
            const newAppointment = mapAppointmentResponse(data)
            setAppointments(prev => [...prev, newAppointment])
            return newAppointment
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error creating appointment")
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const updateAppointment = async (input: UpdateAppointmentInput): Promise<Appointment | null> => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await api.put<AppointmentResponse>(`/api/appointments/${input.id}`, {
                customerId: input.customerId,
                barberId: input.barberId,
                serviceId: input.serviceId,
                date: input.date instanceof Date ? input.date.toISOString() : input.date,
                startTime: input.startTime,
                notes: input.notes,
            })
            const updated = mapAppointmentResponse(data)
            setAppointments(prev => prev.map(a => a.id === updated.id ? updated : a))
            return updated
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error updating appointment")
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const updateStatus = async (id: string, status: AppointmentStatus): Promise<void> => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await api.patch<AppointmentResponse>(`/api/appointments/${id}/status`, { status })
            const updated = mapAppointmentResponse(data)
            setAppointments(prev => prev.map(a => a.id === id ? updated : a))
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error updating appointment status")
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const deleteAppointment = async (id: string): Promise<void> => {
        setIsLoading(true)
        setError(null)
        try {
            await api.delete(`/api/appointments/${id}`)
            setAppointments(prev => prev.filter(a => a.id !== id))
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error deleting appointment")
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const getAppointmentsByDate = (date: Date): Appointment[] => {
        return appointments.filter(apt => {
            const aptDate = new Date(apt.date)
            return aptDate.toDateString() === date.toDateString()
        })
    }

    const getAppointmentsByStatus = (status: AppointmentStatus): Appointment[] => {
        return appointments.filter(apt => apt.status === status)
    }

    return {
        appointments,
        isLoading,
        error,
        refetch: loadAppointments,
        createAppointment,
        updateAppointment,
        updateStatus,
        deleteAppointment,
        getAppointmentsByDate,
        getAppointmentsByStatus,
    }
}
