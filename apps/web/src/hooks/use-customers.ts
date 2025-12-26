"use client"

import * as React from "react"
import { api } from "@/lib/api-config"
import type { Customer, CustomerWithStats, CreateCustomerInput, UpdateCustomerInput } from "@/lib/types/customers"

interface CustomerResponse {
    id: string
    name: string
    phone: string
    email?: string
    notes?: string
    createdAt: string
    updatedAt: string
    totalVisits: number
    totalSpent: number
    lastVisit?: string
    favoriteServices: string[]
    averageFrequency: number
}

// Map backend response to frontend type
function mapCustomerResponse(c: CustomerResponse): CustomerWithStats {
    return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        notes: c.notes,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt),
        totalVisits: c.totalVisits ?? 0,
        totalSpent: c.totalSpent ?? 0,
        lastVisit: c.lastVisit ? new Date(c.lastVisit) : undefined,
        favoriteServices: c.favoriteServices ?? [],
        averageFrequency: c.averageFrequency ?? 0,
    }
}

export function useCustomers() {
    const [customers, setCustomers] = React.useState<CustomerWithStats[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)

    React.useEffect(() => {
        loadCustomers()
    }, [])

    const loadCustomers = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await api.get<CustomerResponse[]>("/api/customers")
            setCustomers(data.map(mapCustomerResponse))
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error loading customers")
            console.error("Error loading customers:", err)
        } finally {
            setIsLoading(false)
        }
    }

    const createCustomer = async (input: CreateCustomerInput): Promise<Customer> => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await api.post<CustomerResponse>("/api/customers", input)
            const newCustomer = mapCustomerResponse(data)
            setCustomers(prev => [...prev, newCustomer])
            return newCustomer
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error creating customer")
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const updateCustomer = async (input: UpdateCustomerInput): Promise<Customer | null> => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await api.put<CustomerResponse>(`/api/customers/${input.id}`, input)
            const updated = mapCustomerResponse(data)
            setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c))
            return updated
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error updating customer")
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const deleteCustomer = async (id: string): Promise<void> => {
        setIsLoading(true)
        setError(null)
        try {
            await api.delete(`/api/customers/${id}`)
            setCustomers(prev => prev.filter(c => c.id !== id))
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error deleting customer")
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const getCustomerById = (id: string): CustomerWithStats | undefined => {
        return customers.find(c => c.id === id)
    }

    return {
        customers,
        isLoading,
        error,
        refetch: loadCustomers,
        createCustomer,
        updateCustomer,
        deleteCustomer,
        getCustomerById,
    }
}
