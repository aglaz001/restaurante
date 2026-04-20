import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Customer operations
export async function findOrCreateCustomer(phoneNumber: string, name?: string) {
  const cleanPhone = phoneNumber.replace(/\D/g, '')

  // Try to find existing customer
  const { data: existing } = await supabase
    .from('customers')
    .select('*')
    .ilike('phone_number', `%${cleanPhone}`)
    .maybeSingle()

  if (existing) {
    return existing
  }

  // Create new customer
  const { data: newCustomer, error } = await supabase
    .from('customers')
    .insert({
      phone_number: cleanPhone,
      name: name || null,
      preferences: {}
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating customer:', error)
    throw error
  }

  return newCustomer
}

export async function updateCustomer(customerId: string, updates: Partial<{ name: string; last_address: string; preferences: Record<string, unknown> }>) {
  const { data, error } = await supabase
    .from('customers')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', customerId)
    .select()
    .single()

  if (error) {
    console.error('Error updating customer:', error)
    throw error
  }

  return data
}

// Menu operations
export async function getMenuItems() {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('category')

  if (error) {
    console.error('Error fetching menu:', error)
    throw error
  }

  return data || []
}

// Order operations
export async function createOrder(orderData: {
  customer_id: string
  origin: 'whatsapp' | 'table'
  notes?: string
}) {
  const { data, error } = await supabase
    .from('orders')
    .insert({
      ...orderData,
      status: 'pending',
      payment_status: 'pending'
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating order:', error)
    throw error
  }

  return data
}

export async function createOrderItems(items: {
  order_id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  notes?: string
}[]) {
  const { data, error } = await supabase
    .from('order_items')
    .insert(items)
    .select()

  if (error) {
    console.error('Error creating order items:', error)
    throw error
  }

  return data
}

export async function updateOrderStatus(orderId: string, status: 'pending' | 'preparing' | 'ready' | 'finished') {
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single()

  if (error) {
    console.error('Error updating order status:', error)
    throw error
  }

  return data
}

export async function updateOrderTotal(orderId: string, totalPrice: number) {
  const { data, error } = await supabase
    .from('orders')
    .update({ total_price: totalPrice, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single()

  if (error) {
    console.error('Error updating order total:', error)
    throw error
  }

  return data
}

export async function getActiveOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customer:customers(*),
      items:order_items(*)
    `)
    .in('status', ['pending', 'preparing', 'ready'])
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching active orders:', error)
    throw error
  }

  return data || []
}