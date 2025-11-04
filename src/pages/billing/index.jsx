import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Header from '../../components/ui/Header';
import { billingService } from '../../services/billingService';
import { customerService } from '../../services/customerService';
import BillModal from './components/BillModal';
import PaymentModal from './components/PaymentModal';
import BillGenerationModal from './components/BillGenerationModal';
import WhatsAppSendModal from './components/WhatsAppSendModal';
import BulkWhatsAppModal from './components/BulkWhatsAppModal';

// Customer Debt Modal Component
const CustomerDebtModal = ({ customer, onClose, onDebtUpdated }) => {
  const [hutang, setHutang] = useState(customer?.hutang || 0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setHutang(customer?.hutang || 0);
  }, [customer]);

  const handleUpdateDebt = async () => {
    setLoading(true);
    try {
      const { error } = await customerService.updateCustomerHutang(customer.id, parseFloat(hutang) || 0);
      if (error) {
        console.error('Error updating customer debt:', error);
        alert('Gagal mengubah hutang pelanggan');
      } else {
        onDebtUpdated();
      }
    } catch (err) {
      console.error('Error updating customer debt:', err);
      alert('Gagal mengubah hutang pelanggan');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Kelola Hutang Pelanggan</h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Nama Pelanggan:</p>
          <p className="font-medium">{customer?.name}</p>
          <p className="text-sm text-gray-500">ID: {customer?.customer_id}</p>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Hutang Saat Ini:</p>
          <p className="font-medium text-red-600">{formatCurrency(customer?.hutang || 0)}</p>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hutang Baru (IDR)
          </label>
          <Input
            type="number"
            value={hutang}
            onChange={(e) => setHutang(e.target.value)}
            placeholder="Masukkan jumlah hutang..."
            min="0"
            step="1000"
          />
          <p className="text-xs text-gray-500 mt-1">
            Preview: {formatCurrency(parseFloat(hutang) || 0)}
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            className="flex-1"
            onClick={handleUpdateDebt}
            disabled={loading}
          >
            {loading ? 'Menyimpan...' : 'Update Hutang'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Compensation Modal Component
const CompensationModal = ({ bill, onClose, onCompensationUpdated }) => {
  const [compensation, setCompensation] = useState(bill?.compensation || 0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCompensation(bill?.compensation || 0);
  }, [bill]);

  const handleUpdateCompensation = async () => {
    setLoading(true);
    try {
      const compensationValue = parseFloat(compensation) || 0;
      
      // Calculate new total: amount + previous_debt - compensation
      const newTotal = (bill.amount || 0) + (bill.previous_debt || 0) - compensationValue;
      
      // Calculate new remaining amount (total - paid)
      const currentPaidAmount = bill.paid_amount || 0;
      const newRemainingAmount = newTotal - currentPaidAmount;
      
      const updatedBillData = {
        ...bill,
        compensation: compensationValue,
        total_amount: newTotal,
        remaining_amount: Math.max(0, newRemainingAmount),
        status: newRemainingAmount <= 0 ? 'paid' : (currentPaidAmount > 0 ? 'partial' : 'unpaid')
      };
      
      const { error } = await billingService.updateBill(bill.id, updatedBillData);
      if (error) {
        console.error('Error updating compensation:', error);
        alert('Gagal mengubah kompensasi');
      } else {
        alert('Kompensasi berhasil diupdate');
        onCompensationUpdated();
      }
    } catch (err) {
      console.error('Error updating compensation:', err);
      alert('Gagal mengubah kompensasi');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(amount);
  };

  const calculateNewTotal = () => {
    const compensationValue = parseFloat(compensation) || 0;
    return (bill?.amount || 0) + (bill?.previous_debt || 0) - compensationValue;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Kelola Kompensasi Tagihan</h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Nomor Tagihan:</p>
          <p className="font-medium">{bill?.bill_number}</p>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Pelanggan:</p>
          <p className="font-medium">{bill?.customer_name}</p>
        </div>
        
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Jumlah Tagihan:</p>
            <p className="font-medium">{formatCurrency(bill?.amount || 0)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Hutang:</p>
            <p className="font-medium text-red-600">{formatCurrency(bill?.previous_debt || 0)}</p>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Kompensasi Saat Ini:</p>
          <p className="font-medium text-blue-600">{formatCurrency(bill?.compensation || 0)}</p>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kompensasi Baru (IDR)
          </label>
          <Input
            type="number"
            value={compensation}
            onChange={(e) => setCompensation(e.target.value)}
            placeholder="Masukkan jumlah kompensasi..."
            min="0"
            step="1000"
          />
          <p className="text-xs text-gray-500 mt-1">
            Preview: {formatCurrency(parseFloat(compensation) || 0)}
          </p>
        </div>
        
        <div className="mb-6 bg-gray-50 p-3 rounded">
          <p className="text-sm text-gray-600 mb-1">Total Tagihan Baru:</p>
          <p className="text-lg font-bold text-green-600">{formatCurrency(calculateNewTotal())}</p>
          <p className="text-xs text-gray-500 mt-1">
            ({formatCurrency(bill?.amount || 0)} + {formatCurrency(bill?.previous_debt || 0)} - {formatCurrency(parseFloat(compensation) || 0)})
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            className="flex-1"
            onClick={handleUpdateCompensation}
            disabled={loading}
          >
            {loading ? 'Menyimpan...' : 'Update Kompensasi'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const BillingPage = () => {
  const [bills, setBills] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    customer_id: '',
    billing_month: '',
    search: '',
    customer_debt: 'all'
  });
  const [stats, setStats] = useState({
    totalBills: 0,
    pendingBills: 0,
    paidBills: 0,
    overdueBills: 0,
    totalAmount: 0,
    totalPaid: 0,
    totalOutstanding: 0,
    totalCustomerDebt: 0,
    customersWithDebt: 0
  });
  const [selectedBill, setSelectedBill] = useState(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showBulkWhatsAppModal, setShowBulkWhatsAppModal] = useState(false);
  const [showCustomerDebtModal, setShowCustomerDebtModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCompensationModal, setShowCompensationModal] = useState(false);
  const [selectedBillForCompensation, setSelectedBillForCompensation] = useState(null);

  useEffect(() => {
    loadBills();
    loadCustomers();
    loadStats();
    loadCustomerDebtStats();
  }, [filters]);

  const handleDeleteAllBills = async () => {
    const confirmMessage = `⚠️ PERINGATAN!\n\nAnda akan menghapus SEMUA data tagihan (${bills.length} tagihan).\nData yang akan dihapus:\n- Semua tagihan\n- Semua pembayaran\n- Semua riwayat billing\n\nTindakan ini TIDAK DAPAT dibatalkan!\n\nKetik "HAPUS SEMUA" untuk konfirmasi:`;
    
    const userInput = prompt(confirmMessage);
    
    if (userInput === 'HAPUS SEMUA') {
      try {
        // Import jsonStorage
        const { default: jsonStorage, TABLES } = await import('../../lib/jsonStorage');
        
        // Clear bills, payments, and billing_history
        const data = jsonStorage.getAllData();
        data.bills = [];
        data.payments = [];
        data.billing_history = [];
        jsonStorage.saveAllData(data);
        
        alert('✅ Semua data tagihan berhasil dihapus!');
        
        // Reload data
        loadBills();
        loadStats();
      } catch (error) {
        console.error('Error deleting all bills:', error);
        alert('❌ Gagal menghapus data tagihan: ' + error.message);
      }
    } else if (userInput !== null) {
      alert('❌ Konfirmasi tidak sesuai. Data tidak dihapus.');
    }
  };

  const loadBills = async () => {
    setLoading(true);
    try {
      const { data, error } = await billingService.getBills(filters);
      if (error) {
        console.error('Error loading bills:', error);
      } else {
        setBills(data || []);
      }
    } catch (err) {
      console.error('Error loading bills:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const { data, error } = await customerService.getCustomers();
      if (error) {
        console.error('Error loading customers:', error);
      } else {
        setCustomers(data || []);
      }
    } catch (err) {
      console.error('Error loading customers:', err);
    }
  };

  const loadStats = async () => {
    try {
      const { data, error } = await billingService.getBillingStats(filters.billing_month);
      if (error) {
        console.error('Error loading stats:', error);
      } else {
        setStats(prevStats => ({
          ...prevStats,
          ...data
        }));
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const loadCustomerDebtStats = async () => {
    try {
      const { data, error } = await customerService.getCustomers();
      if (error) {
        console.error('Error loading customer debt stats:', error);
      } else {
        const totalCustomerDebt = (data || []).reduce((sum, customer) => sum + (customer.hutang || 0), 0);
        const customersWithDebt = (data || []).filter(customer => (customer.hutang || 0) > 0).length;
        
        setStats(prevStats => ({
          ...prevStats,
          totalCustomerDebt,
          customersWithDebt
        }));
      }
    } catch (err) {
      console.error('Error loading customer debt stats:', err);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      customer_id: '',
      billing_month: '',
      search: '',
      customer_debt: 'all'
    });
  };

  const handleViewBill = (bill) => {
    setSelectedBill(bill);
    setShowBillModal(true);
  };

  const handleRecordPayment = (bill) => {
    setSelectedBill(bill);
    setShowPaymentModal(true);
  };

  const handlePaymentRecorded = () => {
    loadBills();
    loadStats();
    loadCustomerDebtStats();
    setShowPaymentModal(false);
    setSelectedBill(null);
  };

  const handleBillsGenerated = () => {
    loadBills();
    loadStats();
    loadCustomerDebtStats();
    setShowGenerationModal(false);
  };

  const handleSendWhatsApp = (bill) => {
    setSelectedBill(bill);
    setShowWhatsAppModal(true);
  };

  const handleWhatsAppSent = () => {
    setShowWhatsAppModal(false);
    setSelectedBill(null);
  };

  const handleManageCustomerDebt = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDebtModal(true);
  };

  const handleCustomerDebtUpdated = () => {
    loadBills();
    loadCustomerDebtStats();
    setShowCustomerDebtModal(false);
    setSelectedCustomer(null);
  };

  const handleManageCompensation = (bill) => {
    setSelectedBillForCompensation(bill);
    setShowCompensationModal(true);
  };

  const handleCompensationUpdated = () => {
    loadBills();
    loadStats();
    setShowCompensationModal(false);
    setSelectedBillForCompensation(null);
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
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
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
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tagihan</h1>
            <p className="text-muted-foreground mt-1">Kelola tagihan dan pembayaran pelanggan</p>
          </div>
          <div className="flex space-x-3">
            {bills.length > 0 && (
              <>
                <Button
                  onClick={handleDeleteAllBills}
                  variant="outline"
                  className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Hapus Semua Tagihan
                </Button>
                <Button
                  onClick={() => setShowBulkWhatsAppModal(true)}
                  variant="outline"
                  className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  Kirim Semua via WhatsApp
                </Button>
              </>
            )}
            <Button
              onClick={() => setShowGenerationModal(true)}
              className="bg-primary hover:bg-primary/90"
            >
              Generate Tagihan Bulanan
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Tagihan</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalBills}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Terbayar</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(stats.totalPaid)}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Belum Terbayar</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(stats.totalOutstanding)}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Terlambat</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.overdueBills}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Hutang Pelanggan</p>
                <p className="text-xl font-bold text-purple-600">{formatCurrency(stats.totalCustomerDebt)}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pelanggan Berhutang</p>
                <p className="text-2xl font-bold text-orange-600">{stats.customersWithDebt}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Cari Tagihan
              </label>
              <Input
                type="text"
                placeholder="Nomor tagihan..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Status
              </label>
              <Select
                value={filters.status}
                onChange={(value) => handleFilterChange('status', value)}
                options={[
                  { value: 'all', label: 'Semua Status' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'paid', label: 'Lunas' },
                  { value: 'overdue', label: 'Terlambat' },
                  { value: 'cancelled', label: 'Dibatalkan' }
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Pelanggan
              </label>
              <Select
                value={filters.customer_id}
                onChange={(value) => handleFilterChange('customer_id', value)}
                options={[
                  { value: '', label: 'Semua Pelanggan' },
                  ...customers.map(customer => ({
                    value: customer.id,
                    label: customer.name
                  }))
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Status Hutang Pelanggan
              </label>
              <Select
                value={filters.customer_debt}
                onChange={(value) => handleFilterChange('customer_debt', value)}
                options={[
                  { value: 'all', label: 'Semua' },
                  { value: 'with_debt', label: 'Ada Hutang' },
                  { value: 'no_debt', label: 'Tidak Ada Hutang' }
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Bulan Tagihan
              </label>
              <Input
                type="month"
                value={filters.billing_month}
                onChange={(e) => handleFilterChange('billing_month', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={resetFilters}
            >
              Reset Filter
            </Button>
          </div>
        </div>

        {/* Bills Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">
              Daftar Tagihan ({bills.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-muted-foreground">Memuat tagihan...</p>
            </div>
          ) : bills.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Belum ada tagihan</p>
              <Button
                onClick={() => setShowGenerationModal(true)}
                className="mt-4"
              >
                Generate Tagihan Pertama
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      No Tagihan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Nama Pelanggan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Jumlah Tagihan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Jumlah Hutang
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Kompensasi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Periode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Total Tagihan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {bills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-muted/50">
                      {/* No Tagihan */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground">
                          {bill.bill_number}
                        </div>
                      </td>
                      
                      {/* Nama Pelanggan */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-foreground font-medium">
                          {bill.customer_name || bill.customers?.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {bill.customers?.phone}
                        </div>
                      </td>
                      
                      {/* Jumlah Tagihan (biaya bulanan) */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-foreground">
                          {formatCurrency(bill.amount || 0)}
                        </div>
                      </td>
                      
                      {/* Jumlah Hutang (hutang bulan lalu) */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">
                          {bill.previous_debt && bill.previous_debt > 0 ? (
                            <span className="text-red-600">
                              {formatCurrency(bill.previous_debt)}
                            </span>
                          ) : (
                            <span className="text-green-600">
                              {formatCurrency(0)}
                            </span>
                          )}
                        </div>
                      </td>
                      
                      {/* Kompensasi */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">
                          {bill.compensation && bill.compensation > 0 ? (
                            <span className="text-blue-600">
                              -{formatCurrency(bill.compensation)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              {formatCurrency(0)}
                            </span>
                          )}
                        </div>
                      </td>
                      
                      {/* Periode */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-foreground">
                          {bill.billing_month} {bill.billing_year}
                        </div>
                        {bill.due_date && (
                          <div className="text-xs text-muted-foreground">
                            Jatuh tempo: {formatDate(bill.due_date)}
                          </div>
                        )}
                      </td>
                      
                      {/* Total Tagihan (jumlah + hutang) */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-foreground">
                          {formatCurrency(bill.total_amount || 0)}
                        </div>
                      </td>
                      
                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(bill.status)}
                      </td>
                      
                      {/* Aksi */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleManageCompensation(bill)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                          >
                            Kelola Kompensasi
                          </Button>
                          {bill.customers?.hutang > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleManageCustomerDebt(bill.customers)}
                              className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                            >
                              Kelola Hutang
                            </Button>
                          )}
                          {bill.customers?.phone && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSendWhatsApp(bill)}
                              className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                            >
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                              </svg>
                              WhatsApp
                            </Button>
                          )}
                          {bill.status !== 'paid' && (
                            <Button
                              size="sm"
                              onClick={() => handleRecordPayment(bill)}
                            >
                              Bayar
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showBillModal && selectedBill && (
        <BillModal
          bill={selectedBill}
          onClose={() => {
            setShowBillModal(false);
            setSelectedBill(null);
          }}
        />
      )}

      {showPaymentModal && selectedBill && (
        <PaymentModal
          bill={selectedBill}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedBill(null);
          }}
          onPaymentRecorded={handlePaymentRecorded}
        />
      )}

      {showGenerationModal && (
        <BillGenerationModal
          onClose={() => setShowGenerationModal(false)}
          onBillsGenerated={handleBillsGenerated}
        />
      )}

      {showWhatsAppModal && selectedBill && (
        <WhatsAppSendModal
          bill={selectedBill}
          customer={selectedBill.customers}
          onClose={() => {
            setShowWhatsAppModal(false);
            setSelectedBill(null);
          }}
          onSent={handleWhatsAppSent}
        />
      )}

      {showBulkWhatsAppModal && (
        <BulkWhatsAppModal
          bills={bills}
          onClose={() => setShowBulkWhatsAppModal(false)}
          onSent={() => setShowBulkWhatsAppModal(false)}
        />
      )}

      {showCustomerDebtModal && selectedCustomer && (
        <CustomerDebtModal
          customer={selectedCustomer}
          onClose={() => {
            setShowCustomerDebtModal(false);
            setSelectedCustomer(null);
          }}
          onDebtUpdated={handleCustomerDebtUpdated}
        />
      )}

      {showCompensationModal && selectedBillForCompensation && (
        <CompensationModal
          bill={selectedBillForCompensation}
          onClose={() => {
            setShowCompensationModal(false);
            setSelectedBillForCompensation(null);
          }}
          onCompensationUpdated={handleCompensationUpdated}
        />
      )}
    </div>
  );
};

export default BillingPage;