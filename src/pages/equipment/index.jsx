import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

const EquipmentPage = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Mock equipment data
  useEffect(() => {
    const mockEquipment = [
      {
        id: 'RT-001',
        name: 'Router Utama Tower A',
        type: 'router',
        brand: 'Mikrotik',
        model: 'CCR1036-12G-4S',
        status: 'active',
        location: 'Tower A - Lantai 2',
        ipAddress: '192.168.1.1',
        lastMaintenance: '2024-07-15',
        nextMaintenance: '2024-10-15',
        warranty: '2025-12-31'
      },
      {
        id: 'SW-002',
        name: 'Switch Distribution B',
        type: 'switch',
        brand: 'TP-Link',
        model: 'TL-SG3428',
        status: 'active',
        location: 'Tower B - Lantai 1',
        ipAddress: '192.168.2.10',
        lastMaintenance: '2024-06-20',
        nextMaintenance: '2024-09-20',
        warranty: '2026-03-15'
      },
      {
        id: 'RT-003',
        name: 'Router Backup',
        type: 'router',
        brand: 'Ubiquiti',
        model: 'EdgeRouter Pro',
        status: 'maintenance',
        location: 'Data Center - Rack 3',
        ipAddress: '192.168.1.2',
        lastMaintenance: '2024-08-01',
        nextMaintenance: '2024-11-01',
        warranty: '2024-11-30'
      },
      {
        id: 'AP-004',
        name: 'Access Point Zona C',
        type: 'access_point',
        brand: 'Ubiquiti',
        model: 'UniFi AP AC Pro',
        status: 'offline',
        location: 'Gedung C - Lantai 3',
        ipAddress: '192.168.3.15',
        lastMaintenance: '2024-05-10',
        nextMaintenance: '2024-08-10',
        warranty: '2025-06-20'
      },
      {
        id: 'ONT-005',
        name: 'ONT Pelanggan 001',
        type: 'ont',
        brand: 'Huawei',
        model: 'HG8245H5',
        status: 'active',
        location: 'Customer Site - PT Teknologi Maju',
        ipAddress: '192.168.100.1',
        lastMaintenance: '2024-03-25',
        nextMaintenance: '2024-12-25',
        warranty: '2025-03-25'
      }
    ];

    setTimeout(() => {
      setEquipment(mockEquipment);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredEquipment = equipment?.filter(item => {
    const matchesSearch = item?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         item?.id?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         item?.location?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item?.status === filterStatus;
    const matchesType = filterType === 'all' || item?.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'maintenance': return 'bg-warning text-warning-foreground';
      case 'offline': return 'bg-error text-error-foreground';
      case 'standby': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'router': return '🔀';
      case 'switch': return '🔌';
      case 'access_point': return '📡';
      case 'ont': return '📦';
      default: return '⚙️';
    }
  };

  const equipmentSummary = {
    total: equipment?.length || 0,
    active: equipment?.filter(e => e?.status === 'active')?.length || 0,
    maintenance: equipment?.filter(e => e?.status === 'maintenance')?.length || 0,
    offline: equipment?.filter(e => e?.status === 'offline')?.length || 0
  };

  return (
    <>
      <Helmet>
        <title>Peralatan - Internet Billing Admin</title>
        <meta name="description" content="Kelola inventaris dan status peralatan jaringan" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Peralatan</h1>
                <p className="text-muted-foreground mt-1">
                  Kelola inventaris dan status peralatan jaringan
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button variant="outline">
                  Schedule Maintenance
                </Button>
                <Button className="px-4 py-2">
                  Tambah Peralatan
                </Button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="text-sm font-medium text-muted-foreground">Total Peralatan</div>
                <div className="text-2xl font-bold text-foreground mt-2">
                  {equipmentSummary?.total}
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="text-sm font-medium text-muted-foreground">Aktif</div>
                <div className="text-2xl font-bold text-success mt-2">
                  {equipmentSummary?.active}
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="text-sm font-medium text-muted-foreground">Maintenance</div>
                <div className="text-2xl font-bold text-warning mt-2">
                  {equipmentSummary?.maintenance}
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="text-sm font-medium text-muted-foreground">Offline</div>
                <div className="text-2xl font-bold text-error mt-2">
                  {equipmentSummary?.offline}
                </div>
              </div>
            </div>

            {/* Filters Section */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Cari Peralatan
                  </label>
                  <Input
                    type="text"
                    placeholder="Nama, ID, atau lokasi..."
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
                    <option value="maintenance">Maintenance</option>
                    <option value="offline">Offline</option>
                    <option value="standby">Standby</option>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tipe Peralatan
                  </label>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e?.target?.value)}
                  >
                    <option value="all">Semua Tipe</option>
                    <option value="router">Router</option>
                    <option value="switch">Switch</option>
                    <option value="access_point">Access Point</option>
                    <option value="ont">ONT</option>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button variant="outline" className="w-full">
                    Reset Filter
                  </Button>
                </div>
              </div>
            </div>

            {/* Equipment List */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">
                  Daftar Peralatan ({filteredEquipment?.length})
                </h2>
              </div>
              
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-muted-foreground">Memuat data peralatan...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Peralatan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Spesifikasi
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Lokasi
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Maintenance
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredEquipment?.map((item) => (
                        <tr key={item?.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="text-2xl">{getTypeIcon(item?.type)}</div>
                              <div>
                                <div className="text-sm font-medium text-foreground">
                                  {item?.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  ID: {item?.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-foreground">{item?.brand} {item?.model}</div>
                            <div className="text-sm text-muted-foreground">IP: {item?.ipAddress}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-foreground">{item?.location}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item?.status)}`}>
                              {item?.status === 'active' ? 'Aktif' : 
                               item?.status === 'maintenance' ? 'Maintenance' :
                               item?.status === 'offline' ? 'Offline' : 'Standby'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-foreground">
                              Terakhir: {new Date(item?.lastMaintenance)?.toLocaleDateString('id-ID')}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Berikutnya: {new Date(item?.nextMaintenance)?.toLocaleDateString('id-ID')}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button variant="ghost" size="sm">
                                Detail
                              </Button>
                              <Button variant="ghost" size="sm">
                                Monitor
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

export default EquipmentPage;