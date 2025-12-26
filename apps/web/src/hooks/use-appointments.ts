"use client"

import * as React from "react"
import type { Appointment, AppointmentStatus, CreateAppointmentInput, UpdateAppointmentInput } from "@/lib/types/appointments"

// Mock data for development
const MOCK_APPOINTMENTS: Appointment[] = [
    {
        id: "1",
        customerId: "c1",
        customer: { id: "c1", name: "Juan Pérez", phone: "+54 11 1234-5678" },
        serviceId: "s1",
        service: { id: "s1", name: "Corte + Barba", duration: 45, price: 1500 },
        barberId: "b1",
        barber: { id: "b1", name: "Carlos" },
        date: new Date(),
        startTime: "10:00",
        endTime: "10:45",
        status: "confirmed",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: "2",
        customerId: "c2",
        customer: { id: "c2", name: "María García", phone: "+54 11 2345-6789" },
        serviceId: "s2",
        service: { id: "s2", name: "Tinte", duration: 90, price: 3200 },
        barberId: "b2",
        barber: { id: "b2", name: "María" },
        date: new Date(),
        startTime: "11:30",
        endTime: "13:00",
        status: "confirmed",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: "3",
        customerId: "c3",
        customer: { id: "c3", name: "Pedro López", phone: "+54 11 3456-7890" },
        serviceId: "s3",
        service: { id: "s3", name: "Corte", duration: 30, price: 800 },
        barberId: "b3",
        barber: { id: "b3", name: "Juan" },
        date: new Date(),
        startTime: "14:00",
        endTime: "14:30",
        status: "reserved",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: "4",
        customerId: "c4",
        customer: { id: "c4", name: "Ana Martínez", phone: "+54 11 4567-8901" },
        serviceId: "s4",
        service: { id: "s4", name: "Corte + Peinado", duration: 60, price: 2100 },
        barberId: "b1",
        barber: { id: "b1", name: "Carlos" },
        date: new Date(),
        startTime: "15:30",
        endTime: "16:30",
        status: "reserved",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: "5",
        customerId: "c5",
        customer: { id: "c5", name: "Roberto Sánchez", phone: "+54 11 5678-9012" },
        serviceId: "s1",
        service: { id: "s1", name: "Corte + Barba", duration: 45, price: 1500 },
        barberId: "b2",
        barber: { id: "b2", name: "María" },
        date: new Date(Date.now() - 86400000), // yesterday
        startTime: "09:00",
        endTime: "09:45",
        status: "completed",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: "6",
        customerId: "c6",
        customer: { id: "c6", name: "Laura Fernández", phone: "+54 11 6789-0123" },
        serviceId: "s3",
        service: { id: "s3", name: "Corte", duration: 30, price: 800 },
        barberId: "b3",
        barber: { id: "b3", name: "Juan" },
        date: new Date(Date.now() - 86400000), // yesterday
        startTime: "16:00",
        endTime: "16:30",
        status: "cancelled",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
]

export function useAppointments() {
    const [appointments, setAppointments] = React.useState<Appointment[]>(MOCK_APPOINTMENTS)
    const [isLoading, setIsLoading] = React.useState(false)

    const createAppointment = async (input: CreateAppointmentInput): Promise<Appointment> => {
        setIsLoading(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500))

        const newAppointment: Appointment = {
            id: `${Date.now()}`,
            ...input,
            customer: { id: input.customerId, name: "Nuevo Cliente", phone: "" },
            service: { id: input.serviceId, name: "Servicio", duration: 30, price: 1000 },
            barber: { id: input.barberId, name: "Peluquero" },
            endTime: input.startTime, // Would calculate based on service duration
            status: "reserved",
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        setAppointments(prev => [...prev, newAppointment])
        setIsLoading(false)
        return newAppointment
    }

    const updateAppointment = async (input: UpdateAppointmentInput): Promise<Appointment | null> => {
        setIsLoading(true)
        await new Promise(resolve => setTimeout(resolve, 500))

        let updated: Appointment | null = null
        setAppointments(prev => prev.map(apt => {
            if (apt.id === input.id) {
                updated = { ...apt, ...input, updatedAt: new Date() }
                return updated
            }
            return apt
        }))

        setIsLoading(false)
        return updated
    }

    const updateStatus = async (id: string, status: AppointmentStatus): Promise<void> => {
        setIsLoading(true)
        await new Promise(resolve => setTimeout(resolve, 300))

        setAppointments(prev => prev.map(apt => {
            if (apt.id === id) {
                return { ...apt, status, updatedAt: new Date() }
            }
            return apt
        }))

        setIsLoading(false)
    }

    const deleteAppointment = async (id: string): Promise<void> => {
        setIsLoading(true)
        await new Promise(resolve => setTimeout(resolve, 300))

        setAppointments(prev => prev.filter(apt => apt.id !== id))
        setIsLoading(false)
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
        createAppointment,
        updateAppointment,
        updateStatus,
        deleteAppointment,
        getAppointmentsByDate,
        getAppointmentsByStatus,
    }
}
