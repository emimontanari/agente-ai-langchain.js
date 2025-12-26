-- ============================================
-- SUPABASE SCHEMA - Peluquería AI Agent
-- ============================================
-- Ejecutar este script en el SQL Editor de Supabase
-- para crear todas las tablas necesarias.
-- ============================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: services (Servicios de la peluquería)
-- ============================================
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    price_cents INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para búsquedas por estado activo
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);

-- ============================================
-- TABLA: barbers (Barberos/Peluqueros)
-- ============================================
CREATE TABLE IF NOT EXISTS barbers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    specialty VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para búsquedas por estado activo
CREATE INDEX IF NOT EXISTS idx_barbers_is_active ON barbers(is_active);

-- ============================================
-- TABLA: barber_schedules (Horarios de trabajo)
-- ============================================
CREATE TABLE IF NOT EXISTS barber_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barber_id UUID NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(barber_id, day_of_week)
);

-- Índice para búsquedas por barbero
CREATE INDEX IF NOT EXISTS idx_barber_schedules_barber_id ON barber_schedules(barber_id);

-- ============================================
-- TABLA: customers (Clientes)
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para búsqueda
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- ============================================
-- TABLA: appointments (Turnos/Citas)
-- ============================================
CREATE TYPE appointment_status AS ENUM ('reserved', 'confirmed', 'cancelled', 'completed', 'no_show');

CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    barber_id UUID NOT NULL REFERENCES barbers(id) ON DELETE RESTRICT,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    status appointment_status NOT NULL DEFAULT 'reserved',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_barber_id ON appointments(barber_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service_id ON appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_appointments_starts_at ON appointments(starts_at);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(DATE(starts_at));

-- ============================================
-- TRIGGERS: Actualizar updated_at automáticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_barbers_updated_at
    BEFORE UPDATE ON barbers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Habilitar RLS en todas las tablas
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE barber_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para el backend (service role)
-- El backend usará la service_role key que bypasa RLS
-- Para el frontend, se pueden agregar políticas más restrictivas

CREATE POLICY "Allow all for service role" ON services FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON barbers FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON barber_schedules FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON customers FOR ALL USING (true);
CREATE POLICY "Allow all for service role" ON appointments FOR ALL USING (true);

-- ============================================
-- DATOS DE EJEMPLO (SEED DATA)
-- ============================================
-- Servicios de ejemplo
INSERT INTO services (name, description, duration_minutes, price_cents) VALUES
    ('Corte', 'Corte de cabello clásico o moderno', 30, 80000),
    ('Corte + Barba', 'Corte de cabello más arreglo de barba', 45, 150000),
    ('Tinte', 'Coloración completa del cabello', 90, 320000),
    ('Corte + Peinado', 'Corte de cabello con peinado incluido', 60, 210000),
    ('Barba', 'Arreglo y perfilado de barba', 20, 60000),
    ('Tratamiento Capilar', 'Tratamiento hidratante para el cabello', 45, 180000)
ON CONFLICT DO NOTHING;

-- Barberos de ejemplo
INSERT INTO barbers (name, phone, email, specialty) VALUES
    ('Carlos Rodríguez', '+54 11 1111-1111', 'carlos@peluqueria.com', 'Cortes modernos'),
    ('María López', '+54 11 2222-2222', 'maria@peluqueria.com', 'Coloración y tintes'),
    ('Juan Martínez', '+54 11 3333-3333', NULL, 'Barbería clásica')
ON CONFLICT DO NOTHING;

-- Clientes de ejemplo
INSERT INTO customers (name, phone, email) VALUES
    ('Juan Pérez', '+54 11 1234-5678', 'juan@email.com'),
    ('María García', '+54 11 2345-6789', 'maria@email.com'),
    ('Pedro López', '+54 11 3456-7890', NULL),
    ('Ana Martínez', '+54 11 4567-8901', 'ana@email.com'),
    ('Roberto Sánchez', '+54 11 5678-9012', NULL)
ON CONFLICT DO NOTHING;
