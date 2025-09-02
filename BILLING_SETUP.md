# Billing System Setup Guide

## Overview
This guide will help you set up the complete billing system for the Internet Billing application. The system includes automatic bill generation, payment tracking, and debt management.

## Database Setup

### Step 1: Create Database Tables
You need to run the SQL commands from `src/lib/database-schema.sql` in your Supabase SQL editor.

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the entire content from `src/lib/database-schema.sql`
4. Run the SQL commands

This will create the following tables:
- `customers` (already exists)
- `packages` (already exists)
- `bills` - Main billing table
- `payments` - Payment records
- `billing_history` - Bill generation history

### Step 2: Verify Tables
After running the SQL, verify that the following tables exist:
- ✅ customers
- ✅ packages  
- ✅ bills
- ✅ payments
- ✅ billing_history

## Features Overview

### 1. Automatic Bill Generation
- **When**: Automatically runs on the 1st of each month at midnight
- **What**: Creates bills for all active customers
- **Debt Handling**: Automatically adds unpaid amounts from previous month as debt
- **Manual Trigger**: Available through the "Generate Tagihan Bulanan" button

### 2. Payment Management
- **Record Payments**: Support for cash, transfer, card, and e-wallet payments
- **Partial Payments**: Customers can pay in installments
- **Payment History**: Complete audit trail of all payments
- **Automatic Status Updates**: Bills automatically marked as paid when fully settled

### 3. Debt Tracking
- **Automatic Carry-forward**: Unpaid bills become debt in the next month
- **Debt Display**: Previous debt clearly shown on new bills
- **Overdue Management**: Bills automatically marked as overdue after due date

### 4. Status Management
- **Pending**: New bills waiting for payment
- **Paid**: Fully paid bills
- **Overdue**: Bills past due date with remaining balance
- **Cancelled**: Manually cancelled bills

## How to Use

### 1. Initial Setup
1. Make sure you have active customers in the system
2. Run the database schema SQL commands
3. The scheduler will automatically initialize when the app starts

### 2. Generate First Bills
1. Go to the Tagihan (Billing) page
2. Click "Generate Tagihan Bulanan"
3. Select the current month
4. Click "Generate Tagihan"

### 3. Record Payments
1. Find the bill in the billing list
2. Click "Bayar" (Pay) button
3. Enter payment details:
   - Amount (can be partial)
   - Payment method
   - Reference number (for transfers)
   - Notes (optional)
4. Click "Catat Pembayaran"

### 4. View Bill Details
1. Click "Detail" button on any bill
2. View complete bill information including:
   - Customer details
   - Billing period
   - Amount breakdown
   - Payment history

## Automatic Processes

### Daily Maintenance (Runs at Midnight)
1. **Bill Generation Check**: On the 1st of each month, automatically generates bills
2. **Overdue Update**: Updates bill status to "overdue" for bills past due date
3. **Debt Calculation**: Calculates and carries forward unpaid amounts

### Bill Generation Logic
1. Gets all active customers
2. Checks for existing bills for the month (prevents duplicates)
3. Calculates previous month's unpaid amounts
4. Creates new bills with:
   - Monthly package fee
   - Previous debt (if any)
   - Due date (end of month)
   - Unique bill number (BILL-YYYY-MM-XXXX)

## Integration with WAHA API

The system is designed to be integrated with WAHA API for WhatsApp notifications:

### Planned Integration Points
1. **Bill Generation**: Send bill notifications via WhatsApp
2. **Payment Reminders**: Automated reminders before due date
3. **Overdue Notices**: Notifications for overdue bills
4. **Payment Confirmations**: Confirm successful payments

### Implementation Notes
- Add WAHA API configuration to `.env` file
- Create notification service in `src/services/notificationService.js`
- Integrate with billing events (generation, payment, overdue)

## Testing the System

### 1. Test Bill Generation
```javascript
// In browser console or create a test script
import { billingService } from './src/services/billingService';

// Generate bills for current month
const result = await billingService.generateMonthlyBills(new Date().toISOString());
console.log(result);
```

### 2. Test Payment Recording
1. Generate some bills first
2. Use the payment modal to record test payments
3. Verify bill status updates correctly

### 3. Test Debt Carry-forward
1. Create bills for previous month
2. Leave some unpaid
3. Generate bills for current month
4. Verify debt is carried forward

## Troubleshooting

### Common Issues

1. **"Could not find table" Error**
   - Solution: Run the database schema SQL commands in Supabase

2. **Bills Not Generating**
   - Check if customers exist and are active
   - Verify database tables are created
   - Check console for error messages

3. **Scheduler Not Running**
   - Verify `schedulerService.initialize()` is called in App.jsx
   - Check browser console for scheduler logs

4. **Payment Not Recording**
   - Verify bill exists and has remaining amount
   - Check payment amount is valid
   - Ensure database permissions are correct

### Debug Mode
To enable debug logging, uncomment the scheduler initialization in `schedulerService.js`:
```javascript
// Uncomment this line for immediate testing
schedulerService.initialize();
```

## Database Schema Summary

### Bills Table
- `id`: UUID primary key
- `bill_number`: Unique bill number (BILL-YYYY-MM-XXXX)
- `customer_id`: Reference to customer
- `billing_period_start/end`: Billing period dates
- `due_date`: Payment due date
- `amount`: Monthly fee
- `previous_debt`: Debt from previous month
- `total_amount`: amount + previous_debt
- `paid_amount`: Total payments received
- `remaining_amount`: total_amount - paid_amount
- `status`: pending/paid/overdue/cancelled

### Payments Table
- `id`: UUID primary key
- `payment_number`: Unique payment number (PAY-YYYY-MM-XXXX)
- `bill_id`: Reference to bill
- `customer_id`: Reference to customer
- `amount`: Payment amount
- `payment_method`: cash/transfer/card/ewallet
- `payment_date`: When payment was made
- `reference_number`: Bank reference (for transfers)

## Next Steps

1. **Run Database Setup**: Execute the SQL schema
2. **Test Bill Generation**: Create your first bills
3. **Test Payments**: Record some test payments
4. **Integrate WAHA API**: Add WhatsApp notifications
5. **Customize**: Adjust business rules as needed

The billing system is now ready for production use!