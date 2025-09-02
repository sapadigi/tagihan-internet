import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import CustomerForm from '../../components/CustomerForm';
import { customerService } from '../../services/customerService';

// Hutang Modal Component
const HutangModal = ({ customer, isOpen, onSave, onCancel }) => {
  const [hutang, setHutang] = useState(customer?.hutang || 0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setHutang(customer?.hutang || 0);
  }, [customer]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(customer.id, parseFloat(hutang) || 0);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Edit Hutang Pelanggan</h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Nama Pelanggan:</p>
          <p className="font-medium">{customer?.name}</p>
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
            onClick={onCancel}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            className="flex-1"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterHutang, setFilterHutang] = useState('all');
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [totalHutang, setTotalHutang] = useState(0);
  const [jumlahPelangganBerhutang, setJumlahPelangganBerhutang] = useState(0);
  const [showHutangModal, setShowHutangModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Load customers from Supabase
  const loadCustomers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const filters = {
        search: searchTerm.trim(),
        status: filterStatus,
        hutang: filterHutang,
        sortBy: sortBy,
        sortOrder: sortOrder
      };
      
      const { data, error } = await customerService.getCustomers(filters);
      
      if (error) {
        setError(error);
        console.error('Error loading customers:', error);
      } else {
        setCustomers(data || []);
        // Hitung total hutang dan jumlah pelanggan berhutang
        const totalHutangAmount = (data || []).reduce((sum, customer) => sum + (customer.hutang || 0), 0);
        const jumlahBerhutang = (data || []).filter(customer => (customer.hutang || 0) > 0).length;
        setTotalHutang(totalHutangAmount);
        setJumlahPelangganBerhutang(jumlahBerhutang);
      }
    } catch (err) {
      setError('Failed to load customers');
      console.error('Error loading customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [searchTerm, filterStatus, filterHutang, sortBy, sortOrder]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(amount);
  };

  // Handle sort
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterHutang('all');
    setSortBy('created_at');
    setSortOrder('desc');
  };

  // Handle status change
  const handleStatusChange = async (customerId, newStatus) => {
    try {
      const { error } = await customerService.updateCustomerStatus(customerId, newStatus);
      if (error) {
        console.error('Error updating status:', error);
        alert('Gagal mengubah status pelanggan');
      } else {
        loadCustomers(); // Reload data
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Gagal mengubah status pelanggan');
    }
  };

  // Handle add customer
  const handleAddCustomer = () => {
    setEditingCustomer(null);
    setShowForm(true);
  };

  // Handle edit customer
  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  // Handle form save
  const handleFormSave = (savedCustomer) => {
    setShowForm(false);
    setEditingCustomer(null);
    loadCustomers(); // Reload data
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCustomer(null);
  };

  // Handle edit hutang
  const handleEditHutang = (customer) => {
    setSelectedCustomer(customer);
    setShowHutangModal(true);
  };

  // Handle update hutang
  const handleUpdateHutang = async (customerId, newHutang) => {
    try {
      const { error } = await customerService.updateCustomerHutang(customerId, newHutang);
      if (error) {
        console.error('Error updating hutang:', error);
        alert('Gagal mengubah hutang pelanggan');
      } else {
        setShowHutangModal(false);
        setSelectedCustomer(null);
        loadCustomers(); // Reload data
      }
    } catch (err) {
      console.error('Error updating hutang:', err);
      alert('Gagal mengubah hutang pelanggan');
    }
  };

  // Handle delete customer
  const handleDeleteCustomer = async (customer) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus pelanggan ${customer.name}?`)) {
      try {
        const { error } = await customerService.deleteCustomer(customer.id);
        if (error) {
          console.error('Error deleting customer:', error);
          alert('Gagal menghapus pelanggan');
        } else {
          loadCustomers(); // Reload data
        }
      } catch (err) {
        console.error('Error deleting customer:', err);
        alert('Gagal menghapus pelanggan');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'suspended': return 'bg-warning text-warning-foreground';
      case 'terminated': return 'bg-error text-error-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <>
      <Helmet>
        <title>Data Pelanggan - Internet Billing Admin</title>
        <meta name="description" content="Kelola data pelanggan dan informasi langganan internet" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Data Pelanggan</h1>
                <p className="text-muted-foreground mt-1">
                  Kelola informasi pelanggan dan status langganan
                </p>
              </div>
              
              <Button className="px-4 py-2" onClick={handleAddCustomer}>
                Tambah Pelanggan Baru
              </Button>
            </div>

            {/* Hutang Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <span className="text-blue-600 text-xl">👥</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Pelanggan</p>
                    <p className="text-2xl font-bold text-foreground">{customers?.length || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <span className="text-red-600 text-xl">⚠️</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Pelanggan Berhutang</p>
                    <p className="text-2xl font-bold text-red-600">{jumlahPelangganBerhutang}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <span className="text-yellow-600 text-xl">💰</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Hutang</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(totalHutang)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters Section */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Cari Pelanggan
                  </label>
                  <Input
                    type="text"
                    placeholder="Nama, email, atau ID pelanggan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e?.target?.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Status
                  </label>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e?.target?.value)}
                  >
                    <option value="all">Semua Status</option>
                    <option value="active">Aktif</option>
                    <option value="suspended">Suspend</option>
                    <option value="terminated">Terminate</option>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Status Hutang
                  </label>
                  <Select
                    value={filterHutang}
                    onChange={(e) => setFilterHutang(e?.target?.value)}
                  >
                    <option value="all">Semua</option>
                    <option value="berhutang">Ada Hutang</option>
                    <option value="lunas">Tidak Ada Hutang</option>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Quick Sort
                  </label>
                  <Button 
                    variant="outline" 
                    className="w-full text-xs" 
                    onClick={() => {
                      setSortBy('hutang');
                      setSortOrder('desc');
                    }}
                  >
                    Hutang Terbesar
                  </Button>
                </div>
                
                <div className="flex items-end">
                  <Button variant="outline" className="w-full" onClick={handleResetFilters}>
                    Reset Filter
                  </Button>
                </div>
              </div>
            </div>

            {/* Customer List */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">
                  Daftar Pelanggan ({customers?.length || 0})
                </h2>
              </div>
              
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-muted-foreground">Memuat data pelanggan...</p>
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                  <div className="text-red-500 mb-4">⚠️</div>
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={loadCustomers}>Coba Lagi</Button>
                </div>
              ) : customers?.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">Belum ada data pelanggan</p>
                  <Button onClick={handleAddCustomer}>Tambah Pelanggan Pertama</Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Pelanggan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Kontak
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Paket
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/30"
                            onClick={() => handleSort('monthly_fee')}>
                          <div className="flex items-center">
                            Biaya Bulanan
                            {sortBy === 'monthly_fee' && (
                              <span className="ml-1">
                                {sortOrder === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/30"
                            onClick={() => handleSort('hutang')}>
                          <div className="flex items-center">
                            Hutang
                            {sortBy === 'hutang' && (
                              <span className="ml-1">
                                {sortOrder === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {customers?.map((customer) => (
                        <tr key={customer?.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-foreground">
                                {customer?.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                ID: {customer?.customer_id}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-foreground">{customer?.email}</div>
                            <div className="text-sm text-muted-foreground">{customer?.phone}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-foreground">
                              {customer?.package_name} {customer?.package_speed}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Bergabung: {new Date(customer?.join_date)?.toLocaleDateString('id-ID')}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-foreground">
                              {formatCurrency(customer?.monthly_fee)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-foreground">
                              {customer?.hutang && customer.hutang > 0 ? (
                                <span className="text-red-600">
                                  {formatCurrency(customer.hutang)}
                                </span>
                              ) : (
                                <span className="text-green-600">
                                  {formatCurrency(0)}
                                </span>
                              )}
                            </div>
                            {customer?.hutang && customer.hutang > 0 && (
                              <div className="text-xs text-red-500">
                                Ada tunggakan
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <Select
                              value={customer?.status}
                              onChange={(e) => handleStatusChange(customer?.id, e.target.value)}
                              className="text-xs"
                            >
                              <option value="active">Aktif</option>
                              <option value="suspended">Suspend</option>
                              <option value="terminated">Terminate</option>
                            </Select>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditHutang(customer)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                Hutang
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditCustomer(customer)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteCustomer(customer)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Hapus
                              </Button>
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
        </main>

        {/* Customer Form Modal */}
        <CustomerForm
          customer={editingCustomer}
          isOpen={showForm}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
        />

        {/* Hutang Modal */}
        {showHutangModal && selectedCustomer && (
          <HutangModal
            customer={selectedCustomer}
            isOpen={showHutangModal}
            onSave={handleUpdateHutang}
            onCancel={() => {
              setShowHutangModal(false);
              setSelectedCustomer(null);
            }}
          />
        )}
      </div>
    </>
  );
};

export default CustomersPage;