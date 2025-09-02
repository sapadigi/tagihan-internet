import { billingService } from './billingService';

// Scheduler service for automatic bill generation
export const schedulerService = {
  // Check if bills should be generated today
  shouldGenerateBills() {
    const today = new Date();
    const dayOfMonth = today.getDate();
    
    // Generate bills on the 1st of each month
    return dayOfMonth === 1;
  },

  // Get the current billing month
  getCurrentBillingMonth() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // 0-based month
    
    return new Date(year, month, 1);
  },

  // Check if bills have already been generated for current month
  async billsAlreadyGenerated() {
    try {
      const billingMonth = this.getCurrentBillingMonth();
      const { data: bills, error } = await billingService.getBills({
        billing_month: billingMonth.toISOString().split('T')[0].substring(0, 7) // YYYY-MM format
      });

      if (error) {
        console.error('Error checking existing bills:', error);
        return false;
      }

      return bills && bills.length > 0;
    } catch (err) {
      console.error('Error checking existing bills:', err);
      return false;
    }
  },

  // Automatically generate bills if conditions are met
  async autoGenerateBills() {
    try {
      console.log('🔄 Checking if bills should be auto-generated...');

      // Check if today is the 1st of the month
      if (!this.shouldGenerateBills()) {
        console.log('📅 Not the 1st of the month, skipping auto-generation');
        return { success: false, message: 'Not the 1st of the month' };
      }

      // Check if bills have already been generated for this month
      const alreadyGenerated = await this.billsAlreadyGenerated();
      if (alreadyGenerated) {
        console.log('✅ Bills already generated for this month');
        return { success: false, message: 'Bills already generated for this month' };
      }

      console.log('🚀 Auto-generating bills for current month...');
      
      const billingMonth = this.getCurrentBillingMonth();
      const { data, error } = await billingService.generateMonthlyBills(billingMonth.toISOString());

      if (error) {
        console.error('❌ Auto-generation failed:', error);
        return { success: false, error };
      }

      console.log('✅ Auto-generation successful:', data);
      return { success: true, data };
    } catch (err) {
      console.error('❌ Auto-generation error:', err);
      return { success: false, error: err.message };
    }
  },

  // Update overdue bills status
  async updateOverdueBills() {
    try {
      console.log('🔄 Updating overdue bills status...');
      
      const today = new Date().toISOString().split('T')[0];
      
      // Get all pending bills that are past due date
      const { data: bills, error } = await billingService.getBills({
        status: 'pending'
      });

      if (error) {
        console.error('Error fetching pending bills:', error);
        return { success: false, error };
      }

      if (!bills || bills.length === 0) {
        console.log('📋 No pending bills to check');
        return { success: true, message: 'No pending bills to check' };
      }

      let updatedCount = 0;
      
      for (const bill of bills) {
        if (bill.due_date < today && bill.remaining_amount > 0) {
          const { error: updateError } = await billingService.updateBillStatus(
            bill.id, 
            'overdue', 
            `Automatically marked as overdue on ${today}`
          );
          
          if (updateError) {
            console.error(`Failed to update bill ${bill.bill_number}:`, updateError);
          } else {
            updatedCount++;
            console.log(`📋 Bill ${bill.bill_number} marked as overdue`);
          }
        }
      }

      console.log(`✅ Updated ${updatedCount} bills to overdue status`);
      return { success: true, updatedCount };
    } catch (err) {
      console.error('❌ Error updating overdue bills:', err);
      return { success: false, error: err.message };
    }
  },

  // Run daily maintenance tasks
  async runDailyMaintenance() {
    console.log('🔧 Running daily maintenance tasks...');
    
    const results = {
      billGeneration: null,
      overdueUpdate: null
    };

    // Try to auto-generate bills
    results.billGeneration = await this.autoGenerateBills();
    
    // Update overdue bills
    results.overdueUpdate = await this.updateOverdueBills();

    console.log('✅ Daily maintenance completed:', results);
    return results;
  },

  // Initialize scheduler (call this when app starts)
  initialize() {
    console.log('🚀 Initializing billing scheduler...');
    
    // Run maintenance immediately on startup
    this.runDailyMaintenance();
    
    // Set up daily maintenance at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Set to midnight
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    // Schedule first run at midnight
    setTimeout(() => {
      this.runDailyMaintenance();
      
      // Then run every 24 hours
      setInterval(() => {
        this.runDailyMaintenance();
      }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
      
    }, msUntilMidnight);
    
    console.log(`⏰ Scheduler initialized. Next run in ${Math.round(msUntilMidnight / 1000 / 60)} minutes`);
  },

  // Manual trigger for testing
  async manualTrigger() {
    console.log('🔧 Manual trigger activated');
    return await this.runDailyMaintenance();
  }
};

// Auto-initialize when module is imported (for production)
// Comment this out during development if you don't want auto-scheduling
// schedulerService.initialize();