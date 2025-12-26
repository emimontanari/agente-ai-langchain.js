# Análisis Completo: Agente AI para Peluquería
## Evaluación Técnica y Recomendaciones Estratégicas

**Fecha de análisis:** Diciembre 2025  
**Versión del sistema:** 1.0  
**Stack actual:** NestJS + LangChain.js + OpenAI GPT-4 Turbo + PostgreSQL

---

## 1. EVALUACIÓN ACTUAL

### 1.1 Fortalezas Identificadas

#### ✅ Arquitectura Técnica Sólida

**Backend Profesional**
- NestJS proporciona una arquitectura modular escalable con inyección de dependencias
- Separación clara de responsabilidades (controllers, services, tools)
- TypeScript asegura type safety y mejor mantenibilidad
- TypeORM facilita migraciones y gestión de base de datos

**Sistema de Tools Bien Diseñado**
- 6 herramientas especializadas cada una con responsabilidad única:
  - `schedule_appointment`: Agendado de turnos con resolución automática de UUIDs
  - `cancel_appointment`: Cancelación con registro de motivos
  - `get_info`: Información verificada de servicios y precios
  - `check_status`: Consulta de estado en tiempo real
  - `list_barbers`: Disponibilidad de peluqueros
  - `resolve_datetime`: Conversión inteligente de fechas naturales a ISO
- Respuestas estructuradas en JSON para consistencia
- Validación robusta en cada tool

**Gestión de Datos de Calidad**
- Sistema estricto para evitar "alucinaciones" del AI
- Precios siempre desde base de datos, nunca inventados
- Formato de moneda local (ARS) respetado
- Validación de disponibilidad antes de confirmar reservas
- Manejo de errores sin excepciones que rompan el flujo

#### ✅ Funcionalidades Core Completas

El agente cubre el ciclo completo de gestión de turnos:
1. **Consulta** → Cliente pregunta por servicios/precios
2. **Reserva** → Agendado automático con validaciones
3. **Confirmación** → Verificación de datos y confirmación explícita
4. **Seguimiento** → Consulta de estado de turnos existentes
5. **Cancelación** → Gestión de cancelaciones con trazabilidad

#### ✅ Infraestructura Cloud-Native

- **Neon PostgreSQL**: Base de datos serverless con escalabilidad automática
- **Vercel**: Despliegue continuo con CI/CD
- **Sentry** (opcional): Monitoreo de errores en producción
- **Inngest** (opcional): Orquestación de workflows asíncronos
- **Better Auth** (opcional): Sistema de autenticación moderno

---

### 1.2 Debilidades Críticas

#### ❌ Falta de Interfaz de Usuario

**Situación actual:** El agente solo existe como API REST
- Endpoint único: `POST /api/agent/chat`
- Solo accesible vía cURL o Postman
- Barrera de entrada alta para usuarios no técnicos
- Cero accesibilidad para clientes finales

**Impacto:** 
- Imposibilidad de uso por clientes reales
- Desperdicio del 90% del potencial del agente
- Requiere conocimientos técnicos para probar funcionalidades

#### ❌ Sin Sistema de Autenticación en Uso

**Problema:** Better Auth está mencionado pero no implementado
- No hay distinción entre usuarios (clientes vs. administradores vs. peluqueros)
- Imposible asociar reservas a usuarios específicos
- Riesgo de seguridad: cualquiera puede cancelar turnos de otros
- Sin historial personalizado de cliente

**Consecuencias:**
- Cliente A puede ver/cancelar turnos de Cliente B
- No hay trazabilidad de quién hizo qué acción
- Imposible implementar funciones como "mis turnos"

#### ❌ Ausencia de Notificaciones

**Situación:** Inngest está disponible pero no configurado
- Cliente agenda turno → No recibe confirmación por email/SMS
- Turno próximo → Sin recordatorios automáticos
- Cancelación → Peluquero no es notificado
- Cambios → Sin comunicación bidireccional

**Impacto en UX:**
- Cliente olvida su turno → No show
- Peluquero pierde tiempo esperando cliente que canceló
- Experiencia desconectada y poco profesional

#### ❌ Sin Persistencia de Conversaciones

**Problema:** Cada mensaje es aislado
- El agente no recuerda conversaciones previas
- Cliente debe repetir información en cada interacción
- Imposible hacer seguimiento a reservas mencionadas antes

**Ejemplo del problema:**
```
Cliente: "Quiero un corte para mañana"
Agente: "Perfecto, ¿a qué hora?"
Cliente: "A las 15:00"
Agente: ❌ No recuerda que es un corte → debe preguntar servicio de nuevo
```

#### ❌ Limitaciones de Escalabilidad

**Puntos ciegos actuales:**
- Sin sistema de caché (Redis mencionado pero no implementado)
- Sin rate limiting efectivo
- Sin optimización de consultas a OpenAI (costos)
- Sin manejo de concurrencia en reservas (dos clientes podrían reservar mismo horario)
- Sin estrategia de failover si OpenAI está caído

#### ❌ Testing Inexistente

**Situación:** Archivos `.spec.ts` generados pero vacíos
- Sin unit tests de tools
- Sin integration tests de flujos completos
- Sin e2e tests de casos de uso reales
- Imposible garantizar que cambios no rompan funcionalidad

---

## 2. MEJORAS FUNCIONALES PRIORITARIAS

### 2.1 Implementar Sistema de Sesiones Conversacionales

**Objetivo:** Mantener contexto entre mensajes para conversaciones naturales

**Implementación técnica:**
```typescript
// Nueva entidad: Conversation
@Entity()
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column('jsonb')
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;

  @Column('jsonb', { nullable: true })
  context: {
    pendingBooking?: {
      serviceId?: string;
      barberId?: string;
      datetime?: string;
    };
    lastMentionedAppointmentId?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Modificación en AgentService:**
```typescript
async chat(userId: string, conversationId: string, message: string) {
  // 1. Recuperar conversación existente
  const conversation = await this.conversationRepo.findOne({
    where: { id: conversationId, userId }
  });
  
  // 2. Incluir historial en el prompt
  const fullMessages = [
    ...conversation.messages,
    { role: 'user', content: message }
  ];
  
  // 3. Llamar a LangChain con contexto completo
  const response = await this.agentExecutor.invoke({
    input: message,
    chat_history: fullMessages,
    context: conversation.context
  });
  
  // 4. Actualizar conversación
  conversation.messages.push(
    { role: 'user', content: message, timestamp: new Date() },
    { role: 'assistant', content: response.output, timestamp: new Date() }
  );
  
  await this.conversationRepo.save(conversation);
  
  return response;
}
```

**Beneficios:**
- ✅ Cliente puede hacer reservas en múltiples mensajes
- ✅ Agente recuerda preferencias (peluquero favorito)
- ✅ Posibilidad de corregir datos sin reiniciar
- ✅ UX más natural y humana

**Esfuerzo estimado:** 3-5 días de desarrollo

---

### 2.2 Sistema de Autenticación y Autorización Completo

**Objetivo:** Implementar Better Auth con roles y permisos

**Estructura de roles:**
```typescript
enum UserRole {
  CUSTOMER = 'customer',      // Cliente final
  BARBER = 'barber',          // Peluquero
  ADMIN = 'admin',            // Administrador
  RECEPTIONIST = 'receptionist' // Recepcionista
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  fullName: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @Column({ nullable: true })
  phone?: string;

  @OneToMany(() => Appointment, appointment => appointment.customer)
  appointments: Appointment[];

  @Column({ nullable: true })
  barberId?: string; // Si el user es también barber
}
```

**Guards para protección de rutas:**
```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      'roles',
      [context.getHandler(), context.getClass()]
    );
    
    if (!requiredRoles) return true;
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some(role => user.role === role);
  }
}
```

**Uso en controladores:**
```typescript
@Controller('api/agent')
export class AgentController {
  @Post('chat')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER) // Solo clientes pueden chatear
  async chat(
    @CurrentUser() user: User,
    @Body() body: ChatRequestDto
  ) {
    return this.agentService.chat(user.id, body.conversationId, body.message);
  }
}

@Controller('api/admin')
export class AdminController {
  @Get('appointments')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.RECEPTIONIST)
  async getAllAppointments() {
    // Solo admin/recepcionista pueden ver todos los turnos
    return this.bookingsService.findAll();
  }
}
```

**Beneficios:**
- ✅ Cada cliente ve solo sus propios turnos
- ✅ Peluqueros ven su agenda personal
- ✅ Admin tiene vista completa del sistema
- ✅ Seguridad robusta contra acceso no autorizado
- ✅ Trazabilidad: saber quién hizo cada acción

**Esfuerzo estimado:** 5-7 días de desarrollo

---

### 2.3 Sistema de Notificaciones Inteligente con Inngest

**Objetivo:** Comunicación automática multicanal

**Workflows implementados:**

#### Workflow 1: Confirmación de Reserva
```typescript
export const appointmentConfirmation = inngest.createFunction(
  { id: 'appointment-confirmation' },
  { event: 'appointment.created' },
  async ({ event, step }) => {
    const { appointmentId, customerId } = event.data;
    
    // Paso 1: Obtener datos del turno
    const appointment = await step.run('fetch-appointment', async () => {
      return await db.appointment.findOne({ 
        where: { id: appointmentId },
        relations: ['customer', 'barber', 'service']
      });
    });
    
    // Paso 2: Enviar email
    await step.run('send-email', async () => {
      return await emailService.send({
        to: appointment.customer.email,
        subject: 'Confirmación de turno - Peluquería',
        template: 'appointment-confirmation',
        data: {
          customerName: appointment.customer.fullName,
          serviceName: appointment.service.name,
          barberName: appointment.barber.displayName,
          datetime: format(appointment.startsAt, "dd/MM/yyyy 'a las' HH:mm"),
          price: formatCurrency(appointment.service.priceCents / 100)
        }
      });
    });
    
    // Paso 3: Enviar SMS (si tiene teléfono)
    if (appointment.customer.phone) {
      await step.run('send-sms', async () => {
        return await smsService.send({
          to: appointment.customer.phone,
          message: `Turno confirmado para ${appointment.service.name} con ${appointment.barber.displayName} el ${format(appointment.startsAt, 'dd/MM')} a las ${format(appointment.startsAt, 'HH:mm')}`
        });
      });
    }
    
    // Paso 4: Agregar a calendario (opcional)
    await step.run('add-to-calendar', async () => {
      return await calendarService.createEvent({
        title: `${appointment.service.name} - ${appointment.barber.displayName}`,
        start: appointment.startsAt,
        end: appointment.endsAt,
        attendees: [appointment.customer.email]
      });
    });
  }
);
```

#### Workflow 2: Recordatorio 24 Horas Antes
```typescript
export const appointmentReminder = inngest.createFunction(
  { id: 'appointment-reminder' },
  { event: 'appointment.created' },
  async ({ event, step }) => {
    const { appointmentId, startsAt } = event.data;
    
    // Esperar hasta 24 horas antes del turno
    await step.sleep('wait-for-reminder', startsAt - 24 * 60 * 60 * 1000);
    
    // Verificar que el turno sigue activo
    const appointment = await step.run('check-status', async () => {
      return await db.appointment.findOne({ 
        where: { id: appointmentId },
        relations: ['customer', 'barber', 'service']
      });
    });
    
    if (appointment.status === 'cancelled') {
      return { skipped: true, reason: 'Appointment was cancelled' };
    }
    
    // Enviar recordatorio
    await step.run('send-reminder-email', async () => {
      return await emailService.send({
        to: appointment.customer.email,
        subject: 'Recordatorio: Tu turno es mañana',
        template: 'appointment-reminder',
        data: {
          customerName: appointment.customer.fullName,
          serviceName: appointment.service.name,
          barberName: appointment.barber.displayName,
          datetime: format(appointment.startsAt, "dd/MM/yyyy 'a las' HH:mm"),
          cancelLink: `${process.env.FRONTEND_URL}/cancel/${appointment.id}`
        }
      });
    });
    
    if (appointment.customer.phone) {
      await step.run('send-reminder-sms', async () => {
        return await smsService.send({
          to: appointment.customer.phone,
          message: `Recordatorio: Turno mañana ${format(appointment.startsAt, 'HH:mm')} con ${appointment.barber.displayName}. Para cancelar: ${process.env.FRONTEND_URL}/cancel/${appointment.id}`
        });
      });
    }
  }
);
```

#### Workflow 3: Notificación de Cancelación
```typescript
export const appointmentCancellation = inngest.createFunction(
  { id: 'appointment-cancellation' },
  { event: 'appointment.cancelled' },
  async ({ event, step }) => {
    const { appointmentId, cancelledBy, reason } = event.data;
    
    const appointment = await step.run('fetch-appointment', async () => {
      return await db.appointment.findOne({
        where: { id: appointmentId },
        relations: ['customer', 'barber']
      });
    });
    
    // Notificar al cliente (si canceló el peluquero/admin)
    if (cancelledBy !== appointment.customer.id) {
      await step.run('notify-customer', async () => {
        return await emailService.send({
          to: appointment.customer.email,
          subject: 'Turno cancelado',
          template: 'appointment-cancelled-by-barber',
          data: {
            customerName: appointment.customer.fullName,
            reason: reason || 'Motivos de fuerza mayor',
            alternativeLink: `${process.env.FRONTEND_URL}/book`
          }
        });
      });
    }
    
    // Notificar al peluquero (si canceló el cliente)
    if (cancelledBy === appointment.customer.id) {
      await step.run('notify-barber', async () => {
        return await emailService.send({
          to: appointment.barber.email,
          subject: 'Turno cancelado por cliente',
          template: 'appointment-cancelled-by-customer',
          data: {
            barberName: appointment.barber.displayName,
            customerName: appointment.customer.fullName,
            datetime: format(appointment.startsAt, 'dd/MM/yyyy HH:mm'),
            reason: reason || 'No especificado'
          }
        });
      });
    }
  }
);
```

**Beneficios:**
- ✅ Cliente recibe confirmación inmediata
- ✅ Recordatorios reducen no-shows en 40-60%
- ✅ Peluqueros informados de cambios en tiempo real
- ✅ Integración con calendarios personales
- ✅ Comunicación profesional y automatizada

**Esfuerzo estimado:** 4-6 días de desarrollo

---

### 2.4 Sistema de Caché y Optimización de Costos

**Objetivo:** Reducir latencia y costos de OpenAI API

**Implementación con Redis:**
```typescript
// cache.module.ts
@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      ttl: 60 * 60 // 1 hora por defecto
    })
  ]
})
export class AppCacheModule {}
```

**Estrategias de caché:**

#### 1. Caché de Respuestas Frecuentes
```typescript
@Injectable()
export class AgentService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async chat(userId: string, message: string) {
    // Generar hash del mensaje para usar como key
    const messageHash = createHash('md5').update(message.toLowerCase()).digest('hex');
    const cacheKey = `agent:response:${messageHash}`;
    
    // Buscar en caché
    const cachedResponse = await this.cacheManager.get(cacheKey);
    if (cachedResponse) {
      return {
        response: cachedResponse,
        cached: true,
        source: 'redis'
      };
    }
    
    // Si no está en caché, llamar a OpenAI
    const response = await this.agentExecutor.invoke({ input: message });
    
    // Guardar en caché solo si es pregunta informativa (no acciones)
    if (!this.isActionQuery(message)) {
      await this.cacheManager.set(cacheKey, response.output, 3600); // 1 hora
    }
    
    return {
      response: response.output,
      cached: false,
      source: 'openai'
    };
  }
  
  private isActionQuery(message: string): boolean {
    const actionKeywords = ['agendar', 'reservar', 'cancelar', 'modificar'];
    return actionKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  }
}
```

#### 2. Caché de Datos de Base de Datos
```typescript
@Injectable()
export class BookingsService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private appointmentRepo: Repository<Appointment>
  ) {}

  async getServices(): Promise<Service[]> {
    const cacheKey = 'services:all';
    
    let services = await this.cacheManager.get<Service[]>(cacheKey);
    
    if (!services) {
      services = await this.serviceRepo.find({ where: { isActive: true } });
      // Servicios cambian raramente, caché de 24 horas
      await this.cacheManager.set(cacheKey, services, 86400);
    }
    
    return services;
  }

  async getAvailableSlots(barberId: string, date: Date): Promise<TimeSlot[]> {
    const cacheKey = `availability:${barberId}:${format(date, 'yyyy-MM-dd')}`;
    
    let slots = await this.cacheManager.get<TimeSlot[]>(cacheKey);
    
    if (!slots) {
      slots = await this.calculateAvailability(barberId, date);
      // Disponibilidad cambia frecuentemente, caché de 5 minutos
      await this.cacheManager.set(cacheKey, slots, 300);
    }
    
    return slots;
  }
  
  // Invalidar caché al crear/cancelar turno
  async createAppointment(data: CreateAppointmentDto) {
    const appointment = await this.appointmentRepo.save(data);
    
    // Invalidar caché de disponibilidad
    const dateKey = format(data.startsAt, 'yyyy-MM-dd');
    await this.cacheManager.del(`availability:${data.barberId}:${dateKey}`);
    
    return appointment;
  }
}
```

#### 3. Rate Limiting Inteligente
```typescript
@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;
    
    const key = `rate-limit:${userId}`;
    const current = await this.cacheManager.get<number>(key) || 0;
    
    if (current >= 30) { // 30 requests por minuto
      throw new TooManyRequestsException(
        'Demasiadas solicitudes. Espera un minuto.'
      );
    }
    
    await this.cacheManager.set(key, current + 1, 60);
    return true;
  }
}
```

**Métricas de mejora esperadas:**
- ⚡ **Latencia:** -60% en queries frecuentes (3s → 1.2s)
- 💰 **Costos OpenAI:** -40% al cachear respuestas comunes
- 🔄 **Carga DB:** -50% al cachear datos raramente cambiantes
- 📈 **Throughput:** +200% requests por segundo

**Esfuerzo estimado:** 3-4 días de desarrollo

---

### 2.5 Manejo de Concurrencia en Reservas

**Problema actual:** Dos clientes pueden intentar reservar el mismo horario simultáneamente

**Solución:** Implementar locks distribuidos con Redis

```typescript
@Injectable()
export class BookingsService {
  constructor(
    private redisClient: Redis,
    private appointmentRepo: Repository<Appointment>
  ) {}

  async scheduleAppointment(data: CreateAppointmentDto): Promise<Result> {
    const lockKey = `lock:appointment:${data.barberId}:${data.startsAt.toISOString()}`;
    
    // Intentar adquirir lock (expire en 10 segundos)
    const lock = await this.redisClient.set(
      lockKey,
      'locked',
      'EX', 10,
      'NX' // Solo setear si no existe
    );
    
    if (!lock) {
      return {
        ok: false,
        message: 'Este horario está siendo reservado por otro cliente. Intenta con otro horario.'
      };
    }
    
    try {
      // Verificar disponibilidad
      const existingAppointment = await this.appointmentRepo.findOne({
        where: {
          barberId: data.barberId,
          startsAt: LessThanOrEqual(data.startsAt),
          endsAt: MoreThanOrEqual(data.startsAt),
          status: In(['reserved', 'confirmed'])
        }
      });
      
      if (existingAppointment) {
        return {
          ok: false,
          message: 'Horario no disponible. Por favor elige otro.'
        };
      }
      
      // Crear appointment
      const appointment = await this.appointmentRepo.save(data);
      
      // Disparar evento para notificaciones
      await this.inngestClient.send({
        name: 'appointment.created',
        data: {
          appointmentId: appointment.id,
          customerId: appointment.customerId,
          startsAt: appointment.startsAt
        }
      });
      
      return {
        ok: true,
        appointment,
        message: 'Turno confirmado exitosamente'
      };
      
    } finally {
      // Liberar lock
      await this.redisClient.del(lockKey);
    }
  }
}
```

**Beneficios:**
- ✅ Previene double-booking 100%
- ✅ Experiencia coherente bajo alta concurrencia
- ✅ Mensajes de error claros cuando hay conflicto

**Esfuerzo estimado:** 2-3 días de desarrollo

---

## 3. IMPLEMENTACIÓN DE FRONTEND

### 3.1 Opciones Técnicas Viables

#### Opción A: Next.js 14 (App Router) ⭐ RECOMENDADA

**Ventajas:**
- ✅ React Server Components para mejor performance
- ✅ Routing integrado con file-system
- ✅ SEO out-of-the-box (importante para atraer clientes)
- ✅ Despliegue trivial en Vercel (mismo provider que backend)
- ✅ TypeScript full-stack
- ✅ Streaming UI para respuestas del agente en tiempo real

**Stack complementario:**
```
Next.js 14 (App Router)
├── Tailwind CSS (estilos)
├── shadcn/ui (componentes)
├── React Query (data fetching)
├── Zustand (estado global ligero)
├── React Hook Form (formularios)
├── date-fns (manejo de fechas)
└── Socket.io (chat en tiempo real)
```

**Estructura de carpetas:**
```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (app)/
│   │   ├── dashboard/
│   │   ├── chat/
│   │   ├── appointments/
│   │   └── profile/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/              # shadcn components
│   ├── chat/            # Chat interface
│   ├── calendar/        # Calendar views
│   └── appointments/    # Booking components
├── lib/
│   ├── api.ts           # API client
│   ├── auth.ts          # Auth helpers
│   └── utils.ts
└── hooks/
    ├── useChat.ts
    ├── useAppointments.ts
    └── useAuth.ts
```

---

#### Opción B: Astro + React Islands

**Ventajas:**
- ✅ Extremadamente rápido (ship 0 JS by default)
- ✅ Perfecto para páginas de marketing + landing
- ✅ React solo donde se necesita interactividad
- ✅ Mejor Core Web Vitals

**Desventajas:**
- ❌ Más complejo para funcionalidades dinámicas
- ❌ Menos maduro para aplicaciones full-stack
- ❌ Requiere más configuración manual

**Caso de uso ideal:** Sitio público + app separada

---

#### Opción C: Vue 3 + Nuxt 3

**Ventajas:**
- ✅ Curva de aprendizaje más suave
- ✅ Composition API muy ergonómica
- ✅ Excelente developer experience

**Desventajas:**
- ❌ Ecosistema más pequeño que React
- ❌ Menos componentes UI pre-hechos

---

### 3.2 Implementación Paso a Paso (Next.js)

#### Paso 1: Setup del Proyecto

```bash
# Crear proyecto Next.js
npx create-next-app@latest peluqueria-frontend --typescript --tailwind --app

cd peluqueria-frontend

# Instalar dependencias UI
npx shadcn-ui@latest init

# Instalar dependencias core
pnpm add @tanstack/react-query zustand react-hook-form zod
pnpm add date-fns @hookform/resolvers axios
pnpm add socket.io-client

# Instalar dev dependencies
pnpm add -D @types/node
```

#### Paso 2: Configurar API Client

```typescript
// lib/api.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  withCredentials: true
});

// Interceptor para agregar auth token
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Redirigir a login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Funciones de API
export const agentApi = {
  chat: (conversationId: string, message: string) =>
    apiClient.post('/api/agent/chat', { conversationId, message }),
  
  createConversation: () =>
    apiClient.post('/api/agent/conversation'),
};

export const appointmentsApi = {
  list: () => apiClient.get('/api/appointments'),
  get: (id: string) => apiClient.get(`/api/appointments/${id}`),
  cancel: (id: string, reason: string) =>
    apiClient.post(`/api/appointments/${id}/cancel`, { reason }),
};

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/api/auth/login', { email, password }),
  
  register: (data: RegisterData) =>
    apiClient.post('/api/auth/register', data),
  
  me: () => apiClient.get('/api/auth/me'),
};
```

#### Paso 3: Componente de Chat Principal

```typescript
// components/chat/ChatInterface.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { Loader2, Send } from 'lucide-react';

export function ChatInterface() {
  const { messages, sendMessage, isLoading } = useChat();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll al último mensaje
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    await sendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-lg">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-purple-500">
        <h2 className="text-xl font-bold text-white">
          Asistente de Peluquería
        </h2>
        <p className="text-sm text-blue-100">
          Agenda tu turno o pregúntame lo que necesites
        </p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${
                message.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <Avatar className="w-8 h-8">
                {message.role === 'user' ? '👤' : '💇'}
              </Avatar>
              
              <div
                className={`rounded-lg p-3 max-w-[80%] ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">
                  {message.content}
                </p>
                <span className="text-xs opacity-70 mt-1 block">
                  {message.timestamp.toLocaleTimeString('es-AR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Escribiendo...</span>
            </div>
          )}
          
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu mensaje..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
```

#### Paso 4: Hook Personalizado para Chat

```typescript
// hooks/useChat.ts
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentApi } from '@/lib/api';
import { io, Socket } from 'socket.io-client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function useChat() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const queryClient = useQueryClient();

  // Crear conversación al montar
  useEffect(() => {
    agentApi.createConversation().then(res => {
      setConversationId(res.data.id);
    });
  }, []);

  // Conectar socket para respuestas en streaming
  useEffect(() => {
    if (!conversationId) return;

    const newSocket = io(process.env.NEXT_PUBLIC_API_URL!, {
      query: { conversationId }
    });

    newSocket.on('message:chunk', (chunk: string) => {
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && !last.completed) {
          return [
            ...prev.slice(0, -1),
            { ...last, content: last.content + chunk }
          ];
        }
        return [
          ...prev,
          { role: 'assistant', content: chunk, timestamp: new Date(), completed: false }
        ];
      });
    });

    newSocket.on('message:complete', () => {
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return [
            ...prev.slice(0, -1),
            { ...last, completed: true }
          ];
        }
        return prev;
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [conversationId]);

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!conversationId) throw new Error('No conversation');
      
      // Agregar mensaje del usuario inmediatamente
      setMessages(prev => [
        ...prev,
        { role: 'user', content: message, timestamp: new Date() }
      ]);
      
      // Enviar a API
      return agentApi.chat(conversationId, message);
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      // Mostrar error al usuario
    }
  });

  return {
    messages,
    sendMessage: sendMessageMutation.mutateAsync,
    isLoading: sendMessageMutation.isPending
  };
}
```

#### Paso 5: Vista de Calendario de Turnos

```typescript
// components/calendar/AppointmentCalendar.tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appointmentsApi } from '@/lib/api';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

export function AppointmentCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const res = await appointmentsApi.list();
      return res.data;
    }
  });

  const appointmentsOnDate = appointments.filter(apt =>
    isSameDay(new Date(apt.startsAt), selectedDate)
  );

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Calendario */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Selecciona una fecha
        </h3>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          locale={es}
          className="rounded-md border"
          modifiers={{
            hasAppointment: (date) =>
              appointments.some(apt =>
                isSameDay(new Date(apt.startsAt), date)
              )
          }}
          modifiersStyles={{
            hasAppointment: {
              fontWeight: 'bold',
              backgroundColor: '#3b82f6',
              color: 'white'
            }
          }}
        />
      </Card>

      {/* Turnos del día */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Turnos del {format(selectedDate, "d 'de' MMMM", { locale: es })}
        </h3>

        {appointmentsOnDate.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No hay turnos para esta fecha
          </p>
        ) : (
          <div className="space-y-3">
            {appointmentsOnDate.map(apt => (
              <AppointmentCard key={apt.id} appointment={apt} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function AppointmentCard({ appointment }) {
  const statusColors = {
    reserved: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-semibold">{appointment.service.name}</h4>
          <p className="text-sm text-gray-600">
            con {appointment.barber.displayName}
          </p>
        </div>
        <Badge className={statusColors[appointment.status]}>
          {appointment.status}
        </Badge>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span>⏰ {format(new Date(appointment.startsAt), 'HH:mm')}</span>
        <span>⏱️ {appointment.service.durationMinutes} min</span>
        <span>💰 ${(appointment.service.priceCents / 100).toFixed(2)}</span>
      </div>

      {appointment.status !== 'cancelled' && (
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-3"
          onClick={() => {/* Lógica de cancelación */}}
        >
          Cancelar turno
        </Button>
      )}
    </div>
  );
}
```

#### Paso 6: Dashboard Principal

```typescript
// app/(app)/dashboard/page.tsx
import { ChatInterface } from '@/components/chat/ChatInterface';
import { AppointmentCalendar } from '@/components/calendar/AppointmentCalendar';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { QuickActions } from '@/components/dashboard/QuickActions';

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Mi Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Gestiona tus turnos y chatea con nuestro asistente
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Chat Interface */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Asistente Virtual
          </h2>
          <ChatInterface />
        </div>

        {/* Calendar */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Mis Turnos
          </h2>
          <AppointmentCalendar />
        </div>
      </div>
    </div>
  );
}
```

**Esfuerzo total frontend:** 15-20 días de desarrollo

---

## 4. NUEVAS UTILIDADES

### 4.1 Sistema de Valoraciones y Reseñas

**Funcionalidad:**
- Cliente puede valorar su experiencia después del turno (1-5 estrellas)
- Comentarios opcionales sobre el servicio
- Peluqueros ven sus ratings agregados
- Clientes potenciales ven reseñas antes de elegir peluquero

**Implementación:**
```typescript
@Entity()
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  appointmentId: string;

  @ManyToOne(() => Appointment)
  appointment: Appointment;

  @Column()
  customerId: string;

  @Column()
  barberId: string;

  @Column({ type: 'int', width: 1 })
  rating: number; // 1-5

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @CreateDateColumn()
  createdAt: Date;
}

// Tool para el agente
export const submitReviewTool = new DynamicStructuredTool({
  name: 'submit_review',
  description: 'Permite al cliente enviar una reseña después de su turno',
  schema: z.object({
    appointmentId: z.string().uuid(),
    rating: z.number().min(1).max(5),
    comment: z.string().optional()
  }),
  func: async ({ appointmentId, rating, comment }) => {
    // Verificar que el turno ya pasó
    const appointment = await appointmentRepo.findOne({
      where: { id: appointmentId }
    });
    
    if (new Date() < appointment.endsAt) {
      return {
        ok: false,
        message: 'Solo puedes reseñar turnos completados'
      };
    }
    
    const review = await reviewRepo.save({
      appointmentId,
      customerId: appointment.customerId,
      barberId: appointment.barberId,
      rating,
      comment
    });
    
    return {
      ok: true,
      message: '¡Gracias por tu reseña! Nos ayuda a mejorar.'
    };
  }
});
```

**Workflow Inngest para solicitar reseñas:**
```typescript
export const requestReview = inngest.createFunction(
  { id: 'request-review' },
  { event: 'appointment.completed' },
  async ({ event, step }) => {
    // Esperar 2 horas después del turno
    await step.sleep('wait-after-appointment', 2 * 60 * 60 * 1000);
    
    const appointment = await step.run('fetch-appointment', async () => {
      return await db.appointment.findOne({
        where: { id: event.data.appointmentId },
        relations: ['customer', 'barber']
      });
    });
    
    // Enviar email pidiendo reseña
    await step.run('send-review-request', async () => {
      return await emailService.send({
        to: appointment.customer.email,
        subject: '¿Cómo fue tu experiencia?',
        template: 'review-request',
        data: {
          customerName: appointment.customer.fullName,
          barberName: appointment.barber.displayName,
          reviewLink: `${process.env.FRONTEND_URL}/review/${appointment.id}`
        }
      });
    });
  }
);
```

**Beneficios:**
- ✅ Mejora reputación online
- ✅ Feedback valioso para el negocio
- ✅ Transparencia para clientes nuevos
- ✅ Incentivo para peluqueros mantener calidad

---

### 4.2 Programa de Lealtad y Descuentos

**Funcionalidad:**
- Sistema de puntos por cada turno
- Niveles de cliente (Bronce, Plata, Oro, Platino)
- Descuentos automáticos según nivel
- Bonificaciones por referir amigos
- Promociones especiales

**Implementación:**
```typescript
@Entity()
export class LoyaltyAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerId: string;

  @Column({ default: 0 })
  points: number;

  @Column({ type: 'enum', enum: ['bronze', 'silver', 'gold', 'platinum'], default: 'bronze' })
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';

  @Column({ default: 0 })
  totalSpentCents: number;

  @Column({ default: 0 })
  referralCount: number;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity()
export class LoyaltyTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  accountId: string;

  @Column({ type: 'int' })
  pointsDelta: number; // Puede ser negativo (canje)

  @Column()
  type: 'earned' | 'redeemed' | 'bonus' | 'referral';

  @Column({ nullable: true })
  appointmentId?: string;

  @Column({ nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt: Date;
}

// Service
@Injectable()
export class LoyaltyService {
  private readonly TIER_BENEFITS = {
    bronze: { discount: 0, pointsMultiplier: 1 },
    silver: { discount: 5, pointsMultiplier: 1.2 }, // 5% descuento
    gold: { discount: 10, pointsMultiplier: 1.5 },
    platinum: { discount: 15, pointsMultiplier: 2 }
  };

  async earnPoints(customerId: string, appointmentId: string, amountPaid: number) {
    const account = await this.getOrCreateAccount(customerId);
    
    // Calcular puntos (1 punto por cada $100 ARS)
    const basePoints = Math.floor(amountPaid / 100);
    const multiplier = this.TIER_BENEFITS[account.tier].pointsMultiplier;
    const points = Math.floor(basePoints * multiplier);
    
    // Agregar puntos
    account.points += points;
    account.totalSpentCents += amountPaid * 100;
    
    // Actualizar tier si corresponde
    await this.updateTier(account);
    
    // Registrar transacción
    await this.loyaltyTransactionRepo.save({
      accountId: account.id,
      pointsDelta: points,
      type: 'earned',
      appointmentId,
      description: `Ganaste ${points} puntos`
    });
    
    await this.accountRepo.save(account);
    
    return { points, newBalance: account.points };
  }

  async redeemPoints(customerId: string, points: number): Promise<number> {
    const account = await this.getOrCreateAccount(customerId);
    
    if (account.points < points) {
      throw new BadRequestException('Puntos insuficientes');
    }
    
    // 100 puntos = $50 ARS descuento
    const discountCents = (points / 100) * 5000;
    
    account.points -= points;
    await this.accountRepo.save(account);
    
    await this.loyaltyTransactionRepo.save({
      accountId: account.id,
      pointsDelta: -points,
      type: 'redeemed',
      description: `Canjeaste ${points} puntos por $${discountCents/100} de descuento`
    });
    
    return discountCents;
  }

  private async updateTier(account: LoyaltyAccount) {
    const totalSpent = account.totalSpentCents / 100;
    
    if (totalSpent >= 50000) account.tier = 'platinum';      // $50,000 ARS
    else if (totalSpent >= 25000) account.tier = 'gold';     // $25,000 ARS
    else if (totalSpent >= 10000) account.tier = 'silver';   // $10,000 ARS
    else account.tier = 'bronze';
  }

  async getReferralCode(customerId: string): Promise<string> {
    // Generar código único basado en customer ID
    return createHash('md5')
      .update(customerId + process.env.REFERRAL_SALT)
      .digest('hex')
      .substring(0, 8)
      .toUpperCase();
  }

  async processReferral(referrerCode: string, newCustomerId: string) {
    // Encontrar referrer por código
    const customers = await this.customerRepo.find();
    const referrer = customers.find(c => 
      this.getReferralCode(c.id) === referrerCode
    );
    
    if (!referrer) return null;
    
    // Bonus para ambos
    const referrerAccount = await this.getOrCreateAccount(referrer.id);
    const newAccount = await this.getOrCreateAccount(newCustomerId);
    
    // Referrer gana 500 puntos
    referrerAccount.points += 500;
    referrerAccount.referralCount += 1;
    
    // Nuevo cliente gana 200 puntos
    newAccount.points += 200;
    
    await this.accountRepo.save([referrerAccount, newAccount]);
    
    await this.loyaltyTransactionRepo.save([
      {
        accountId: referrerAccount.id,
        pointsDelta: 500,
        type: 'referral',
        description: '¡Gracias por referir un amigo!'
      },
      {
        accountId: newAccount.id,
        pointsDelta: 200,
        type: 'bonus',
        description: 'Bienvenido! Bonus por referencia'
      }
    ]);
    
    return { referrer, points: { referrer: 500, new: 200 } };
  }
}
```

**Tool para el agente:**
```typescript
export const checkLoyaltyTool = new DynamicStructuredTool({
  name: 'check_loyalty',
  description: 'Consulta el estado de puntos y beneficios del programa de lealtad',
  schema: z.object({
    customerId: z.string().uuid()
  }),
  func: async ({ customerId }) => {
    const account = await loyaltyService.getOrCreateAccount(customerId);
    const benefits = loyaltyService.TIER_BENEFITS[account.tier];
    
    return {
      ok: true,
      points: account.points,
      tier: account.tier,
      discount: `${benefits.discount}%`,
      pointsValue: `$${(account.points / 100 * 50).toFixed(2)} ARS`,
      message: `Tienes ${account.points} puntos (${account.tier.toUpperCase()}). Descuento actual: ${benefits.discount}%`
    };
  }
});
```

**Beneficios:**
- ✅ Retención de clientes (+30%)
- ✅ Incremento en frecuencia de visitas
- ✅ Marketing boca a boca vía referidos
- ✅ Mayor valor de vida del cliente (LTV)

---

### 4.3 Galería de Trabajos y Portfolio

**Funcionalidad:**
- Peluqueros suben fotos de sus trabajos
- Categorización por tipo de servicio
- Clientes ven portfolio antes de elegir peluquero
- Agente puede mostrar ejemplos durante conversación

**Implementación:**
```typescript
@Entity()
export class PortfolioImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  barberId: string;

  @ManyToOne(() => Barber)
  barber: Barber;

  @Column()
  serviceId: string;

  @ManyToOne(() => Service)
  service: Service;

  @Column()
  imageUrl: string; // URL en CDN (Cloudinary/S3)

  @Column({ nullable: true })
  description?: string;

  @Column({ default: 0 })
  likes: number;

  @CreateDateColumn()
  createdAt: Date;
}

// Tool para el agente
export const showPortfolioTool = new DynamicStructuredTool({
  name: 'show_portfolio',
  description: 'Muestra trabajos previos de un peluquero específico o de un tipo de servicio',
  schema: z.object({
    barberId: z.string().uuid().optional(),
    serviceId: z.string().uuid().optional()
  }),
  func: async ({ barberId, serviceId }) => {
    const query: any = {};
    if (barberId) query.barberId = barberId;
    if (serviceId) query.serviceId = serviceId;
    
    const images = await portfolioRepo.find({
      where: query,
      relations: ['barber', 'service'],
      order: { likes: 'DESC', createdAt: 'DESC' },
      take: 6
    });
    
    if (images.length === 0) {
      return {
        ok: false,
        message: 'No hay trabajos previos para mostrar aún'
      };
    }
    
    return {
      ok: true,
      images: images.map(img => ({
        url: img.imageUrl,
        barber: img.barber.displayName,
        service: img.service.name,
        description: img.description,
        likes: img.likes
      })),
      message: `Aquí tienes ${images.length} ejemplos de trabajos previos`
    };
  }
});
```

**Integración en frontend:**
```typescript
// components/portfolio/PortfolioGallery.tsx
export function PortfolioGallery({ barberId, serviceId }) {
  const { data: images = [] } = useQuery({
    queryKey: ['portfolio', barberId, serviceId],
    queryFn: async () => {
      const res = await apiClient.get('/api/portfolio', {
        params: { barberId, serviceId }
      });
      return res.data;
    }
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {images.map(img => (
        <div key={img.id} className="relative group">
          <img
            src={img.imageUrl}
            alt={img.description}
            className="rounded-lg w-full aspect-square object-cover"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col justify-end p-4">
            <p className="text-white text-sm font-semibold">
              {img.service.name}
            </p>
            <p className="text-white/80 text-xs">
              por {img.barber.displayName}
            </p>
            <div className="flex items-center gap-1 mt-2">
              <Heart className="w-4 h-4 text-red-400" />
              <span className="text-white text-xs">{img.likes}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Beneficios:**
- ✅ Confianza visual para clientes nuevos
- ✅ Showcase de habilidades de peluqueros
- ✅ Herramienta de marketing orgánico
- ✅ Diferenciación competitiva

---

### 4.4 Integración con Pasarela de Pagos

**Funcionalidad:**
- Pagos online al reservar turno
- Opciones: pagar ahora o pagar en el local
- Integración con Mercado Pago (Argentina)
- Gestión de reembolsos en cancelaciones

**Implementación:**
```typescript
@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  appointmentId: string;

  @ManyToOne(() => Appointment)
  appointment: Appointment;

  @Column()
  customerId: string;

  @Column({ type: 'int' })
  amountCents: number;

  @Column({ type: 'enum', enum: ['pending', 'approved', 'rejected', 'refunded'] })
  status: 'pending' | 'approved' | 'rejected' | 'refunded';

  @Column()
  paymentProvider: string; // 'mercadopago', 'cash'

  @Column({ nullable: true })
  externalPaymentId?: string;

  @CreateDateColumn()
  createdAt: Date;
}

@Injectable()
export class PaymentService {
  constructor(
    private mercadoPago: MercadoPagoSDK
  ) {}

  async createPaymentLink(appointmentId: string): Promise<string> {
    const appointment = await this.appointmentRepo.findOne({
      where: { id: appointmentId },
      relations: ['customer', 'service', 'barber']
    });

    // Crear preferencia en Mercado Pago
    const preference = {
      items: [
        {
          title: `${appointment.service.name} con ${appointment.barber.displayName}`,
          quantity: 1,
          unit_price: appointment.service.priceCents / 100,
          currency_id: 'ARS'
        }
      ],
      payer: {
        email: appointment.customer.email,
        name: appointment.customer.fullName
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL}/payment/success`,
        failure: `${process.env.FRONTEND_URL}/payment/failure`,
        pending: `${process.env.FRONTEND_URL}/payment/pending`
      },
      auto_return: 'approved',
      notification_url: `${process.env.BACKEND_URL}/api/webhooks/mercadopago`
    };

    const response = await this.mercadoPago.preferences.create(preference);

    // Guardar payment pendiente
    await this.paymentRepo.save({
      appointmentId,
      customerId: appointment.customerId,
      amountCents: appointment.service.priceCents,
      status: 'pending',
      paymentProvider: 'mercadopago',
      externalPaymentId: response.body.id
    });

    return response.body.init_point; // URL de pago
  }

  async handleWebhook(paymentId: string, status: string) {
    const payment = await this.paymentRepo.findOne({
      where: { externalPaymentId: paymentId }
    });

    if (!payment) return;

    // Actualizar estado
    payment.status = this.mapMPStatus(status);
    await this.paymentRepo.save(payment);

    // Si fue aprobado, confirmar turno
    if (payment.status === 'approved') {
      const appointment = await this.appointmentRepo.findOne({
        where: { id: payment.appointmentId }
      });
      appointment.status = 'confirmed';
      await this.appointmentRepo.save(appointment);

      // Disparar evento de confirmación
      await this.inngestClient.send({
        name: 'appointment.confirmed',
        data: { appointmentId: appointment.id }
      });
    }
  }

  async refundPayment(appointmentId: string, reason: string): Promise<boolean> {
    const payment = await this.paymentRepo.findOne({
      where: { appointmentId, status: 'approved' }
    });

    if (!payment) return false;

    try {
      // Realizar reembolso en Mercado Pago
      await this.mercadoPago.refund.create({
        payment_id: payment.externalPaymentId
      });

      payment.status = 'refunded';
      await this.paymentRepo.save(payment);

      return true;
    } catch (error) {
      console.error('Refund error:', error);
      return false;
    }
  }
}
```

**Tool para el agente:**
```typescript
export const processPaymentTool = new DynamicStructuredTool({
  name: 'process_payment',
  description: 'Genera un link de pago para que el cliente complete la reserva',
  schema: z.object({
    appointmentId: z.string().uuid(),
    paymentMethod: z.enum(['online', 'cash'])
  }),
  func: async ({ appointmentId, paymentMethod }) => {
    if (paymentMethod === 'cash') {
      // Marcar como "pago en local"
      await appointmentRepo.update(appointmentId, {
        paymentMethod: 'cash',
        status: 'confirmed'
      });
      
      return {
        ok: true,
        message: 'Perfecto, confirmaremos tu turno. Pagarás en el local.'
      };
    }

    // Generar link de pago
    const paymentLink = await paymentService.createPaymentLink(appointmentId);
    
    return {
      ok: true,
      paymentLink,
      message: 'Aquí está tu link de pago. Una vez completado, tu turno quedará confirmado.'
    };
  }
});
```

**Beneficios:**
- ✅ Reduce no-shows (clientes que pagan tienen más compromiso)
- ✅ Flujo de caja anticipado
- ✅ Menos gestión de efectivo
- ✅ Experiencia moderna y conveniente

---

### 4.5 Dashboard de Analíticas para Admin

**Funcionalidad:**
- Métricas clave del negocio en tiempo real
- Visualización de ingresos, turnos, ocupación
- Análisis de peluqueros más solicitados
- Identificación de horarios pico
- Reportes exportables

**Implementación:**
```typescript
@Injectable()
export class AnalyticsService {
  async getDashboardMetrics(
    startDate: Date,
    endDate: Date
  ): Promise<DashboardMetrics> {
    // Revenue metrics
    const totalRevenue = await this.appointmentRepo
      .createQueryBuilder('apt')
      .leftJoin('apt.service', 'service')
      .leftJoin('apt.payment', 'payment')
      .where('apt.startsAt BETWEEN :start AND :end', {
        start: startDate,
        end: endDate
      })
      .andWhere('payment.status = :status', { status: 'approved' })
      .select('SUM(service.priceCents)', 'totalCents')
      .getRawOne();

    // Appointment metrics
    const appointmentStats = await this.appointmentRepo
      .createQueryBuilder('apt')
      .where('apt.startsAt BETWEEN :start AND :end', {
        start: startDate,
        end: endDate
      })
      .select([
        'COUNT(*) as total',
        'COUNT(CASE WHEN status = \'confirmed\' THEN 1 END) as confirmed',
        'COUNT(CASE WHEN status = \'cancelled\' THEN 1 END) as cancelled',
        'COUNT(CASE WHEN status = \'reserved\' THEN 1 END) as pending'
      ])
      .getRawOne();

    // Top barbers
    const topBarbers = await this.appointmentRepo
      .createQueryBuilder('apt')
      .leftJoin('apt.barber', 'barber')
      .leftJoin('apt.service', 'service')
      .where('apt.startsAt BETWEEN :start AND :end', {
        start: startDate,
        end: endDate
      })
      .groupBy('barber.id')
      .select([
        'barber.displayName as name',
        'COUNT(*) as appointmentCount',
        'SUM(service.priceCents) as revenueCents'
      ])
      .orderBy('appointmentCount', 'DESC')
      .limit(5)
      .getRawMany();

    // Busiest hours
    const busiestHours = await this.appointmentRepo
      .createQueryBuilder('apt')
      .where('apt.startsAt BETWEEN :start AND :end', {
        start: startDate,
        end: endDate
      })
      .select([
        'EXTRACT(HOUR FROM apt.startsAt) as hour',
        'COUNT(*) as count'
      ])
      .groupBy('hour')
      .orderBy('count', 'DESC')
      .getRawMany();

    // Customer retention
    const returningCustomers = await this.appointmentRepo
      .createQueryBuilder('apt')
      .where('apt.startsAt BETWEEN :start AND :end', {
        start: startDate,
        end: endDate
      })
      .groupBy('apt.customerId')
      .having('COUNT(*) > 1')
      .select('COUNT(DISTINCT apt.customerId) as count')
      .getRawOne();

    const totalCustomers = await this.appointmentRepo
      .createQueryBuilder('apt')
      .where('apt.startsAt BETWEEN :start AND :end', {
        start: startDate,
        end: endDate
      })
      .select('COUNT(DISTINCT apt.customerId) as count')
      .getRawOne();

    return {
      revenue: {
        total: totalRevenue.totalCents / 100,
        currency: 'ARS'
      },
      appointments: {
        total: parseInt(appointmentStats.total),
        confirmed: parseInt(appointmentStats.confirmed),
        cancelled: parseInt(appointmentStats.cancelled),
        pending: parseInt(appointmentStats.pending),
        cancelRate: (parseInt(appointmentStats.cancelled) / parseInt(appointmentStats.total)) * 100
      },
      topBarbers,
      busiestHours: busiestHours.map(h => ({
        hour: parseInt(h.hour),
        count: parseInt(h.count)
      })),
      retention: {
        returningCustomers: parseInt(returningCustomers.count),
        totalCustomers: parseInt(totalCustomers.count),
        retentionRate: (parseInt(returningCustomers.count) / parseInt(totalCustomers.count)) * 100
      }
    };
  }

  async exportReport(format: 'csv' | 'pdf', dateRange: DateRange) {
    const metrics = await this.getDashboardMetrics(
      dateRange.start,
      dateRange.end
    );

    if (format === 'csv') {
      return this.generateCSV(metrics);
    } else {
      return this.generatePDF(metrics);
    }
  }
}
```

**Visualización en frontend:**
```typescript
// components/admin/AnalyticsDashboard.tsx
export function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
  });

  const { data: metrics } = useQuery({
    queryKey: ['analytics', dateRange],
    queryFn: async () => {
      const res = await apiClient.get('/api/admin/analytics', {
        params: dateRange
      });
      return res.data;
    }
  });

  return (
    <div className="space-y-6">
      {/* Date Range Picker */}
      <DateRangePicker value={dateRange} onChange={setDateRange} />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Ingresos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ${metrics.revenue.total.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">ARS</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Turnos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {metrics.appointments.total}
            </p>
            <p className="text-sm text-gray-500">
              {metrics.appointments.confirmed} confirmados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasa de Cancelación</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {metrics.appointments.cancelRate.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500">
              {metrics.appointments.cancelled} cancelados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Retención</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {metrics.retention.retentionRate.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500">
              Clientes recurrentes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top Peluqueros</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={metrics.topBarbers} />
          </CardContent>
        </Card>

        {/* Busiest Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Horarios Más Solicitados</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart data={metrics.busiestHours} />
          </CardContent>
        </Card>
      </div>

      {/* Export Button */}
      <div className="flex gap-2">
        <Button onClick={() => exportReport('csv')}>
          Exportar CSV
        </Button>
        <Button onClick={() => exportReport('pdf')}>
          Exportar PDF
        </Button>
      </div>
    </div>
  );
}
```

**Beneficios:**
- ✅ Decisiones basadas en datos
- ✅ Identificación de oportunidades de mejora
- ✅ Optimización de recursos y horarios
- ✅ Monitoreo de performance de empleados

---

### 4.6 Integraciones con Calendarios Externos

**Funcionalidad:**
- Sincronización con Google Calendar
- Sincronización con Apple Calendar (iCal)
- Sincronización con Outlook
- Actualizaciones bidireccionales

**Implementación:**
```typescript
@Injectable()
export class CalendarSyncService {
  constructor(
    private readonly googleCalendarService: GoogleCalendarService,
    private readonly outlookService: OutlookService
  ) {}

  async syncAppointmentToGoogle(appointmentId: string, userId: string) {
    const appointment = await this.appointmentRepo.findOne({
      where: { id: appointmentId },
      relations: ['customer', 'barber', 'service']
    });

    const userTokens = await this.getUserGoogleTokens(userId);

    const event = {
      summary: `${appointment.service.name} con ${appointment.barber.displayName}`,
      description: `Turno en peluquería\nServicio: ${appointment.service.name}\nPeluquero: ${appointment.barber.displayName}\nPrecio: $${appointment.service.priceCents / 100}`,
      start: {
        dateTime: appointment.startsAt.toISOString(),
        timeZone: 'America/Argentina/Buenos_Aires'
      },
      end: {
        dateTime: appointment.endsAt.toISOString(),
        timeZone: 'America/Argentina/Buenos_Aires'
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },  // 24h antes
          { method: 'popup', minutes: 60 }         // 1h antes
        ]
      }
    };

    const calendarEvent = await this.googleCalendarService.insertEvent(
      userTokens,
      event
    );

    // Guardar el ID del evento externo
    await this.appointmentRepo.update(appointmentId, {
      googleCalendarEventId: calendarEvent.id
    });

    return calendarEvent;
  }

  async generateICalLink(appointmentId: string): Promise<string> {
    const appointment = await this.appointmentRepo.findOne({
      where: { id: appointmentId },
      relations: ['barber', 'service']
    });

    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Peluquería//ES
BEGIN:VEVENT
UID:${appointmentId}@peluqueria.com
DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss'Z'")}
DTSTART:${format(appointment.startsAt, "yyyyMMdd'T'HHmmss'Z'")}
DTEND:${format(appointment.endsAt, "yyyyMMdd'T'HHmmss'Z'")}
SUMMARY:${appointment.service.name} con ${appointment.barber.displayName}
DESCRIPTION:Turno en peluquería
LOCATION:Dirección de la peluquería
BEGIN:VALARM
TRIGGER:-PT24H
DESCRIPTION:Recordatorio: Turno mañana
ACTION:DISPLAY
END:VALARM
END:VEVENT
END:VCALENDAR`;

    // Guardar archivo .ics temporalmente
    const filename = `turno-${appointmentId}.ics`;
    await writeFile(`/tmp/${filename}`, ics);

    // Subir a S3 o servir directamente
    return `${process.env.BACKEND_URL}/api/calendar/ics/${appointmentId}`;
  }
}
```

**Beneficios:**
- ✅ Cliente nunca olvida su turno
- ✅ Integración nativa con calendarios personales
- ✅ Recordatorios automáticos del sistema operativo
- ✅ Visibilidad en todos los dispositivos

---

## 5. HOJA DE RUTA DE IMPLEMENTACIÓN

### Fase 1: Fundamentos (4-6 semanas)
**Prioridad: CRÍTICA**

#### Semana 1-2: Sistema de Autenticación
- ✅ Implementar Better Auth completo
- ✅ Crear entidad User con roles
- ✅ Guards de autorización
- ✅ Endpoints de login/register/me
- ✅ Testing de autenticación

**Entregables:**
- Sistema de login funcional
- Protección de rutas por rol
- JWT tokens con refresh
- Documentación de endpoints auth

**Métricas de éxito:**
- 100% de rutas protegidas
- Login < 500ms
- 0 vulnerabilidades de seguridad detectadas

---

#### Semana 3-4: Frontend Base con Next.js
- ✅ Setup de proyecto Next.js
- ✅ Configuración de Tailwind + shadcn/ui
- ✅ Componente de chat funcional
- ✅ Integración con API de agente
- ✅ Sistema de autenticación en frontend
- ✅ Dashboard básico

**Entregables:**
- Interfaz de chat completamente funcional
- Páginas de login/register
- Dashboard con vista de turnos
- Responsive design (mobile-first)

**Métricas de éxito:**
- Lighthouse score > 90
- Tiempo de carga < 3s
- 100% responsive (mobile/tablet/desktop)

---

#### Semana 5-6: Sesiones Conversacionales + Redis
- ✅ Implementar entity Conversation
- ✅ Modificar AgentService para contexto
- ✅ Setup de Redis (Upstash para serverless)
- ✅ Implementar caché de respuestas
- ✅ Implementar caché de datos de DB
- ✅ Rate limiting con Redis

**Entregables:**
- Conversaciones persistentes
- Sistema de caché operativo
- Documentación de estrategias de caché

**Métricas de éxito:**
- 60% reducción en latencia (queries frecuentes)
- 40% reducción en costos de OpenAI
- 100% de conversaciones persistentes

---

### Fase 2: Comunicación y Engagement (3-4 semanas)
**Prioridad: ALTA**

#### Semana 7-8: Sistema de Notificaciones con Inngest
- ✅ Configurar Inngest workflows
- ✅ Workflow de confirmación de reserva
- ✅ Workflow de recordatorios 24h antes
- ✅ Workflow de cancelaciones
- ✅ Integración con email (SendGrid/Resend)
- ✅ Integración con SMS (Twilio)

**Entregables:**
- 3 workflows operativos
- Templates de emails profesionales
- Sistema de SMS opcional

**Métricas de éxito:**
- 90% de emails entregados
- Recordatorios enviados 100% a tiempo
- Reducción 40% en no-shows

---

#### Semana 9-10: Programa de Lealtad
- ✅ Implementar entities de loyalty
- ✅ Service de gestión de puntos
- ✅ Sistema de tiers automático
- ✅ Códigos de referidos
- ✅ UI de dashboard de puntos
- ✅ Tool del agente para consultar puntos

**Entregables:**
- Sistema de puntos operativo
- Página de dashboard de lealtad
- Códigos de referido únicos por usuario
- Documentación de reglas de loyalty

**Métricas de éxito:**
- 20% de clientes en tier Silver+ al mes 3
- 10% de nuevos clientes vía referidos
- Incremento 15% en frecuencia de visitas

---

### Fase 3: Diferenciación Competitiva (3-4 semanas)
**Prioridad: MEDIA-ALTA**

#### Semana 11-12: Sistema de Reseñas y Portfolio
- ✅ Implementar entity Review
- ✅ Workflow de solicitud de reseñas
- ✅ Implementar entity PortfolioImage
- ✅ Upload de imágenes (Cloudinary)
- ✅ Galería en frontend
- ✅ Tool del agente para mostrar portfolio

**Entregables:**
- Sistema de reseñas completo
- Galería de trabajos por peluquero
- Página pública de reviews
- Widget de rating agregado

**Métricas de éxito:**
- 30% de clientes dejan reseña
- Rating promedio > 4.2/5
- 5+ fotos por peluquero

---

#### Semana 13-14: Integración de Pagos
- ✅ Setup Mercado Pago SDK
- ✅ Implementar entity Payment
- ✅ Service de procesamiento de pagos
- ✅ Webhook handler para notificaciones
- ✅ Sistema de reembolsos automáticos
- ✅ UI de checkout en frontend
- ✅ Tool del agente para generar links de pago

**Entregables:**
- Pasarela de pagos operativa
- Flujo de pago online completo
- Sistema de reembolsos automático
- Reportes de transacciones

**Métricas de éxito:**
- 60% de clientes pagan online
- Tasa de abandono de checkout < 20%
- 95% de reembolsos procesados automáticamente

---

### Fase 4: Optimización y Escalabilidad (2-3 semanas)
**Prioridad: MEDIA**

#### Semana 15-16: Concurrencia y Performance
- ✅ Implementar locks distribuidos con Redis
- ✅ Optimizar queries de base de datos (índices)
- ✅ Implementar connection pooling
- ✅ Load testing con k6
- ✅ Optimización de bundle size en frontend
- ✅ Lazy loading de componentes

**Entregables:**
- 0% double-bookings
- Documentación de performance
- Reportes de load testing
- Optimizaciones aplicadas

**Métricas de éxito:**
- Soporta 100 requests concurrentes
- P95 latencia < 2s
- 0 errores de concurrencia

---

#### Semana 17: Dashboard de Analíticas
- ✅ Implementar AnalyticsService
- ✅ Queries de métricas clave
- ✅ Integración con charts (Recharts)
- ✅ Exportación de reportes (CSV/PDF)
- ✅ Página de admin con dashboards

**Entregables:**
- Dashboard completo de métricas
- Exportación de reportes
- Visualizaciones interactivas
- Documentación de métricas

**Métricas de éxito:**
- 10+ métricas tracked
- Actualización en tiempo real
- Reportes exportables

---

### Fase 5: Integraciones Avanzadas (2 semanas)
**Prioridad: BAJA-MEDIA**

#### Semana 18-19: Sincronización de Calendarios
- ✅ Integración con Google Calendar API
- ✅ Generación de archivos .ics
- ✅ Sincronización bidireccional
- ✅ UI de configuración de calendarios

**Entregables:**
- Sync con Google Calendar
- Links .ics descargables
- Documentación de integraciones

**Métricas de éxito:**
- 40% de usuarios sincronizan calendario
- 100% de eventos sincronizados correctamente

---

### Fase 6: Testing y Refinamiento (1-2 semanas)
**Prioridad: CRÍTICA**

#### Semana 20-21: Testing Completo
- ✅ Unit tests de todos los services
- ✅ Integration tests de workflows
- ✅ E2E tests de flujos principales
- ✅ Load testing final
- ✅ Security audit
- ✅ UX testing con usuarios reales

**Entregables:**
- Coverage de tests > 80%
- 0 vulnerabilidades críticas
- Feedback de UX testing procesado
- Plan de mejoras post-launch

**Métricas de éxito:**
- 100% de tests pasando
- 0 bugs críticos
- Score de seguridad A+

---

## PRIORIZACIÓN FINAL

### ðŸ"´ CRÍTICO (Hacer primero)
1. Sistema de Autenticación (Semana 1-2)
2. Frontend Base (Semana 3-4)
3. Sesiones Conversacionales (Semana 5-6)
4. Testing Final (Semana 20-21)

### ðŸŸ  ALTO (Hacer segundo)
5. Notificaciones Inngest (Semana 7-8)
6. Programa de Lealtad (Semana 9-10)

### ðŸŸ¡ MEDIO (Hacer tercero)
7. Sistema de Reseñas (Semana 11-12)
8. Integración de Pagos (Semana 13-14)
9. Concurrencia y Performance (Semana 15-16)

### ðŸŸ¢ BAJO (Hacer cuarto)
10. Dashboard de Analíticas (Semana 17)
11. Calendarios Externos (Semana 18-19)

---

## ESTIMACIÓN TOTAL

**Duración total:** 21 semanas (≈ 5 meses)  
**Esfuerzo estimado:** 1 desarrollador full-time  
**Budget estimado (servicios cloud):**
- OpenAI API: $200-500/mes (dependiendo de volumen)
- Neon PostgreSQL: $19/mes (plan Pro)
- Vercel: $20/mes (plan Pro)
- Upstash Redis: $10/mes
- Inngest: $20/mes (plan Pro)
- Cloudinary: $0-89/mes (según uso)
- Mercado Pago: comisión 4-6% por transacción
- SendGrid/Resend: $15/mes (10k emails)
- Twilio SMS: $0.04/SMS (uso variable)

**Total mensual:** $284-653/mes + comisiones variables

---

## RECOMENDACIONES ESTRATÉGICAS

### 1. MVP Inicial (8 semanas)
Si necesitas lanzar rápido, prioriza:
- ✅ Autenticación básica (2 semanas)
- ✅ Frontend esencial (3 semanas)
- ✅ Sesiones conversacionales (2 semanas)
- ✅ Testing básico (1 semana)

Esto te da un producto funcional para validar con usuarios reales.

### 2. Desarrollo Iterativo
- Lanza el MVP y recopila feedback
- Itera basándote en métricas de uso
- Prioriza features según demanda real

### 3. Monitoreo Desde Día 1
- Implementa Sentry desde el inicio
- Trackea métricas de uso (Posthog/Mixpanel)
- Define KPIs clave y monitorealos semanalmente

### 4. Documentación Continua
- Documenta cada feature al implementarla
- Mantén README actualizado
- Crea guías de usuario para features complejas

---

## CONCLUSIÓN

El agente actual tiene una **base técnica sólida** pero está **limitado por la ausencia de interfaz de usuario** y funcionalidades críticas de engagement.

Las **mejoras prioritarias** son:
1. Sistema de autenticación y autorización
2. Frontend moderno con Next.js
3. Persistencia de conversaciones
4. Sistema de notificaciones automáticas

Las **nuevas utilidades propuestas** (lealtad, reseñas, pagos, portfolio, analíticas, calendarios) transformarían el agente de un **chatbot básico** a una **plataforma completa de gestión** que:
- Aumenta retención de clientes
- Mejora experiencia de usuario
- Genera ingresos adicionales
- Proporciona insights valiosos del negocio

Con una **inversión de 5 meses** de desarrollo y un **presupuesto mensual de ~$500**, puedes tener un producto competitivo de nivel profesional que se paga solo con mejoras en eficiencia operativa y reducción de no-shows.

**Siguiente acción recomendada:** Implementar Fase 1 (Fundamentos) en las próximas 6 semanas para tener un MVP lanzable.
