"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export type CalendarView = "day" | "week" | "month"

export interface CalendarEvent {
    id: string
    title: string
    start: Date
    end: Date
    color?: string
    data?: any
}

export interface CalendarProps {
    events?: CalendarEvent[]
    view?: CalendarView
    date?: Date
    onDateChange?: (date: Date) => void
    onViewChange?: (view: CalendarView) => void
    onEventClick?: (event: CalendarEvent) => void
    onSlotClick?: (date: Date) => void
    className?: string
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
const MONTHS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

function getWeekDays(date: Date): Date[] {
    const start = new Date(date)
    start.setDate(start.getDate() - start.getDay())
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start)
        d.setDate(d.getDate() + i)
        return d
    })
}

function getMonthDays(date: Date): Date[] {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const days: Date[] = []
    const startDay = firstDay.getDay()

    // Previous month days
    for (let i = startDay - 1; i >= 0; i--) {
        const d = new Date(year, month, -i)
        days.push(d)
    }

    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push(new Date(year, month, i))
    }

    // Next month days
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
        days.push(new Date(year, month + 1, i))
    }

    return days
}

function formatTime(hour: number): string {
    return `${hour.toString().padStart(2, "0")}:00`
}

function isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
}

function Calendar({
    events = [],
    view = "week",
    date = new Date(),
    onDateChange,
    onViewChange,
    onEventClick,
    onSlotClick,
    className,
}: CalendarProps) {
    const [currentDate, setCurrentDate] = React.useState(date)
    const [currentView, setCurrentView] = React.useState(view)

    const handlePrev = () => {
        const newDate = new Date(currentDate)
        if (currentView === "day") newDate.setDate(newDate.getDate() - 1)
        else if (currentView === "week") newDate.setDate(newDate.getDate() - 7)
        else newDate.setMonth(newDate.getMonth() - 1)
        setCurrentDate(newDate)
        onDateChange?.(newDate)
    }

    const handleNext = () => {
        const newDate = new Date(currentDate)
        if (currentView === "day") newDate.setDate(newDate.getDate() + 1)
        else if (currentView === "week") newDate.setDate(newDate.getDate() + 7)
        else newDate.setMonth(newDate.getMonth() + 1)
        setCurrentDate(newDate)
        onDateChange?.(newDate)
    }

    const handleToday = () => {
        const today = new Date()
        setCurrentDate(today)
        onDateChange?.(today)
    }

    const handleViewChange = (v: CalendarView) => {
        setCurrentView(v)
        onViewChange?.(v)
    }

    const getEventsForDay = (day: Date) => {
        return events.filter(e => isSameDay(new Date(e.start), day))
    }

    const getEventsForHour = (day: Date, hour: number) => {
        return events.filter(e => {
            const start = new Date(e.start)
            return isSameDay(start, day) && start.getHours() === hour
        })
    }

    const renderDayView = () => {
        const dayEvents = getEventsForDay(currentDate)
        return (
            <div className="flex-1 overflow-auto">
                <div className="grid grid-cols-[80px_1fr] min-h-[600px]">
                    {HOURS.map(hour => (
                        <React.Fragment key={hour}>
                            <div className="border-b border-r px-2 py-3 text-xs text-muted-foreground">
                                {formatTime(hour)}
                            </div>
                            <div
                                className="border-b px-2 py-1 min-h-[48px] hover:bg-accent/50 cursor-pointer relative"
                                onClick={() => {
                                    const slotDate = new Date(currentDate)
                                    slotDate.setHours(hour, 0, 0, 0)
                                    onSlotClick?.(slotDate)
                                }}
                            >
                                {getEventsForHour(currentDate, hour).map(event => (
                                    <div
                                        key={event.id}
                                        className={cn(
                                            "text-xs p-1 rounded mb-1 cursor-pointer truncate",
                                            event.color || "bg-primary text-primary-foreground"
                                        )}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onEventClick?.(event)
                                        }}
                                    >
                                        {event.title}
                                    </div>
                                ))}
                            </div>
                        </React.Fragment>
                    ))}
                </div>
            </div>
        )
    }

    const renderWeekView = () => {
        const weekDays = getWeekDays(currentDate)
        return (
            <div className="flex-1 overflow-auto">
                <div className="grid grid-cols-[80px_repeat(7,1fr)] sticky top-0 bg-background z-10 border-b">
                    <div className="border-r p-2" />
                    {weekDays.map((day, i) => (
                        <div
                            key={i}
                            className={cn(
                                "border-r p-2 text-center",
                                isSameDay(day, new Date()) && "bg-primary/10"
                            )}
                        >
                            <div className="text-xs text-muted-foreground">{DAYS[i]}</div>
                            <div className="font-semibold">{day.getDate()}</div>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-[80px_repeat(7,1fr)]">
                    {HOURS.slice(8, 20).map(hour => (
                        <React.Fragment key={hour}>
                            <div className="border-b border-r px-2 py-3 text-xs text-muted-foreground">
                                {formatTime(hour)}
                            </div>
                            {weekDays.map((day, i) => (
                                <div
                                    key={i}
                                    className="border-b border-r px-1 py-1 min-h-[48px] hover:bg-accent/50 cursor-pointer relative"
                                    onClick={() => {
                                        const slotDate = new Date(day)
                                        slotDate.setHours(hour, 0, 0, 0)
                                        onSlotClick?.(slotDate)
                                    }}
                                >
                                    {getEventsForHour(day, hour).map(event => (
                                        <div
                                            key={event.id}
                                            className={cn(
                                                "text-xs p-1 rounded mb-1 cursor-pointer truncate",
                                                event.color || "bg-primary text-primary-foreground"
                                            )}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onEventClick?.(event)
                                            }}
                                        >
                                            {event.title}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        )
    }

    const renderMonthView = () => {
        const monthDays = getMonthDays(currentDate)
        return (
            <div className="flex-1">
                <div className="grid grid-cols-7 border-b">
                    {DAYS.map(day => (
                        <div key={day} className="p-2 text-center text-sm font-medium border-r last:border-r-0">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7">
                    {monthDays.map((day, i) => {
                        const isCurrentMonth = day.getMonth() === currentDate.getMonth()
                        const isToday = isSameDay(day, new Date())
                        const dayEvents = getEventsForDay(day)
                        return (
                            <div
                                key={i}
                                className={cn(
                                    "border-b border-r min-h-[100px] p-1 cursor-pointer hover:bg-accent/50",
                                    !isCurrentMonth && "bg-muted/30 text-muted-foreground"
                                )}
                                onClick={() => onSlotClick?.(day)}
                            >
                                <div className={cn(
                                    "text-sm mb-1 w-6 h-6 flex items-center justify-center rounded-full",
                                    isToday && "bg-primary text-primary-foreground"
                                )}>
                                    {day.getDate()}
                                </div>
                                <div className="space-y-1">
                                    {dayEvents.slice(0, 3).map(event => (
                                        <div
                                            key={event.id}
                                            className={cn(
                                                "text-xs p-1 rounded truncate cursor-pointer",
                                                event.color || "bg-primary/20 text-primary"
                                            )}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onEventClick?.(event)
                                            }}
                                        >
                                            {event.title}
                                        </div>
                                    ))}
                                    {dayEvents.length > 3 && (
                                        <div className="text-xs text-muted-foreground">
                                            +{dayEvents.length - 3} más
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    return (
        <div className={cn("flex flex-col h-full", className)}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleToday}>
                        Hoy
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handlePrev}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleNext}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <h2 className="text-lg font-semibold">
                        {currentView === "day" && (
                            `${currentDate.getDate()} ${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                        )}
                        {currentView === "week" && (
                            `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                        )}
                        {currentView === "month" && (
                            `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                        )}
                    </h2>
                </div>
                <div className="flex gap-1">
                    {(["day", "week", "month"] as CalendarView[]).map(v => (
                        <Button
                            key={v}
                            variant={currentView === v ? "default" : "ghost"}
                            size="sm"
                            onClick={() => handleViewChange(v)}
                        >
                            {v === "day" ? "Día" : v === "week" ? "Semana" : "Mes"}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {currentView === "day" && renderDayView()}
            {currentView === "week" && renderWeekView()}
            {currentView === "month" && renderMonthView()}
        </div>
    )
}

export { Calendar }
