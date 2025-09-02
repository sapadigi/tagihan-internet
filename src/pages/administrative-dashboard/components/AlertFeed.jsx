import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AlertFeed = () => {
  const [alerts] = useState([
    {
      id: 1,
      type: 'payment',
      severity: 'high',
      title: 'Pembayaran Tertunggak',
      message: 'Pelanggan #12345 - Rp 450.000 tertunggak 15 hari',
      timestamp: new Date(Date.now() - 900000),
      actionable: true
    },
    {
      id: 2,
      type: 'equipment',
      severity: 'critical',
      title: 'Kerusakan Peralatan',
      message: 'Router #RT-445 tidak merespons - Area Kemang',
      timestamp: new Date(Date.now() - 1800000),
      actionable: true
    },
    {
      id: 3,
      type: 'system',
      severity: 'medium',
      title: 'Sinkronisasi API',
      message: 'WhatsApp API mengalami keterlambatan 5 menit',
      timestamp: new Date(Date.now() - 2700000),
      actionable: false
    },
    {
      id: 4,
      type: 'inventory',
      severity: 'low',
      title: 'Stok Rendah',
      message: 'Modem TP-Link tersisa 3 unit',
      timestamp: new Date(Date.now() - 3600000),
      actionable: true
    },
    {
      id: 5,
      type: 'payment',
      severity: 'medium',
      title: 'Pembayaran Gagal',
      message: 'Auto-debit gagal untuk 12 pelanggan',
      timestamp: new Date(Date.now() - 5400000),
      actionable: true
    }
  ]);

  const getAlertIcon = (type) => {
    switch (type) {
      case 'payment': return 'CreditCard';
      case 'equipment': return 'Router';
      case 'system': return 'AlertTriangle';
      case 'inventory': return 'Package';
      default: return 'Bell';
    }
  };

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-error';
      case 'high': return 'text-warning';
      case 'medium': return 'text-accent';
      case 'low': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getSeverityBadge = (severity) => {
    const colors = {
      critical: 'bg-error/10 text-error border-error/20',
      high: 'bg-warning/10 text-warning border-warning/20',
      medium: 'bg-accent/10 text-accent border-accent/20',
      low: 'bg-muted text-muted-foreground border-border'
    };
    
    const labels = {
      critical: 'Kritis',
      high: 'Tinggi',
      medium: 'Sedang',
      low: 'Rendah'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${colors?.[severity]}`}>
        {labels?.[severity]}
      </span>
    );
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 60) {
      return `${minutes} menit lalu`;
    } else if (hours < 24) {
      return `${hours} jam lalu`;
    } else {
      return timestamp?.toLocaleDateString('id-ID');
    }
  };

  const handleAlertAction = (alertId, type) => {
    console.log(`Handling alert ${alertId} of type ${type}`);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">Peringatan Sistem</h3>
          <p className="text-sm text-muted-foreground">
            {alerts?.length} item memerlukan perhatian
          </p>
        </div>
        
        <Button variant="outline" size="sm" iconName="Settings">
          Atur Peringatan
        </Button>
      </div>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {alerts?.map((alert) => (
          <div 
            key={alert.id}
            className="flex items-start space-x-4 p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
          >
            <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${getAlertColor(alert.severity)}`}>
              <Icon name={getAlertIcon(alert.type)} size={18} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-medium text-card-foreground text-sm">{alert.title}</h4>
                {getSeverityBadge(alert.severity)}
              </div>
              
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {alert.message}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {formatTime(alert.timestamp)}
                </span>
                
                {alert.actionable && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleAlertAction(alert.id, alert.type)}
                    className="text-xs"
                  >
                    Tindak Lanjut
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-error rounded-full" />
            <span className="text-xs text-muted-foreground">Kritis: 1</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-warning rounded-full" />
            <span className="text-xs text-muted-foreground">Tinggi: 1</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-accent rounded-full" />
            <span className="text-xs text-muted-foreground">Sedang: 2</span>
          </div>
        </div>
        
        <Button variant="ghost" size="sm" iconName="ExternalLink">
          Lihat Semua
        </Button>
      </div>
    </div>
  );
};

export default AlertFeed;