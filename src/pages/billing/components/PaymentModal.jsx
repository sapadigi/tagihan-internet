import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import { billingService } from '../../../services/billingService';

const PaymentModal = ({ bill, onClose, onPaymentRecorded }) => {
  const [formData, setFormData] = useState({
    amount: bill.remaining_amount || 0,
    payment_method: 'cash',
    reference_number: '',
    notes: '',
    send_whatsapp_notification: bill.customers?.phone ? true : false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const paymentMethods = [
    { value: 'cash', label: 'Tunai' },
    { value: 'transfer', label: 'Transfer Bank' },
    { value: 'card', label: 'Kartu Debit/Kredit' },
    { value: 'ewallet', label: 'E-Wallet' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Jumlah pembayaran harus lebih dari 0';
    }

    if (formData.amount > bill.remaining_amount) {
      newErrors.amount = 'Jumlah pembayaran tidak boleh melebihi sisa tagihan';
    }

    if (!formData.payment_method) {
      newErrors.payment_method = 'Metode pembayaran wajib dipilih';
    }

    if (formData.payment_method === 'transfer' && !formData.reference_number.trim()) {
      newErrors.reference_number = 'Nomor referensi wajib diisi untuk transfer bank';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const paymentData = {
        bill_id: bill.id,
        customer_id: bill.customer_id,
        amount: parseFloat(formData.amount),
        payment_method: formData.payment_method,
        reference_number: formData.reference_number.trim() || null,
        notes: formData.notes.trim() || null,
        created_by: 'admin' // In real app, this would be the logged-in user
      };

      const { data, error, whatsappNotification } = await billingService.recordPayment(
        paymentData, 
        formData.send_whatsapp_notification
      );
      
      if (error) {
        alert(`Gagal mencatat pembayaran: ${error}`);
      } else {
        let successMessage = 'Pembayaran berhasil dicatat!';
        
        if (formData.send_whatsapp_notification && bill.customers?.phone) {
          if (whatsappNotification?.success) {
            successMessage += '\n✅ Konfirmasi WhatsApp berhasil dikirim.';
          } else {
            successMessage += '\n⚠️ Pembayaran tercatat, namun notifikasi WhatsApp gagal dikirim.';
          }
        }
        
        alert(successMessage);
        onPaymentRecorded();
      }
    } catch (err) {
      console.error('Error recording payment:', err);
      alert('Gagal mencatat pembayaran');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Catat Pembayaran</h2>
              <p className="text-muted-foreground mt-1">Tagihan: {bill.bill_number}</p>
            </div>
            <Button variant="outline" onClick={onClose}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Bill Summary */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-foreground mb-3">Ringkasan Tagihan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Pelanggan:</span>
                <p className="font-medium text-foreground">{bill.customers?.name}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Periode:</span>
                <p className="font-medium text-foreground">
                  {formatDate(bill.billing_period_start)} - {formatDate(bill.billing_period_end)}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Total Tagihan:</span>
                <p className="font-medium text-foreground">{formatCurrency(bill.total_amount)}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Sudah Terbayar:</span>
                <p className="font-medium text-green-600">{formatCurrency(bill.paid_amount)}</p>
              </div>
              <div className="md:col-span-2">
                <span className="text-sm text-muted-foreground">Sisa Tagihan:</span>
                <p className="text-xl font-bold text-red-600">{formatCurrency(bill.remaining_amount)}</p>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Jumlah Pembayaran *
              </label>
              <Input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                max={bill.remaining_amount}
                step="1000"
                className={errors.amount ? 'border-red-500' : ''}
              />
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
              <p className="text-xs text-muted-foreground mt-1">
                Maksimal: {formatCurrency(bill.remaining_amount)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Metode Pembayaran *
              </label>
              <Select
                value={formData.payment_method}
                onChange={(value) => handleSelectChange('payment_method', value)}
                options={paymentMethods}
                className={errors.payment_method ? 'border-red-500' : ''}
              />
              {errors.payment_method && <p className="text-red-500 text-xs mt-1">{errors.payment_method}</p>}
            </div>

            {(formData.payment_method === 'transfer' || formData.payment_method === 'ewallet') && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nomor Referensi {formData.payment_method === 'transfer' ? '*' : ''}
                </label>
                <Input
                  type="text"
                  name="reference_number"
                  value={formData.reference_number}
                  onChange={handleInputChange}
                  placeholder="Masukkan nomor referensi"
                  className={errors.reference_number ? 'border-red-500' : ''}
                />
                {errors.reference_number && <p className="text-red-500 text-xs mt-1">{errors.reference_number}</p>}
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.payment_method === 'transfer' 
                    ? 'Nomor referensi transfer bank'
                    : 'ID transaksi e-wallet (opsional)'
                  }
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Catatan
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Catatan tambahan (opsional)"
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* WhatsApp Notification Option */}
            {bill.customers?.phone && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={formData.send_whatsapp_notification}
                    onChange={(checked) => setFormData(prev => ({ ...prev, send_whatsapp_notification: checked }))}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label className="text-sm font-medium text-green-800 cursor-pointer">
                      Kirim konfirmasi pembayaran via WhatsApp
                    </label>
                    <p className="text-xs text-green-700 mt-1">
                      Notifikasi akan dikirim ke {bill.customers.phone} dengan detail pembayaran dan status tagihan
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                </div>
              </div>
            )}

            {!bill.customers?.phone && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Notifikasi WhatsApp tidak tersedia</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Pelanggan belum memiliki nomor WhatsApp. Tambahkan nomor di data pelanggan untuk mengaktifkan notifikasi.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Amount Buttons */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Jumlah Cepat:
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormData(prev => ({ ...prev, amount: bill.remaining_amount }))}
              >
                Lunas ({formatCurrency(bill.remaining_amount)})
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormData(prev => ({ ...prev, amount: Math.floor(bill.remaining_amount / 2) }))}
              >
                50% ({formatCurrency(Math.floor(bill.remaining_amount / 2))})
              </Button>
              {bill.amount && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, amount: bill.amount }))}
                >
                  Biaya Bulanan ({formatCurrency(bill.amount)})
                </Button>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Catat Pembayaran'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;