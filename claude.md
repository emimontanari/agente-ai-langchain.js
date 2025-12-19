# GUÍA COMPLETA
## Agente AI para Peluquería con LangChain.js

---

**Stack Tecnológico**

LangChain.js • NestJS • TypeScript • Inngest • Better Auth  
Neon PostgreSQL • Sentry • Vercel • pnpm

*Versión 1.0 - Diciembre 2025*

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Fase 1: Preparación y Configuración Inicial](#fase-1-preparación-y-configuración-inicial)
3. [Fase 2: Creación del Proyecto con NestJS CLI](#fase-2-creación-del-proyecto-con-nestjs-cli)
4. [Fase 3: Instalación de Dependencias](#fase-3-instalación-de-dependencias)
5. [Fase 4: Archivos de Configuración](#fase-4-archivos-de-configuración)
6. [Fase 5: Arquitectura de Base de Datos](#fase-5-arquitectura-de-base-de-datos)
7. [Fase 6: Implementación del Agente AI](#fase-6-implementación-del-agente-ai)
8. [Fase 7: Ejecución del Proyecto](#fase-7-ejecución-del-proyecto)
9. [Fase 8: Despliegue en Vercel](#fase-8-despliegue-en-vercel)
10. [Resumen de Comandos Importantes](#resumen-de-comandos-importantes)
11. [Próximos Pasos y Mejoras](#próximos-pasos-y-mejoras)
12. [Conclusión](#conclusión)

---

## Resumen Ejecutivo

Esta guía te llevará paso a paso desde cero hasta tener un agente AI completamente funcional para un negocio de peluquería. El agente podrá:

- Agendar turnos de manera autónoma
- Gestionar reservas y cancelaciones
- Proporcionar información sobre servicios y precios
- Verificar disponibilidad de peluqueros
- Consultar estados de turnos existentes

### Stack Tecnológico Completo

Utilizaremos tecnologías modernas y profesionales que te prepararán para proyectos reales de IA a escala empresarial.

| Tecnología | Propósito |
|------------|-----------|
| **LangChain.js** | Framework para construir agentes AI con herramientas y capacidad de razonamiento |
| **NestJS** | Framework backend profesional con arquitectura modular y TypeScript |
| **TypeScript** | Lenguaje con tipado estático para código más seguro y mantenible |
| **Inngest** | Orquestación de flujos de trabajo y tareas asíncronas |
| **Better Auth** | Sistema de autenticación moderno y seguro |
| **Neon PostgreSQL** | Base de datos PostgreSQL serverless con escalabilidad automática |
| **Sentry** | Monitoreo de errores y rendimiento en producción |
| **Vercel** | Plataforma de despliegue con CI/CD automático |
| **OpenAI API** | Motor de IA (GPT-4 Turbo) que impulsa el agente inteligente |

---

## Fase 1: Preparación y Configuración Inicial

### 1.1 Requisitos Previos

Antes de comenzar, necesitas instalar las siguientes herramientas en tu sistema:

1. **Node.js (versión 18 o superior)**
   - Descarga desde https://nodejs.org

2. **pnpm (gestor de paquetes)**
   ```bash
   npm install -g pnpm
   ```

3. **NestJS CLI**
   ```bash
   npm install -g @nestjs/cli
   ```

4. **Git**
   - Descarga desde https://git-scm.com

5. **Cuentas en servicios cloud:**
   - **OpenAI** (https://platform.openai.com) - Obtén tu API key
   - **Neon** (https://neon.tech) - Base de datos PostgreSQL serverless
   - **Vercel** (https://vercel.com) - Plataforma de despliegue
   - **Sentry** (https://sentry.io) - Monitoreo de errores (opcional)
   - **Inngest** (https://inngest.com) - Orquestación de flujos (opcional)

---

## Fase 2: Creación del Proyecto con NestJS CLI

### 2.1 Crear el Proyecto con NestJS

NestJS CLI creará automáticamente toda la estructura del proyecto. Ejecuta:

```bash
nest new peluqueria-ai-agent
```

Cuando te pregunte qué gestor de paquetes usar, selecciona **pnpm**.

Este comando creará la siguiente estructura base:

```
peluqueria-ai-agent/
├── src/
│   ├── app.controller.spec.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── main.ts
├── test/
├── node_modules/
├── .eslintrc.js
├── .gitignore
├── .prettierrc
├── nest-cli.json
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── README.md
```

### 2.2 Navegar al Proyecto

```bash
cd peluqueria-ai-agent
```

### 2.3 Generar Módulos y Recursos con NestJS CLI

NestJS CLI puede generar automáticamente controladores, servicios, módulos, etc. Vamos a crear la estructura necesaria:

#### Generar módulo de configuración

```bash
nest generate module config
```

#### Generar módulo de agente AI

```bash
nest generate module agent
nest generate service agent
nest generate controller agent
```

#### Generar módulo de base de datos

```bash
nest generate module database
```

#### Generar módulo de autenticación

```bash
nest generate module auth
nest generate service auth
nest generate controller auth
```

Después de ejecutar estos comandos, tu estructura será:

```
peluqueria-ai-agent/
├── src/
│   ├── agent/
│   │   ├── agent.controller.spec.ts
│   │   ├── agent.controller.ts
│   │   ├── agent.module.ts
│   │   ├── agent.service.spec.ts
│   │   └── agent.service.ts
│   ├── auth/
│   │   ├── auth.controller.spec.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.spec.ts
│   │   └── auth.service.ts
│   ├── config/
│   │   └── config.module.ts
│   ├── database/
│   │   └── database.module.ts
│   ├── app.controller.spec.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── main.ts
├── test/
├── .eslintrc.js
├── .gitignore
├── nest-cli.json
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

### 2.4 Crear Carpetas Adicionales Manualmente

Ahora crearemos algunas carpetas que necesitamos manualmente:

```bash
# Dentro de src/agent/
mkdir -p src/agent/tools
mkdir -p src/agent/prompts

# Dentro de src/database/
mkdir -p src/database/entities
mkdir -p src/database/repositories
mkdir -p src/database/migrations

# Dentro de src/config/
# (Ya existe, solo agregaremos archivos después)

# Carpeta para workflows
mkdir -p src/workflows

# Carpeta común para utilidades
mkdir -p src/common/decorators
mkdir -p src/common/guards
mkdir -p src/common/interceptors
mkdir -p src/common/pipes
```

### 2.5 Estructura Final del Proyecto

Después de todos estos pasos, tu estructura completa será:

```
peluqueria-ai-agent/
├── src/
│   ├── agent/
│   │   ├── tools/                     # Herramientas del agente (crear archivos)
│   │   │   ├── schedule.tool.ts
│   │   │   ├── cancel.tool.ts
│   │   │   ├── info.tool.ts
│   │   │   └── status.tool.ts
│   │   ├── prompts/                   # Prompts del sistema (crear archivos)
│   │   │   └── system.prompt.ts
│   │   ├── agent.controller.ts        # Generado por CLI
│   │   ├── agent.module.ts            # Generado por CLI
│   │   └── agent.service.ts           # Generado por CLI (modificaremos)
│   │
│   ├── auth/
│   │   ├── auth.controller.ts         # Generado por CLI
│   │   ├── auth.module.ts             # Generado por CLI
│   │   └── auth.service.ts            # Generado por CLI
│   │
│   ├── config/
│   │   ├── config.module.ts           # Generado por CLI
│   │   ├── database.config.ts         # Crear manualmente
│   │   ├── openai.config.ts           # Crear manualmente
│   │   └── inngest.config.ts          # Crear manualmente
│   │
│   ├── database/
│   │   ├── entities/                  # Crear archivos de entidades
│   │   │   ├── appointment.entity.ts
│   │   │   ├── service.entity.ts
│   │   │   ├── barber.entity.ts
│   │   │   ├── user.entity.ts
│   │   │   └── price.entity.ts
│   │   ├── repositories/              # Repositorios personalizados (opcional)
│   │   ├── migrations/                # Migraciones de BD
│   │   └── database.module.ts         # Generado por CLI
│   │
│   ├── common/                        # Utilidades comunes
│   │   ├── decorators/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── pipes/
│   │
│   ├── workflows/
│   │   └── inngest.workflows.ts       # Crear manualmente
│   │
│   ├── app.controller.ts              # Generado por CLI
│   ├── app.module.ts                  # Generado por CLI (modificaremos)
│   ├── app.service.ts                 # Generado por CLI
│   └── main.ts                        # Generado por CLI (modificaremos)
│
├── test/
├── .env                               # Crear manualmente
├── .env.example                       # Crear manualmente
├── .eslintrc.js                       # Generado por CLI
├── .gitignore                         # Generado por CLI (modificaremos)
├── .prettierrc                        # Generado por CLI
├── nest-cli.json                      # Generado por CLI
├── package.json                       # Generado por CLI (modificaremos)
├── tsconfig.json                      # Generado por CLI
├── tsconfig.build.json                # Generado por CLI
└── README.md                          # Generado por CLI
```

---

## Fase 3: Instalación de Dependencias

### 3.1 Dependencias Base (Ya Instaladas por NestJS CLI)

El CLI de NestJS ya instaló:
- `@nestjs/common`
- `@nestjs/core`
- `@nestjs/platform-express`
- `reflect-metadata`
- `rxjs`
- TypeScript y sus tipos

### 3.2 LangChain y OpenAI

```bash
pnpm install langchain @langchain/openai @langchain/community zod
```

> **Nota:** `zod` es necesario para la validación de schemas en las herramientas de LangChain.

### 3.3 Base de Datos PostgreSQL

```bash
pnpm install @nestjs/typeorm typeorm pg
```

### 3.4 Autenticación

```bash
pnpm install better-auth
```

### 3.5 Orquestación de Flujos

```bash
pnpm install inngest
```

### 3.6 Monitoreo de Errores

```bash
pnpm install @sentry/node @sentry/tracing
```

### 3.7 Variables de Entorno

```bash
pnpm install @nestjs/config
```

> **Nota:** `@nestjs/config` es el módulo oficial de NestJS para manejar variables de entorno, mejor que usar solo `dotenv`.

### 3.8 Comando Completo (Todas las Dependencias Adicionales)

```bash
pnpm install langchain @langchain/openai @langchain/community zod @nestjs/typeorm typeorm pg better-auth inngest @sentry/node @sentry/tracing @nestjs/config
```

---

## Fase 4: Archivos de Configuración

### 4.1 Variables de Entorno (.env)

Crea un archivo `.env` en la raíz del proyecto:

```env
# OpenAI
OPENAI_API_KEY=sk-...

# Neon PostgreSQL
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech:5432/db?sslmode=require

# Better Auth
BETTER_AUTH_SECRET=tu_secret_aleatorio_aqui
BETTER_AUTH_URL=http://localhost:3000

# Inngest
INNGEST_API_KEY=evt_...
INNGEST_EVENT_KEY=fnc_...

# Sentry
SENTRY_DSN=https://...@sentry.io/...

# Aplicación
NODE_ENV=development
PORT=3000
```

### 4.2 Actualizar .gitignore

El archivo `.gitignore` ya fue creado por NestJS CLI, pero asegúrate de que incluya:

```gitignore
# compiled output
/dist
/node_modules

# Logs
logs
*.log
npm-debug.log*
pnpm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# OS
.DS_Store

# Tests
/coverage
/.nyc_output

# IDEs and editors
/.idea
.project
.classpath
.c9/
*.launch
.settings/
*.sublime-workspace

# IDE - VSCode
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json

# Environment variables
.env
.env.local
.env.*.local
```

### 4.3 TypeScript (tsconfig.json)

El archivo `tsconfig.json` ya fue creado por NestJS CLI con una configuración óptima. No necesitas modificarlo, pero aquí está para referencia:

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false,
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### 4.4 Actualizar package.json (Scripts)

El `package.json` ya tiene buenos scripts, pero puedes agregar algunos personalizados:

```json
{
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "typeorm": "typeorm-ts-node-commonjs",
    "migration:generate": "typeorm-ts-node-commonjs migration:generate",
    "migration:run": "typeorm-ts-node-commonjs migration:run",
    "migration:revert": "typeorm-ts-node-commonjs migration:revert"
  }
}
```

---

## Fase 5: Arquitectura de Base de Datos

### 5.1 Diagrama de Relaciones

La base de datos tendrá las siguientes tablas:

| Tabla | Propósito | Campos Principales |
|-------|-----------|-------------------|
| **users** | Clientes de la peluquería | name, email, phone, passwordHash |
| **barbers** | Peluqueros disponibles | name, email, phone, isAvailable, specialties |
| **services** | Servicios ofrecidos (corte, barba, etc.) | name, description, price, durationMinutes |
| **appointments** | Turnos agendados | user, barber, service, scheduledTime, status |
| **prices** | Histórico de precios | service, amount, currency, validFrom, validUntil |

### 5.2 Configuración de Base de Datos

Crea el archivo `src/config/database.config.ts`:

```typescript
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  synchronize: process.env.NODE_ENV === 'development', // Solo en desarrollo
  logging: process.env.NODE_ENV === 'development',
  ssl: {
    rejectUnauthorized: false,
  },
});
```

### 5.3 Entidades de Base de Datos

#### src/database/entities/user.entity.ts

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  passwordHash: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

#### src/database/entities/barber.entity.ts

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('barbers')
export class Barber {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'boolean', default: true })
  isAvailable: boolean;

  @Column({ type: 'text', nullable: true })
  specialties: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

#### src/database/entities/service.entity.ts

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'integer' })
  durationMinutes: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
```

#### src/database/entities/appointment.entity.ts

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Barber } from './barber.entity';
import { Service } from './service.entity';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Barber, { eager: true })
  @JoinColumn({ name: 'barberId' })
  barber: Barber;

  @ManyToOne(() => Service, { eager: true })
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  @Column({ type: 'timestamp' })
  scheduledTime: Date;

  @Column({ 
    type: 'enum',
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  })
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### src/database/entities/price.entity.ts

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Service } from './service.entity';

@Entity('prices')
export class Price {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Service)
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({ type: 'date' })
  validFrom: Date;

  @Column({ type: 'date', nullable: true })
  validUntil: Date;
}
```

### 5.4 Actualizar Database Module

Modifica `src/database/database.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Barber } from './entities/barber.entity';
import { Service } from './entities/service.entity';
import { Appointment } from './entities/appointment.entity';
import { Price } from './entities/price.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Barber, Service, Appointment, Price]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
```

---

## Fase 6: Implementación del Agente AI

### 6.1 Arquitectura del Agente

El agente funciona mediante la siguiente arquitectura:

1. **Prompt del Sistema** - Define la personalidad y contexto del agente
2. **Modelo de Lenguaje (GPT-4 Turbo)** - Procesa el lenguaje natural y decide qué acciones tomar
3. **Herramientas (Tools)** - Funciones específicas que el agente puede llamar
4. **Executor** - Coordina la conversación y ejecución de herramientas

### 6.2 Prompt del Sistema

Crea el archivo `src/agent/prompts/system.prompt.ts`:

```typescript
export const SYSTEM_PROMPT = `Eres un asistente AI para una peluquería.

Tu rol es ayudar a los clientes a:
1. Agendar turnos
2. Cancelar o modificar turnos existentes
3. Obtener información sobre servicios y precios
4. Verificar disponibilidad de peluqueros

Siempre sé amable, profesional y claro en tus respuestas.
Si el usuario solicita algo fuera de tu alcance, sugiere contactar directamente con la peluquería.

Información útil:
- Horario: Lunes a Viernes 9:00 AM - 6:00 PM, Sábado 10:00 AM - 4:00 PM
- Teléfono: +34 XXX XXX XXX
- Email: contacto@peluqueria.com`;
```

### 6.3 Herramientas del Agente

| Herramienta | Funcionalidad |
|-------------|---------------|
| **schedule_appointment** | Agenda un nuevo turno con usuario, peluquero, servicio y fecha/hora |
| **cancel_appointment** | Cancela un turno existente por su ID |
| **get_info** | Obtiene información sobre servicios disponibles y precios |
| **check_status** | Verifica el estado de turnos o disponibilidad de peluqueros |

#### src/agent/tools/schedule.tool.ts

```typescript
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from '../../database/entities/appointment.entity';

@Injectable()
export class ScheduleTool {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {}

  getTool() {
    return tool(
      async (input) => {
        try {
          const appointment = this.appointmentRepository.create({
            user: { id: input.userId },
            barber: { id: input.barberId },
            service: { id: input.serviceId },
            scheduledTime: new Date(input.dateTime),
            status: 'pending',
            notes: input.notes || '',
          });

          await this.appointmentRepository.save(appointment);
          
          return `Turno agendado exitosamente para ${new Date(input.dateTime).toLocaleString('es-ES')}`;
        } catch (error) {
          return `Error al agendar el turno: ${error.message}`;
        }
      },
      {
        name: 'schedule_appointment',
        description: 'Agenda un nuevo turno en la peluquería',
        schema: z.object({
          userId: z.string().describe('ID del usuario que agenda el turno'),
          barberId: z.string().describe('ID del peluquero seleccionado'),
          serviceId: z.string().describe('ID del servicio solicitado'),
          dateTime: z.string().describe('Fecha y hora del turno en formato ISO 8601'),
          notes: z.string().optional().describe('Notas o comentarios adicionales'),
        }),
      },
    );
  }
}
```

#### src/agent/tools/cancel.tool.ts

```typescript
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from '../../database/entities/appointment.entity';

@Injectable()
export class CancelTool {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {}

  getTool() {
    return tool(
      async (input) => {
        try {
          const appointment = await this.appointmentRepository.findOne({
            where: { id: input.appointmentId },
          });

          if (!appointment) {
            return 'Turno no encontrado. Verifica el ID proporcionado.';
          }

          if (appointment.status === 'cancelled') {
            return 'Este turno ya fue cancelado previamente.';
          }

          appointment.status = 'cancelled';
          await this.appointmentRepository.save(appointment);
          
          return `Turno cancelado exitosamente. ID: ${input.appointmentId}`;
        } catch (error) {
          return `Error al cancelar el turno: ${error.message}`;
        }
      },
      {
        name: 'cancel_appointment',
        description: 'Cancela un turno existente en la peluquería',
        schema: z.object({
          appointmentId: z.string().describe('ID único del turno a cancelar'),
          reason: z.string().optional().describe('Razón de la cancelación'),
        }),
      },
    );
  }
}
```

#### src/agent/tools/info.tool.ts

```typescript
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Service } from '../../database/entities/service.entity';

@Injectable()
export class InfoTool {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
  ) {}

  getTool() {
    return tool(
      async (input) => {
        try {
          const services = await this.serviceRepository.find({
            where: { isActive: true },
          });

          if (services.length === 0) {
            return 'No hay servicios disponibles en este momento.';
          }

          if (input.type === 'services') {
            return JSON.stringify(
              services.map(s => ({
                id: s.id,
                name: s.name,
                description: s.description,
                price: s.price,
                duration: s.durationMinutes,
              })),
              null,
              2
            );
          }

          if (input.type === 'prices') {
            return services
              .map((s) => `${s.name}: $${s.price} (${s.durationMinutes} minutos)`)
              .join('\n');
          }

          return 'Tipo de información no válido. Usa "services" o "prices".';
        } catch (error) {
          return `Error al obtener información: ${error.message}`;
        }
      },
      {
        name: 'get_info',
        description: 'Obtiene información sobre servicios y precios de la peluquería',
        schema: z.object({
          type: z.enum(['services', 'prices']).describe('Tipo de información a obtener'),
        }),
      },
    );
  }
}
```

#### src/agent/tools/status.tool.ts

```typescript
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from '../../database/entities/appointment.entity';
import { Barber } from '../../database/entities/barber.entity';

@Injectable()
export class StatusTool {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Barber)
    private barberRepository: Repository<Barber>,
  ) {}

  getTool() {
    return tool(
      async (input) => {
        try {
          if (input.type === 'appointment') {
            const appointment = await this.appointmentRepository.findOne({
              where: { id: input.id },
              relations: ['user', 'barber', 'service'],
            });

            if (!appointment) {
              return 'Turno no encontrado.';
            }

            return JSON.stringify({
              id: appointment.id,
              user: appointment.user.name,
              barber: appointment.barber.name,
              service: appointment.service.name,
              scheduledTime: appointment.scheduledTime,
              status: appointment.status,
              notes: appointment.notes,
            }, null, 2);
          }

          if (input.type === 'barber') {
            const barber = await this.barberRepository.findOne({
              where: { id: input.id },
            });

            if (!barber) {
              return 'Peluquero no encontrado.';
            }

            return JSON.stringify({
              id: barber.id,
              name: barber.name,
              isAvailable: barber.isAvailable,
              specialties: barber.specialties,
            }, null, 2);
          }

          return 'Tipo de consulta no válido. Usa "appointment" o "barber".';
        } catch (error) {
          return `Error al verificar estado: ${error.message}`;
        }
      },
      {
        name: 'check_status',
        description: 'Verifica el estado de turnos o disponibilidad de peluqueros',
        schema: z.object({
          type: z.enum(['appointment', 'barber']).describe('Tipo de entidad a consultar'),
          id: z.string().describe('ID único del turno o peluquero'),
        }),
      },
    );
  }
}
```

### 6.4 Servicio Principal del Agente

Modifica `src/agent/agent.service.ts`:

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ScheduleTool } from './tools/schedule.tool';
import { CancelTool } from './tools/cancel.tool';
import { InfoTool } from './tools/info.tool';
import { StatusTool } from './tools/status.tool';
import { SYSTEM_PROMPT } from './prompts/system.prompt';

@Injectable()
export class AgentService implements OnModuleInit {
  private agent: AgentExecutor;

  constructor(
    private configService: ConfigService,
    private scheduleTool: ScheduleTool,
    private cancelTool: CancelTool,
    private infoTool: InfoTool,
    private statusTool: StatusTool,
  ) {}

  onModuleInit() {
    this.initializeAgent();
  }

  private initializeAgent() {
    const llm = new ChatOpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
      modelName: 'gpt-4-turbo',
      temperature: 0.7,
    });

    const tools = [
      this.scheduleTool.getTool(),
      this.cancelTool.getTool(),
      this.infoTool.getTool(),
      this.statusTool.getTool(),
    ];

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', SYSTEM_PROMPT],
      ['human', '{input}'],
      ['placeholder', '{agent_scratchpad}'],
    ]);

    const agentChain = createToolCallingAgent({
      llm,
      tools,
      prompt,
    });

    this.agent = new AgentExecutor({
      agent: agentChain,
      tools,
      verbose: this.configService.get<string>('NODE_ENV') === 'development',
    });
  }

  async processMessage(userMessage: string): Promise<string> {
    try {
      const result = await this.agent.invoke({
        input: userMessage,
      });
      return result.output;
    } catch (error) {
      console.error('Error en agente:', error);
      return 'Lo siento, ocurrió un error procesando tu solicitud. Por favor, intenta de nuevo.';
    }
  }
}
```

### 6.5 Controlador del Agente

Modifica `src/agent/agent.controller.ts`:

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { AgentService } from './agent.service';

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('chat')
  async chat(@Body() body: { message: string }) {
    const response = await this.agentService.processMessage(body.message);
    return { 
      success: true,
      response 
    };
  }
}
```

### 6.6 Módulo del Agente

Modifica `src/agent/agent.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { DatabaseModule } from '../database/database.module';
import { ScheduleTool } from './tools/schedule.tool';
import { CancelTool } from './tools/cancel.tool';
import { InfoTool } from './tools/info.tool';
import { StatusTool } from './tools/status.tool';

@Module({
  imports: [DatabaseModule],
  controllers: [AgentController],
  providers: [
    AgentService,
    ScheduleTool,
    CancelTool,
    InfoTool,
    StatusTool,
  ],
})
export class AgentModule {}
```

### 6.7 Módulo Principal de la Aplicación

Modifica `src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AgentModule } from './agent/agent.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(databaseConfig()),
    AgentModule,
    AuthModule,
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### 6.8 Punto de Entrada Principal

Modifica `src/main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as Sentry from '@sentry/node';

async function bootstrap() {
  // Inicializar Sentry si está configurado
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: 1.0,
    });
  }

  const app = await NestFactory.create(AppModule);

  // Habilitar CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Pipes globales para validación
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Prefijo global para todas las rutas
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Aplicación ejecutándose en: http://localhost:${port}`);
  console.log(`📝 Documentación: http://localhost:${port}/api`);
}

bootstrap();
```

---

## Fase 7: Ejecución del Proyecto

### 7.1 Compilar TypeScript

```bash
pnpm run build
```

Este comando transpila el código TypeScript a JavaScript en la carpeta `dist/`.

### 7.2 Ejecutar en Modo Desarrollo

```bash
pnpm run start:dev
```

Este comando ejecuta el servidor con recarga automática (hot reload) cuando haces cambios en el código.

### 7.3 Ejecutar en Modo Producción

```bash
pnpm run build
pnpm run start:prod
```

### 7.4 Probar el Agente

Una vez que el servidor esté ejecutándose, puedes probar el agente enviando una petición HTTP:

```bash
curl -X POST http://localhost:3000/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "¿Cuáles son vuestros servicios y precios?"}'
```

Deberías recibir una respuesta del agente AI con información sobre los servicios disponibles.

### 7.5 Comandos Útiles de NestJS CLI

```bash
# Ver todos los comandos disponibles
nest --help

# Generar un nuevo módulo
nest generate module nombre-modulo

# Generar un nuevo servicio
nest generate service nombre-servicio

# Generar un nuevo controlador
nest generate controller nombre-controlador

# Generar un recurso completo (módulo + servicio + controlador)
nest generate resource nombre-recurso
```

---

## Fase 8: Despliegue en Vercel

### 8.1 Preparar el Proyecto para Vercel

Crea un archivo `vercel.json` en la raíz del proyecto:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/main.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/main.js"
    }
  ]
}
```

### 8.2 Preparar Repositorio Git

```bash
git init
git add .
git commit -m "Initial commit: AI Agent for Hair Salon"
git branch -M main
git remote add origin https://github.com/tu-usuario/peluqueria-ai-agent.git
git push -u origin main
```

### 8.3 Configurar Vercel

1. Ve a https://vercel.com y crea una cuenta con GitHub
2. Haz clic en **"New Project"**
3. Importa tu repositorio de GitHub
4. Configura el proyecto:
   - **Framework Preset:** Other
   - **Build Command:** `pnpm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `pnpm install`

5. Configura las variables de entorno en Vercel:
   - `OPENAI_API_KEY`
   - `DATABASE_URL`
   - `BETTER_AUTH_SECRET`
   - `BETTER_AUTH_URL` (usa la URL de tu proyecto en Vercel)
   - `INNGEST_API_KEY`
   - `INNGEST_EVENT_KEY`
   - `SENTRY_DSN`
   - `NODE_ENV=production`
   - `PORT=3000`

6. Haz clic en **"Deploy"**

### 8.4 Verificar Despliegue

Tu aplicación estará disponible en: `https://tu-proyecto.vercel.app`

Prueba el endpoint:
```bash
curl -X POST https://tu-proyecto.vercel.app/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola, quisiera información sobre servicios"}'
```

---

## Resumen de Comandos Importantes

### Comandos de NestJS

| Comando | Descripción |
|---------|-------------|
| `nest new nombre-proyecto` | Crear nuevo proyecto NestJS |
| `nest generate module nombre` | Generar módulo |
| `nest generate service nombre` | Generar servicio |
| `nest generate controller nombre` | Generar controlador |
| `nest generate resource nombre` | Generar recurso completo (CRUD) |
| `nest build` | Compilar proyecto |
| `nest start` | Iniciar aplicación |
| `nest start --watch` | Iniciar con hot reload |

### Comandos de pnpm

| Comando | Descripción |
|---------|-------------|
| `pnpm install` | Instalar dependencias |
| `pnpm add paquete` | Agregar paquete |
| `pnpm remove paquete` | Remover paquete |

### Comandos del Proyecto

| Comando | Descripción |
|---------|-------------|
| `pnpm run start:dev` | Ejecutar en desarrollo con hot reload |
| `pnpm run build` | Compilar TypeScript a JavaScript |
| `pnpm run start:prod` | Ejecutar aplicación compilada |
| `pnpm run lint` | Ejecutar linter |
| `pnpm run format` | Formatear código |
| `pnpm run test` | Ejecutar tests |
| `pnpm run migration:generate` | Generar migración de BD |
| `pnpm run migration:run` | Ejecutar migraciones |

---

## Próximos Pasos y Mejoras

### 9.1 Autenticación con Better Auth

Implementa un sistema completo de registro e inicio de sesión:

```bash
# Generar módulo de autenticación (ya lo hicimos)
nest generate guard auth
nest generate decorator current-user
```

Funcionalidades:
- Registro de usuarios con validación de email
- Login con JWT tokens
- Protección de rutas con guards
- Refresh tokens para sesiones largas

### 9.2 Flujos de Trabajo con Inngest

Configura tareas automáticas:

```bash
# Crear servicios para workflows
nest generate service workflows/notifications
nest generate service workflows/reminders
```

Implementa:
- Recordatorios por email 24 horas antes del turno
- Notificaciones SMS cuando un turno se confirma
- Sincronización con calendarios externos
- Procesamiento de pagos automático

### 9.3 Frontend con Next.js

Crea una interfaz web:

```bash
# En una carpeta separada
npx create-next-app@latest peluqueria-frontend
```

Características:
- Chat en tiempo real con el agente AI
- Calendario visual para turnos
- Dashboard de usuario
- Sistema de valoraciones
- Galería de trabajos

### 9.4 Testing

```bash
# Generar tests
nest generate service nombre --spec
```

Implementa:
- Unit tests para servicios
- Integration tests para controladores
- E2E tests para flujos completos
- Mocks para servicios externos

### 9.5 Documentación con Swagger

```bash
pnpm add @nestjs/swagger
```

Genera documentación automática de tu API.

### 9.6 Monitoreo y Logging

```bash
pnpm add @nestjs/logger winston
```

Implementa:
- Logging estructurado
- Métricas de rendimiento
- Alertas automáticas
- Dashboards en Grafana

### 9.7 Caché con Redis

```bash
pnpm add @nestjs/cache-manager cache-manager-redis-store
```

Mejora el rendimiento:
- Caché de respuestas frecuentes
- Rate limiting avanzado
- Sesiones de usuario

### 9.8 Validación Avanzada

```bash
pnpm add class-validator class-transformer
```

Crea DTOs para validación robusta:
- Validación de inputs
- Transformación de datos
- Sanitización automática

---

## Conclusión

**¡Felicitaciones!** Has creado un agente AI profesional para peluquería usando NestJS CLI y las mejores prácticas.

### Lo que has aprendido:

✅ **NestJS CLI** - Generación automática de código con estructura profesional  
✅ **Arquitectura Modular** - Organización escalable con módulos, servicios y controladores  
✅ **LangChain.js** - Construcción de agentes AI con herramientas personalizadas  
✅ **TypeORM** - ORM robusto para PostgreSQL con migraciones  
✅ **ConfigModule** - Manejo profesional de variables de entorno  
✅ **Decorators** - Uso de inyección de dependencias de NestJS  
✅ **Best Practices** - Separación de responsabilidades, testing, validación

### Ventajas de usar NestJS CLI:

- 🚀 Generación automática de estructura
- 📦 Módulos auto-configurados
- 🎯 Convenciones establecidas
- 🔧 Herramientas integradas (testing, linting, etc.)
- 📚 Documentación clara de la estructura

### Recursos Adicionales

- **NestJS Docs:** https://docs.nestjs.com
- **LangChain.js Docs:** https://js.langchain.com/docs
- **TypeORM Docs:** https://typeorm.io
- **OpenAI API:** https://platform.openai.com/docs
- **Neon Docs:** https://neon.tech/docs
- **Vercel Docs:** https://vercel.com/docs

### Comunidades

- **NestJS Discord:** https://discord.gg/nestjs
- **LangChain Discord:** https://discord.gg/langchain
- **Stack Overflow:** Tag `nestjs`, `langchain`, `typeorm`

---

**¡Éxito con tu proyecto!** 🚀

Has construido los cimientos de un sistema profesional que puede escalar a miles de usuarios. El siguiente paso es agregar las mejoras mencionadas y adaptar el agente a las necesidades específicas de tu negocio.

---

*Versión 1.0 - Diciembre 2025*  
*Licencia: MIT*
