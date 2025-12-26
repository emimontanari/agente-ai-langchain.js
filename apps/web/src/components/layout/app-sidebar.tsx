"use client";

import {
    CalendarDays,
    Home,
    Users,
    Scissors,
    MessageSquare,
    BarChart3,
    Settings,
    UserCircle,
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarFooter,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
    {
        title: "General",
        items: [
            { title: "Dashboard", url: "/", icon: Home },
            { title: "Calendario", url: "/calendar", icon: CalendarDays },
        ],
    },
    {
        title: "Gestión",
        items: [
            { title: "Turnos", url: "/appointments", icon: CalendarDays },
            { title: "Clientes", url: "/customers", icon: Users },
            { title: "Servicios", url: "/services", icon: Scissors },
            { title: "Peluqueros", url: "/barbers", icon: UserCircle },
        ],
    },
    {
        title: "Agente AI",
        items: [
            { title: "Chat", url: "/agent", icon: MessageSquare },
            { title: "Configuración", url: "/agent/settings", icon: Settings },
        ],
    },
    {
        title: "Analytics",
        items: [
            { title: "Reportes", url: "/reports", icon: BarChart3 },
        ],
    },
];

export function AppSidebar() {
    const pathname = usePathname();

    return (
        <Sidebar>
            <SidebarHeader className="border-b px-6 py-4">
                <div className="flex items-center gap-2">
                    <Scissors className="h-6 w-6 text-primary" />
                    <span className="text-lg font-bold">Peluquería AI</span>
                </div>
            </SidebarHeader>
            <SidebarContent>
                {menuItems.map((section) => (
                    <SidebarGroup key={section.title}>
                        <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {section.items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={pathname === item.url}
                                        >
                                            <Link href={item.url}>
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarFooter className="border-t p-4">
                <p className="text-xs text-muted-foreground">
                    © 2025 Peluquería AI
                </p>
            </SidebarFooter>
        </Sidebar>
    );
}
