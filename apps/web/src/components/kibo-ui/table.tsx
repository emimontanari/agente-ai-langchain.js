"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Search,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
} from "lucide-react"

export interface Column<T> {
    key: keyof T | string
    header: string
    cell?: (row: T) => React.ReactNode
    sortable?: boolean
    className?: string
}

export interface DataTableProps<T> {
    data: T[]
    columns: Column<T>[]
    pageSize?: number
    searchable?: boolean
    searchPlaceholder?: string
    onRowClick?: (row: T) => void
    className?: string
}

type SortDirection = "asc" | "desc" | null

function DataTable<T extends Record<string, unknown>>({
    data,
    columns,
    pageSize = 10,
    searchable = true,
    searchPlaceholder = "Buscar...",
    onRowClick,
    className,
}: DataTableProps<T>) {
    const [page, setPage] = React.useState(0)
    const [search, setSearch] = React.useState("")
    const [sortKey, setSortKey] = React.useState<string | null>(null)
    const [sortDir, setSortDir] = React.useState<SortDirection>(null)

    const filteredData = React.useMemo(() => {
        if (!search) return data
        const lower = search.toLowerCase()
        return data.filter(row =>
            Object.values(row).some(val =>
                String(val).toLowerCase().includes(lower)
            )
        )
    }, [data, search])

    const sortedData = React.useMemo(() => {
        if (!sortKey || !sortDir) return filteredData
        return [...filteredData].sort((a, b) => {
            const aVal = a[sortKey]
            const bVal = b[sortKey]
            if (aVal === bVal) return 0
            if (aVal === null || aVal === undefined) return 1
            if (bVal === null || bVal === undefined) return -1
            const cmp = aVal < bVal ? -1 : 1
            return sortDir === "asc" ? cmp : -cmp
        })
    }, [filteredData, sortKey, sortDir])

    const totalPages = Math.ceil(sortedData.length / pageSize)
    const paginatedData = sortedData.slice(page * pageSize, (page + 1) * pageSize)

    const handleSort = (key: string) => {
        if (sortKey === key) {
            if (sortDir === "asc") setSortDir("desc")
            else if (sortDir === "desc") {
                setSortKey(null)
                setSortDir(null)
            }
        } else {
            setSortKey(key)
            setSortDir("asc")
        }
    }

    const getValue = (row: T, key: string): unknown => {
        const keys = key.split(".")
        let val: unknown = row
        for (const k of keys) {
            val = (val as Record<string, unknown>)?.[k]
        }
        return val
    }

    return (
        <div className={cn("space-y-4", className)}>
            {/* Search */}
            {searchable && (
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={searchPlaceholder}
                        value={search}
                        onChange={e => {
                            setSearch(e.target.value)
                            setPage(0)
                        }}
                        className="pl-9"
                    />
                </div>
            )}

            {/* Table */}
            <div className="rounded-md border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-muted/50">
                        <tr>
                            {columns.map(col => (
                                <th
                                    key={String(col.key)}
                                    className={cn(
                                        "px-4 py-3 text-left text-sm font-medium text-muted-foreground",
                                        col.sortable && "cursor-pointer select-none hover:text-foreground",
                                        col.className
                                    )}
                                    onClick={() => col.sortable && handleSort(String(col.key))}
                                >
                                    <div className="flex items-center gap-2">
                                        {col.header}
                                        {col.sortable && (
                                            <span className="text-muted-foreground">
                                                {sortKey === col.key ? (
                                                    sortDir === "asc" ? (
                                                        <ArrowUp className="h-4 w-4" />
                                                    ) : (
                                                        <ArrowDown className="h-4 w-4" />
                                                    )
                                                ) : (
                                                    <ArrowUpDown className="h-4 w-4 opacity-50" />
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                                >
                                    No se encontraron resultados
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row, i) => (
                                <tr
                                    key={i}
                                    className={cn(
                                        "border-t hover:bg-muted/50 transition-colors",
                                        onRowClick && "cursor-pointer"
                                    )}
                                    onClick={() => onRowClick?.(row)}
                                >
                                    {columns.map(col => (
                                        <td
                                            key={String(col.key)}
                                            className={cn("px-4 py-3 text-sm", col.className)}
                                        >
                                            {col.cell
                                                ? col.cell(row)
                                                : String(getValue(row, String(col.key)) ?? "")}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Mostrando {page * pageSize + 1}-{Math.min((page + 1) * pageSize, sortedData.length)} de {sortedData.length}
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setPage(0)}
                            disabled={page === 0}
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setPage(p => p - 1)}
                            disabled={page === 0}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="px-3 text-sm">
                            {page + 1} / {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setPage(p => p + 1)}
                            disabled={page >= totalPages - 1}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setPage(totalPages - 1)}
                            disabled={page >= totalPages - 1}
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export { DataTable }
