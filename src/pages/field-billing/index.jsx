import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthProvider';
import FieldBillingUnlock from '../../components/FieldBillingUnlock';
import { billingService } from '../../services/billingService';
import { customerService } from '../../services/customerService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';

const FieldBilling = () => {
  const { isFieldBillingUnlocked } = useAuth();
  const [bills, setBills] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    payment_method: 'cash',
    notes: '',
    send_whatsapp: false
  });
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentLock, setPaymentLock] = useState(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [billsResult, customersResult] = await Promise.all([
        billingService.getBills(),
        customerService.getCustomers()
      ]);

      if (!billsResult.error) {
        setBills(billsResult.data);
      }

      if (!customersResult.error) {
        setCustomers(customersResult.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCustomerInfo = (customerId) => {
    return customers.find(c => c.id === customerId) || {};
  };

  const getCustomerDebt = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    const totalDebt = customer?.hutang || 0;
    const customerBills = bills.filter(b => b.customer_id === customerId && b.status !== 'paid');
    const billCount = customerBills.length;
    
    // Debug log to check customer data
    if (customer) {
      console.log('Customer data:', customer);
      console.log('Customer hutang:', customer.hutang);
    }
    
    return { totalDebt, billCount };
  };

  const filteredBills = bills.filter(bill => {
    const customer = getCustomerInfo(bill.customer_id);
    const searchLower = searchTerm.toLowerCase();
    
    // Filter by search term
    const matchesSearch = (
      customer.name?.toLowerCase().includes(searchLower) ||
      customer.address?.toLowerCase().includes(searchLower) ||
      bill.bill_number?.toLowerCase().includes(searchLower) ||
      customer.phone?.includes(searchTerm)
    );

    // Filter by status
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'unpaid') return matchesSearch && bill.status !== 'paid';
    if (filterStatus === 'overdue') return matchesSearch && bill.status === 'overdue';
    
    return matchesSearch;
  });

  const handlePayment = (bill) => {
    const customer = getCustomerInfo(bill.customer_id);
    setSelectedBill({ ...bill, customer });
    setPaymentData({
      amount: bill.remaining_amount || bill.total_amount || bill.amount,
      payment_method: 'cash',
      notes: '',
      send_whatsapp: customer.phone ? true : false
    });
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    if (!selectedBill) return;

    // Check if this bill is already being processed
    if (paymentLock.has(selectedBill.id)) {
      alert('Pembayaran untuk tagihan ini sedang diproses. Mohon tunggu.');
      return;
    }

    // Add to lock
    setPaymentLock(prev => new Set([...prev, selectedBill.id]));
    setProcessingPayment(true);

    try {
      // Check if bill status has changed (to prevent double payment)
      const { data: currentBill } = await billingService.getBillById(selectedBill.id);
      if (currentBill && currentBill.status === 'paid') {
        alert('Tagihan ini sudah lunas. Data akan di-refresh.');
        setShowPaymentModal(false);
        setSelectedBill(null);
        loadData();
        return;
      }

      const paymentInfo = {
        bill_id: selectedBill.id,
        amount: parseFloat(paymentData.amount),
        payment_method: paymentData.payment_method,
        notes: paymentData.notes
      };

      // Try payment recording with auto-retry for duplicate key errors
      let retryCount = 0;
      const maxRetries = 5; // Increase retry count
      let result;

      while (retryCount <= maxRetries) {
        console.log(`Payment attempt ${retryCount + 1}/${maxRetries + 1}`);
        
        result = await billingService.recordPayment(
          paymentInfo, 
          paymentData.send_whatsapp
        );

        // If successful or non-duplicate error, break the loop
        if (!result.error || (!result.error.includes('duplicate key') && !result.error.includes('violates unique constraint'))) {
          break;
        }

        // If duplicate key error and we have retries left
        if ((result.error.includes('duplicate key') || result.error.includes('violates unique constraint')) && retryCount < maxRetries) {
          console.warn(`Payment attempt ${retryCount + 1} failed with duplicate constraint, retrying...`);
          retryCount++;
          // Add exponential backoff with more randomization
          const delay = 1000 * Math.pow(2, retryCount) + Math.random() * 2000;
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        // If we're here, it means we've exhausted retries
        break;
      }

      if (result.error) {
        // Handle specific error types
        if (result.error.includes('duplicate key') || result.error.includes('violates unique constraint')) {
          alert(`Sistem sibuk saat ini. Pembayaran gagal dicatat setelah ${maxRetries + 1} percobaan.\n\nSilakan tunggu 1-2 menit dan coba lagi.`);
        } else {
          alert(`Gagal mencatat pembayaran: ${result.error}`);
        }
      } else {
        let successMessage = 'Pembayaran berhasil dicatat!';
        
        if (paymentData.send_whatsapp && selectedBill.customer?.phone) {
          if (result.whatsappNotification?.success) {
            successMessage += '\n✅ Konfirmasi WhatsApp berhasil dikirim.';
          } else {
            successMessage += '\n⚠️ Pembayaran tercatat, namun notifikasi WhatsApp gagal dikirim.';
          }
        }
        
        alert(successMessage);
        setShowPaymentModal(false);
        setSelectedBill(null);
        setProcessingPayment(false);
        loadData(); // Refresh data
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      // Remove from lock
      setPaymentLock(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedBill?.id);
        return newSet;
      });
      setProcessingPayment(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data tagihan...</p>
        </div>
      </div>
    );
  }

  // Show unlock screen if field billing is not unlocked
  if (!isFieldBillingUnlocked) {
    return <FieldBillingUnlock onUnlock={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">📱 Penagihan Lapangan</h1>
            <div className="flex justify-between items-center mt-2 text-sm">
              <span className="text-blue-100">
                {filteredBills.length} tagihan
              </span>
              <span className="text-blue-100">
                {new Date().toLocaleDateString('id-ID')}
              </span>
            </div>
          </div>
          {/* Lock button */}
          <button
            onClick={() => {
              if (confirm('Kunci akses field billing?')) {
                setPaymentLock(new Set()); // Clear any payment locks
                localStorage.removeItem('field_billing_auth');
                window.location.reload();
              }
            }}
            className="text-blue-100 hover:text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
            title="Kunci akses field billing"
          >
            🔒
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 bg-white border-b space-y-3">
        <Input
          type="text"
          placeholder="🔍 Cari nama, alamat, nomor tagihan, atau telepon..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              filterStatus === 'all' 
                ? 'bg-blue-100 text-blue-800 border-2 border-blue-300' 
                : 'bg-gray-100 text-gray-600 border border-gray-300'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilterStatus('unpaid')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              filterStatus === 'unpaid' 
                ? 'bg-red-100 text-red-800 border-2 border-red-300' 
                : 'bg-gray-100 text-gray-600 border border-gray-300'
            }`}
          >
            Belum Lunas
          </button>
          <button
            onClick={() => setFilterStatus('overdue')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              filterStatus === 'overdue' 
                ? 'bg-orange-100 text-orange-800 border-2 border-orange-300' 
                : 'bg-gray-100 text-gray-600 border border-gray-300'
            }`}
          >
            Terlambat
          </button>
        </div>
      </div>

      {/* Bills List */}
      <div className="p-4 space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{bills.filter(b => b.status !== 'paid').length}</p>
            <p className="text-xs text-blue-800">Belum Lunas</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-red-600">{bills.filter(b => b.status === 'overdue').length}</p>
            <p className="text-xs text-red-800">Terlambat</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-green-600">
              {customers.length > 0 ? 
                formatCurrency(customers.filter(c => (c.hutang || 0) > 0).reduce((sum, c) => sum + (c.hutang || 0), 0)).replace('Rp', '') :
                '0'
              }
            </p>
            <p className="text-xs text-green-800">Total Piutang</p>
          </div>
        </div>

        {filteredBills.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500 text-lg mb-2">Tidak ada tagihan ditemukan</p>
            <p className="text-gray-400 text-sm">Coba ubah filter atau kata kunci pencarian</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBills.map((bill) => {
              const customer = getCustomerInfo(bill.customer_id);
              const customerDebt = getCustomerDebt(bill.customer_id);
              return (
                <div key={bill.id} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
                  {/* Customer Info */}
                  <div className="mb-3">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800">{customer.name}</h3>
                        {customerDebt.totalDebt > 0 && (
                          <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full mt-1">
                            Hutang: {formatCurrency(customerDebt.totalDebt)}
                          </span>
                        )}
                        {customerDebt.billCount > 1 && (
                          <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full mt-1 ml-1">
                            {customerDebt.billCount} tagihan
                          </span>
                        )}
                      </div>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bill.status)}`}>
                        {bill.status === 'pending' ? 'Belum Bayar' : 
                         bill.status === 'partial' ? 'Sebagian' : 
                         bill.status === 'overdue' ? 'Terlambat' : 'Lunas'}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-1">📍 {customer.address}</p>
                    {customer.phone && (
                      <p className="text-blue-600 text-sm">📞 {customer.phone}</p>
                    )}
                  </div>

                  {/* Bill Info */}
                  <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div>
                      <p className="text-gray-500">No. Tagihan</p>
                      <p className="font-medium">{bill.bill_number}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Periode</p>
                      <p className="font-medium">{bill.period}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Jatuh Tempo</p>
                      <p className="font-medium">{formatDate(bill.due_date)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Hutang</p>
                      <p className="font-medium text-red-600">
                        {formatCurrency(customerDebt.totalDebt)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {customerDebt.billCount} tagihan belum lunas
                      </p>
                    </div>
                  </div>

                  {/* Amount Info */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Tagihan Ini:</span>
                      <span className="font-semibold">{formatCurrency(bill.amount)}</span>
                    </div>
                    {bill.paid_amount > 0 && (
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Sudah Dibayar:</span>
                        <span className="text-green-600">{formatCurrency(bill.paid_amount)}</span>
                      </div>
                    )}
                    {customerDebt.totalDebt > 0 && (
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between items-center font-bold text-sm">
                          <span className="text-orange-600">Total Hutang Customer:</span>
                          <span className="text-orange-600">{formatCurrency(customerDebt.totalDebt)}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Data dari field hutang customer
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => handlePayment(bill)}
                    className={`w-full font-semibold py-3 ${
                      bill.status === 'paid' || processingPayment
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700'
                    } text-white`}
                    disabled={bill.status === 'paid' || processingPayment}
                  >
                    {processingPayment ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        <span className="text-sm">Memproses...</span>
                      </div>
                    ) : (
                      bill.status === 'paid' ? '✅ Sudah Lunas' : '💰 Bayar Sekarang'
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-t-lg p-6 max-h-[90vh] overflow-y-auto relative">
            {/* Loading Overlay */}
            {processingPayment && (
              <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10 rounded-t-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-3"></div>
                  <p className="text-gray-600 font-medium">
                    {selectedBill.customer?.phone ? 'Mengirim notifikasi WhatsApp...' : 'Memproses pembayaran...'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Mohon tunggu sebentar</p>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">💰 Catat Pembayaran</h2>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setProcessingPayment(false);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
                disabled={processingPayment}
              >
                ✕
              </button>
            </div>

            {/* Customer & Bill Info */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="font-semibold">{selectedBill.customer?.name}</p>
              <p className="text-sm text-gray-600">{selectedBill.bill_number}</p>
              
            </div>

            {/* Payment Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">💵 Jumlah Bayar</label>
                <Input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  min="0"
                  max={selectedBill.remaining_amount || selectedBill.total_amount || selectedBill.amount}
                  disabled={processingPayment}
                />
              </div>

              {/* <div>
                <label className="block text-sm font-medium mb-1">💳 Metode Pembayaran</label>
                <Select
                  value={paymentData.payment_method}
                  onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                  disabled={processingPayment}
                >
                  <option value="cash">💵 Tunai</option>
                  <option value="transfer">🏦 Transfer</option>
                  <option value="e_wallet">📱 E-Wallet</option>
                </Select>
              </div> */}

              <div>
                <label className="block text-sm font-medium mb-1">📝 Catatan (Opsional)</label>
                <Input
                  type="text"
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  placeholder="Catatan pembayaran..."
                  disabled={processingPayment}
                />
              </div>

              {selectedBill.customer?.phone && (
  <div className="flex items-start space-x-2 p-2 border rounded-lg bg-gray-50">
    <input type="checkbox" checked readOnly className="mt-1" />
    <div>
      <p className="font-medium">📱 Kirim konfirmasi WhatsApp</p>
      <p className="text-sm text-gray-600">
        Ke nomor: {selectedBill.customer.phone}
      </p>
    </div>
  </div>
)}

            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => {
                  setShowPaymentModal(false);
                  setProcessingPayment(false);
                }}
                variant="outline"
                className="flex-1"
                disabled={processingPayment}
              >
                Batal
              </Button>
              <Button
                onClick={processPayment}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={!paymentData.amount || paymentData.amount <= 0 || processingPayment}
              >
                {processingPayment ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    <span className="text-sm">
                      {selectedBill.customer?.phone ? 'Kirim WhatsApp...' : 'Memproses...'}
                    </span>
                  </div>
                ) : (
                  '✅ Catat Pembayaran'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldBilling;
