# 🔐 Sistem Autentikasi Internet Billing

## Overview
Sistem autentikasi telah ditambahkan untuk melindungi halaman administrasi dan field billing dengan dua tingkat akses yang berbeda.

## 🚀 Cara Akses

### 1. **Halaman Administrasi** (Dashboard, Customers, Billing, dll.)
- **Username:** `admin`
- **Password:** `admin123`
- **Akses:** Semua halaman kecuali field-billing

### 2. **Field Billing** (Penagihan Lapangan)
- **Password:** `field2024`
- **Akses:** Khusus halaman field-billing
- **URL Direct:** `/field-billing`

## 🔧 Fitur Sistem Login

### **Admin Login**
- Proteksi untuk semua halaman admin
- Session disimpan di localStorage
- Tombol logout di header
- Auto-redirect ke login jika belum login

### **Field Billing Protection**
- Password sederhana untuk akses cepat
- Tidak perlu username
- Tombol kunci 🔒 untuk logout
- Session terpisah dari admin

### **Auto-Lock Features**
- Session tersimpan sampai logout manual
- Refresh halaman tidak memerlukan login ulang
- Tombol kunci untuk keamanan tambahan

## 📱 Flow Penggunaan

### **Admin:**
1. Buka browser → otomatis ke halaman login
2. Masukkan `admin` / `admin123`
3. Akses semua halaman admin
4. Logout via header profile

### **Field Agent:**
1. Buka `/field-billing` → halaman unlock
2. Masukkan password `field2024`
3. Akses penagihan lapangan
4. Kunci via tombol 🔒 di header

## 🔒 Keamanan

### **Admin Protection**
- Username & password validation
- Protected routes dengan React Router
- Local storage session management
- Automatic logout tersedia

### **Field Billing Protection**
- Simple password protection
- Quick access untuk field use
- Separate session dari admin
- Easy lock/unlock mechanism

## 🛠️ Technical Implementation

### **Components:**
- `AuthProvider.jsx` - Context untuk autentikasi
- `LoginPage.jsx` - Halaman login admin
- `FieldBillingUnlock.jsx` - Unlock field billing
- `ProtectedRoute.jsx` - Route protection wrapper

### **Auth Context Methods:**
```javascript
const {
  isAuthenticated,           // Admin login status
  isFieldBillingUnlocked,   // Field billing status
  login,                    // Admin login
  logout,                   // Admin logout
  unlockFieldBilling,       // Unlock field billing
  lockFieldBilling          // Lock field billing
} = useAuth();
```

### **Credential Configuration:**
Ubah kredensial di `AuthProvider.jsx`:
```javascript
// Admin credentials
const adminCredentials = {
  username: 'admin',
  password: 'admin123'
};

// Field billing password
const fieldBillingPassword = 'field2024';
```

## 🎯 Route Structure

```
Public Routes:
  /field-billing (dengan password protection)

Protected Routes (perlu admin login):
  /                          → Dashboard
  /administrative-dashboard  → Dashboard
  /customers                → Customers
  /billing                  → Billing
  /cash-management          → Cash Management
  /reports                  → Reports
  /equipment                → Equipment
  /whatsapp-settings        → WhatsApp Settings
```

## 🔄 Session Management

### **localStorage Keys:**
- `billing_auth` - Admin authentication status
- `field_billing_auth` - Field billing unlock status

### **Auto-persist:**
- Login status tersimpan otomatis
- Refresh browser tidak memerlukan login ulang
- Manual logout menghapus session

## 📝 Notes

1. **Development Mode:** Credential di hardcode untuk testing
2. **Production:** Ganti dengan sistem autentikasi yang lebih robust
3. **Field Billing:** Dirancang untuk akses mobile/tablet di lapangan
4. **Admin Panel:** Dirancang untuk akses desktop/web

## 🚨 Keamanan Tambahan

- [ ] Implementasi JWT tokens
- [ ] Password hashing
- [ ] Session timeout
- [ ] Rate limiting
- [ ] 2FA untuk admin
- [ ] Audit logs

---

**Login Admin:** `admin` / `admin123`  
**Field Billing:** Password `field2024`
