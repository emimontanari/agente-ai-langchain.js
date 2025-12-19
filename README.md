# 📋 AI Agent para Peluquería

Asistente inteligente para gestionar turnos en una peluquería usando NestJS, LangChain y OpenAI.

## 🚀 Quick Start

```bash
# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu OPENAI_API_KEY y DATABASE_URL

# Inicializar base de datos
pnpm ts-node src/database/seed.ts

# Ejecutar en desarrollo
pnpm start:dev

# Ejecutar en producción
pnpm build
pnpm start:prod
```

## 🏗 Arquitectura

### Componentes Principales

- **🧠 Agent Service**: Orquestador central que maneja la lógica del asistente AI
- **🔧 Tools**: Herramientas especializadas para cada operación
- **📊 Bookings Service**: Servicio centralizado para gestión de turnos
- **💾 Database**: PostgreSQL con TypeORM

### Diagrama de Flujo

```
Usuario → Agent Service → OpenAI → Tools → Database
                ↓
            Sistema Prompt con reglas estrictas
```

## 🛠️ Tools Disponibles

| Tool                   | Descripción              | Funcionalidad                          |
| ---------------------- | ------------------------ | -------------------------------------- |
| `schedule_appointment` | Agendar turnos           | Resuelve nombres → UUIDs, crea turnos  |
| `cancel_appointment`   | Cancelar turnos          | Cancela por ID con motivo              |
| `get_info`             | Información de servicios | Lista servicios y precios en ARS       |
| `check_status`         | Verificar estado         | Consulta estado de turnos y peluqueros |
| `list_barbers`         | Listar peluqueros        | Muestra peluqueros disponibles         |
| `resolve_datetime`     | Resolver fechas          | Convierte "mañana 15:00" a ISO         |

## 💡 Características Clave

### ✅ Calidad de Datos

- **Sin inventos**: Todos los precios y servicios vienen de la base de datos
- **Moneda local**: Precios siempre en pesos argentinos (ARS)
- **Resolución inteligente**: Nombres → UUIDs automáticamente
- **Validación robusta**: Todas las tools devuelven JSON estructurado

### 🎯 Comportamiento del Agente

- **Forzado a usar tools**: Siempre usa herramientas para preguntas sobre servicios/precios
- **Confirmaciones seguras**: Solo confirma si `ok: true`
- **Manejo de errores**: Respuestas útiles cuando algo falla
- **Contexto temporal**: Conoce fecha/hora actual y timezone

## 📋 Ejemplos de Uso

### Agendar Turno

```
Usuario: "Quiero un corte con Juan para mañana a las 15:00"

🤖 Proceso:
1. Detecta palabras clave (agenda, Juan, mañana 15:00)
2. Llama `resolve_datetime` → convierte a ISO
3. Llama `list_barbers` → obtiene ID de Juan
4. Llama `get_info` → obtiene servicios disponibles
5. Llama `schedule_appointment` → crea turno

📅 Resultado: "Turno confirmado para mañana, 20/12/2025, 15:00"
```

### Consultar Precios

```
Usuario: "¿Cuánto cuesta un corte?"

🤖 Proceso:
1. Detecta "cuánto cuesta" → forza uso de tools
2. Enrich message con datos reales de DB
3. Llama `get_info` (por regla del prompt)
4. Recibe precios formateados en ARS

💰 Resultado: "$50.00 ARS (60 minutos)"
```

## 🏛️ Base de Datos

### Entidades

```typescript
// Entidad principal
Appointment {
  id: string;           // UUID
  customerId: string;    // UUID del cliente
  barberId: string;      // UUID del peluquero
  serviceId: string;     // UUID del servicio
  startsAt: Date;       // Fecha/hora inicio
  endsAt: Date;         // Fecha/hora fin
  status: AppointmentStatus; // 'reserved' | 'confirmed' | 'cancelled'
  notes?: string;        // Notas adicionales
}

// Peluqueros
Barber {
  id: string;
  displayName: string;    // "Juan", "Maria"
  isActive: boolean;
  createdAt: Date;
}

// Servicios
Service {
  id: string;
  name: string;           // "Corte", "Barba", "Tinte"
  description?: string;
  durationMinutes: number; // Duración en minutos
  priceCents: number;      // Precio en centavos
  isActive: boolean;
}

// Clientes
Customer {
  id: string;
  fullName: string;
  phone?: string;
  email?: string;
  createdAt: Date;
}
```

## 🔧 Configuración

### Variables de Entorno

```bash
# .env
OPENAI_API_KEY=sk-xxx
DATABASE_URL=postgresql://user:pass@host:5432/db
NODE_ENV=development
PORT=3000
```

### Reglas del System Prompt

```
REGLAS CRÍTICAS:
- SIEMPRE que el usuario pregunte por servicios, precios, costos o disponibilidad, usá la herramienta "get_info".
- NO inventes servicios, precios, duración ni moneda. Usá exclusivamente los datos de la base de datos.
- Mostrá precios en ARS (pesos argentinos) formateados correctamente.
- Cuando llames herramientas, SIEMPRE leé el JSON de respuesta.
- SOLO confirmes la reserva si response.ok === true.
- Si response.ok === false, pedí disculpas y ofrecé alternativas.
```

## 🧪 Testing

### API Endpoint

```bash
curl -X POST http://localhost:3000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"¿Qué servicios ofrecen?"}'
```

### Scripts Disponibles

```bash
# Desarrollo con hot reload
pnpm start:dev

# Construcción para producción
pnpm build

# Ejecución en producción
pnpm start:prod

# Tests unitarios
pnpm test

# Tests e2e
pnpm test:e2e
```

## 🔍 Troubleshooting

### Issues Comunes

**Error: "AppointmentRepository no disponible"**

```bash
# Verificar que BookingsModule exporta el servicio
grep -r "exports.*BookingsService" src/bookings
```

**Error: Base de datos no conecta**

```bash
# Verificar DATABASE_URL
echo $DATABASE_URL
# Correr seed para poblar datos
pnpm ts-node src/database/seed.ts
```

**Performance: Requests tardan mucho**

```bash
# Revisar logs del servidor
pnpm start:dev
# Verificar conexión a OpenAI
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models
```

## 📈 Monitor

### Logs de Desarrollo

```bash
# Logs detallados con verbose
NODE_ENV=development pnpm start:dev

# Silent mode para producción
NODE_ENV=production pnpm start:prod
```

### Métricas Importantes

- ⚡ **Response time**: < 5s recomendado
- 💾 **Database queries**: Usar índices apropiados
- 🤖 **OpenAI tokens**: Monitorear consumo de API

## 🚀 Deploy

### Opciones de Deploy

**Docker (Recomendado)**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

**Variables de Producción**

```bash
OPENAI_API_KEY=sk-production-key
DATABASE_URL=postgresql://prod-user:pass@prod-db:5432/peluqueria
NODE_ENV=production
```

## 🤝 Contributing

### Flujo de Trabajo

1. **Fork** el repositorio
2. **Crear branch**: `feature/nueva-funcionalidad`
3. **Testing**: Asegurar que todos los tests pasen
4. **Code Review**: Mantener consistencia con el estilo del proyecto
5. **Deploy**: A través de PR al branch main

### Estándares de Código

- **TypeScript** estricto
- **Convenciones NestJS**
- **Tools siempre devuelven JSON estructurado**
- **Manejo de errores sin excepciones**
- **Comments en español** (cuando necesarios)

## 📝 Licencia

Este proyecto es software propietario. Todos los derechos reservados.

## 📞 Soporte

Para soporte técnico o preguntas:

- Revisar issues en el repositorio del proyecto
- Consultar documentación interna de la empresa
- Contactar al equipo de desarrollo responsable

---

**Versión**: 1.0.0  
**Última actualización**: Diciembre 2025  
**Framework**: NestJS + TypeScript  
**AI**: OpenAI GPT-4 Turbo
