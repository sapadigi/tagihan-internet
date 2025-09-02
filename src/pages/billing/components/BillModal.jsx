import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import { billingService } from '../../../services/billingService';

const BillModal = ({ bill, onClose }) => {
  const [billDetails, setBillDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBillDetails();
  }, [bill.id]);

  const loadBillDetails = async () => {
    try {
      const { data, error } = await billingService.getBillById(bill.id);
      if (error) {
        console.error('Error loading bill details:', error);
      } else {
        setBillDetails(data);
      }
    } catch (err) {
      console.error('Error loading bill details:', err);
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

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Lunas' },
      overdue: { bg: 'bg-red-100', text: 'text-red-800', label: 'Terlambat' },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Dibatalkan' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-muted-foreground">Memuat detail tagihan...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!billDetails) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Gagal memuat detail tagihan</p>
            <Button onClick={onClose} className="mt-4">Tutup</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Detail Tagihan</h2>
              <p className="text-muted-foreground mt-1">{billDetails.bill_number}</p>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusBadge(billDetails.status)}
              <Button variant="outline" onClick={onClose}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-foreground mb-3">Informasi Pelanggan</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Nama:</span>
                  <p className="font-medium text-foreground">{billDetails.customers?.name}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">ID Pelanggan:</span>
                  <p className="font-medium text-foreground">{billDetails.customers?.customer_id}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <p className="font-medium text-foreground">{billDetails.customers?.email}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Telepon:</span>
                  <p className="font-medium text-foreground">{billDetails.customers?.phone}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Paket:</span>
                  <p className="font-medium text-foreground">
                    {billDetails.customers?.package_name} - {billDetails.customers?.package_speed}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-foreground mb-3">Informasi Tagihan</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Periode Tagihan:</span>
                  <p className="font-medium text-foreground">
                    {formatDate(billDetails.billing_period_start)} - {formatDate(billDetails.billing_period_end)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Jatuh Tempo:</span>
                  <p className="font-medium text-foreground">{formatDate(billDetails.due_date)}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Tanggal Dibuat:</span>
                  <p className="font-medium text-foreground">{formatDateTime(billDetails.created_at)}</p>
                </div>
                {billDetails.payment_date && (
                  <div>
                    <span className="text-sm text-muted-foreground">Tanggal Lunas:</span>
                    <p className="font-medium text-green-600">{formatDateTime(billDetails.payment_date)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bill Amount Breakdown */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-foreground mb-3">Rincian Tagihan</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-foreground">Biaya Bulanan:</span>
                <span className="font-medium text-foreground">{formatCurrency(billDetails.amount)}</span>
              </div>
              {billDetails.previous_debt > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-red-600">Hutang Bulan Sebelumnya:</span>
                  <span className="font-medium text-red-600">{formatCurrency(billDetails.previous_debt)}</span>
                </div>
              )}
              <hr className="border-border" />
              <div className="flex justify-between items-center text-lg">
                <span className="font-semibold text-foreground">Total Tagihan:</span>
                <span className="font-bold text-foreground">{formatCurrency(billDetails.total_amount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-600">Total Terbayar:</span>
                <span className="font-medium text-green-600">{formatCurrency(billDetails.paid_amount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-red-600">Sisa Tagihan:</span>
                <span className="font-medium text-red-600">{formatCurrency(billDetails.remaining_amount)}</span>
              </div>
            </div>
          </div>

          {/* Payment History */}
          {billDetails.payments && billDetails.payments.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-foreground mb-3">Riwayat Pembayaran</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-sm font-medium text-muted-foreground">Nomor</th>
                      <th className="text-left py-2 text-sm font-medium text-muted-foreground">Tanggal</th>
                      <th className="text-left py-2 text-sm font-medium text-muted-foreground">Jumlah</th>
                      <th className="text-left py-2 text-sm font-medium text-muted-foreground">Metode</th>
                      <th className="text-left py-2 text-sm font-medium text-muted-foreground">Referensi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billDetails.payments.map((payment) => (
                      <tr key={payment.id} className="border-b border-border">
                        <td className="py-2 text-sm text-foreground">{payment.payment_number}</td>
                        <td className="py-2 text-sm text-foreground">{formatDateTime(payment.payment_date)}</td>
                        <td className="py-2 text-sm font-medium text-green-600">{formatCurrency(payment.amount)}</td>
                        <td className="py-2 text-sm text-foreground capitalize">{payment.payment_method}</td>
                        <td className="py-2 text-sm text-foreground">{payment.reference_number || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notes */}
          {billDetails.notes && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-foreground mb-3">Catatan</h3>
              <p className="text-foreground">{billDetails.notes}</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border">
          <div className="flex justify-end">
            <Button onClick={onClose}>Tutup</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillModal;