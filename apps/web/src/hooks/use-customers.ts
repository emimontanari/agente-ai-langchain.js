"use client"

import * as React from "react"
import type { Customer, CustomerWithStats, CreateCustomerInput, UpdateCustomerInput } from "@/lib/types/customers"

const MOCK_CUSTOMERS: CustomerWithStats[] = [
    {
        id: "c1",
        name: "Juan Pérez",
        phone: "+54 11 1234-5678",
        email: "juan@email.com",
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date(),
        totalVisits: 12,
        totalSpent: 18000,
        lastVisit: new Date("2024-12-20"),
        favoriteServices: ["Corte + Barba", "Corte"],
        averageFrequency: 30,
    },
    {
        id: "c2",
        name: "María García",
        phone: "+54 11 2345-6789",
        email: "maria@email.com",
        createdAt: new Date("2024-03-10"),
        updatedAt: new Date(),
        totalVisits: 8,
        totalSpent: 25600,
        lastVisit: new Date("2024-12-18"),
        favoriteServices: ["Tinte", "Corte + Peinado"],
        averageFrequency: 45,
    },
    {
        id: "c3",
        name: "Pedro López",
        phone: "+54 11 3456-7890",
        createdAt: new Date("2024-06-20"),
        updatedAt: new Date(),
        totalVisits: 5,
        totalSpent: 4000,
        lastVisit: new Date("2024-12-15"),
        favoriteServices: ["Corte"],
        averageFrequency: 35,
    },
    {
        id: "c4",
        name: "Ana Martínez",
        phone: "+54 11 4567-8901",
        email: "ana@email.com",
        createdAt: new Date("2024-02-05"),
        updatedAt: new Date(),
        totalVisits: 15,
        totalSpent: 31500,
        lastVisit: new Date("2024-12-22"),
        favoriteServices: ["Corte + Peinado", "Tinte"],
        averageFrequency: 28,
    },
    {
        id: "c5",
        name: "Roberto Sánchez",
        phone: "+54 11 5678-9012",
        createdAt: new Date("2024-08-15"),
        updatedAt: new Date(),
        totalVisits: 3,
        totalSpent: 4500,
        lastVisit: new Date("2024-12-10"),
        favoriteServices: ["Corte + Barba"],
        averageFrequency: 40,
    },
]

export function useCustomers() {
    const [customers, setCustomers] = React.useState<CustomerWithStats[]>(MOCK_CUSTOMERS)
    const [isLoading, setIsLoading] = React.useState(false)

    const createCustomer = async (input: CreateCustomerInput): Promise<Customer> => {
        setIsLoading(true)
        await new Promise(resolve => setTimeout(resolve, 500))

        const newCustomer: CustomerWithStats = {
            id: `c${Date.now()}`,
            ...input,
            createdAt: new Date(),
            updatedAt: new Date(),
            totalVisits: 0,
            totalSpent: 0,
            favoriteServices: [],
            averageFrequency: 0,
        }

        setCustomers(prev => [...prev, newCustomer])
        setIsLoading(false)
        return newCustomer
    }

    const updateCustomer = async (input: UpdateCustomerInput): Promise<Customer | null> => {
        setIsLoading(true)
        await new Promise(resolve => setTimeout(resolve, 500))

        let updated: Customer | null = null
        setCustomers(prev => prev.map(c => {
            if (c.id === input.id) {
                updated = { ...c, ...input, updatedAt: new Date() }
                return updated as CustomerWithStats
            }
            return c
        }))

        setIsLoading(false)
        return updated
    }

    const deleteCustomer = async (id: string): Promise<void> => {
        setIsLoading(true)
        await new Promise(resolve => setTimeout(resolve, 300))
        setCustomers(prev => prev.filter(c => c.id !== id))
        setIsLoading(false)
    }

    const getCustomerById = (id: string): CustomerWithStats | undefined => {
        return customers.find(c => c.id === id)
    }

    return {
        customers,
        isLoading,
        createCustomer,
        updateCustomer,
        deleteCustomer,
        getCustomerById,
    }
}
