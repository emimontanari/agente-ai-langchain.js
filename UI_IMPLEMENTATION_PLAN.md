# 📋 Plan de Implementación UI - Sistema CRM para Peluquería

## 📝 Resumen Ejecutivo

Interfaz de usuario completa para el sistema de agente AI de peluquería, permitiendo gestionar turnos, horarios, servicios y CRM.

---

## 🏗 Stack Tecnológico

### Build System y Gestión de Paquetes

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **Turborepo** | v2.5.5 | Sistema de build para monorepo |
| **pnpm** | v10.4.1 | Gestor de paquetes |
| **pnpm workspaces** | - | Dependencias compartidas |

### Frontend

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **Next.js** | 15 | Framework React con App Router |
| **React** | 19 | Biblioteca UI |
| **Turbopack** | - | Bundler para desarrollo |
| **TypeScript** | 5.7.3 | Tipado estático |

### Autenticación

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **Clerk** | v6.34.2 | Auth y gestión de usuarios |
| - | - | Soporte para organizaciones |
| - | - | JWT para auth con backend |

### UI y Estilos

| Tecnología | Uso |
|------------|-----|
| **shadcn/ui** | Componentes accesibles y customizables |
| **Tailwind CSS v4** | Framework CSS utility-first |
| **Radix UI** | Primitivas UI accesibles |
| **class-variance-authority** | Variantes de componentes |
| **next-themes** | Dark/light mode |
| **Lucide React** | Iconos |

### Utilidades

| Tecnología | Uso |
|------------|-----|
| **zod** | Validación de schemas |
| **clsx** | ClassNames condicionales |
| **tailwind-merge** | Fusión de clases Tailwind |
| **TanStack Query** | Caché y sincronización |
| **React Hook Form** | Formularios |
| **Recharts** | Gráficos |

### Herramientas de Desarrollo

| Tecnología | Uso |
|------------|-----|
| **Prettier** | Formateo de código |
| **ESLint** | Linting |
| **TypeScript** | Verificación de tipos |

---

## 📁 Estructura del Monorepo

```
peluqueria-ai-agent/
├── apps/
│   └── web/                      # Frontend Next.js 15
│       ├── app/                  # App Router
│       │   ├── (auth)/           # Rutas autenticación (Clerk)
│       │   │   ├── sign-in/
│       │   │   └── sign-up/
│       │   ├── (dashboard)/      # Panel principal
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx      # Dashboard
│       │   │   ├── appointments/ # Turnos
│       │   │   ├── calendar/     # Calendario
│       │   │   ├── customers/    # CRM
│       │   │   ├── services/     # Servicios
│       │   │   ├── barbers/      # Peluqueros
│       │   │   ├── agent/        # Config AI
│       │   │   ├── reports/      # Analytics
│       │   │   └── settings/     # Config
│       │   └── api/              # API routes
│       ├── components/
│       │   ├── ui/               # shadcn/ui
│       │   ├── layout/           # Header, Sidebar
│       │   └── features/         # Por módulo
│       ├── lib/
│       │   ├── api/              # Clientes API
│       │   ├── hooks/            # Custom hooks
│       │   └── validations/      # Schemas Zod
│       └── public/
├── packages/
│   ├── ui/                       # Componentes compartidos
│   ├── config-tailwind/          # Config Tailwind compartida
│   ├── config-typescript/        # TSConfig base
│   └── types/                    # Types compartidos
├── src/                          # Backend NestJS (existente)
├── turbo.json                    # Config Turborepo
├── pnpm-workspace.yaml           # Config workspaces
└── package.json                  # Root package
```

---

## 🎯 Módulos de la UI

### 1. 📊 Dashboard
- Métricas: turnos hoy, ingresos, clientes nuevos
- Calendario mini (24h)
- Próximos turnos
- Actividad del agente

### 2. 📅 Turnos
- Vista lista/calendario/kanban
- CRUD completo
- Estados: reserved, confirmed, cancelled, completed, no_show
- Filtros por fecha, peluquero, servicio

### 3. 👥 CRM Clientes
- Lista con búsqueda
- Perfil con historial
- Métricas: frecuencia, LTV, servicios favoritos

### 4. 💇 Servicios
- CRUD servicios
- Nombre, descripción, duración, precio (ARS)
- Activar/desactivar

### 5. 👨‍🦰 Peluqueros
- CRUD peluqueros
- Horarios de trabajo
- Estadísticas

### 6. 🤖 Agente AI
- Chat con streaming
- Configuración (prompt, temperatura, modelo)
- Logs de conversaciones

### 7. 📈 Reportes
- Ingresos (día/semana/mes)
- Ocupación por horario
- Estadísticas del agente
- Exportar PDF/CSV

### 8. ⚙️ Configuración
- Perfil de usuario
- Config del negocio
- Gestión de usuarios (admin)

---

## 📅 Fases de Implementación

### Fase 1: Setup Monorepo (Semana 1)
- [ ] Inicializar Turborepo con pnpm
- [ ] Configurar Next.js 15 + React 19
- [ ] Setup Tailwind CSS v4 + shadcn/ui
- [ ] Configurar Clerk para auth
- [ ] Layout principal (Header, Sidebar)

### Fase 2: Turnos y Calendario (Semana 2-3)
- [ ] Vista lista con tabla
- [ ] Vista calendario
- [ ] CRUD turnos
- [ ] Cambio de estados

### Fase 3: CRM y Servicios (Semana 4-5)
- [ ] CRUD clientes
- [ ] Perfil con historial
- [ ] CRUD servicios
- [ ] CRUD peluqueros

### Fase 4: Agente AI (Semana 6-7)
- [ ] Chat con streaming
- [ ] Config del agente
- [ ] Logs de conversaciones

### Fase 5: Dashboard y Reportes (Semana 8-9)
- [ ] Dashboard con métricas
- [ ] Gráficos con Recharts
- [ ] Exportación PDF/CSV

### Fase 6: Polish y Deploy (Semana 10-11)
- [ ] Testing E2E
- [ ] Optimización performance
- [ ] Deploy producción

---

## 🔄 Configuración Inicial del Monorepo

### turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "type-check": {}
  }
}
```

### pnpm-workspace.yaml
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

---

## 🎨 Diseño UI

### Paleta de Colores
```css
--primary: #6366f1;
--success: #22c55e;
--warning: #f59e0b;
--error: #ef4444;
--background: #f8fafc;
--surface: #ffffff;
```

### Estados de Turnos
- `reserved` → Amarillo
- `confirmed` → Verde
- `cancelled` → Rojo
- `completed` → Indigo
- `no_show` → Gris

---

**Versión:** 1.1 | **Actualizado:** Diciembre 2025
