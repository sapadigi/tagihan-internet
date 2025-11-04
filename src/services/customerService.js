import neonStorage from '../lib/neonStorage'

// Customer service functions
export const customerService = {
  // Get all customers with optional filtering
  async getCustomers(filters = {}) {
    try {
      return await neonStorage.getCustomers()
    } catch (error) {
      console.error('Error fetching customers:', error)
      return { data: null, error: error.message }
    }
  },

  // Get single customer by ID
  async getCustomerById(id) {
    try {
      return await neonStorage.getCustomerById(id)
    } catch (error) {
      console.error('Error fetching customer:', error)
      return { data: null, error: error.message }
    }
  },

  // Create new customer
  async createCustomer(customerData) {
    try {
      return await neonStorage.createCustomer(customerData)
    } catch (error) {
      console.error('Error creating customer:', error)
      return { data: null, error: error.message }
    }
  },

  // Update customer
  async updateCustomer(id, customerData) {
    try {
      return await neonStorage.updateCustomer(id, customerData)
    } catch (error) {
      console.error('Error updating customer:', error)
      return { data: null, error: error.message }
    }
  },

  // Delete customer
  async deleteCustomer(id) {
    try {
      return await neonStorage.deleteCustomer(id)
    } catch (error) {
      console.error('Error deleting customer:', error)
      return { error: error.message }
    }
  },

  // Update customer status
  async updateCustomerStatus(id, status) {
    try {
      const customer = await neonStorage.getCustomerById(id)
      if (!customer.data) throw new Error('Customer not found')
      return await neonStorage.updateCustomer(id, { ...customer.data, status })
    } catch (error) {
      console.error('Error updating customer status:', error)
      return { data: null, error: error.message }
    }
  },

  // Update customer hutang/debt
  async updateCustomerHutang(id, hutang) {
    try {
      const customer = await neonStorage.getCustomerById(id)
      if (!customer.data) throw new Error('Customer not found')
      return await neonStorage.updateCustomer(id, { ...customer.data, hutang })
    } catch (error) {
      console.error('Error updating customer hutang:', error)
      return { data: null, error: error.message }
    }
  },

  // Get customer statistics
  async getCustomerStats() {
    try {
      const result = await neonStorage.getCustomers()
      if (result.error) throw new Error(result.error)
      
      const data = result.data || []
      const stats = {
        total: data.length,
        active: data.filter(c => c.status === 'active').length,
        suspended: data.filter(c => c.status === 'suspended').length,
        terminated: data.filter(c => c.status === 'terminated').length,
        totalRevenue: data.reduce((sum, c) => sum + (parseInt(c.monthly_fee) || 0), 0)
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
      return await neonStorage.getPackages()
    } catch (error) {
      console.error('Error fetching packages:', error)
      return { data: null, error: error.message }
    }
  }
}