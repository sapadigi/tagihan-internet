import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import MetricCard from './components/MetricCard';
import RevenueChart from './components/RevenueChart';
import AlertFeed from './components/AlertFeed';
import QuickActions from './components/QuickActions';
import SystemStatus from './components/SystemStatus';

const AdministrativeDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [userRole] = useState('Billing Manager');
  
  // Mock real-time data
  const [dashboardData, setDashboardData] = useState({
    activeCustomers: 1247,
    monthlyBilling: 89500000,
    outstandingPayments: 12300000,
    equipmentActive: 1189,
    equipmentIssues: 8,
    lowStockItems: 3
  });

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    // Simulate real-time updates every 30 seconds
    const updateInterval = setInterval(() => {
      setDashboardData(prev => ({
        ...prev,
        activeCustomers: prev?.activeCustomers + Math.floor(Math.random() * 3) - 1,
        outstandingPayments: prev?.outstandingPayments + (Math.random() - 0.5) * 500000
      }));
    }, 30000);

    // Keyboard shortcuts
    const handleKeyPress = (e) => {
      if (e?.ctrlKey) {
        switch (e?.key) {
          case '1':
            e?.preventDefault();
            document.getElementById('customers-panel')?.scrollIntoView({ behavior: 'smooth' });
            break;
          case '2':
            e?.preventDefault();
            document.getElementById('billing-panel')?.scrollIntoView({ behavior: 'smooth' });
            break;
          case '3':
            e?.preventDefault();
            document.getElementById('equipment-panel')?.scrollIntoView({ behavior: 'smooth' });
            break;
          case '4':
            e?.preventDefault();
            document.getElementById('revenue-panel')?.scrollIntoView({ behavior: 'smooth' });
            break;
          case 'i':
            e?.preventDefault();
            console.log('Quick invoice shortcut');
            break;
          case 'f':
            e?.preventDefault();
            console.log('Customer lookup shortcut');
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      clearTimeout(timer);
      clearInterval(updateInterval);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(amount);
  };

  const handleCustomerClick = () => {
    console.log('Navigate to customer management');
  };

  const handleBillingClick = () => {
    console.log('Navigate to billing management');
  };

  const handleEquipmentClick = () => {
    console.log('Navigate to equipment inventory');
  };

  const handleExportDashboard = () => {
    console.log('Exporting dashboard snapshot');
  };

  return (
    <>
      <Helmet>
        <title>Dashboard Administratif - Internet Billing Admin</title>
        <meta name="description" content="Pusat komando ISP untuk visibilitas operasional komprehensif dan pengambilan keputusan cepat" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard Administratif</h1>
                <p className="text-muted-foreground mt-1">
                  Selamat datang, {userRole} • {new Date()?.toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-2 bg-card border border-border rounded-lg">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  <span className="text-sm text-muted-foreground">Live Data</span>
                </div>
                
                <button
                  onClick={handleExportDashboard}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  Ekspor Dashboard
                </button>
              </div>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              {/* Customer Metrics */}
              <div id="customers-panel">
                <MetricCard
                  title="Pelanggan Aktif"
                  value={dashboardData?.activeCustomers?.toLocaleString('id-ID')}
                  change="+2.3% dari bulan lalu"
                  changeType="positive"
                  icon="Users"
                  iconColor="bg-primary"
                  onClick={handleCustomerClick}
                  loading={loading}
                  subtitle="Target: 1.300 pelanggan"
                />
              </div>

              {/* Billing Metrics */}
              <div id="billing-panel">
                <MetricCard
                  title="Tagihan Bulanan"
                  value={formatCurrency(dashboardData?.monthlyBilling)}
                  change="+8.1% dari bulan lalu"
                  changeType="positive"
                  icon="CreditCard"
                  iconColor="bg-success"
                  onClick={handleBillingClick}
                  loading={loading}
                  subtitle="Agustus 2024"
                />
              </div>

              {/* Outstanding Payments */}
              <div>
                <MetricCard
                  title="Pembayaran Tertunggak"
                  value={formatCurrency(dashboardData?.outstandingPayments)}
                  change="-5.2% dari minggu lalu"
                  changeType="positive"
                  icon="AlertTriangle"
                  iconColor="bg-warning"
                  onClick={handleBillingClick}
                  loading={loading}
                  subtitle="67 pelanggan"
                  alert={dashboardData?.outstandingPayments > 10000000}
                />
              </div>

              {/* Equipment Status */}
              <div id="equipment-panel">
                <MetricCard
                  title="Peralatan Aktif"
                  value={`${dashboardData?.equipmentActive}/${dashboardData?.equipmentActive + dashboardData?.equipmentIssues}`}
                  change={`${dashboardData?.equipmentIssues} bermasalah`}
                  changeType={dashboardData?.equipmentIssues > 5 ? "negative" : "neutral"}
                  icon="Router"
                  iconColor="bg-accent"
                  onClick={handleEquipmentClick}
                  loading={loading}
                  subtitle={`${dashboardData?.lowStockItems} item stok rendah`}
                  alert={dashboardData?.equipmentIssues > 5 || dashboardData?.lowStockItems > 2}
                />
              </div>
            </div>

            {/* Secondary Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
              {/* Revenue Chart - Takes 2 columns */}
              <div id="revenue-panel" className="xl:col-span-2">
                <RevenueChart />
              </div>

              {/* Quick Actions */}
              <div>
                <QuickActions />
              </div>
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Alert Feed */}
              <div>
                <AlertFeed />
              </div>

              {/* System Status */}
              <div>
                <SystemStatus />
              </div>
            </div>

            {/* Footer Info */}
            <div className="mt-8 pt-6 border-t border-border">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div>
                  <p>Data terakhir diperbarui: {new Date()?.toLocaleTimeString('id-ID')}</p>
                  <p className="mt-1">Pintasan: Ctrl+1-4 untuk navigasi panel • Ctrl+I untuk invoice cepat</p>
                </div>
                
                <div className="text-right">
                  <p>Sistem Billing Internet v2.1.0</p>
                  <p className="mt-1">© {new Date()?.getFullYear()} InternetBill Admin</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default AdministrativeDashboard;