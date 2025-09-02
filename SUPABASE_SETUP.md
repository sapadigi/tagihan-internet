# Supabase Integration Setup Guide

## Overview
This guide will help you set up Supabase database integration for the Internet Billing Admin application's customer data management.

## Prerequisites
- Supabase account (create at [supabase.com](https://supabase.com))
- Node.js and npm installed
- Internet Billing Admin application

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `internet-billing-db` (or your preferred name)
   - Database Password: Create a strong password
   - Region: Choose closest to your location
5. Click "Create new project"
6. Wait for the project to be set up (usually takes 2-3 minutes)

## Step 2: Get Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Project API Key** (anon/public key)

## Step 3: Configure Environment Variables

1. Open your `.env` file in the project root
2. Update the Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace `your-project-id` and `your-anon-key-here` with your actual values from Step 2.

## Step 4: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the entire content from [`src/lib/database-schema.sql`](src/lib/database-schema.sql)
4. Click "Run" to execute the SQL commands

This will create:
- `customers` table with all necessary fields
- `packages` table with sample internet packages
- Automatic customer ID generation (CUST-001, CUST-002, etc.)
- Row Level Security policies
- Triggers for automatic timestamps

## Step 5: Verify Database Setup

1. Go to **Table Editor** in your Supabase dashboard
2. You should see two tables:
   - `customers` (empty initially)
   - `packages` (with 5 sample packages)

## Step 6: Test the Integration

1. Start your development server:
```bash
npm start
```

2. Navigate to the Customers page in your application
3. Try the following operations:
   - **View customers**: Should show empty state initially
   - **Add customer**: Click "Tambah Pelanggan Baru" and fill the form
   - **Edit customer**: Click "Edit" on any customer row
   - **Change status**: Use the status dropdown in the table
   - **Delete customer**: Click "Hapus" on any customer row
   - **Search/Filter**: Use the search and filter controls

## Database Schema Details

### Customers Table
- `id`: UUID primary key
- `customer_id`: Auto-generated unique ID (CUST-001, CUST-002, etc.)
- `name`: Customer name
- `email`: Customer email (unique)
- `phone`: Phone number
- `address`: Full address
- `package_name`: Internet package name
- `package_speed`: Package speed (e.g., "100 Mbps")
- `status`: active | suspended | terminated
- `monthly_fee`: Monthly subscription fee in IDR
- `join_date`: Date customer joined
- `created_at`, `updated_at`: Automatic timestamps

### Packages Table
- `id`: UUID primary key
- `name`: Package name
- `speed`: Package speed
- `price`: Package price in IDR
- `description`: Package description
- `is_active`: Whether package is available
- `created_at`: Creation timestamp

## API Functions Available

The application includes comprehensive service functions in [`src/services/customerService.js`](src/services/customerService.js):

### Customer Operations
- `getCustomers(filters)` - Get all customers with optional search/status filters
- `getCustomerById(id)` - Get single customer
- `createCustomer(data)` - Create new customer
- `updateCustomer(id, data)` - Update existing customer
- `deleteCustomer(id)` - Delete customer
- `updateCustomerStatus(id, status)` - Update customer status only
- `getCustomerStats()` - Get customer statistics

### Package Operations
- `getPackages()` - Get all active packages

## Security Notes

1. **Row Level Security (RLS)** is enabled on both tables
2. Current policies allow all operations for development
3. For production, you should:
   - Implement proper authentication
   - Restrict policies based on user roles
   - Add additional validation rules

## Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables" error**
   - Check your `.env` file has correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
   - Restart your development server after updating .env

2. **Database connection errors**
   - Verify your Supabase project is active
   - Check if your API key is correct
   - Ensure your project URL is correct

3. **SQL execution errors**
   - Make sure you ran the complete schema from `database-schema.sql`
   - Check the SQL Editor for any error messages
   - Verify all tables were created successfully

4. **Form submission errors**
   - Check browser console for detailed error messages
   - Verify all required fields are filled
   - Ensure email format is valid

### Getting Help

1. Check the browser console for detailed error messages
2. Review the Supabase dashboard logs
3. Verify your database schema matches the expected structure
4. Test API calls directly in the Supabase API docs

## Next Steps

After successful setup, you can:

1. **Customize the schema**: Add more fields to customers table as needed
2. **Add more packages**: Insert additional internet packages in the packages table
3. **Implement authentication**: Add user login/registration
4. **Add billing features**: Create billing records linked to customers
5. **Add reporting**: Create reports and analytics based on customer data

## File Structure

```
src/
├── lib/
│   ├── supabase.js              # Supabase client configuration
│   └── database-schema.sql      # Database schema and sample data
├── services/
│   └── customerService.js       # API service functions
├── components/
│   └── CustomerForm.jsx         # Customer add/edit form component
└── pages/
    └── customers/
        └── index.jsx            # Main customers page
```

This integration provides a complete customer management system with real-time data persistence using Supabase as the backend database.