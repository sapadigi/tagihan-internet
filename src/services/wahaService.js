// WAHA API Service for WhatsApp Integration
const WAHA_CONFIG = {
  baseUrl: 'https://waha-qwaukuvset8t.brokoli.sumopod.my.id',
  apiKey: 'XoPxIaKZAexQLhktB6kptPsd1Eg4xR7R',
  session: 'Toni'
}

export const wahaService = {
  // Helper function to make API calls
  async makeRequest(endpoint, method = 'GET', data = null) {
    try {
      const url = `${WAHA_CONFIG.baseUrl}${endpoint}`
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': WAHA_CONFIG.apiKey
        }
      }

      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data)
      }

      const response = await fetch(url, options)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      return { data: result, error: null }
    } catch (error) {
      console.error('WAHA API Error:', error)
      return { data: null, error: error.message }
    }
  },

  // Check if WhatsApp session is ready
  async getSessionStatus() {
    return await this.makeRequest(`/api/sessions/${WAHA_CONFIG.session}`)
  },

  // Send text message
  async sendMessage(chatId, text) {
    const endpoint = `/api/sendText`
    const data = {
      session: WAHA_CONFIG.session,
      chatId: chatId,
      text: text
    }
    return await this.makeRequest(endpoint, 'POST', data)
  },

  // Send image message
  async sendImage(chatId, imageUrl, caption = '') {
    const endpoint = `/api/sendImage`
    const data = {
      session: WAHA_CONFIG.session,
      chatId: chatId,
      file: {
        url: imageUrl
      },
      caption: caption
    }
    return await this.makeRequest(endpoint, 'POST', data)
  },

  // Send document/file
  async sendDocument(chatId, fileUrl, filename, caption = '') {
    const endpoint = `/api/sendFile`
    const data = {
      session: WAHA_CONFIG.session,
      chatId: chatId,
      file: {
        url: fileUrl,
        filename: filename
      },
      caption: caption
    }
    return await this.makeRequest(endpoint, 'POST', data)
  },

  // Format phone number for WhatsApp (Indonesian format)
  formatPhoneNumber(phone) {
    if (!phone) return null
    
    // Remove all non-numeric characters
    let cleanPhone = phone.replace(/\D/g, '')
    
    // Handle Indonesian numbers
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.substring(1)
    } else if (cleanPhone.startsWith('8')) {
      cleanPhone = '62' + cleanPhone
    } else if (!cleanPhone.startsWith('62')) {
      cleanPhone = '62' + cleanPhone
    }
    
    return cleanPhone + '@c.us'
  },

  // Generate payment confirmation message
  generatePaymentConfirmationMessage(payment, bill, customer) {
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(amount || 0)
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const formatDateTime = (dateString) => {
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const paymentMethod = {
      'cash': 'Tunai',
      'transfer': 'Transfer Bank',
      'card': 'Kartu Debit/Kredit',
      'ewallet': 'E-Wallet'
    }

    const message = `
✅ *Konfirmasi Pembayaran* ✅

👤 Pelanggan Yth. ${customer.name}
📞 *No. HP:* ${customer.phone || '-'}

💸 Jumlah yang Dibayar: ${formatCurrency(payment.amount)}
🕔 Status: *Lunas*

📅 Tanggal Pembayaran: ${bill.payment_date || new Date().toLocaleDateString('id-ID')}

Terima kasih telah melakukan pembayaran 🙏
Layanan internet Anda tetap aktif seperti biasa.

_Pesan ini dikirim otomatis oleh Bot_
`.trim()


    return message
  },

  // Generate bill message template
  generateBillMessage(bill, customer) {
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(amount || 0)
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const message = `
🔔 *Informasi Tagihan Internet* 🔔

👤 Pelanggan Yth. ${customer.name}
📞 *No. HP:* ${customer.phone || '-'}
💸 Jumlah Tagihan: ${formatCurrency(bill.amount)}
💸 Tagihan Sebelumnya: ${formatCurrency(customer.hutang || 0)}
${bill.compensation && bill.compensation > 0 ? `💰 Kompensasi Gangguan: -${formatCurrency(bill.compensation)}\n` : ''}💸 Total Tagihan: ${formatCurrency(bill.total_amount || (bill.amount + (customer.hutang || 0)))}
🕔 Status Pembayaran: ${bill.status === 'paid' ? 'Lunas' : 'Belum Lunas'}

💡 *Cara Pembayaran:*
1. Transfer ke *Dana* 0851 7991 5187 a/n Toni Setiawan
2. Bayar langsung hub. *Sigit*
📌 *Note:* Jangan lupa kirimkan bukti pembayaran

Terima kasih telah menggunakan layanan kami! 🙏
Jika ada pertanyaan, hubungi kami di WhatsApp.

_Pesan ini dikirim otomatis oleh Bot_
`.trim()


    return message
  },

  // Generate payment reminder message
  generateReminderMessage(bill, customer, daysOverdue = 0) {
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(amount || 0)
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    let reminderText = ''
    if (daysOverdue > 0) {
      reminderText = `⚠️ *PERINGATAN TUNGGAKAN* ⚠️\n\nTagihan Anda sudah terlambat ${daysOverdue} hari!`
    } else {
      reminderText = `🔔 *PENGINGAT TAGIHAN*\n\nTagihan Anda akan jatuh tempo dalam beberapa hari.`
    }

    const message = `
${reminderText}

👤 *Pelanggan:* ${customer.name}
🆔 *ID:* ${customer.customer_id}

📋 *Detail Tagihan:*
• Nomor: ${bill.bill_number}
• Jatuh Tempo: ${formatDate(bill.due_date)}
• *Total: ${formatCurrency(bill.remaining_amount)}*

${daysOverdue > 0 ? 
  '⚠️ Segera lakukan pembayaran untuk menghindari pemutusan layanan.' : 
  '💡 Bayar sekarang untuk menghindari keterlambatan.'
}

📞 *Hubungi kami:*
WA: 08123456789

Terima kasih! 🙏
`.trim()

    return message
  },

  // Send payment confirmation to customer
  async sendPaymentConfirmation(payment, bill, customer) {
    try {
      const chatId = this.formatPhoneNumber(customer.phone)
      if (!chatId) {
        return { success: false, error: 'Nomor telepon tidak valid' }
      }

      // Check session status first
      const { data: sessionStatus, error: sessionError } = await this.getSessionStatus()
      if (sessionError) {
        return { success: false, error: `Session error: ${sessionError}` }
      }

      if (sessionStatus?.status !== 'WORKING') {
        return { success: false, error: 'WhatsApp session tidak aktif' }
      }

      // Generate and send payment confirmation message
      const message = this.generatePaymentConfirmationMessage(payment, bill, customer)
      const { data, error } = await this.sendMessage(chatId, message)

      if (error) {
        return { success: false, error }
      }

      return { success: true, data, messageId: data?.id }
    } catch (error) {
      console.error('Error sending payment confirmation:', error)
      return { success: false, error: error.message }
    }
  },

  // Send bill notification to customer
  async sendBillNotification(bill, customer) {
    try {
      const chatId = this.formatPhoneNumber(customer.phone)
      if (!chatId) {
        return { success: false, error: 'Nomor telepon tidak valid' }
      }

      // Check session status first
      const { data: sessionStatus, error: sessionError } = await this.getSessionStatus()
      if (sessionError) {
        return { success: false, error: `Session error: ${sessionError}` }
      }

      if (sessionStatus?.status !== 'WORKING') {
        return { success: false, error: 'WhatsApp session tidak aktif' }
      }

      // Generate and send message
      const message = this.generateBillMessage(bill, customer)
      const { data, error } = await this.sendMessage(chatId, message)

      if (error) {
        return { success: false, error }
      }

      return { success: true, data, messageId: data?.id }
    } catch (error) {
      console.error('Error sending bill notification:', error)
      return { success: false, error: error.message }
    }
  },

  // Send payment reminder
  async sendPaymentReminder(bill, customer, daysOverdue = 0) {
    try {
      const chatId = this.formatPhoneNumber(customer.phone)
      if (!chatId) {
        return { success: false, error: 'Nomor telepon tidak valid' }
      }

      // Check session status first
      const { data: sessionStatus, error: sessionError } = await this.getSessionStatus()
      if (sessionError) {
        return { success: false, error: `Session error: ${sessionError}` }
      }

      if (sessionStatus?.status !== 'WORKING') {
        return { success: false, error: 'WhatsApp session tidak aktif' }
      }

      // Generate and send reminder message
      const message = this.generateReminderMessage(bill, customer, daysOverdue)
      const { data, error } = await this.sendMessage(chatId, message)

      if (error) {
        return { success: false, error }
      }

      return { success: true, data, messageId: data?.id }
    } catch (error) {
      console.error('Error sending payment reminder:', error)
      return { success: false, error: error.message }
    }
  },

  // Send bulk bill notifications
  async sendBulkBillNotifications(billsWithCustomers, onProgress = null) {
    const results = []
    const total = billsWithCustomers.length

    for (let i = 0; i < billsWithCustomers.length; i++) {
      const { bill, customer } = billsWithCustomers[i]
      
      try {
        const result = await this.sendBillNotification(bill, customer)
        results.push({
          billId: bill.id,
          customerId: customer.id,
          customerName: customer.name,
          phone: customer.phone,
          ...result
        })

        // Call progress callback if provided
        if (onProgress) {
          onProgress(i + 1, total, result)
        }

        // Add delay between messages to avoid rate limiting
        if (i < billsWithCustomers.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 10000)) // 10 second delay
        }
      } catch (error) {
        results.push({
          billId: bill.id,
          customerId: customer.id,
          customerName: customer.name,
          phone: customer.phone,
          success: false,
          error: error.message
        })
      }
    }

    return results
  },

  // Test WhatsApp connection
  async testConnection() {
    try {
      const { data, error } = await this.getSessionStatus()
      
      if (error) {
        return { 
          success: false, 
          error, 
          status: 'error',
          message: 'Gagal terhubung ke WAHA API'
        }
      }

      return {
        success: true,
        status: data?.status || 'unknown',
        data,
        message: data?.status === 'WORKING' ? 
          'WhatsApp siap digunakan' : 
          'WhatsApp belum siap, silakan scan QR code'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: 'error',
        message: 'Gagal menghubungi server WAHA'
      }
    }
  }
}
