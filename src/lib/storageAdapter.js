// Storage Adapter - Switch between localStorage and Neon based on environment
import jsonStorage, { TABLES } from './jsonStorage'
import neonStorage from './neonStorage'

// TEMPORARY: Force using Neon for testing
// TODO: Change back to: const USE_NEON = import.meta.env.VITE_DATABASE_URL ? true : false
const USE_NEON = true // Force Neon mode

console.log('=== Storage Adapter Debug ===')
console.log('VITE_DATABASE_URL:', import.meta.env.VITE_DATABASE_URL ? '✅ FOUND' : '❌ NOT FOUND')
console.log('USE_NEON:', USE_NEON)
console.log('Storage Mode:', USE_NEON ? '🔵 Neon PostgreSQL' : '🟡 LocalStorage')
console.log('============================')

// Create adapter that wraps both storages
const storageAdapter = {
  // Customer methods
  async getCustomers(filters = {}) {
    console.log('🔶 storageAdapter.getCustomers() called, USE_NEON:', USE_NEON)
    if (USE_NEON) {
      return await neonStorage.getCustomers()
    } else {
      const data = jsonStorage.select(TABLES.CUSTOMERS, { filters })
      return { data, error: null }
    }
  },

  async getCustomerById(id) {
    if (USE_NEON) {
      return await neonStorage.getCustomerById(id)
    } else {
      const data = jsonStorage.select(TABLES.CUSTOMERS, { filters: { id }, single: true })
      return { data, error: null }
    }
  },

  async createCustomer(customerData) {
    if (USE_NEON) {
      return await neonStorage.createCustomer(customerData)
    } else {
      const [data] = jsonStorage.insert(TABLES.CUSTOMERS, customerData)
      return { data, error: null }
    }
  },

  async updateCustomer(id, customerData) {
    if (USE_NEON) {
      return await neonStorage.updateCustomer(id, customerData)
    } else {
      const data = jsonStorage.update(TABLES.CUSTOMERS, id, customerData)
      return { data, error: null }
    }
  },

  async deleteCustomer(id) {
    if (USE_NEON) {
      return await neonStorage.deleteCustomer(id)
    } else {
      jsonStorage.delete(TABLES.CUSTOMERS, id)
      return { data: true, error: null }
    }
  },

  // Package methods
  async getPackages() {
    if (USE_NEON) {
      return await neonStorage.getPackages()
    } else {
      const data = jsonStorage.select(TABLES.PACKAGES, { filters: { is_active: true } })
      return { data, error: null }
    }
  },

  // Bills methods
  async getBills(filters = {}) {
    if (USE_NEON) {
      return await neonStorage.getBills(filters)
    } else {
      let bills = jsonStorage.select(TABLES.BILLS)
      const customers = jsonStorage.select(TABLES.CUSTOMERS)
      
      bills = bills.map(bill => ({
        ...bill,
        customers: customers.find(c => c.id === bill.customer_id) || null
      }))

      // Apply filters
      if (filters.status && filters.status !== 'all') {
        bills = bills.filter(b => b.status === filters.status)
      }
      if (filters.customer_id) {
        bills = bills.filter(b => b.customer_id === filters.customer_id)
      }

      return { data: bills, error: null }
    }
  },

  async createBill(billData) {
    if (USE_NEON) {
      return await neonStorage.createBill(billData)
    } else {
      const [data] = jsonStorage.insert(TABLES.BILLS, billData)
      return { data, error: null }
    }
  },

  async updateBill(id, billData) {
    if (USE_NEON) {
      return await neonStorage.updateBill(id, billData)
    } else {
      const data = jsonStorage.update(TABLES.BILLS, id, billData)
      return { data, error: null }
    }
  },

  async deleteBill(id) {
    if (USE_NEON) {
      return await neonStorage.deleteBill(id)
    } else {
      jsonStorage.delete(TABLES.BILLS, id)
      return { data: true, error: null }
    }
  },

  async deleteAllBills() {
    if (USE_NEON) {
      return await neonStorage.deleteAllBills()
    } else {
      const data = jsonStorage.getAllData()
      data.bills = []
      data.payments = []
      data.billing_history = []
      jsonStorage.saveAllData(data)
      return { data: true, error: null }
    }
  },

  // Payment methods
  async getPayments(billId = null) {
    if (USE_NEON) {
      return await neonStorage.getPayments(billId)
    } else {
      const filters = billId ? { bill_id: billId } : {}
      const data = jsonStorage.select(TABLES.PAYMENTS, { filters })
      return { data, error: null }
    }
  },

  async createPayment(paymentData) {
    if (USE_NEON) {
      return await neonStorage.createPayment(paymentData)
    } else {
      const [data] = jsonStorage.insert(TABLES.PAYMENTS, paymentData)
      return { data, error: null }
    }
  },

  // Billing history methods
  async createBillingHistory(historyData) {
    if (USE_NEON) {
      return await neonStorage.createBillingHistory(historyData)
    } else {
      const [data] = jsonStorage.insert(TABLES.BILLING_HISTORY, historyData)
      return { data, error: null }
    }
  },

  // Utility
  getMode() {
    return USE_NEON ? 'neon' : 'localStorage'
  }
}

export default storageAdapter
