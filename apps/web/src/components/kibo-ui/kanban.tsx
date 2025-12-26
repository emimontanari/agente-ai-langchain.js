"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface KanbanColumn<T> {
    id: string
    title: string
    color?: string
}

export interface KanbanItem {
    id: string
    columnId: string
    [key: string]: unknown
}

export interface KanbanProps<T extends KanbanItem> {
    columns: KanbanColumn<T>[]
    items: T[]
    onItemMove?: (itemId: string, fromColumnId: string, toColumnId: string) => void
    onItemClick?: (item: T) => void
    renderItem?: (item: T) => React.ReactNode
    className?: string
}

function Kanban<T extends KanbanItem>({
    columns,
    items,
    onItemMove,
    onItemClick,
    renderItem,
    className,
}: KanbanProps<T>) {
    const [draggedItem, setDraggedItem] = React.useState<T | null>(null)
    const [dragOverColumn, setDragOverColumn] = React.useState<string | null>(null)

    const getColumnItems = (columnId: string) => {
        return items.filter(item => item.columnId === columnId)
    }

    const handleDragStart = (e: React.DragEvent, item: T) => {
        setDraggedItem(item)
        e.dataTransfer.effectAllowed = "move"
    }

    const handleDragOver = (e: React.DragEvent, columnId: string) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
        setDragOverColumn(columnId)
    }

    const handleDragLeave = () => {
        setDragOverColumn(null)
    }

    const handleDrop = (e: React.DragEvent, toColumnId: string) => {
        e.preventDefault()
        if (draggedItem && draggedItem.columnId !== toColumnId) {
            onItemMove?.(draggedItem.id, draggedItem.columnId, toColumnId)
        }
        setDraggedItem(null)
        setDragOverColumn(null)
    }

    const handleDragEnd = () => {
        setDraggedItem(null)
        setDragOverColumn(null)
    }

    return (
        <div className={cn("flex gap-4 overflow-x-auto pb-4", className)}>
            {columns.map(column => (
                <div
                    key={column.id}
                    className={cn(
                        "flex-shrink-0 w-80 bg-muted/30 rounded-lg",
                        dragOverColumn === column.id && "ring-2 ring-primary ring-opacity-50"
                    )}
                    onDragOver={(e) => handleDragOver(e, column.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, column.id)}
                >
                    {/* Column Header */}
                    <div className="p-3 border-b flex items-center gap-2">
                        {column.color && (
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: column.color }}
                            />
                        )}
                        <h3 className="font-semibold text-sm">{column.title}</h3>
                        <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            {getColumnItems(column.id).length}
                        </span>
                    </div>

                    {/* Column Items */}
                    <div className="p-2 space-y-2 min-h-[200px]">
                        {getColumnItems(column.id).map(item => (
                            <div
                                key={item.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, item)}
                                onDragEnd={handleDragEnd}
                                onClick={() => onItemClick?.(item)}
                                className={cn(
                                    "bg-background rounded-md border p-3 cursor-grab active:cursor-grabbing",
                                    "hover:shadow-md transition-shadow",
                                    draggedItem?.id === item.id && "opacity-50"
                                )}
                            >
                                {renderItem ? renderItem(item) : (
                                    <div className="text-sm">{String(item.id)}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

export { Kanban }
