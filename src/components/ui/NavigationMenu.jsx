import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const NavigationMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'BarChart3',
      path: '/',
      description: 'Overview dan statistik utama'
    },
    {
      id: 'customers',
      label: 'Data Pelanggan',
      icon: 'Users',
      path: '/customers',
      description: 'Kelola informasi pelanggan'
    },
    {
      id: 'billing',
      label: 'Tagihan',
      icon: 'CreditCard',
      path: '/billing',
      description: 'Kelola tagihan dan pembayaran'
    },
    {
      id: 'field-billing',
      label: 'Penagihan Lapangan',
      icon: 'MonitorSpeaker',
      path: '/field-billing',
      description: 'Interface mobile untuk petugas lapangan'
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: 'MessageCircle',
      path: '/whatsapp-settings',
      description: 'Pengaturan notifikasi WhatsApp'
    },
    {
      id: 'cash',
      label: 'Kas',
      icon: 'Wallet',
      path: '/cash-management',
      description: 'Kelola arus kas dan transaksi'
    },
    {
      id: 'reports',
      label: 'Laporan',
      icon: 'FileText',
      path: '/reports',
      description: 'Analisis dan laporan keuangan'
    },
    {
      id: 'equipment',
      label: 'Peralatan',
      icon: 'Router',
      path: '/equipment',
      description: 'Kelola inventaris peralatan'
    }
  ];

  const handleMenuClick = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const isActive = (path) => {
    return location?.pathname === path;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="relative"
        >
          <Icon name={isOpen ? "X" : "Menu"} size={20} />
        </Button>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-1">
        {menuItems?.map((item) => (
          <Button
            key={item?.id}
            variant={isActive(item?.path) ? "default" : "ghost"}
            size="sm"
            onClick={() => handleMenuClick(item?.path)}
            className={`flex items-center space-x-2 ${
              isActive(item?.path) 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name={item?.icon} size={16} />
            <span className="font-medium">{item?.label}</span>
          </Button>
        ))}
      </nav>

      {/* Mobile Navigation Dropdown */}
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 z-50 bg-card border-b border-border shadow-lg md:hidden">
          <div className="px-4 py-2">
            <div className="grid gap-1">
              {menuItems?.map((item) => (
                <Button
                  key={item?.id}
                  variant={isActive(item?.path) ? "default" : "ghost"}
                  onClick={() => handleMenuClick(item?.path)}
                  className={`w-full justify-start px-3 py-3 ${
                    isActive(item?.path) 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon name={item?.icon} size={20} />
                    <div className="text-left">
                      <div className="font-medium">{item?.label}</div>
                      <div className="text-xs opacity-70">{item?.description}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default NavigationMenu;