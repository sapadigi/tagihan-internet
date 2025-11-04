// Neon Database Storage - PostgreSQL implementation
import { neon } from '@neondatabase/serverless';

class NeonStorage {
  constructor() {
    // Get database URL from environment or use hardcoded for development
    const dbUrl = import.meta.env.VITE_DATABASE_URL || 
                 'postgresql://neondb_owner:npg_jaoNX63yHqiw@ep-flat-rain-adxuna30-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require';
    
    console.log('🔵 NeonStorage initializing...');
    console.log('🔵 Database URL:', dbUrl ? 'Connected' : 'NOT FOUND');
    
    if (!dbUrl) {
      throw new Error('VITE_DATABASE_URL is not defined in environment variables');
    }
    
    this.sql = neon(dbUrl);
    console.log('✅ NeonStorage initialized successfully');
  }

  // ==================== CUSTOMERS ====================
  
  async getCustomers() {
    try {
      console.log('🔵 neonStorage.getCustomers() called')
      const customers = await this.sql`
        SELECT * FROM customers 
        ORDER BY created_at DESC
      `;
      console.log('🔵 Found', customers?.length, 'customers from Neon')
      console.log('🔵 Sample customer:', customers?.[0])
      return { data: customers, error: null };
    } catch (error) {
      console.error('❌ Error getting customers:', error);
      return { data: null, error: error.message };
    }
  }

  async getCustomerById(id) {
    try {
      const customers = await this.sql`
        SELECT * FROM customers 
        WHERE id = ${id}
      `;
      return { data: customers[0] || null, error: null };
    } catch (error) {
      console.error('Error getting customer:', error);
      return { data: null, error: error.message };
    }
  }

  async createCustomer(customerData) {
    try {
      const result = await this.sql`
        INSERT INTO customers (
          name, email, phone, address, 
          package_name, package_speed, monthly_fee, hutang, status
        )
        VALUES (
          ${customerData.name},
          ${customerData.email},
          ${customerData.phone},
          ${customerData.address || ''},
          ${customerData.package_name},
          ${customerData.package_speed},
          ${customerData.monthly_fee},
          ${customerData.hutang || 0},
          ${customerData.status || 'active'}
        )
        RETURNING *
      `;
      return { data: result[0], error: null };
    } catch (error) {
      console.error('Error creating customer:', error);
      return { data: null, error: error.message };
    }
  }

  async updateCustomer(id, customerData) {
    try {
      const result = await this.sql`
        UPDATE customers
        SET 
          name = ${customerData.name},
          email = ${customerData.email},
          phone = ${customerData.phone},
          address = ${customerData.address || ''},
          package_name = ${customerData.package_name},
          package_speed = ${customerData.package_speed},
          monthly_fee = ${customerData.monthly_fee},
          hutang = ${customerData.hutang !== undefined ? customerData.hutang : 0},
          status = ${customerData.status},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;
      return { data: result[0], error: null };
    } catch (error) {
      console.error('Error updating customer:', error);
      return { data: null, error: error.message };
    }
  }

  async deleteCustomer(id) {
    try {
      await this.sql`
        DELETE FROM customers 
        WHERE id = ${id}
      `;
      return { data: true, error: null };
    } catch (error) {
      console.error('Error deleting customer:', error);
      return { data: null, error: error.message };
    }
  }

  // ==================== PACKAGES ====================
  
  async getPackages() {
    try {
      const packages = await this.sql`
        SELECT * FROM packages 
        WHERE is_active = true
        ORDER BY price ASC
      `;
      return { data: packages, error: null };
    } catch (error) {
      console.error('Error getting packages:', error);
      return { data: null, error: error.message };
    }
  }

  async createPackage(packageData) {
    try {
      const result = await this.sql`
        INSERT INTO packages (name, speed, price, description, is_active)
        VALUES (
          ${packageData.name},
          ${packageData.speed},
          ${packageData.price},
          ${packageData.description || ''},
          ${packageData.is_active !== false}
        )
        RETURNING *
      `;
      return { data: result[0], error: null };
    } catch (error) {
      console.error('Error creating package:', error);
      return { data: null, error: error.message };
    }
  }

  async updatePackage(id, packageData) {
    try {
      const result = await this.sql`
        UPDATE packages
        SET 
          name = ${packageData.name},
          speed = ${packageData.speed},
          price = ${packageData.price},
          description = ${packageData.description || ''},
          is_active = ${packageData.is_active !== false}
        WHERE id = ${id}
        RETURNING *
      `;
      return { data: result[0], error: null };
    } catch (error) {
      console.error('Error updating package:', error);
      return { data: null, error: error.message };
    }
  }

  async deletePackage(id) {
    try {
      await this.sql`
        DELETE FROM packages 
        WHERE id = ${id}
      `;
      return { data: true, error: null };
    } catch (error) {
      console.error('Error deleting package:', error);
      return { data: null, error: error.message };
    }
  }

  // ==================== BILLS ====================
  
  async getBills(filters = {}) {
    try {
      console.log('🔵 neonStorage.getBills() called with filters:', filters)
      
      // Use SQL JOIN to get customer data with bills
      let query = `
        SELECT 
          bills.id,
          bills.bill_number,
          bills.customer_id,
          bills.customer_name,
          bills.billing_month,
          bills.billing_year,
          bills.amount,
          bills.previous_debt,
          bills.compensation,
          bills.total_amount,
          bills.paid_amount,
          bills.remaining_amount,
          bills.status,
          bills.due_date,
          bills.payment_date,
          bills.created_at,
          customers.name,
          customers.phone,
          customers.email,
          customers.address,
          customers.package_name,
          customers.package_speed,
          customers.monthly_fee,
          customers.hutang,
          customers.status as customer_status
        FROM bills
        LEFT JOIN customers ON bills.customer_id = customers.id
        WHERE 1=1
      `;
      const params = [];

      if (filters.customer_id) {
        query += ` AND bills.customer_id = $${params.length + 1}`;
        params.push(filters.customer_id);
      }

      if (filters.status && filters.status !== 'all') {
        query += ` AND bills.status = $${params.length + 1}`;
        params.push(filters.status);
      }

      if (filters.billing_month) {
        query += ` AND billing_month = $${params.length + 1}`;
        params.push(filters.billing_month);
      }

      if (filters.billing_year) {
        query += ` AND billing_year = $${params.length + 1}`;
        params.push(filters.billing_year);
      }

      query += ' ORDER BY bills.created_at DESC';

      console.log('🔵 Executing query:', query)
      console.log('🔵 With params:', params)

      // Use sql.query() for dynamic queries with parameters
      const result = await this.sql.query(query, params);
      
      // Transform data to match localStorage format with nested customers object
      const bills = result.map(row => ({
        id: row.id,
        bill_number: row.bill_number,
        customer_id: row.customer_id,
        customer_name: row.customer_name,
        billing_month: row.billing_month,
        billing_year: row.billing_year,
        amount: row.amount,
        previous_debt: row.previous_debt,
        compensation: row.compensation || 0,
        total_amount: row.total_amount,
        paid_amount: row.paid_amount || 0,
        remaining_amount: row.remaining_amount || row.total_amount,
        status: row.status,
        due_date: row.due_date,
        payment_date: row.payment_date,
        created_at: row.created_at,
        // Nest customer data in 'customers' object for compatibility
        customers: row.name ? {
          id: row.customer_id,
          name: row.name,
          phone: row.phone,
          email: row.email,
          address: row.address,
          package_name: row.package_name,
          package_speed: row.package_speed,
          monthly_fee: row.monthly_fee,
          hutang: row.hutang,
          status: row.customer_status
        } : null
      }));
      
      console.log('🔵 Query result:', bills?.length, 'bills found')
      console.log('🔵 First bill sample:', bills?.[0])
      
      return { data: bills, error: null };
    } catch (error) {
      console.error('❌ Error getting bills:', error);
      return { data: null, error: error.message };
    }
  }

  async createBill(billData) {
    try {
      console.log('🔵 neonStorage.createBill() called for:', billData.bill_number)
      
      const result = await this.sql`
        INSERT INTO bills (
          bill_number, customer_id, customer_name,
          billing_month, billing_year, amount,
          previous_debt, compensation, total_amount, 
          paid_amount, remaining_amount, status, due_date
        )
        VALUES (
          ${billData.bill_number},
          ${billData.customer_id},
          ${billData.customer_name},
          ${billData.billing_month},
          ${billData.billing_year},
          ${billData.amount},
          ${billData.previous_debt || 0},
          ${billData.compensation || 0},
          ${billData.total_amount},
          ${billData.paid_amount || 0},
          ${billData.remaining_amount || billData.total_amount},
          ${billData.status || 'unpaid'},
          ${billData.due_date}
        )
        RETURNING *
      `;
      
      console.log('🔵 Bill created successfully:', result[0]?.bill_number)
      return { data: result[0], error: null };
    } catch (error) {
      console.error('Error creating bill:', error);
      return { data: null, error: error.message };
    }
  }

  async updateBill(id, billData) {
    try {
      const result = await this.sql`
        UPDATE bills
        SET 
          status = ${billData.status},
          amount = ${billData.amount},
          previous_debt = ${billData.previous_debt || 0},
          compensation = ${billData.compensation || 0},
          total_amount = ${billData.total_amount},
          paid_amount = ${billData.paid_amount || 0},
          remaining_amount = ${billData.remaining_amount || 0},
          payment_date = ${billData.payment_date || null},
          due_date = ${billData.due_date}
        WHERE id = ${id}
        RETURNING *
      `;
      return { data: result[0], error: null };
    } catch (error) {
      console.error('Error updating bill:', error);
      return { data: null, error: error.message };
    }
  }

  async deleteBill(id) {
    try {
      await this.sql`
        DELETE FROM bills 
        WHERE id = ${id}
      `;
      return { data: true, error: null };
    } catch (error) {
      console.error('Error deleting bill:', error);
      return { data: null, error: error.message };
    }
  }

  async deleteAllBills() {
    try {
      await this.sql`DELETE FROM billing_history`;
      await this.sql`DELETE FROM payments`;
      await this.sql`DELETE FROM bills`;
      return { data: true, error: null };
    } catch (error) {
      console.error('Error deleting all bills:', error);
      return { data: null, error: error.message };
    }
  }

  // ==================== PAYMENTS ====================
  
  async getPayments(billId = null) {
    try {
      let payments;
      if (billId) {
        payments = await this.sql`
          SELECT * FROM payments 
          WHERE bill_id = ${billId}
          ORDER BY payment_date DESC
        `;
      } else {
        payments = await this.sql`
          SELECT * FROM payments 
          ORDER BY payment_date DESC
        `;
      }
      return { data: payments, error: null };
    } catch (error) {
      console.error('Error getting payments:', error);
      return { data: null, error: error.message };
    }
  }

  async createPayment(paymentData) {
    try {
      const result = await this.sql`
        INSERT INTO payments (
          bill_id, customer_id, amount,
          payment_method, notes
        )
        VALUES (
          ${paymentData.bill_id},
          ${paymentData.customer_id},
          ${paymentData.amount},
          ${paymentData.payment_method || 'cash'},
          ${paymentData.notes || ''}
        )
        RETURNING *
      `;
      return { data: result[0], error: null };
    } catch (error) {
      console.error('Error creating payment:', error);
      return { data: null, error: error.message };
    }
  }

  // ==================== BILLING HISTORY ====================
  
  async getBillingHistory(customerId = null) {
    try {
      let history;
      if (customerId) {
        history = await this.sql`
          SELECT * FROM billing_history 
          WHERE customer_id = ${customerId}
          ORDER BY created_at DESC
        `;
      } else {
        history = await this.sql`
          SELECT * FROM billing_history 
          ORDER BY created_at DESC
        `;
      }
      return { data: history, error: null };
    } catch (error) {
      console.error('Error getting billing history:', error);
      return { data: null, error: error.message };
    }
  }

  async createBillingHistory(historyData) {
    try {
      const result = await this.sql`
        INSERT INTO billing_history (
          customer_id, bill_id, action, description
        )
        VALUES (
          ${historyData.customer_id},
          ${historyData.bill_id || null},
          ${historyData.action},
          ${historyData.description || ''}
        )
        RETURNING *
      `;
      return { data: result[0], error: null };
    } catch (error) {
      console.error('Error creating billing history:', error);
      return { data: null, error: error.message };
    }
  }
}

// Create singleton instance
const neonStorage = new NeonStorage();
export default neonStorage;
