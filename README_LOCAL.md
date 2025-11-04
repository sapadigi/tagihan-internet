# Aplikasi Tagihan Internet - Versi Lokal

🎉 **Aplikasi ini sekarang 100% berjalan tanpa database eksternal!**

Sistem billing internet yang lengkap dengan penyimpanan data menggunakan **JSON Local Storage** (localStorage browser).

## ✨ Fitur Utama

- 📊 **Dashboard Admin** - Overview lengkap billing dan pelanggan
- 👥 **Manajemen Pelanggan** - CRUD customer dengan filter & search
- 💰 **Billing & Tagihan** - Generate tagihan bulanan otomatis
- 💳 **Payment Processing** - Catat pembayaran dengan berbagai metode
- 📱 **WhatsApp Integration** - Notifikasi otomatis via WhatsApp
- 📈 **Reports & Analytics** - Laporan keuangan dan statistik
- 💾 **Export/Import Data** - Backup dan restore data dengan mudah
- 🔄 **Auto Billing** - Generate tagihan otomatis setiap bulan

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/sapadigi/tagihan-internet
cd tagihan-internet
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Jalankan Aplikasi
```bash
npm start
```

Aplikasi akan berjalan di `http://localhost:5173`

## 💾 Database Lokal

Aplikasi ini menggunakan **localStorage** untuk menyimpan data. Tidak perlu setup database!

### Data Sample

Untuk memulai dengan data contoh:

1. Buka Console Browser (F12)
2. Copy isi dari file `sample-data.json`
3. Jalankan:
```javascript
const sampleData = { /* paste data dari sample-data.json */ };
localStorage.setItem('internet_billing_data', JSON.stringify(sampleData));
window.location.reload();
```

### Backup & Restore

**Export Data (Backup):**
```javascript
import jsonStorage from './src/lib/jsonStorage.js'
jsonStorage.exportToJSON()
```

**Import Data (Restore):**
```javascript
import jsonStorage from './src/lib/jsonStorage.js'
const data = { /* data dari file backup */ }
jsonStorage.importFromJSON(data)
```

## 📁 Struktur Project

```
tagihan-internet/
├── src/
│   ├── lib/
│   │   └── jsonStorage.js       # Storage engine lokal
│   ├── services/
│   │   ├── customerService.js   # Service manajemen pelanggan
│   │   ├── billingService.js    # Service billing & payment
│   │   ├── wahaService.js       # WhatsApp integration
│   │   └── schedulerService.js  # Auto billing scheduler
│   ├── pages/                   # Halaman-halaman aplikasi
│   └── components/              # Komponen UI
├── sample-data.json             # Data contoh
├── JSON_DATABASE_GUIDE.md       # Dokumentasi database lokal
└── MIGRATION_COMPLETE.md        # Info migrasi dari Supabase
```

## 🔧 Teknologi

- **React** - UI Framework
- **Vite** - Build Tool
- **TailwindCSS** - Styling
- **LocalStorage** - Data Storage
- **WAHA API** - WhatsApp Integration

## 📚 Dokumentasi

- **JSON_DATABASE_GUIDE.md** - Panduan lengkap database lokal
- **MIGRATION_COMPLETE.md** - Info migrasi dari Supabase
- **BILLING_SETUP.md** - Setup billing system
- **WHATSAPP_INTEGRATION.md** - Setup WhatsApp notifications

## ⚠️ Catatan Penting

### Storage & Backup
- Data disimpan di localStorage browser (5-10MB limit)
- Data hanya ada di browser yang digunakan
- **PENTING:** Export data secara berkala untuk backup
- Data akan hilang jika clear browser data

### Browser Compatibility
- Chrome/Edge: ✅ Fully Supported
- Firefox: ✅ Fully Supported
- Safari: ✅ Fully Supported
- Mobile Browser: ⚠️ Limited (storage terbatas)

## 🎯 Keuntungan Versi Lokal

✅ **Gratis 100%** - Tidak ada biaya database
✅ **Offline First** - Berjalan tanpa internet
✅ **Setup Mudah** - Tidak perlu konfigurasi database
✅ **Cepat** - Data langsung di browser
✅ **Portable** - Export/import antar browser

## 🔐 Keamanan

- Data tersimpan lokal di browser pengguna
- Tidak ada transmisi data ke server eksternal (kecuali WhatsApp API)
- Disarankan untuk backup data secara teratur

## 🐛 Troubleshooting

### Data tidak tersimpan?
- Pastikan localStorage enabled di browser settings
- Jangan gunakan mode Incognito untuk data permanen
- Cek Console (F12) untuk error messages

### Ingin pindah komputer/browser?
1. Export data dari browser lama
2. Simpan file JSON
3. Import ke browser baru

### Storage penuh?
1. Export data untuk backup
2. Clear data lama yang tidak diperlukan
3. Hapus billing history tahun sebelumnya

## 📞 Support

Jika ada pertanyaan atau masalah:
- Buka issue di GitHub
- Email: support@example.com

## 📄 License

MIT License - Free to use and modify

---

**Dibuat dengan ❤️ untuk memudahkan pengelolaan tagihan internet**

Happy Billing! 🎉
