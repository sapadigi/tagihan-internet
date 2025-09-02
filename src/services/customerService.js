import { supabase, TABLES } from '../lib/supabase'

// Customer service functions
export const customerService = {
  // Get all customers with optional filtering
  async getCustomers(filters = {}) {
    try {
      let query = supabase
        .from(TABLES.CUSTOMERS)
        .select('*')

      // Apply sorting
      const sortField = filters.sortBy || 'created_at';
      const sortDirection = filters.sortOrder === 'asc' ? true : false;
      query = query.order(sortField, { ascending: sortDirection });

      // Apply filters
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,customer_id.ilike.%${filters.search}%`)
      }

      if (filters.hutang && filters.hutang !== 'all') {
        if (filters.hutang === 'berhutang') {
          query = query.gt('hutang', 0)
        } else if (filters.hutang === 'lunas') {
          query = query.or('hutang.is.null,hutang.eq.0')
        }
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error fetching customers:', error)
      return { data: null, error: error.message }
    }
  },

  // Get single customer by ID
  async getCustomerById(id) {
    try {
      const { data, error } = await supabase
        .from(TABLES.CUSTOMERS)
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error fetching customer:', error)
      return { data: null, error: error.message }
    }
  },

  // Create new customer
  async createCustomer(customerData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.CUSTOMERS)
        .insert([{
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          address: customerData.address,
          package_name: customerData.package_name,
          package_speed: customerData.package_speed,
          monthly_fee: customerData.monthly_fee,
          status: customerData.status || 'active',
          join_date: customerData.join_date || new Date().toISOString().split('T')[0]
        }])
        .select()
        .single()

      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error creating customer:', error)
      return { data: null, error: error.message }
    }
  },

  // Update customer
  async updateCustomer(id, customerData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.CUSTOMERS)
        .update({
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
          address: customerData.address,
          package_name: customerData.package_name,
          package_speed: customerData.package_speed,
          monthly_fee: customerData.monthly_fee,
          hutang: customerData.hutang,
          status: customerData.status
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error updating customer:', error)
      return { data: null, error: error.message }
    }
  },

  // Delete customer
  async deleteCustomer(id) {
    try {
      const { error } = await supabase
        .from(TABLES.CUSTOMERS)
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }

      return { error: null }
    } catch (error) {
      console.error('Error deleting customer:', error)
      return { error: error.message }
    }
  },

  // Update customer status
  async updateCustomerStatus(id, status) {
    try {
      const { data, error } = await supabase
        .from(TABLES.CUSTOMERS)
        .update({ status })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error updating customer status:', error)
      return { data: null, error: error.message }
    }
  },

  // Update customer hutang/debt
  async updateCustomerHutang(id, hutang) {
    try {
      const { data, error } = await supabase
        .from(TABLES.CUSTOMERS)
        .update({ hutang })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error updating customer hutang:', error)
      return { data: null, error: error.message }
    }
  },

  // Get customer statistics
  async getCustomerStats() {
    try {
      const { data, error } = await supabase
        .from(TABLES.CUSTOMERS)
        .select('status, monthly_fee')

      if (error) {
        throw error
      }

      const stats = {
        total: data.length,
        active: data.filter(c => c.status === 'active').length,
        suspended: data.filter(c => c.status === 'suspended').length,
        terminated: data.filter(c => c.status === 'terminated').length,
        totalRevenue: data.reduce((sum, c) => sum + (c.monthly_fee || 0), 0)
      }

      return { data: stats, error: null }
    } catch (error) {
      console.error('Error fetching customer stats:', error)
      return { data: null, error: error.message }
    }
  }
}

// Package service functions
export const packageService = {
  // Get all packages
  async getPackages() {
    try {
      const { data, error } = await supabase
        .from(TABLES.PACKAGES)
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true })

      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error fetching packages:', error)
      return { data: null, error: error.message }
    }
  }
}