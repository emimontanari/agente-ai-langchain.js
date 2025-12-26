# 📋 Plan de Implementación UI - Sistema CRM para Peluquería

## 📝 Resumen Ejecutivo

Este documento define el plan completo para implementar una interfaz de usuario (UI) para el sistema de agente AI de peluquería. La UI permitirá a los empleados visualizar turnos, gestionar horarios, administrar servicios, configurar el agente y acceder a un CRM completo.

---

## 🏗 Arquitectura Propuesta

### Stack Tecnológico

| Componente | Tecnología | Justificación |
|------------|------------|---------------|
| **Frontend** | Next.js 14+ (App Router) | SSR, performance, excelente DX |
| **UI Library** | Shadcn/ui + Radix | Componentes accesibles y customizables |
| **Styling** | Tailwind CSS | Desarrollo rápido, diseño consistente |
| **State Management** | TanStack Query | Caché inteligente, sincronización server |
| **Forms** | React Hook Form + Zod | Validación robusta |
| **Charts** | Recharts | Visualización de métricas |
| **Auth** | NextAuth.js | Autenticación flexible |
| **Backend** | NestJS (existente) | Reutilizar infraestructura actual |

### Estructura de Carpetas

```
frontend/
├── app/                          # App Router de Next.js
│   ├── (auth)/                   # Rutas de autenticación
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/              # Panel principal
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Dashboard home
│   │   ├── appointments/         # Gestión de turnos
│   │   │   ├── page.tsx          # Lista/calendario
│   │   │   ├── [id]/page.tsx     # Detalle turno
│   │   │   └── new/page.tsx      # Nuevo turno
│   │   ├── calendar/             # Vista calendario
│   │   ├── customers/            # CRM Clientes
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── services/             # Gestión servicios
│   │   ├── barbers/              # Gestión peluqueros
│   │   ├── agent/                # Configuración AI
│   │   │   ├── chat/             # Chat con el agente
│   │   │   ├── settings/         # Config del agente
│   │   │   └── logs/             # Historial conversaciones
│   │   ├── reports/              # Reportes y analytics
│   │   └── settings/             # Configuración general
│   ├── api/                      # API routes (proxy al backend)
│   └── globals.css
├── components/
│   ├── ui/                       # Componentes shadcn
│   ├── layout/                   # Header, Sidebar, etc
│   ├── appointments/             # Componentes de turnos
│   ├── customers/                # Componentes CRM
│   ├── calendar/                 # Componentes calendario
│   └── charts/                   # Visualizaciones
├── lib/
│   ├── api/                      # Clientes API
│   ├── hooks/                    # Custom hooks
│   ├── utils/                    # Utilidades
│   └── validations/              # Schemas Zod
├── types/                        # TypeScript types
└── public/                       # Assets estáticos
```

---

## 🎯 Módulos de la UI

### 1. 📊 Dashboard Principal

**Descripción:** Vista general con métricas clave y accesos rápidos.

**Componentes:**
- **Tarjetas de Métricas**
  - Turnos de hoy
  - Ingresos del día
  - Clientes nuevos (semana)
  - Turnos cancelados
- **Calendario Mini** (próximas 24h)
- **Lista de Próximos Turnos**
- **Actividad Reciente del Agente**
- **Alertas y Notificaciones**

**API Endpoints Necesarios:**
```typescript
GET /api/dashboard/stats           // Métricas generales
GET /api/dashboard/upcoming        // Próximos turnos
GET /api/dashboard/agent-activity  // Actividad del agente
```

---

### 2. 📅 Gestión de Turnos (Appointments)

**Descripción:** CRUD completo de turnos con múltiples vistas.

**Vistas:**
1. **Vista Lista** - Tabla con filtros y búsqueda
2. **Vista Calendario** - Calendario semanal/mensual/diario
3. **Vista Kanban** - Por estado (reservado, confirmado, completado)

**Funcionalidades:**
- Crear turno manual
- Editar turno existente
- Cancelar turno (con motivo)
- Confirmar turno
- Marcar como completado
- Marcar como no-show
- Filtrar por: fecha, peluquero, servicio, estado
- Búsqueda por nombre de cliente

**Estados de Turno:**
```typescript
type AppointmentStatus = 
  | 'reserved'    // Reservado (pendiente confirmación)
  | 'confirmed'   // Confirmado
  | 'cancelled'   // Cancelado
  | 'completed'   // Completado
  | 'no_show';    // No se presentó
```

**API Endpoints:**
```typescript
GET    /api/appointments              // Lista con filtros y paginación
GET    /api/appointments/:id          // Detalle de turno
POST   /api/appointments              // Crear turno
PATCH  /api/appointments/:id          // Actualizar turno
DELETE /api/appointments/:id          // Cancelar turno
GET    /api/appointments/calendar     // Vista calendario
```

**Componentes UI:**
- `AppointmentTable` - Tabla con filtros
- `AppointmentCalendar` - Calendario interactivo
- `AppointmentCard` - Tarjeta de turno
- `AppointmentForm` - Formulario crear/editar
- `AppointmentDetails` - Vista detallada
- `AppointmentStatusBadge` - Badge con color por estado

---

### 3. 👥 CRM de Clientes (Customers)

**Descripción:** Gestión completa de clientes con historial.

**Funcionalidades:**
- Lista de clientes con búsqueda y filtros
- Perfil de cliente con:
  - Datos personales (nombre, teléfono, email)
  - Historial de turnos
  - Servicios favoritos
  - Total gastado
  - Notas internas
  - Última visita
- Crear/editar cliente
- Eliminar cliente (soft delete)
- Métricas por cliente:
  - Frecuencia de visitas
  - Servicios más solicitados
  - Valor de vida del cliente (LTV)

**API Endpoints:**
```typescript
GET    /api/customers                 // Lista con filtros
GET    /api/customers/:id             // Detalle cliente
GET    /api/customers/:id/history     // Historial de turnos
POST   /api/customers                 // Crear cliente
PATCH  /api/customers/:id             // Actualizar cliente
DELETE /api/customers/:id             // Eliminar cliente
GET    /api/customers/:id/stats       // Estadísticas cliente
```

**Componentes UI:**
- `CustomerTable` - Tabla de clientes
- `CustomerProfile` - Perfil completo
- `CustomerForm` - Formulario crear/editar
- `CustomerHistory` - Timeline de visitas
- `CustomerStats` - Métricas del cliente

---

### 4. 💇 Gestión de Servicios

**Descripción:** CRUD de servicios ofrecidos.

**Funcionalidades:**
- Lista de servicios activos/inactivos
- Crear nuevo servicio
- Editar servicio existente
- Activar/desactivar servicio
- Campos:
  - Nombre
  - Descripción
  - Duración (minutos)
  - Precio (en centavos → mostrar en ARS)
  - Estado (activo/inactivo)

**API Endpoints:**
```typescript
GET    /api/services                  // Lista servicios
GET    /api/services/:id              // Detalle servicio
POST   /api/services                  // Crear servicio
PATCH  /api/services/:id              // Actualizar servicio
DELETE /api/services/:id              // Desactivar servicio
```

---

### 5. 👨‍🦰 Gestión de Peluqueros

**Descripción:** Administración de empleados/peluqueros.

**Funcionalidades:**
- Lista de peluqueros
- Perfil de peluquero con:
  - Datos personales
  - Horarios de trabajo
  - Servicios que ofrece
  - Estadísticas de turnos
- Crear/editar peluquero
- Activar/desactivar peluquero
- Configurar horarios disponibles

**API Endpoints:**
```typescript
GET    /api/barbers                   // Lista peluqueros
GET    /api/barbers/:id               // Detalle peluquero
GET    /api/barbers/:id/schedule      // Horarios
GET    /api/barbers/:id/stats         // Estadísticas
POST   /api/barbers                   // Crear peluquero
PATCH  /api/barbers/:id               // Actualizar peluquero
PATCH  /api/barbers/:id/schedule      // Actualizar horarios
```

**Modelo de Horarios (nuevo):**
```typescript
interface BarberSchedule {
  barberId: string;
  dayOfWeek: number;      // 0-6 (Domingo-Sábado)
  startTime: string;      // "09:00"
  endTime: string;        // "18:00"
  isActive: boolean;
}
```

---

### 6. 🤖 Configuración del Agente AI

**Descripción:** Panel para configurar y monitorear el agente AI.

**Sub-módulos:**

#### 6.1 Chat con el Agente
- Interfaz de chat en tiempo real
- Streaming de respuestas (ya implementado en backend)
- Visualización de herramientas usadas
- Historial de conversaciones

#### 6.2 Configuración del Agente
- Editar System Prompt
- Ajustar temperatura del modelo
- Seleccionar modelo (GPT-4, GPT-4-turbo, etc.)
- Activar/desactivar herramientas específicas
- Configurar horarios de atención del agente

#### 6.3 Logs de Conversaciones
- Lista de conversaciones
- Detalle de cada conversación
- Filtros por fecha, usuario
- Exportar conversaciones

**API Endpoints:**
```typescript
GET    /api/agent/config              // Configuración actual
PATCH  /api/agent/config              // Actualizar config
GET    /api/agent/conversations       // Lista conversaciones
GET    /api/agent/conversations/:id   // Detalle conversación
POST   /api/agent/chat                // Chat endpoint (existente)
```

---

### 7. 📈 Reportes y Analytics

**Descripción:** Visualización de métricas y generación de reportes.

**Reportes Disponibles:**
1. **Ingresos**
   - Por día/semana/mes
   - Por servicio
   - Por peluquero
2. **Turnos**
   - Tasa de cancelación
   - Ocupación por horario
   - Servicios más populares
3. **Clientes**
   - Nuevos vs recurrentes
   - Retención
   - LTV promedio
4. **Agente AI**
   - Conversaciones por día
   - Tasa de conversión (consulta → turno)
   - Herramientas más usadas

**Componentes UI:**
- `RevenueChart` - Gráfico de ingresos
- `AppointmentChart` - Gráfico de turnos
- `CustomerChart` - Métricas de clientes
- `AgentMetrics` - Estadísticas del agente
- `ReportExport` - Exportar a PDF/CSV

---

### 8. ⚙️ Configuración General

**Descripción:** Configuración del sistema y usuarios.

**Funcionalidades:**
- **Perfil de Usuario**
  - Cambiar contraseña
  - Preferencias de notificaciones
- **Configuración del Negocio**
  - Nombre de la peluquería
  - Horarios de operación
  - Timezone
  - Moneda (ARS por defecto)
- **Gestión de Usuarios** (admin only)
  - Crear/editar usuarios
  - Asignar roles (admin, empleado)
- **Integraciones**
  - WhatsApp Business (futuro)
  - Google Calendar (futuro)

---

## 🔄 Endpoints Backend Adicionales Requeridos

Para soportar la UI, el backend de NestJS necesitará los siguientes módulos/endpoints nuevos:

### Nuevos Módulos NestJS

```
src/
├── customers/              # Gestión de clientes
│   ├── customers.module.ts
│   ├── customers.controller.ts
│   └── customers.service.ts
├── dashboard/              # Métricas dashboard
│   ├── dashboard.module.ts
│   ├── dashboard.controller.ts
│   └── dashboard.service.ts
├── reports/                # Reportes y analytics
│   ├── reports.module.ts
│   ├── reports.controller.ts
│   └── reports.service.ts
└── users/                  # Autenticación y usuarios
    ├── users.module.ts
    ├── users.controller.ts
    ├── users.service.ts
    └── auth/
        ├── auth.controller.ts
        └── auth.service.ts
```

### Nuevas Entidades

```typescript
// Entidad Usuario
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column({ unique: true })
  email: string;
  
  @Column()
  password: string;
  
  @Column()
  fullName: string;
  
  @Column({ default: 'employee' })
  role: 'admin' | 'employee';
  
  @Column({ default: true })
  isActive: boolean;
  
  @CreateDateColumn()
  createdAt: Date;
}

// Entidad Horario de Peluquero
@Entity('barber_schedules')
export class BarberSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column('uuid')
  barberId: string;
  
  @Column('int')
  dayOfWeek: number;
  
  @Column('time')
  startTime: string;
  
  @Column('time')
  endTime: string;
  
  @Column({ default: true })
  isActive: boolean;
}

// Entidad Configuración del Negocio
@Entity('business_config')
export class BusinessConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column()
  businessName: string;
  
  @Column({ default: 'America/Argentina/Buenos_Aires' })
  timezone: string;
  
  @Column({ default: 'ARS' })
  currency: string;
  
  @Column('json')
  operatingHours: {
    [day: number]: { open: string; close: string };
  };
}
```

---

## 🎨 Diseño UI/UX

### Paleta de Colores

```css
:root {
  /* Primarios */
  --primary: #6366f1;        /* Indigo 500 */
  --primary-hover: #4f46e5;  /* Indigo 600 */
  
  /* Estados */
  --success: #22c55e;        /* Green 500 */
  --warning: #f59e0b;        /* Amber 500 */
  --error: #ef4444;          /* Red 500 */
  --info: #3b82f6;           /* Blue 500 */
  
  /* Neutros */
  --background: #f8fafc;     /* Slate 50 */
  --surface: #ffffff;
  --border: #e2e8f0;         /* Slate 200 */
  --text-primary: #0f172a;   /* Slate 900 */
  --text-secondary: #64748b; /* Slate 500 */
  
  /* Estados de turnos */
  --status-reserved: #fbbf24;
  --status-confirmed: #22c55e;
  --status-cancelled: #ef4444;
  --status-completed: #6366f1;
  --status-noshow: #64748b;
}
```

### Layout Principal

```
┌─────────────────────────────────────────────────────────┐
│  Logo    │  Search...                    │ 🔔  👤 Admin │  ← Header
├──────────┼──────────────────────────────────────────────┤
│ Dashboard│                                              │
│ Turnos   │                                              │
│ Clientes │           CONTENIDO PRINCIPAL                │
│ Servicios│                                              │
│ Peluquero│                                              │
│ Agente AI│                                              │
│ Reportes │                                              │
│ ──────── │                                              │
│ Config   │                                              │
└──────────┴──────────────────────────────────────────────┘
   Sidebar
```

---

## 📅 Fases de Implementación

### Fase 1: Fundamentos (Semana 1-2)

**Objetivo:** Establecer la base del proyecto frontend.

**Tareas:**
1. [ ] Inicializar proyecto Next.js 14
2. [ ] Configurar Tailwind CSS + shadcn/ui
3. [ ] Implementar layout principal (Header, Sidebar)
4. [ ] Configurar TanStack Query
5. [ ] Implementar autenticación básica
6. [ ] Crear página de login
7. [ ] Configurar rutas protegidas

**Entregables:**
- Proyecto configurado y funcionando
- Sistema de autenticación básico
- Layout responsive

---

### Fase 2: Turnos y Calendario (Semana 3-4)

**Objetivo:** Implementar gestión completa de turnos.

**Tareas:**
1. [ ] Crear vista lista de turnos con tabla
2. [ ] Implementar filtros y búsqueda
3. [ ] Desarrollar formulario crear/editar turno
4. [ ] Implementar vista calendario (FullCalendar)
5. [ ] Crear modal de detalle de turno
6. [ ] Implementar cambio de estados
7. [ ] Backend: endpoints CRUD de appointments

**Entregables:**
- CRUD completo de turnos
- Vista calendario funcional
- Filtros operativos

---

### Fase 3: CRM y Servicios (Semana 5-6)

**Objetivo:** Implementar gestión de clientes y servicios.

**Tareas:**
1. [ ] Backend: módulo Customers
2. [ ] Crear vista lista de clientes
3. [ ] Implementar perfil de cliente
4. [ ] Desarrollar historial de visitas
5. [ ] CRUD de servicios
6. [ ] CRUD de peluqueros
7. [ ] Gestión de horarios de peluqueros

**Entregables:**
- CRM de clientes funcional
- Gestión de servicios y peluqueros

---

### Fase 4: Agente AI (Semana 7-8)

**Objetivo:** Integrar interfaz con el agente AI.

**Tareas:**
1. [ ] Implementar chat con streaming
2. [ ] Mostrar herramientas usadas por el agente
3. [ ] Vista de conversaciones histórica
4. [ ] Panel de configuración del agente
5. [ ] Edición de System Prompt
6. [ ] Logs y métricas del agente

**Entregables:**
- Chat funcional con streaming
- Configuración del agente

---

### Fase 5: Dashboard y Reportes (Semana 9-10)

**Objetivo:** Implementar analytics y reportes.

**Tareas:**
1. [ ] Backend: módulo Dashboard
2. [ ] Backend: módulo Reports
3. [ ] Implementar dashboard con métricas
4. [ ] Crear gráficos de ingresos
5. [ ] Estadísticas de turnos
6. [ ] Métricas de clientes
7. [ ] Exportación PDF/CSV

**Entregables:**
- Dashboard con métricas en tiempo real
- Reportes exportables

---

### Fase 6: Pulido y Deploy (Semana 11-12)

**Objetivo:** Optimización y despliegue.

**Tareas:**
1. [ ] Testing E2E con Playwright
2. [ ] Optimización de performance
3. [ ] Responsive design review
4. [ ] Configuración Docker
5. [ ] Deploy a producción
6. [ ] Documentación de usuario

**Entregables:**
- Sistema testeado y optimizado
- Desplegado en producción
- Documentación completa

---

## 🧪 Plan de Verificación

### Testing Automatizado

```bash
# Frontend - Unit tests con Vitest
npm run test

# Frontend - E2E tests con Playwright
npm run test:e2e

# Backend - Unit tests con Jest (existente)
pnpm test

# Backend - E2E tests
pnpm test:e2e
```

### Pruebas Manuales

1. **Flujo de Login**
   - Ingresar credenciales válidas
   - Verificar redirección a dashboard
   
2. **Gestión de Turnos**
   - Crear turno manualmente
   - Verificar en calendario
   - Cambiar estado a confirmado
   
3. **Chat con Agente**
   - Enviar consulta de precios
   - Verificar respuesta con streaming
   - Agendar turno desde chat

---

## ⚠️ Consideraciones Técnicas

### Rendimiento
- Implementar paginación en todas las listas
- Usar React Query para caching
- Lazy loading de componentes pesados
- Optimistic updates para mejor UX

### Seguridad
- JWT para autenticación
- RBAC (Role Based Access Control)
- Sanitización de inputs
- HTTPS obligatorio

### Escalabilidad
- Arquitectura modular
- Separación clara frontend/backend
- Preparar para múltiples sucursales (futuro)

---

## 📋 Decisiones que Requieren Revisión del Usuario

> [!IMPORTANT]
> **Stack Frontend**
> Se propone Next.js 14 con Tailwind CSS y shadcn/ui. ¿Hay alguna preferencia diferente?

> [!IMPORTANT]
> **Autenticación**
> Se propone NextAuth.js con JWT. ¿Ya existe algún sistema de auth o se prefiere otro?

> [!IMPORTANT]
> **Hosting**
> ¿Dónde se desplegará el frontend? Opciones: Vercel, Docker en VPS, AWS.

> [!IMPORTANT]
> **Prioridades de Módulos**
> ¿Cuáles módulos son más urgentes? El orden propuesto puede ajustarse.

---

**Documento creado:** Diciembre 2025  
**Versión:** 1.0
