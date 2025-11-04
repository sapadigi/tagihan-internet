# Database Local JSON - Dokumentasi

## Overview
Aplikasi ini sekarang menggunakan **localStorage** sebagai database lokal, menggantikan Supabase. Semua data disimpan di browser menggunakan localStorage dengan format JSON.

## Keuntungan Menggunakan JSON Storage Lokal

✅ **Tidak Perlu Database Eksternal** - Aplikasi berjalan sepenuhnya offline
✅ **Setup Mudah** - Tidak perlu konfigurasi database
✅ **Gratis** - Tidak ada biaya langganan database
✅ **Cepat** - Data disimpan langsung di browser
✅ **Portable** - Data bisa di-export/import dengan mudah

## Struktur Data

Semua data disimpan di localStorage dengan key: `internet_billing_data`

### Tabel/Koleksi Data:

1. **customers** - Data pelanggan
   - id, customer_id, name, email, phone, address
   - package_name, package_speed, monthly_fee
   - status, join_date, hutang, created_at

2. **packages** - Paket internet
   - id, name, speed, price, description
   - is_active, created_at

3. **bills** - Tagihan
   - id, bill_number, customer_id
   - billing_period_start, billing_period_end, due_date
   - amount, previous_debt, total_amount, remaining_amount, paid_amount
   - status, payment_date, notes, created_at

4. **payments** - Pembayaran
   - id, payment_number, bill_id, customer_id
   - amount, payment_method, payment_date
   - reference_number, notes, created_by, created_at

5. **billing_history** - Riwayat billing
   - id, billing_month, total_customers
   - total_bills_generated, total_amount
   - status, created_at

## Cara Menggunakan

### 1. Menjalankan Aplikasi

```bash
# Install dependencies (tanpa Supabase)
npm install

# Jalankan aplikasi
npm start
```

### 2. Import Data Sample

Aplikasi akan otomatis membuat data sample saat pertama kali dijalankan. Anda juga bisa import data dari file JSON.

**Cara import data:**
1. Buka Console Browser (F12)
2. Jalankan command:
```javascript
import jsonStorage from './src/lib/jsonStorage.js'
jsonStorage.importFromJSON(dataJSON)
```

### 3. Export Data

**Untuk backup data:**
```javascript
import jsonStorage from './src/lib/jsonStorage.js'
jsonStorage.exportToJSON()
```

File JSON akan otomatis ter-download dengan nama `billing-data-YYYY-MM-DD.json`

### 4. Clear All Data

**Untuk reset semua data:**
```javascript
import jsonStorage from './src/lib/jsonStorage.js'
jsonStorage.clearAllData()
```

## Migrasi dari Supabase

### Perubahan File:

1. **src/lib/supabase.js** → **src/lib/jsonStorage.js**
   - Mengganti Supabase client dengan localStorage wrapper

2. **src/services/customerService.js**
   - Update semua fungsi untuk menggunakan jsonStorage
   - Tidak perlu async query builder

3. **src/services/billingService.js**
   - Update semua fungsi untuk menggunakan jsonStorage
   - Generate ID dan nomor secara lokal

4. **.env**
   - Hapus VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY

5. **package.json**
   - Hapus dependency @supabase/supabase-js

## Batasan

⚠️ **LocalStorage Limit**: Browser memiliki limit ~5-10MB untuk localStorage
⚠️ **Data Per Browser**: Data hanya tersimpan di browser yang digunakan
⚠️ **Backup Manual**: Perlu export data secara berkala untuk backup

## Tips

💡 Export data secara berkala untuk backup
💡 Gunakan Export/Import untuk pindah browser
💡 Data akan hilang jika clear browser data
💡 Gunakan mode Incognito untuk testing tanpa menghapus data utama

## API Service

### jsonStorage Methods:

```javascript
// SELECT
const customers = jsonStorage.select('customers')
const activeCustomers = jsonStorage.select('customers', { 
  filters: { status: 'active' } 
})

// INSERT
const newCustomer = jsonStorage.insert('customers', {
  name: 'John Doe',
  email: 'john@example.com'
})

// UPDATE
jsonStorage.update('customers', customerId, {
  status: 'active'
})

// DELETE
jsonStorage.delete('customers', customerId)

// EXPORT/IMPORT
jsonStorage.exportToJSON()
jsonStorage.importFromJSON(jsonData)
```

## Troubleshooting

### Data Tidak Tersimpan?
- Cek apakah localStorage diaktifkan di browser
- Cek Console untuk error messages
- Pastikan tidak ada mode Private/Incognito

### Data Hilang?
- Data di localStorage bisa hilang jika clear browser data
- Selalu export data untuk backup
- Restore dari file backup dengan importFromJSON()

### Storage Penuh?
- Export dan clear old data
- Hapus billing history yang sudah lama
- Compress data dengan menghapus field yang tidak perlu

## Support

Jika ada masalah atau pertanyaan, silakan buka issue di GitHub repository.
