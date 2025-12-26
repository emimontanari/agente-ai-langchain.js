import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Users,
  DollarSign,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Scissors
} from "lucide-react";
import { Status } from "@/components/kibo-ui/status";
import { Pill } from "@/components/kibo-ui/pill";
import { RelativeTime } from "@/components/kibo-ui/relative-time";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Resumen de actividad de tu peluquería
          </p>
        </div>
        <Button>
          <CalendarDays className="mr-2 h-4 w-4" />
          Nuevo Turno
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turnos Hoy</CardTitle>
            <CalendarDays className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <p className="text-xs text-green-600 font-medium">+2 desde ayer</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Nuevos</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground mt-1">Esta semana</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Hoy</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$24,500</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <p className="text-xs text-green-600 font-medium">+15% vs promedio</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversaciones AI</CardTitle>
            <Activity className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34</div>
            <p className="text-xs text-muted-foreground mt-1">Últimas 24h</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-7">
        {/* Próximos Turnos */}
        <Card className="md:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Próximos Turnos</CardTitle>
                <CardDescription>Agenda de hoy</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  customer: "Juan Pérez",
                  service: "Corte + Barba",
                  time: "10:00",
                  barber: "Carlos",
                  status: "confirmed",
                  price: "$1,500"
                },
                {
                  customer: "María García",
                  service: "Tinte",
                  time: "11:30",
                  barber: "María",
                  status: "confirmed",
                  price: "$3,200"
                },
                {
                  customer: "Pedro López",
                  service: "Corte",
                  time: "14:00",
                  barber: "Juan",
                  status: "reserved",
                  price: "$800"
                },
                {
                  customer: "Ana Martínez",
                  service: "Corte + Peinado",
                  time: "15:30",
                  barber: "Carlos",
                  status: "reserved",
                  price: "$2,100"
                },
              ].map((appointment, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Scissors className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{appointment.customer}</p>
                      <p className="text-sm text-muted-foreground">{appointment.service}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{appointment.time}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">con {appointment.barber}</p>
                    </div>
                    <Status
                      variant={appointment.status === "confirmed" ? "success" : "warning"}
                      className="min-w-[100px] justify-center"
                    >
                      {appointment.status === "confirmed" ? "Confirmado" : "Reservado"}
                    </Status>
                    <p className="font-semibold text-green-600 min-w-[70px] text-right">
                      {appointment.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actividad del Agente AI */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Actividad del Agente AI</CardTitle>
            <CardDescription>Últimas interacciones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  type: "success",
                  icon: CheckCircle2,
                  title: "Turno reservado",
                  description: "Corte para mañana 15:00",
                  time: "hace 5 min",
                  color: "text-green-600"
                },
                {
                  type: "info",
                  icon: Activity,
                  title: "Consulta respondida",
                  description: "Precios de servicios",
                  time: "hace 12 min",
                  color: "text-blue-600"
                },
                {
                  type: "warning",
                  icon: AlertCircle,
                  title: "Cancelación procesada",
                  description: "Turno del 28/12",
                  time: "hace 30 min",
                  color: "text-orange-600"
                },
                {
                  type: "success",
                  icon: CheckCircle2,
                  title: "Turno confirmado",
                  description: "Cliente: Ana Martínez",
                  time: "hace 45 min",
                  color: "text-green-600"
                },
                {
                  type: "info",
                  icon: Activity,
                  title: "Consulta de horarios",
                  description: "Disponibilidad para la próxima semana",
                  time: "hace 1h",
                  color: "text-blue-600"
                },
              ].map((activity, i) => {
                const Icon = activity.icon;
                return (
                  <div key={i} className="rounded-lg border p-3 hover:bg-accent/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <Status variant={activity.type as any} dot>
                            {activity.title}
                          </Status>
                          <RelativeTime date={new Date(Date.now() - (i + 1) * 300000)} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tasa de Ocupación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold">87%</div>
              <p className="text-sm text-muted-foreground">de capacidad</p>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-secondary">
              <div className="h-2 w-[87%] rounded-full bg-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Servicios Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Corte</span>
                <span className="font-medium">45%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Barba</span>
                <span className="font-medium">28%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tinte</span>
                <span className="font-medium">27%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Estado de Turnos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-muted-foreground">Confirmados</span>
                </div>
                <span className="font-medium">8</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  <span className="text-muted-foreground">Reservados</span>
                </div>
                <span className="font-medium">4</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-muted-foreground">Completados</span>
                </div>
                <span className="font-medium">23</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
