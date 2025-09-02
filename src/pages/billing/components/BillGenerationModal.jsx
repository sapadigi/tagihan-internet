import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { billingService } from '../../../services/billingService';

const BillGenerationModal = ({ onClose, onBillsGenerated }) => {
  const [billingMonth, setBillingMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!billingMonth) {
      setError('Bulan tagihan wajib dipilih');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const { data, error: generateError } = await billingService.generateMonthlyBills(billingMonth + '-01');
      
      if (generateError) {
        setError(generateError);
      } else {
        setResult(data);
      }
    } catch (err) {
      console.error('Error generating bills:', err);
      setError('Gagal generate tagihan bulanan');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (result) {
      onBillsGenerated();
    } else {
      onClose();
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const getMonthName = (monthString) => {
    const date = new Date(monthString + '-01');
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Generate Tagihan Bulanan</h2>
              <p className="text-muted-foreground mt-1">
                Buat tagihan otomatis untuk semua pelanggan aktif
              </p>
            </div>
            <Button variant="outline" onClick={handleClose}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {!result && !loading && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Informasi Generate Tagihan
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Tagihan akan dibuat untuk semua pelanggan dengan status aktif</li>
                        <li>Hutang dari bulan sebelumnya akan otomatis ditambahkan</li>
                        <li>Jatuh tempo tagihan adalah akhir bulan</li>
                        <li>Tagihan yang sudah ada untuk bulan ini akan dilewati</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Bulan Tagihan *
                </label>
                <Input
                  type="month"
                  value={billingMonth}
                  onChange={(e) => setBillingMonth(e.target.value)}
                  className={error ? 'border-red-500' : ''}
                />
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                <p className="text-xs text-muted-foreground mt-1">
                  Pilih bulan untuk generate tagihan
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Peringatan
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Pastikan bulan yang dipilih sudah benar. Proses ini akan membuat tagihan 
                        untuk bulan <strong>{billingMonth ? getMonthName(billingMonth) : 'yang dipilih'}</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">
                Sedang generate tagihan untuk {getMonthName(billingMonth)}...
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Proses ini mungkin memakan waktu beberapa saat
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Generate Tagihan Berhasil!
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>{result.message}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Ringkasan Generate Tagihan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Bulan Tagihan:</span>
                    <p className="font-medium text-foreground">{getMonthName(billingMonth)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Jumlah Tagihan:</span>
                    <p className="font-medium text-foreground">{result.bills?.length || 0} tagihan</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-sm text-muted-foreground">Total Nilai Tagihan:</span>
                    <p className="text-xl font-bold text-foreground">{formatCurrency(result.totalAmount)}</p>
                  </div>
                </div>
              </div>

              {result.bills && result.bills.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    Detail Tagihan yang Dibuat
                  </h3>
                  <div className="max-h-60 overflow-y-auto">
                    <div className="space-y-2">
                      {result.bills.slice(0, 10).map((bill, index) => (
                        <div key={bill.id} className="flex justify-between items-center py-2 border-b border-border">
                          <div>
                            <p className="text-sm font-medium text-foreground">{bill.bill_number}</p>
                            <p className="text-xs text-muted-foreground">Customer ID: {bill.customer_id}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-foreground">{formatCurrency(bill.total_amount)}</p>
                            {bill.previous_debt > 0 && (
                              <p className="text-xs text-red-600">+{formatCurrency(bill.previous_debt)} hutang</p>
                            )}
                          </div>
                        </div>
                      ))}
                      {result.bills.length > 10 && (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          ... dan {result.bills.length - 10} tagihan lainnya
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Generate Tagihan Gagal
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border">
          <div className="flex justify-end space-x-3">
            {!result && !loading && (
              <>
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={loading || !billingMonth}
                >
                  Generate Tagihan
                </Button>
              </>
            )}
            {(result || error) && (
              <Button onClick={handleClose}>
                {result ? 'Selesai' : 'Tutup'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillGenerationModal;