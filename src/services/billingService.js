import storageAdapter from '../lib/storageAdapter'
import { wahaService } from './wahaService'

// Billing service functions
export const billingService = {
  // Generate bill number
  generateBillNumber(billingDate, existingBills = []) {
    const year = billingDate.getFullYear()
    const month = String(billingDate.getMonth() + 1).padStart(2, '0')
    const yearMonth = `${year}-${month}`
    
    // Extract all existing numbers for this month
    const existingNumbers = existingBills
      .filter(bill => bill.bill_number && bill.bill_number.startsWith(`BILL-${yearMonth}`))
      .map(bill => {
        const match = bill.bill_number.match(/BILL-\d{4}-\d{2}-(\d+)$/)
        return match ? parseInt(match[1]) : 0
      })

    // Find next available number
    const nextId = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1
    return `BILL-${yearMonth}-${String(nextId).padStart(4, '0')}`
  },

  // Generate unique payment number
  generatePaymentNumber(paymentDate) {
    const date = new Date(paymentDate)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    const second = String(date.getSeconds()).padStart(2, '0')
    
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0')
    
    return `PAY-${year}${month}${day}-${hour}${minute}${second}-${timestamp}-${random}`
  },

  // Get all bills with optional filtering
  async getBills(filters = {}) {
    try {
      return await storageAdapter.getBills(filters)
    } catch (error) {
      console.error('Error fetching bills:', error)
      return { data: null, error: error.message }
    }
  },

  // Get single bill by ID
  async getBillById(id) {
    try {
      const bills = jsonStorage.select(TABLES.BILLS, { filters: { id } })
      if (bills.length === 0) {
        throw new Error('Bill not found')
      }

      const bill = bills[0]
      
      // Join with customer
      const customers = jsonStorage.select(TABLES.CUSTOMERS)
      bill.customers = customers.find(c => c.id === bill.customer_id) || null

      // Join with payments
      const payments = jsonStorage.select(TABLES.PAYMENTS, { 
        filters: { bill_id: id } 
      })
      bill.payments = payments

      return { data: bill, error: null }
    } catch (error) {
      console.error('Error fetching bill:', error)
      return { data: null, error: error.message }
    }
  },

  // Generate bills for all active customers for a specific month
  async generateMonthlyBills(billingMonth) {
    try {
      const billingDate = new Date(billingMonth)
      const year = billingDate.getFullYear()
      const month = billingDate.getMonth()
      const monthName = billingDate.toLocaleString('id-ID', { month: 'long' })
      
      console.log('📋 Generating bills for:', monthName, year)
      
      // Calculate billing period
      const dueDate = new Date(year, month + 1, 0) // End of the month

      // Get all active customers using storageAdapter
      const { data: customers, error: customersError } = await storageAdapter.getCustomers()
      
      if (customersError) {
        throw new Error(`Failed to get customers: ${customersError}`)
      }

      const activeCustomers = customers?.filter(c => c.status === 'active') || []

      if (activeCustomers.length === 0) {
        return { data: { message: 'No active customers found' }, error: null }
      }

      console.log('👥 Found', activeCustomers.length, 'active customers')

      // Check if bills already exist for this month
      const { data: existingBills } = await storageAdapter.getBills({
        billing_month: monthName,
        billing_year: year
      })

      const existingCustomerIds = existingBills?.map(bill => bill.customer_id) || []
      const customersToProcess = activeCustomers.filter(customer => 
        !existingCustomerIds.includes(customer.id)
      )

      if (customersToProcess.length === 0) {
        return { 
          data: { 
            message: `Bills already generated for ${monthName} ${year}`,
            existingCount: existingBills?.length || 0
          }, 
          error: null 
        }
      }

      console.log('✅ Will generate bills for', customersToProcess.length, 'customers')

      // Get all existing bills to generate unique bill numbers
      const { data: allExistingBills } = await storageAdapter.getBills()

      // Generate bills
      const billsToCreate = []
      let totalAmount = 0

      for (const customer of customersToProcess) {
        // Previous debt comes from customer.hutang field
        const previousDebt = customer.hutang || 0
        const monthlyFee = customer.monthly_fee || 0
        const totalBillAmount = monthlyFee + previousDebt

        // Generate bill number - update allExistingBills array to prevent duplicates
        const billNumber = this.generateBillNumber(billingDate, allExistingBills || [])
        
        // Add to existing bills list immediately to prevent duplicates in next iteration
        if (allExistingBills) {
          allExistingBills.push({ bill_number: billNumber })
        }

        const billData = {
          bill_number: billNumber,
          customer_id: customer.id,
          customer_name: customer.name,
          billing_month: monthName,
          billing_year: year,
          due_date: dueDate.toISOString().split('T')[0],
          amount: monthlyFee,
          previous_debt: previousDebt,
          total_amount: totalBillAmount,
          status: 'unpaid'
        }

        billsToCreate.push(billData)
        totalAmount += totalBillAmount
      }

      console.log('💾 Creating', billsToCreate.length, 'bills...')

      // Insert bills one by one (for better error handling)
      const createdBills = []
      let successCount = 0
      let errorCount = 0
      
      for (let i = 0; i < billsToCreate.length; i++) {
        const billData = billsToCreate[i]
        console.log(`📝 Creating bill ${i+1}/${billsToCreate.length}:`, billData.bill_number, 'for', billData.customer_name)
        
        try {
          const { data: createdBill, error } = await storageAdapter.createBill(billData)
          if (error) {
            console.error('❌ Error creating bill:', error, billData)
            errorCount++
          } else {
            console.log('✅ Bill created:', createdBill?.bill_number || 'unknown')
            createdBills.push(createdBill)
            successCount++
          }
        } catch (err) {
          console.error('❌ Exception creating bill:', err.message, billData)
          errorCount++
        }
      }

      console.log(`✅ Successfully created ${successCount} bills, ${errorCount} errors`)

      // Record billing history
      await storageAdapter.createBillingHistory({
        action: 'generate_monthly_bills',
        description: `Generated ${createdBills.length} bills for ${monthName} ${year}. Total amount: Rp ${totalAmount.toLocaleString()}`
      })

      return { 
        data: { 
          message: `Successfully generated ${createdBills.length} bills for ${monthName} ${year}`,
          bills: createdBills,
          totalAmount,
          monthName,
          year
        }, 
        error: null 
      }
    } catch (error) {
      console.error('Error generating monthly bills:', error)
      return { data: null, error: error.message }
    }
  },

  // Record a payment
  async recordPayment(paymentData, sendWhatsAppNotification = true) {
    try {
      // Get the bill
      const bills = jsonStorage.select(TABLES.BILLS, { 
        filters: { id: paymentData.bill_id } 
      })

      if (bills.length === 0) {
        throw new Error('Bill not found')
      }

      const bill = bills[0]

      // Get customer
      const customers = jsonStorage.select(TABLES.CUSTOMERS, {
        filters: { id: bill.customer_id }
      })

      const customer = customers.length > 0 ? customers[0] : null

      // Generate payment number
      const paymentDate = paymentData.payment_date || new Date().toISOString()
      const paymentNumber = this.generatePaymentNumber(paymentDate)

      // Create payment
      const [payment] = jsonStorage.insert(TABLES.PAYMENTS, {
        payment_number: paymentNumber,
        bill_id: paymentData.bill_id,
        customer_id: bill.customer_id,
        amount: paymentData.amount,
        payment_method: paymentData.payment_method || 'cash',
        payment_date: paymentDate,
        reference_number: paymentData.reference_number,
        notes: paymentData.notes,
        created_by: paymentData.created_by || 'admin'
      })

      // Update bill
      const newPaidAmount = (bill.paid_amount || 0) + paymentData.amount
      const newRemainingAmount = (bill.remaining_amount || bill.total_amount) - paymentData.amount

      jsonStorage.update(TABLES.BILLS, paymentData.bill_id, {
        paid_amount: newPaidAmount,
        remaining_amount: Math.max(0, newRemainingAmount),
        status: newRemainingAmount <= 0 ? 'paid' : (newPaidAmount > 0 ? 'partial' : bill.status),
        payment_date: newRemainingAmount <= 0 ? new Date().toISOString() : bill.payment_date
      })

      // Send WhatsApp payment confirmation (if enabled and phone available)
      let whatsappResult = null
      if (sendWhatsAppNotification && customer?.phone) {
        try {
          whatsappResult = await wahaService.sendPaymentConfirmation(payment, bill, customer)
          if (whatsappResult.success) {
            console.log('Payment confirmation sent via WhatsApp:', whatsappResult.messageId)
          } else {
            console.warn('Failed to send WhatsApp payment confirmation:', whatsappResult.error)
          }
        } catch (whatsappError) {
          console.warn('WhatsApp notification error (non-critical):', whatsappError)
        }
      }

      return { 
        data: payment, 
        error: null,
        whatsappNotification: whatsappResult
      }
    } catch (error) {
      console.error('Error recording payment:', error)
      return { data: null, error: error.message }
    }
  },

  // Get billing statistics
  async getBillingStats(month = null) {
    try {
      const { data: bills, error } = await storageAdapter.getBills()
      
      if (error) throw new Error(error)

      let filteredBills = bills || []

      if (month) {
        const monthName = new Date(month).toLocaleLaleString('id-ID', { month: 'long' })
        const year = new Date(month).getFullYear()
        
        filteredBills = filteredBills.filter(b => 
          b.billing_month === monthName && b.billing_year === year
        )
      }

      const stats = {
        totalBills: filteredBills.length,
        unpaidBills: filteredBills.filter(b => b.status === 'unpaid').length,
        paidBills: filteredBills.filter(b => b.status === 'paid').length,
        partialBills: filteredBills.filter(b => b.status === 'partial').length,
        totalAmount: filteredBills.reduce((sum, b) => sum + (b.total_amount || 0), 0),
        totalPaid: filteredBills.reduce((sum, b) => sum + (b.amount - (b.previous_debt || 0)), 0),
        totalOutstanding: filteredBills.filter(b => b.status === 'unpaid').reduce((sum, b) => sum + (b.total_amount || 0), 0)
      }

      return { data: stats, error: null }
    } catch (error) {
      console.error('Error fetching billing stats:', error)
      return { data: null, error: error.message }
    }
  },

  // Get payments with optional filtering
  async getPayments(filters = {}) {
    try {
      let payments = jsonStorage.select(TABLES.PAYMENTS)
      
      // Join with bills and customers
      const bills = jsonStorage.select(TABLES.BILLS)
      const customers = jsonStorage.select(TABLES.CUSTOMERS)
      
      payments = payments.map(payment => ({
        ...payment,
        bills: bills.find(b => b.id === payment.bill_id) || null,
        customers: customers.find(c => c.id === payment.customer_id) || null
      }))

      // Apply filters
      if (filters.customer_id) {
        payments = payments.filter(p => p.customer_id === filters.customer_id)
      }

      if (filters.bill_id) {
        payments = payments.filter(p => p.bill_id === filters.bill_id)
      }

      if (filters.payment_method) {
        payments = payments.filter(p => p.payment_method === filters.payment_method)
      }

      if (filters.date_from) {
        payments = payments.filter(p => p.payment_date >= filters.date_from)
      }

      if (filters.date_to) {
        payments = payments.filter(p => p.payment_date <= filters.date_to)
      }

      // Sort by payment_date descending
      payments.sort((a, b) => {
        const dateA = new Date(a.payment_date)
        const dateB = new Date(b.payment_date)
        return dateB - dateA
      })

      return { data: payments, error: null }
    } catch (error) {
      console.error('Error fetching payments:', error)
      return { data: null, error: error.message }
    }
  },

  // Update bill status manually
  async updateBillStatus(billId, status, notes = null) {
    try {
      const updateData = { status }
      if (notes) {
        updateData.notes = notes
      }

      const data = jsonStorage.update(TABLES.BILLS, billId, updateData)

      if (!data) {
        throw new Error('Bill not found')
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error updating bill status:', error)
      return { data: null, error: error.message }
    }
  }
}
