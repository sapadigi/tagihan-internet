import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const SystemStatus = () => {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [systems] = useState([
    {
      id: 'accounting',
      name: 'Software Akuntansi',
      status: 'online',
      latency: 45,
      lastSync: new Date(Date.now() - 300000)
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp API',
      status: 'warning',
      latency: 120,
      lastSync: new Date(Date.now() - 600000)
    },
    {
      id: 'equipment',
      name: 'Monitor Peralatan',
      status: 'online',
      latency: 32,
      lastSync: new Date(Date.now() - 180000)
    },
    {
      id: 'payment',
      name: 'Gateway Pembayaran',
      status: 'online',
      latency: 78,
      lastSync: new Date(Date.now() - 120000)
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-success';
      case 'warning': return 'text-warning';
      case 'error': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      online: 'bg-success/10 text-success border-success/20',
      warning: 'bg-warning/10 text-warning border-warning/20',
      error: 'bg-error/10 text-error border-error/20'
    };
    
    const labels = {
      online: 'Online',
      warning: 'Peringatan',
      error: 'Error'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${colors?.[status]}`}>
        {labels?.[status]}
      </span>
    );
  };

  const formatTime = (timestamp) => {
    return timestamp?.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">Status Sistem</h3>
          <p className="text-sm text-muted-foreground">
            Terakhir diperbarui: {formatTime(lastUpdate)}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <span className="text-sm text-success">Live</span>
        </div>
      </div>
      <div className="space-y-4">
        {systems?.map((system) => (
          <div key={system?.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg bg-muted flex items-center justify-center ${getStatusColor(system?.status)}`}>
                <Icon 
                  name={
                    system?.id === 'accounting' ? 'Calculator' :
                    system?.id === 'whatsapp' ? 'MessageSquare' :
                    system?.id === 'equipment'? 'Router' : 'CreditCard'
                  } 
                  size={16} 
                />
              </div>
              
              <div>
                <h4 className="font-medium text-card-foreground text-sm">{system?.name}</h4>
                <p className="text-xs text-muted-foreground">
                  Sinkronisasi: {formatTime(system?.lastSync)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Latensi</div>
                <div className="text-sm font-medium">{system?.latency}ms</div>
              </div>
              {getStatusBadge(system?.status)}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-success rounded-full" />
              <span className="text-muted-foreground">3 Online</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-warning rounded-full" />
              <span className="text-muted-foreground">1 Peringatan</span>
            </div>
          </div>
          
          <span className="text-muted-foreground">
            Uptime: 99.8%
          </span>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;