// JSON Storage - Local storage implementation to replace Supabase
// This provides a simple database-like interface using localStorage

class JSONStorage {
  constructor() {
    this.storageKey = 'internet_billing_data'
    this.initializeStorage()
  }

  // Initialize storage with default structure
  initializeStorage() {
    const data = this.getAllData()
    if (!data.customers) data.customers = []
    if (!data.packages) {
      data.packages = this.getDefaultPackages()
    } else {
      // Auto-update packages if new default packages are added
      this.updatePackages(data)
    }
    if (!data.bills) data.bills = []
    if (!data.payments) data.payments = []
    if (!data.billing_history) data.billing_history = []
    this.saveAllData(data)
  }

  // Update packages with new default packages if they don't exist
  updatePackages(data) {
    const defaultPackages = this.getDefaultPackages()
    defaultPackages.forEach(defaultPkg => {
      const exists = data.packages.find(pkg => pkg.name === defaultPkg.name)
      if (!exists) {
        // Find max ID
        const maxId = data.packages.length > 0 
          ? Math.max(...data.packages.map(p => p.id || 0))
          : 0
        // Add new package with proper ID
        data.packages.push({
          ...defaultPkg,
          id: maxId + 1
        })
        console.log(`Added new package: ${defaultPkg.name}`)
      }
    })
  }

  // Get default packages
  getDefaultPackages() {
    return [
      {
        id: 1,
        name: 'Basic',
        speed: '10 Mbps',
        price: 100000,
        description: 'Paket internet dasar untuk kebutuhan browsing',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Standard',
        speed: '20 Mbps',
        price: 150000,
        description: 'Paket internet standar untuk streaming dan gaming',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Premium',
        speed: '50 Mbps',
        price: 200000,
        description: 'Paket internet premium untuk kebutuhan bisnis',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 4,
        name: 'Putus',
        speed: '0 Mbps',
        price: 0,
        description: 'Paket untuk pelanggan yang putus layanan, hanya menagih hutang tanpa biaya bulanan',
        is_active: true,
        created_at: new Date().toISOString()
      }
    ]
  }

  // Get all data from localStorage
  getAllData() {
    try {
      const data = localStorage.getItem(this.storageKey)
      return data ? JSON.parse(data) : {}
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return {}
    }
  }

  // Save all data to localStorage
  saveAllData(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data))
    } catch (error) {
      console.error('Error writing to localStorage:', error)
    }
  }

  // Generate unique ID
  generateId(items) {
    if (!items || items.length === 0) return 1
    const maxId = Math.max(...items.map(item => item.id || 0))
    return maxId + 1
  }

  // Generate customer ID (format: CUST-YYYY-XXXX)
  generateCustomerId(customers) {
    const year = new Date().getFullYear()
    const existingIds = customers
      .filter(c => c.customer_id && c.customer_id.startsWith(`CUST-${year}`))
      .map(c => {
        const match = c.customer_id.match(/CUST-\d{4}-(\d{4})/)
        return match ? parseInt(match[1]) : 0
      })
    
    const nextNum = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1
    return `CUST-${year}-${String(nextNum).padStart(4, '0')}`
  }

  // Query builder for filtering
  applyFilters(items, filters) {
    let result = [...items]

    // Apply search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(item => {
        return Object.values(item).some(val => 
          val && val.toString().toLowerCase().includes(searchLower)
        )
      })
    }

    // Apply field filters
    Object.keys(filters).forEach(key => {
      if (key === 'search' || key === 'sortBy' || key === 'sortOrder') return
      
      const value = filters[key]
      if (value !== undefined && value !== null && value !== 'all') {
        if (key === 'hutang') {
          if (value === 'berhutang') {
            result = result.filter(item => item.hutang && item.hutang > 0)
          } else if (value === 'lunas') {
            result = result.filter(item => !item.hutang || item.hutang === 0)
          }
        } else if (key === 'customer_debt') {
          // Skip, will be handled separately
        } else {
          result = result.filter(item => item[key] === value)
        }
      }
    })

    // Apply sorting
    if (filters.sortBy) {
      const sortField = filters.sortBy
      const sortOrder = filters.sortOrder === 'asc' ? 1 : -1
      result.sort((a, b) => {
        const aVal = a[sortField]
        const bVal = b[sortField]
        if (aVal < bVal) return -1 * sortOrder
        if (aVal > bVal) return 1 * sortOrder
        return 0
      })
    }

    return result
  }

  // CRUD operations for any table
  select(table, options = {}) {
    const data = this.getAllData()
    let items = data[table] || []

    // Apply filters
    if (options.filters) {
      items = this.applyFilters(items, options.filters)
    }

    // Get single item
    if (options.single) {
      return items.length > 0 ? items[0] : null
    }

    return items
  }

  insert(table, items) {
    const data = this.getAllData()
    if (!data[table]) data[table] = []

    const itemsArray = Array.isArray(items) ? items : [items]
    const newItems = itemsArray.map(item => ({
      ...item,
      id: item.id || this.generateId(data[table]),
      created_at: item.created_at || new Date().toISOString()
    }))

    data[table].push(...newItems)
    this.saveAllData(data)

    return newItems
  }

  update(table, id, updates) {
    const data = this.getAllData()
    if (!data[table]) return null

    const index = data[table].findIndex(item => item.id === id)
    if (index === -1) return null

    data[table][index] = {
      ...data[table][index],
      ...updates,
      updated_at: new Date().toISOString()
    }

    this.saveAllData(data)
    return data[table][index]
  }

  delete(table, id) {
    const data = this.getAllData()
    if (!data[table]) return false

    const index = data[table].findIndex(item => item.id === id)
    if (index === -1) return false

    data[table].splice(index, 1)
    this.saveAllData(data)
    return true
  }

  // Join operation (simulate SQL join)
  selectWithJoin(table, joins = []) {
    const data = this.getAllData()
    let items = [...(data[table] || [])]

    joins.forEach(join => {
      const joinTable = data[join.table] || []
      items = items.map(item => {
        const joinKey = join.foreignKey || `${join.table.slice(0, -1)}_id`
        const joinItem = joinTable.find(j => j.id === item[joinKey])
        return {
          ...item,
          [join.table]: joinItem || null
        }
      })
    })

    return items
  }

  // Export data to JSON file
  exportToJSON() {
    const data = this.getAllData()
    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `billing-data-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Import data from JSON file
  importFromJSON(jsonData) {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData
      this.saveAllData(data)
      return { success: true }
    } catch (error) {
      console.error('Error importing data:', error)
      return { success: false, error: error.message }
    }
  }

  // Clear all data
  clearAllData() {
    localStorage.removeItem(this.storageKey)
    this.initializeStorage()
  }

  // Get statistics
  getStats(table) {
    const data = this.getAllData()
    const items = data[table] || []
    return {
      total: items.length,
      latest: items[items.length - 1],
      oldest: items[0]
    }
  }
}

// Create singleton instance
const jsonStorage = new JSONStorage()

// Database table names
export const TABLES = {
  CUSTOMERS: 'customers',
  PACKAGES: 'packages',
  BILLS: 'bills',
  PAYMENTS: 'payments',
  BILLING_HISTORY: 'billing_history'
}

export default jsonStorage
