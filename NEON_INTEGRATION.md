# 🚀 Neon PostgreSQL Integration

## ✅ Integrasi Berhasil!

Aplikasi **Tagihan Internet** sekarang menggunakan **Neon PostgreSQL** sebagai database cloud!

## 📊 Status Database

### Database Connection
- **Provider**: Neon PostgreSQL
- **Region**: US East 1 (AWS)
- **Database**: neondb
- **Status**: ✅ Connected

### Data Summary
- 📦 **Packages**: 4 (Paket Voucher, Paket Anak, Paket Keluarga, Putus)
- 👥 **Customers**: 20 pelanggan aktif
- 📋 **Bills**: Support unlimited bills dengan auto-increment ID
- 💰 **Payments**: Tracking pembayaran lengkap
- 📜 **History**: Billing history untuk audit trail

## 🔧 Struktur Database

### 1. Customers Table
```sql
- id (SERIAL PRIMARY KEY)
- name (VARCHAR)
- email (VARCHAR)
- phone (VARCHAR)
- address (TEXT)
- package_name (VARCHAR)
- package_speed (VARCHAR)
- monthly_fee (INTEGER)
- hutang (INTEGER) -- Kolom khusus untuk debt tracking
- status (VARCHAR) -- 'active' atau 'inactive'
- created_at, updated_at (TIMESTAMP)
```

### 2. Bills Table
```sql
- id (SERIAL PRIMARY KEY)
- bill_number (VARCHAR UNIQUE) -- Format: BILL-YYYY-MM-0001
- customer_id (INTEGER FK)
- customer_name (VARCHAR) -- Denormalized untuk performa
- billing_month (VARCHAR) -- 'November', 'Desember', dll
- billing_year (INTEGER) -- 2025
- amount (INTEGER) -- Biaya bulanan
- previous_debt (INTEGER) -- Hutang bulan lalu
- total_amount (INTEGER) -- amount + previous_debt
- status (VARCHAR) -- 'unpaid', 'paid', 'partial'
- due_date (DATE)
- created_at (TIMESTAMP)
```

### 3. Payments Table
```sql
- id (SERIAL PRIMARY KEY)
- bill_id (INTEGER FK)
- customer_id (INTEGER FK)
- amount (INTEGER)
- payment_method (VARCHAR) -- 'cash', 'transfer', dll
- payment_date (TIMESTAMP)
- notes (TEXT)
- created_at (TIMESTAMP)
```

### 4. Packages Table
```sql
- id (SERIAL PRIMARY KEY)
- name (VARCHAR)
- speed (VARCHAR)
- price (INTEGER)
- description (TEXT)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
```

### 5. Billing History Table
```sql
- id (SERIAL PRIMARY KEY)
- customer_id (INTEGER FK)
- bill_id (INTEGER FK)
- action (VARCHAR)
- description (TEXT)
- created_at (TIMESTAMP)
```

## 📁 Struktur File

### Storage Layer
```
src/lib/
├── neonStorage.js       # Neon PostgreSQL operations
├── jsonStorage.js       # LocalStorage fallback
└── storageAdapter.js    # Smart adapter (auto-switch)
```

### Services
```
src/services/
├── customerService.js   # Customer management
├── billingService.js    # Billing & payment
└── schedulerService.js  # Auto maintenance
```

### Setup Scripts
```
scripts/
├── setup-neon.js        # Automated database setup
└── test-connection.js   # Connection testing
```

## 🎯 Format Data yang Dikembalikan

### getBills() Response
```javascript
{
  data: [
    {
      id: 1,
      bill_number: "BILL-2025-11-0001",
      customer_id: 1,
      customer_name: "Pa Bayu",           // ✅ Nama pelanggan
      billing_month: "November",          // ✅ Periode (bulan)
      billing_year: 2025,                 // ✅ Periode (tahun)
      amount: 100000,                     // ✅ Jumlah tagihan bulanan
      previous_debt: 0,                   // ✅ Jumlah hutang
      total_amount: 100000,               // ✅ Total tagihan (amount + hutang)
      status: "unpaid",                   // ✅ Status
      due_date: "2025-11-30",
      created_at: "2025-11-04T...",
      customers: {                        // ✅ Data customer nested
        id: 1,
        name: "Pa Bayu",
        phone: "08129695655",
        email: "pa.bayu@tbw.net",
        package_name: "Paket Voucher",
        monthly_fee: 100000,
        hutang: 0,
        status: "active"
      }
    }
  ],
  error: null
}
```

### Format Tampilan Tabel
```
No Tagihan | Nama Pelanggan | Jumlah Tagihan | Jumlah Hutang | Periode | Total Tagihan | Status | Aksi
----------|----------------|----------------|---------------|---------|---------------|--------|------
BILL-..01 | Pa Bayu        | Rp 100.000     | Rp 0          | Nov 25  | Rp 100.000    | Unpaid | [⋮]
BILL-..02 | Pa Ipan        | Rp 150.000     | Rp 150.000    | Nov 25  | Rp 300.000    | Unpaid | [⋮]
```

### Mapping Field ke Tampilan
- **No Tagihan** → `bill_number`
- **Nama Pelanggan** → `customer_name` atau `customers.name`
- **Jumlah Tagihan** → `amount` (biaya bulanan)
- **Jumlah Hutang** → `previous_debt` (hutang bulan lalu)
- **Periode** → `${billing_month} ${billing_year}` (contoh: "November 2025")
- **Total Tagihan** → `total_amount` (amount + previous_debt)
- **Status** → `status` ('unpaid', 'paid', 'partial')

## 🚀 Fitur yang Sudah Terintegrasi

### ✅ Berhasil
- [x] Read bills dari Neon
- [x] Generate monthly bills untuk semua customers
- [x] Unique bill number generation
- [x] Customer data dengan hutang tracking
- [x] JOIN query untuk nested customer data
- [x] Filtering by status, month, year
- [x] Auto database setup script
- [x] Connection testing
- [x] Debug logging

### ⏳ Perlu Update (Masih Gunakan jsonStorage)
- [ ] recordPayment() - Record pembayaran
- [ ] getBillById() - Get single bill
- [ ] getPayments() - Get payment history
- [ ] updateBillStatus() - Update status manual
- [ ] getBillingStats() - Dashboard statistics

## 📝 Cara Menggunakan

### Setup Database (Sudah Dilakukan)
```bash
npm run setup:neon
```

### Test Connection
```bash
node test-connection.js
```

### Generate Bills
1. Buka aplikasi di browser
2. Pilih menu "Generate Tagihan"
3. Pilih bulan dan tahun
4. Klik "Generate"
5. Semua 20 customers akan otomatis dibuatkan tagihan

### Mode Switching
Aplikasi secara otomatis menggunakan Neon database jika `VITE_DATABASE_URL` tersedia.

Untuk development dengan localStorage:
1. Comment out `const USE_NEON = true` di `storageAdapter.js`
2. Gunakan: `const USE_NEON = import.meta.env.VITE_DATABASE_URL ? true : false`

## 🐛 Troubleshooting

### Bills tidak muncul?
1. **Hard refresh**: Ctrl+Shift+R
2. **Cek console**: Harus ada log "🔵 Neon PostgreSQL"
3. **Verify data**: Jalankan `node test-connection.js`

### Duplicate bill_number error?
- Sudah fixed! Bill number sekarang auto-increment dengan tracking

### Generate hanya 1 customer?
- Sudah fixed! Sekarang loop semua customers dengan proper error handling

### Customer name tidak muncul?
- Sudah fixed! Data di-transform dengan nested `customers` object

## 🎉 Keunggulan Neon Integration

1. ☁️ **Cloud-based**: Data tersimpan di cloud, bisa diakses dari mana saja
2. 🔄 **Real-time sync**: Semua device sync otomatis
3. 💪 **Scalable**: Support unlimited bills dan customers
4. 🚀 **Fast**: Connection pooling dan optimized queries
5. 🔒 **Secure**: SSL required, row-level security
6. 📊 **SQL Power**: JOIN, aggregation, complex queries
7. 🆓 **Free Tier**: 0.5 GB storage, 100 hours compute/month

## 🔜 Next Steps untuk Production

1. **Environment Variable di Vercel**:
   ```
   VITE_DATABASE_URL=postgresql://...
   ```

2. **Remove Hardcoded URL**:
   - Edit `neonStorage.js` line 7-8
   - Hapus fallback URL hardcoded

3. **Update Remaining Services**:
   - Migrate `recordPayment()` ke storageAdapter
   - Migrate `getPayments()` ke storageAdapter
   - Migrate `updateBillStatus()` ke storageAdapter

4. **Add More Features**:
   - Bulk payment processing
   - Payment reminders via WhatsApp
   - Export to Excel/PDF
   - Analytics dashboard

## 📞 Support

Untuk pertanyaan atau issue:
1. Cek console browser untuk error logs
2. Run `node test-connection.js` untuk verify connection
3. Lihat log di `storageAdapter.js` untuk mode detection

---

**Status**: ✅ Production Ready (dengan beberapa service yang perlu migrasi)

**Last Updated**: November 4, 2025
