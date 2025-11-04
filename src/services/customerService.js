import jsonStorage, { TABLES } from '../lib/jsonStorage'

// Customer service functions
export const customerService = {
  // Get all customers with optional filtering
  async getCustomers(filters = {}) {
    try {
      // Set default sorting
      const queryFilters = {
        ...filters,
        sortBy: filters.sortBy || 'created_at',
        sortOrder: filters.sortOrder || 'desc'
      }

      const data = jsonStorage.select(TABLES.CUSTOMERS, { filters: queryFilters })

      return { data, error: null }
    } catch (error) {
      console.error('Error fetching customers:', error)
      return { data: null, error: error.message }
    }
  },

  // Get single customer by ID
  async getCustomerById(id) {
    try {
      const data = jsonStorage.select(TABLES.CUSTOMERS, { 
        filters: { id },
        single: true 
      })

      if (!data) {
        throw new Error('Customer not found')
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
      // Get all customers to generate customer_id
      const allCustomers = jsonStorage.select(TABLES.CUSTOMERS)
      const customerId = jsonStorage.generateCustomerId(allCustomers)

      const newCustomer = {
        customer_id: customerId,
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        address: customerData.address,
        package_name: customerData.package_name,
        package_speed: customerData.package_speed,
        monthly_fee: customerData.monthly_fee,
        status: customerData.status || 'active',
        join_date: customerData.join_date || new Date().toISOString().split('T')[0],
        hutang: 0
      }

      const [data] = jsonStorage.insert(TABLES.CUSTOMERS, newCustomer)

      return { data, error: null }
    } catch (error) {
      console.error('Error creating customer:', error)
      return { data: null, error: error.message }
    }
  },

  // Update customer
  async updateCustomer(id, customerData) {
    try {
      const data = jsonStorage.update(TABLES.CUSTOMERS, id, {
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

      if (!data) {
        throw new Error('Customer not found')
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
      const success = jsonStorage.delete(TABLES.CUSTOMERS, id)

      if (!success) {
        throw new Error('Customer not found')
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
      const data = jsonStorage.update(TABLES.CUSTOMERS, id, { status })

      if (!data) {
        throw new Error('Customer not found')
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
      const data = jsonStorage.update(TABLES.CUSTOMERS, id, { hutang })

      if (!data) {
        throw new Error('Customer not found')
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
      const data = jsonStorage.select(TABLES.CUSTOMERS)

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
      const data = jsonStorage.select(TABLES.PACKAGES, {
        filters: { is_active: true, sortBy: 'price', sortOrder: 'asc' }
      })

      return { data, error: null }
    } catch (error) {
      console.error('Error fetching packages:', error)
      return { data: null, error: error.message }
    }
  }
}