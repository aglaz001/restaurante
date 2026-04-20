-- =====================================================
-- SUPABASE SCHEMA - Sistema de Automação de Pedidos
-- Execute este arquivo no SQL Editor do Supabase
-- =====================================================

-- 1. Tabela customers (clientes WhatsApp)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT UNIQUE NOT NULL,
  name TEXT,
  last_address TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para busca por telefone
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone_number);

-- 2. Tabela orders (pedidos)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  origin TEXT CHECK (origin IN ('whatsapp', 'table')) DEFAULT 'whatsapp',
  status TEXT CHECK (status IN ('pending', 'preparing', 'ready', 'finished')) DEFAULT 'pending',
  total_price NUMERIC(10, 2) DEFAULT 0,
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para buscar pedidos ativos
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_origin ON orders(origin);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- 3. Tabela order_items (itens do pedido)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para buscar itens por pedido
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- 4. Tabela menu_items (cardápio)
-- Esta tabela deve existir para o backend consultar o cardápio
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  category TEXT NOT NULL,
  image TEXT,
  is_veg BOOLEAN DEFAULT FALSE,
  discount INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Policies para customers
CREATE POLICY "Allow read for service role" ON customers
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Allow insert for service role" ON customers
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow update for service role" ON customers
  FOR UPDATE USING (auth.role() = 'service_role');

-- Policies para orders
CREATE POLICY "Allow read for all authenticated" ON orders
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow insert for service role" ON orders
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow update for service role" ON orders
  FOR UPDATE USING (auth.role() = 'service_role');

-- Policies para order_items
CREATE POLICY "Allow read for authenticated" ON order_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow insert for service role" ON order_items
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Policies para menu_items (leitura pública para o app)
CREATE POLICY "Allow read for all" ON menu_items
  FOR SELECT USING (true);

-- =====================================================
-- REALTIME
-- =====================================================

-- Habilitar Realtime para orders (para a Dashboard)
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- =====================================================
-- TRIGGER para updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- DADOS DE EXEMPLO - Menu
-- =====================================================

INSERT INTO menu_items (id, name, price, category, image, is_veg, description) VALUES
  ('1', 'Salada de Legumes Saudavel', 17.99, 'Prato Principal', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop', true, 'Legumes frescos da estação com molho da casa'),
  ('2', 'Hamburguer de Carne com Queijo e Batatas', 23.99, 'Hamburgueres', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop', false, 'Hamburguer suculento com queijo derretido e batatas crocantes'),
  ('3', 'Tacos de Frango Grelhado com Molho', 14.99, 'Prato Principal', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=300&h=200&fit=crop', false, 'Tacos de frango grelhado com molho artesanal'),
  ('4', 'Sushi Maki de Atum e Camarao', 9.99, 'Prato Principal', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300&h=200&fit=crop', false, 'Variedade de rolinhos de sushi com atum fresco e camarao'),
  ('5', 'Suco de Laranja com Semente de Manjericao', 12.99, 'Cafe da Manha', 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&h=200&fit=crop', true, 'Suco de laranja espremido na hora com sementes de manjericao'),
  ('6', 'Hamburguer Classico com Batatas Fritas', 10.59, 'Hamburgueres', 'https://images.unsplash.com/photo-1550317138-10000687a72b?w=300&h=200&fit=crop', true, 'Hamburguer classico com queijo e batatas fritas douradas'),
  ('7', 'Creme de Tomate com Manjericao', 8.99, 'Sopas', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=300&h=200&fit=crop', true, 'Sopa rica de tomate com creme de manjericao fresco'),
  ('8', 'Espaguete Carbonara', 15.99, 'Massas', 'https://images.unsplash.com/photo-1551183053-bf91798d047?w=300&h=200&fit=crop', false, 'Massa italiana classica com bacon e parmesao'),
  ('9', 'Pizza Margherita', 13.99, 'Prato Principal', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=200&fit=crop', true, 'Pizza tradicional com mozarela e manjericao'),
  ('10', 'Cafe da Manha Completo', 16.99, 'Cafe da Manha', 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=300&h=200&fit=crop', false, 'Ovos, bacon, linguica, feijao e torrada'),
  ('11', 'Salmao Grelhado com Ervas', 24.99, 'Prato Principal', 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&h=200&fit=crop', false, 'Salmao fresco do Atlantico com manteiga de limao e ervas'),
  ('12', 'Massa Cremosa de Cogumelos', 13.49, 'Massas', 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=300&h=200&fit=crop', true, 'Massa cremosa com variedade de cogumelos silvestres')
ON CONFLICT (id) DO NOTHING;