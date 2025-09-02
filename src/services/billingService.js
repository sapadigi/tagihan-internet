import { supabase, TABLES } from '../lib/supabase'
import { wahaService } from './wahaService'

// Billing service functions
export const billingService = {
  // Fallback function to generate bill number if database function doesn't exist
  async generateBillNumberFallback(billingDate, usedNumbers = new Set()) {
    try {
      const year = billingDate.getFullYear();
      const month = String(billingDate.getMonth() + 1).padStart(2, '0');
      const yearMonth = `${year}-${month}`;
      
      // Get existing bills for this month
      const { data: existingBills, error } = await supabase
        .from(TABLES.BILLS)
        .select('bill_number')
        .like('bill_number', `BILL-${yearMonth}-%`)
        .order('bill_number', { ascending: false });

      if (error) {
        throw error;
      }

      // Extract all existing numbers for this month
      const existingNumbers = new Set();
      if (existingBills && existingBills.length > 0) {
        existingBills.forEach(bill => {
          const match = bill.bill_number.match(/BILL-\d{4}-\d{2}-(\d+)$/);
          if (match) {
            existingNumbers.add(parseInt(match[1]));
          }
        });
      }

      // Combine existing numbers with used numbers in current batch
      const allUsedNumbers = new Set([...existingNumbers, ...usedNumbers]);

      // Find next available number
      let nextId = 1;
      while (allUsedNumbers.has(nextId)) {
        nextId++;
      }

      const billNumber = `BILL-${yearMonth}-${String(nextId).padStart(4, '0')}`;
      
      // Add to used numbers to prevent duplicates in current batch
      usedNumbers.add(nextId);
      
      return billNumber;
    } catch (error) {
      console.error('Error generating bill number fallback:', error);
      // Ultimate fallback with timestamp to ensure uniqueness
      const timestamp = Date.now().toString().slice(-6);
      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const year = billingDate.getFullYear();
      const month = String(billingDate.getMonth() + 1).padStart(2, '0');
      return `BILL-${year}-${month}-${timestamp}${randomSuffix}`;
    }
  },

  // Generate unique payment number with timestamp for guaranteed uniqueness
  async generateUniquePaymentNumber(paymentDate) {
    // Use timestamp-based generation for guaranteed uniqueness
    // This avoids any potential database sequence issues
    const date = new Date(paymentDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    
    // Use current timestamp for uniqueness
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    
    // Format: PAY-YYYYMMDD-HHMMSS-TIMESTAMP-RANDOM
    return `PAY-${year}${month}${day}-${hour}${minute}${second}-${timestamp}-${random}`;
  },

  // Fallback function to generate payment number using timestamp for guaranteed uniqueness
  async generatePaymentNumberFallback(paymentDate) {
    try {
      const date = new Date(paymentDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      // Use timestamp with random suffix for guaranteed uniqueness
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
      
      // Format: PAY-YYYY-MM-DD-TIMESTAMP-RANDOM
      return `PAY-${year}-${month}-${day}-${timestamp}-${random}`;
      
    } catch (error) {
      console.error('Error generating payment number fallback:', error);
      // Ultimate fallback with multiple random components
      const timestamp = Date.now();
      const random1 = Math.floor(Math.random() * 99999);
      const random2 = Math.floor(Math.random() * 99999);
      const date = new Date(paymentDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `PAY-${year}-${month}-${timestamp}-${random1}-${random2}`;
    }
  },
  // Get all bills with optional filtering
  async getBills(filters = {}) {
    try {
      let query = supabase
        .from(TABLES.BILLS)
        .select(`
          *,
          customers (
            id,
            customer_id,
            name,
            email,
            phone,
            package_name,
            package_speed,
            monthly_fee,
            hutang
          )
        `)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }

      if (filters.customer_id) {
        query = query.eq('customer_id', filters.customer_id)
      }

      if (filters.billing_month) {
        const startDate = new Date(filters.billing_month)
        const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
        query = query.gte('billing_period_start', startDate.toISOString().split('T')[0])
        query = query.lte('billing_period_end', endDate.toISOString().split('T')[0])
      }

      if (filters.search) {
        query = query.or(`bill_number.ilike.%${filters.search}%`)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      // Apply customer debt filter if specified (after fetching data)
      let filteredData = data;
      if (filters.customer_debt && filters.customer_debt !== 'all') {
        if (filters.customer_debt === 'with_debt') {
          filteredData = data.filter(bill => bill.customers?.hutang && bill.customers.hutang > 0);
        } else if (filters.customer_debt === 'no_debt') {
          filteredData = data.filter(bill => !bill.customers?.hutang || bill.customers.hutang === 0);
        }
      }

      return { data: filteredData, error: null }
    } catch (error) {
      console.error('Error fetching bills:', error)
      return { data: null, error: error.message }
    }
  },

  // Get single bill by ID
  async getBillById(id) {
    try {
      const { data, error } = await supabase
        .from(TABLES.BILLS)
        .select(`
          *,
          customers (
            id,
            customer_id,
            name,
            email,
            phone,
            package_name,
            package_speed,
            monthly_fee
          ),
          payments (
            id,
            payment_number,
            amount,
            payment_method,
            payment_date,
            reference_number,
            notes,
            created_by
          )
        `)
        .eq('id', id)
        .single()

      if (error) {
        throw error
      }

      return { data, error: null }
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
      
      // Calculate billing period
      const billingPeriodStart = new Date(year, month, 1)
      const billingPeriodEnd = new Date(year, month + 1, 0)
      const dueDate = new Date(year, month + 1, 0) // End of the month

      // Get all active customers
      const { data: customers, error: customersError } = await supabase
        .from(TABLES.CUSTOMERS)
        .select('*')
        .eq('status', 'active')

      if (customersError) {
        throw customersError
      }

      if (!customers || customers.length === 0) {
        return { data: { message: 'No active customers found' }, error: null }
      }

      // Check if bills already exist for this month
      const { data: existingBills, error: existingError } = await supabase
        .from(TABLES.BILLS)
        .select('customer_id')
        .eq('billing_period_start', billingPeriodStart.toISOString().split('T')[0])

      if (existingError) {
        throw existingError
      }

      const existingCustomerIds = existingBills?.map(bill => bill.customer_id) || []
      const customersToProcess = customers.filter(customer => 
        !existingCustomerIds.includes(customer.id)
      )

      if (customersToProcess.length === 0) {
        return { data: { message: 'Bills already generated for this month' }, error: null }
      }

      // Get previous month's unpaid bills for debt calculation
      const prevMonth = new Date(year, month - 1, 1)
      const { data: unpaidBills, error: unpaidError } = await supabase
        .from(TABLES.BILLS)
        .select('customer_id, remaining_amount')
        .eq('billing_period_start', prevMonth.toISOString().split('T')[0])
        .gt('remaining_amount', 0)

      if (unpaidError) {
        throw unpaidError
      }

      const debtMap = {}
      unpaidBills?.forEach(bill => {
        debtMap[bill.customer_id] = bill.remaining_amount
      })

      // Generate bills
      const billsToCreate = []
      let totalAmount = 0
      const usedBillNumbers = new Set() // Track used numbers in current batch

      for (const customer of customersToProcess) {
        const previousDebt = debtMap[customer.id] || 0
        const monthlyFee = customer.monthly_fee || 0
        const totalBillAmount = monthlyFee + previousDebt

        // Generate bill number
        let billNumber;
        const { data: billNumberData, error: billNumberError } = await supabase
          .rpc('generate_bill_number', { billing_date: billingPeriodStart.toISOString().split('T')[0] })

        if (billNumberError) {
          // Fallback: Generate bill number manually if function doesn't exist
          console.warn('Using fallback bill number generation:', billNumberError.message);
          billNumber = await this.generateBillNumberFallback(billingPeriodStart, usedBillNumbers);
        } else {
          billNumber = billNumberData;
        }

        billsToCreate.push({
          bill_number: billNumber,
          customer_id: customer.id,
          billing_period_start: billingPeriodStart.toISOString().split('T')[0],
          billing_period_end: billingPeriodEnd.toISOString().split('T')[0],
          due_date: dueDate.toISOString().split('T')[0],
          amount: monthlyFee,
          previous_debt: previousDebt,
          total_amount: totalBillAmount,
          remaining_amount: totalBillAmount,
          status: 'pending'
        })

        totalAmount += totalBillAmount
      }

      // Insert bills with retry mechanism for duplicate key errors
      let createdBills;
      let insertError;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        const { data, error } = await supabase
          .from(TABLES.BILLS)
          .insert(billsToCreate)
          .select()

        if (!error) {
          createdBills = data;
          insertError = null;
          break;
        } else if (error.message.includes('duplicate key value') && retryCount < maxRetries - 1) {
          // If duplicate key error, regenerate bill numbers and retry
          console.warn(`Duplicate bill number detected, retrying... (${retryCount + 1}/${maxRetries})`);
          
          // Regenerate bill numbers for all bills
          const usedBillNumbers = new Set();
          for (let i = 0; i < billsToCreate.length; i++) {
            billsToCreate[i].bill_number = await this.generateBillNumberFallback(billingPeriodStart, usedBillNumbers);
          }
          
          retryCount++;
        } else {
          insertError = error;
          break;
        }
      }

      if (insertError) {
        throw insertError
      }

      // Record billing history
      const { error: historyError } = await supabase
        .from(TABLES.BILLING_HISTORY)
        .insert({
          billing_month: billingPeriodStart.toISOString().split('T')[0],
          total_customers: customersToProcess.length,
          total_bills_generated: createdBills.length,
          total_amount: totalAmount,
          status: 'completed'
        })

      if (historyError) {
        console.warn('Failed to record billing history:', historyError)
      }

      return { 
        data: { 
          message: `Successfully generated ${createdBills.length} bills`,
          bills: createdBills,
          totalAmount
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
      // First, get the bill to get customer_id
      const { data: bill, error: billError } = await supabase
        .from(TABLES.BILLS)
        .select(`
          *,
          customers (
            id,
            customer_id,
            name,
            email,
            phone,
            package_name,
            package_speed,
            monthly_fee
          )
        `)
        .eq('id', paymentData.bill_id)
        .single()

      if (billError) {
        throw billError
      }

      if (!bill) {
        throw new Error('Bill not found')
      }

      // Generate payment number with retry mechanism
      const paymentDate = paymentData.payment_date || new Date().toISOString()
      let paymentNumber;
      let retryCount = 0;
      const maxRetries = 5;

      while (retryCount < maxRetries) {
        try {
          // Generate unique payment number with timestamp
          paymentNumber = await this.generateUniquePaymentNumber(paymentDate);
          console.log(`Attempting payment with number: ${paymentNumber} (attempt ${retryCount + 1}/${maxRetries})`);
          
          // Try to insert payment with generated number
          const { data: payment, error: paymentError } = await supabase
            .from(TABLES.PAYMENTS)
            .insert({
              payment_number: paymentNumber,
              bill_id: paymentData.bill_id,
              customer_id: bill.customer_id, // Use customer_id from the bill
              amount: paymentData.amount,
              payment_method: paymentData.payment_method || 'cash',
              payment_date: paymentDate,
              reference_number: paymentData.reference_number,
              notes: paymentData.notes,
              created_by: paymentData.created_by || 'admin'
            })
            .select()
            .single()

          if (paymentError) {
            console.error('Payment insert error:', paymentError);
            // Check if it's a duplicate key error
            if (paymentError.message.includes('duplicate key value') && retryCount < maxRetries - 1) {
              console.warn(`Payment number collision detected: ${paymentNumber}, retrying... (${retryCount + 1}/${maxRetries})`);
              retryCount++;
              // Add exponential backoff with more randomization
              await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount) + Math.random() * 2000));
              continue;
            } else {
              throw paymentError;
            }
          }

          console.log('Payment recorded successfully:', payment.payment_number);

          // Success - update bill paid amount
          const newPaidAmount = (bill.paid_amount || 0) + paymentData.amount
          const newRemainingAmount = (bill.remaining_amount || bill.total_amount) - paymentData.amount

          const { error: updateError } = await supabase
            .from(TABLES.BILLS)
            .update({ 
              paid_amount: newPaidAmount,
              remaining_amount: Math.max(0, newRemainingAmount),
              status: newRemainingAmount <= 0 ? 'paid' : (newPaidAmount > 0 ? 'partial' : bill.status),
              payment_date: newRemainingAmount <= 0 ? new Date().toISOString() : bill.payment_date
            })
            .eq('id', paymentData.bill_id)

          if (updateError) {
            throw updateError
          }

          // Send WhatsApp payment confirmation (if enabled and phone available)
          let whatsappResult = null;
          if (sendWhatsAppNotification) {
            try {
              if (bill.customers?.phone) {
                whatsappResult = await wahaService.sendPaymentConfirmation(payment, bill, bill.customers)
                if (whatsappResult.success) {
                  console.log('Payment confirmation sent via WhatsApp:', whatsappResult.messageId)
                } else {
                  console.warn('Failed to send WhatsApp payment confirmation:', whatsappResult.error)
                }
              }
            } catch (whatsappError) {
              console.warn('WhatsApp notification error (non-critical):', whatsappError)
              // Don't throw error - payment recording should succeed even if WhatsApp fails
            }
          }

          return { 
            data: payment, 
            error: null,
            whatsappNotification: whatsappResult
          }

        } catch (innerError) {
          if (innerError.message.includes('duplicate key value') && retryCount < maxRetries - 1) {
            console.warn(`Payment insertion failed with duplicate key, retrying... (${retryCount + 1}/${maxRetries})`);
            retryCount++;
            // Add exponential backoff
            await new Promise(resolve => setTimeout(resolve, 200 * Math.pow(2, retryCount) + Math.random() * 100));
            continue;
          } else {
            throw innerError;
          }
        }
      }

      // If we reach here, all retries failed
      throw new Error(`Failed to record payment after ${maxRetries} attempts due to payment number conflicts`);

    } catch (error) {
      console.error('Error recording payment:', error)
      return { data: null, error: error.message }
    }
  },

  // Get billing statistics
  async getBillingStats(month = null) {
    try {
      let query = supabase.from(TABLES.BILLS).select('status, total_amount, paid_amount, remaining_amount')

      if (month) {
        const startDate = new Date(month)
        const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
        query = query.gte('billing_period_start', startDate.toISOString().split('T')[0])
        query = query.lte('billing_period_end', endDate.toISOString().split('T')[0])
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      const stats = {
        totalBills: data.length,
        pendingBills: data.filter(b => b.status === 'pending').length,
        paidBills: data.filter(b => b.status === 'paid').length,
        overdueBills: data.filter(b => b.status === 'overdue').length,
        totalAmount: data.reduce((sum, b) => sum + (b.total_amount || 0), 0),
        totalPaid: data.reduce((sum, b) => sum + (b.paid_amount || 0), 0),
        totalOutstanding: data.reduce((sum, b) => sum + (b.remaining_amount || 0), 0)
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
      let query = supabase
        .from(TABLES.PAYMENTS)
        .select(`
          *,
          bills (
            id,
            bill_number,
            total_amount,
            billing_period_start,
            billing_period_end
          ),
          customers (
            id,
            customer_id,
            name,
            email,
            phone
          )
        `)
        .order('payment_date', { ascending: false })

      if (filters.customer_id) {
        query = query.eq('customer_id', filters.customer_id)
      }

      if (filters.bill_id) {
        query = query.eq('bill_id', filters.bill_id)
      }

      if (filters.payment_method) {
        query = query.eq('payment_method', filters.payment_method)
      }

      if (filters.date_from) {
        query = query.gte('payment_date', filters.date_from)
      }

      if (filters.date_to) {
        query = query.lte('payment_date', filters.date_to)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      return { data, error: null }
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

      const { data, error } = await supabase
        .from(TABLES.BILLS)
        .update(updateData)
        .eq('id', billId)
        .select()
        .single()

      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error updating bill status:', error)
      return { data: null, error: error.message }
    }
  }
}