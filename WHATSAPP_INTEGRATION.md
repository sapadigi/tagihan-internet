# Integrasi WhatsApp dengan WAHA API

## Overview
Sistem Internet Billing ini telah diintegrasikan dengan WAHA (WhatsApp HTTP API) untuk mengirim notifikasi tagihan melalui WhatsApp kepada pelanggan.

## Konfigurasi WAHA
- **Server URL**: https://waha-qwaukuvset8t.brokoli.sumopod.my.id
- **API Key**: XoPxIaKZAexQLhktB6kptPsd1Eg4xR7R
- **Session Name**: Toni

## Fitur WhatsApp

### 1. Pengiriman Tagihan Individual
- Tombol WhatsApp tersedia di setiap baris tagihan
- Hanya muncul jika pelanggan memiliki nomor WhatsApp
- Mengirim detail tagihan lengkap dengan informasi pembayaran

### 2. Pengiriman Massal (Bulk)
- Tombol "Kirim Semua via WhatsApp" di halaman tagihan
- Mengirim tagihan ke semua pelanggan yang memiliki nomor WhatsApp
- Progress bar dan laporan real-time
- Delay otomatis antar pesan (2 detik) untuk menghindari rate limiting

### 3. Halaman Pengaturan WhatsApp
- Monitoring status koneksi WhatsApp
- Scan QR Code untuk menghubungkan akun
- Kontrol session (Start/Stop)
- Petunjuk penggunaan

## Template Pesan

### Template Tagihan
Pesan yang dikirim berisi:
- Informasi pelanggan (nama, ID, nomor HP)
- Detail tagihan (nomor, periode, jatuh tempo)
- Rincian biaya (bulanan, tunggakan jika ada, total)
- Informasi paket internet
- Cara pembayaran (Bank, E-Wallet, bayar langsung)
- Informasi customer service

### Template Pengingat
- Pesan pengingat untuk tagihan yang mendekati jatuh tempo
- Peringatan untuk tagihan yang terlambat
- Informasi kontak customer service

## Cara Penggunaan

### Setup Awal
1. Buka halaman **WhatsApp Settings** dari menu navigasi
2. Pastikan status koneksi menunjukkan status yang sesuai
3. Jika perlu scan QR Code, klik "Tampilkan QR Code" dan scan dengan WhatsApp
4. Tunggu hingga status menjadi "Aktif" (WORKING)

### Mengirim Tagihan Individual
1. Buka halaman **Tagihan**
2. Cari tagihan yang ingin dikirim
3. Klik tombol **WhatsApp** (hijau) di kolom aksi
4. Review preview pesan dan informasi pelanggan
5. Klik **Kirim via WhatsApp**

### Mengirim Tagihan Massal
1. Buka halaman **Tagihan**
2. Klik tombol **Kirim Semua via WhatsApp** di header
3. Review statistik (siap dikirim vs tanpa nomor HP)
4. Pastikan status WhatsApp "Aktif"
5. Klik **Kirim ke X Pelanggan**
6. Monitor progress pengiriman
7. Review laporan hasil pengiriman

## Format Nomor WhatsApp
Sistem secara otomatis memformat nomor telepon Indonesia:
- `08123456789` → `6281234567890@c.us`
- `8123456789` → `6281234567890@c.us`
- `+628123456789` → `6281234567890@c.us`

## Error Handling
- Fallback untuk kasus koneksi terputus
- Validasi nomor WhatsApp sebelum pengiriman
- Laporan detail untuk setiap pengiriman (berhasil/gagal)
- Retry mechanism untuk gagal sementara

## Monitoring dan Troubleshooting

### Status Koneksi
- **WORKING**: WhatsApp siap digunakan ✅
- **SCAN_QR_CODE**: Perlu scan QR code ⚠️
- **STARTING**: Sedang memulai 🔄
- **STOPPED**: Tidak aktif ❌

### Common Issues
1. **QR Code Expired**: Refresh QR code dan scan ulang
2. **Rate Limiting**: Sistem otomatis menambah delay antar pesan
3. **Session Terputus**: Restart session dari halaman pengaturan
4. **Nomor Tidak Valid**: Update nomor pelanggan di data pelanggan

## API Endpoints WAHA Yang Digunakan
- `GET /api/sessions/{session}` - Cek status session
- `POST /api/sendText` - Kirim pesan teks
- `GET /api/sessions/{session}/auth/qr` - Ambil QR code
- `POST /api/sessions/start` - Mulai session
- `POST /api/sessions/stop` - Hentikan session

## Security Notes
- API Key disimpan dalam konfigurasi aplikasi
- Session terisolasi per instance
- Tidak ada data sensitif yang disimpan di server WAHA
- Pesan tidak tersimpan setelah terkirim

## Maintenance
- Monitor status koneksi secara berkala
- Update konfigurasi jika server WAHA berubah
- Backup dan restore session jika diperlukan
- Update template pesan sesuai kebutuhan

## Troubleshooting Guide

### WhatsApp Tidak Terhubung
1. Cek status di halaman WhatsApp Settings
2. Pastikan server WAHA aktif
3. Scan QR code jika diperlukan
4. Restart session jika error

### Pesan Tidak Terkirim
1. Validasi nomor WhatsApp pelanggan
2. Cek quota pengiriman harian
3. Monitor error di console browser
4. Cek koneksi internet

### Performance Issues
1. Batasi jumlah pengiriman massal per batch
2. Sesuaikan delay antar pesan
3. Monitor penggunaan bandwidth
4. Upgrade server jika diperlukan
