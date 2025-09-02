import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

const CashManagementPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Mock cash management data
  useEffect(() => {
    const mockTransactions = [
      {
        id: 'TXN-001',
        type: 'income',
        category: 'payment',
        description: 'Pembayaran langganan - PT. Teknologi Maju',
        amount: 2500000,
        date: '2024-08-12',
        reference: 'INV-2024-001',
        method: 'transfer'
      },
      {
        id: 'TXN-002',
        type: 'expense',
        category: 'operational',
        description: 'Pembelian perangkat router',
        amount: 1500000,
        date: '2024-08-10',
        reference: 'PO-2024-005',
        method: 'cash'
      },
      {
        id: 'TXN-003',
        type: 'income',
        category: 'payment',
        description: 'Pembayaran langganan - Sekolah Dasar Nusantara',
        amount: 1200000,
        date: '2024-08-11',
        reference: 'INV-2024-004',
        method: 'transfer'
      },
      {
        id: 'TXN-004',
        type: 'expense',
        category: 'maintenance',
        description: 'Biaya maintenance tower',
        amount: 750000,
        date: '2024-08-09',
        reference: 'MAINT-001',
        method: 'cash'
      },
      {
        id: 'TXN-005',
        type: 'expense',
        category: 'utility',
        description: 'Tagihan listrik bulan Agustus',
        amount: 3200000,
        date: '2024-08-08',
        reference: 'PLN-202408',
        method: 'transfer'
      }
    ];

    setTimeout(() => {
      setTransactions(mockTransactions);
      setLoading(false);
    }, 1000);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(amount);
  };

  const filteredTransactions = transactions?.filter(transaction => {
    const matchesSearch = transaction?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         transaction?.reference?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         transaction?.id?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesFilter = filterType === 'all' || transaction?.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const totalIncome = transactions?.filter(t => t?.type === 'income')?.reduce((sum, t) => sum + t?.amount, 0);
  const totalExpense = transactions?.filter(t => t?.type === 'expense')?.reduce((sum, t) => sum + t?.amount, 0);
  const netCashFlow = totalIncome - totalExpense;

  const getTypeColor = (type) => {
    return type === 'income' ? 'text-success' : 'text-error';
  };

  const getMethodBadge = (method) => {
    return method === 'transfer' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground';
  };

  return (
    <>
      <Helmet>
        <title>Kas - Internet Billing Admin</title>
        <meta name="description" content="Kelola arus kas dan transaksi keuangan" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Kas</h1>
                <p className="text-muted-foreground mt-1">
                  Kelola arus kas dan transaksi keuangan
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button variant="outline">
                  Export Laporan
                </Button>
                <Button className="px-4 py-2">
                  Tambah Transaksi
                </Button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="text-sm font-medium text-muted-foreground">Total Pemasukan</div>
                <div className="text-2xl font-bold text-success mt-2">
                  {formatCurrency(totalIncome)}
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="text-sm font-medium text-muted-foreground">Total Pengeluaran</div>
                <div className="text-2xl font-bold text-error mt-2">
                  {formatCurrency(totalExpense)}
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="text-sm font-medium text-muted-foreground">Arus Kas Bersih</div>
                <div className={`text-2xl font-bold mt-2 ${netCashFlow >= 0 ? 'text-success' : 'text-error'}`}>
                  {formatCurrency(netCashFlow)}
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="text-sm font-medium text-muted-foreground">Total Transaksi</div>
                <div className="text-2xl font-bold text-foreground mt-2">
                  {transactions?.length}
                </div>
              </div>
            </div>

            {/* Filters Section */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Cari Transaksi
                  </label>
                  <Input
                    type="text"
                    placeholder="Deskripsi, referensi, atau ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e?.target?.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tipe Transaksi
                  </label>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e?.target?.value)}
                  >
                    <option value="all">Semua Transaksi</option>
                    <option value="income">Pemasukan</option>
                    <option value="expense">Pengeluaran</option>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button variant="outline" className="w-full">
                    Reset Filter
                  </Button>
                </div>
              </div>
            </div>

            {/* Transaction List */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">
                  Riwayat Transaksi ({filteredTransactions?.length})
                </h2>
              </div>
              
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-muted-foreground">Memuat data transaksi...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Transaksi
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Deskripsi
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Kategori
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Jumlah
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Metode
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredTransactions?.map((transaction) => (
                        <tr key={transaction?.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-foreground">
                                {transaction?.id}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(transaction?.date)?.toLocaleDateString('id-ID')}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-foreground">{transaction?.description}</div>
                            <div className="text-sm text-muted-foreground">Ref: {transaction?.reference}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-foreground capitalize">
                              {transaction?.category?.replace('_', ' ')}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`text-sm font-medium ${getTypeColor(transaction?.type)}`}>
                              {transaction?.type === 'income' ? '+' : '-'}{formatCurrency(transaction?.amount)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMethodBadge(transaction?.method)}`}>
                              {transaction?.method === 'transfer' ? 'Transfer' : 'Tunai'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button variant="ghost" size="sm">
                                Detail
                              </Button>
                              <Button variant="ghost" size="sm">
                                Edit
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
      </div>
    </>
  );
};

export default CashManagementPage;