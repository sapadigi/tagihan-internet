import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const ReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState('revenue');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  // Mock report data
  const [reportData, setReportData] = useState({
    revenue: [
      { month: 'Jan', amount: 45000000 },
      { month: 'Feb', amount: 52000000 },
      { month: 'Mar', amount: 48000000 },
      { month: 'Apr', amount: 61000000 },
      { month: 'May', amount: 55000000 },
      { month: 'Jun', amount: 67000000 },
      { month: 'Jul', amount: 72000000 },
      { month: 'Aug', amount: 89500000 }
    ],
    customers: [
      { month: 'Jan', new: 45, churned: 12, net: 33 },
      { month: 'Feb', new: 52, churned: 15, net: 37 },
      { month: 'Mar', new: 38, churned: 8, net: 30 },
      { month: 'Apr', new: 61, churned: 18, net: 43 },
      { month: 'May', new: 49, churned: 11, net: 38 },
      { month: 'Jun', new: 67, churned: 22, net: 45 },
      { month: 'Jul', new: 55, churned: 14, net: 41 },
      { month: 'Aug', new: 42, churned: 9, net: 33 }
    ],
    packages: [
      { name: 'Home 25 Mbps', value: 35, color: '#8884d8' },
      { name: 'Home 50 Mbps', value: 28, color: '#82ca9d' },
      { name: 'Business 100 Mbps', value: 22, color: '#ffc658' },
      { name: 'Enterprise 200 Mbps', value: 10, color: '#ff7c7c' },
      { name: 'Education 75 Mbps', value: 5, color: '#8dd1e1' }
    ]
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(value);
  };

  const exportReport = () => {
    console.log(`Exporting ${selectedReport} report for ${selectedPeriod} period`);
  };

  const generateReportSummary = () => {
    const currentMonth = reportData?.revenue?.[reportData?.revenue?.length - 1];
    const previousMonth = reportData?.revenue?.[reportData?.revenue?.length - 2];
    const growth = ((currentMonth?.amount - previousMonth?.amount) / previousMonth?.amount * 100)?.toFixed(1);
    
    return {
      totalRevenue: currentMonth?.amount || 0,
      growth: growth || 0,
      totalCustomers: 1247,
      activePackages: reportData?.packages?.length || 0
    };
  };

  const summary = generateReportSummary();

  return (
    <>
      <Helmet>
        <title>Laporan - Internet Billing Admin</title>
        <meta name="description" content="Analisis laporan keuangan dan operasional" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Laporan</h1>
                <p className="text-muted-foreground mt-1">
                  Analisis laporan keuangan dan operasional
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={exportReport}>
                  Export PDF
                </Button>
                <Button variant="outline">
                  Schedule Report
                </Button>
              </div>
            </div>

            {/* Report Controls */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Jenis Laporan
                  </label>
                  <Select
                    value={selectedReport}
                    onChange={(e) => setSelectedReport(e?.target?.value)}
                  >
                    <option value="revenue">Laporan Pendapatan</option>
                    <option value="customers">Laporan Pelanggan</option>
                    <option value="packages">Distribusi Paket</option>
                    <option value="financial">Laporan Keuangan</option>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Periode
                  </label>
                  <Select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e?.target?.value)}
                  >
                    <option value="weekly">Mingguan</option>
                    <option value="monthly">Bulanan</option>
                    <option value="quarterly">Kuartalan</option>
                    <option value="yearly">Tahunan</option>
                  </Select>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="text-sm font-medium text-muted-foreground">Pendapatan Bulan Ini</div>
                <div className="text-2xl font-bold text-foreground mt-2">
                  {formatCurrency(summary?.totalRevenue)}
                </div>
                <div className="text-sm text-success mt-1">
                  +{summary?.growth}% dari bulan lalu
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="text-sm font-medium text-muted-foreground">Total Pelanggan</div>
                <div className="text-2xl font-bold text-foreground mt-2">
                  {summary?.totalCustomers?.toLocaleString('id-ID')}
                </div>
                <div className="text-sm text-success mt-1">
                  +2.3% dari bulan lalu
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="text-sm font-medium text-muted-foreground">Paket Aktif</div>
                <div className="text-2xl font-bold text-foreground mt-2">
                  {summary?.activePackages}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Jenis paket berbeda
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="text-sm font-medium text-muted-foreground">ARPU</div>
                <div className="text-2xl font-bold text-foreground mt-2">
                  {formatCurrency(summary?.totalRevenue / summary?.totalCustomers)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Average Revenue Per User
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
              {/* Revenue Chart */}
              {selectedReport === 'revenue' && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Tren Pendapatan Bulanan
                  </h3>
                  {loading ? (
                    <div className="h-64 flex items-center justify-center">
                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={reportData?.revenue}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={formatCurrency} />
                        <Tooltip formatter={(value) => [formatCurrency(value), 'Pendapatan']} />
                        <Bar dataKey="amount" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              )}

              {/* Customer Chart */}
              {selectedReport === 'customers' && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Pertumbuhan Pelanggan
                  </h3>
                  {loading ? (
                    <div className="h-64 flex items-center justify-center">
                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={reportData?.customers}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="new" stroke="#82ca9d" name="Baru" />
                        <Line type="monotone" dataKey="churned" stroke="#ff7c7c" name="Berhenti" />
                        <Line type="monotone" dataKey="net" stroke="#8884d8" name="Net Growth" />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              )}

              {/* Package Distribution */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Distribusi Paket
                </h3>
                {loading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={reportData?.packages}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {reportData?.packages?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry?.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Detailed Analytics */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Analisis Detail
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {formatCurrency(reportData?.revenue?.reduce((sum, item) => sum + item?.amount, 0))}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Total Pendapatan YTD
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">
                    {reportData?.customers?.reduce((sum, item) => sum + item?.new, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Pelanggan Baru YTD
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">
                    {reportData?.customers?.reduce((sum, item) => sum + item?.churned, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Churn Rate YTD
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ReportsPage;