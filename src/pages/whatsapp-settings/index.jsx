import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Header from '../../components/ui/Header';
import { wahaService } from '../../services/wahaService';

const WhatsAppSettingsPage = () => {
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [testing, setTesting] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);

  useEffect(() => {
    checkConnection();
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    try {
      const result = await wahaService.testConnection();
      setConnectionStatus(result);
      
      if (result.data) {
        setSessionInfo(result.data);
      }
    } catch (error) {
      setConnectionStatus({
        success: false,
        error: error.message,
        status: 'error',
        message: 'Gagal menghubungi server'
      });
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    await checkConnection();
    setTesting(false);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'WORKING': { bg: 'bg-green-100', text: 'text-green-800', label: 'Aktif' },
      'SCAN_QR_CODE': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Butuh Scan QR' },
      'STARTING': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Starting...' },
      'STOPPED': { bg: 'bg-red-100', text: 'text-red-800', label: 'Berhenti' },
      'error': { bg: 'bg-red-100', text: 'text-red-800', label: 'Error' }
    };

    const config = statusConfig[status] || statusConfig.error;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getQRCode = async () => {
    try {
      const response = await fetch(`https://waha-qwaukuvset8t.brokoli.sumopod.my.id/api/sessions/Toni/auth/qr`, {
        headers: {
          'X-Api-Key': 'XoPxIaKZAexQLhktB6kptPsd1Eg4xR7R'
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const qrUrl = URL.createObjectURL(blob);
        setQrCode(qrUrl);
      }
    } catch (error) {
      console.error('Error getting QR code:', error);
    }
  };

  const startSession = async () => {
    try {
      await wahaService.makeRequest('/api/sessions/start', 'POST', {
        name: 'Toni',
        config: {
          proxy: null,
          webhooks: []
        }
      });
      
      setTimeout(checkConnection, 2000);
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const stopSession = async () => {
    try {
      await wahaService.makeRequest('/api/sessions/stop', 'POST', {
        name: 'Toni'
      });
      
      setTimeout(checkConnection, 2000);
    } catch (error) {
      console.error('Error stopping session:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Pengaturan WhatsApp</h1>
          <p className="text-muted-foreground mt-1">Kelola koneksi dan pengaturan WhatsApp untuk notifikasi tagihan</p>
        </div>

        {/* Connection Status */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Status Koneksi</h2>
              <p className="text-muted-foreground mt-1">Status koneksi WhatsApp saat ini</p>
            </div>
            <Button
              onClick={handleTestConnection}
              disabled={testing}
              variant="outline"
            >
              {testing ? 'Testing...' : 'Test Koneksi'}
            </Button>
          </div>

          {connectionStatus && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Status:</span>
                {getStatusBadge(connectionStatus.status)}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Pesan:</span>
                <span className="text-sm text-muted-foreground">{connectionStatus.message}</span>
              </div>

              {sessionInfo && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Session:</span>
                    <span className="text-sm text-muted-foreground">{sessionInfo.name || 'Toni'}</span>
                  </div>
                  
                  {sessionInfo.me && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Nomor WhatsApp:</span>
                      <span className="text-sm text-muted-foreground">{sessionInfo.me.id}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* QR Code Section */}
        {connectionStatus?.status === 'SCAN_QR_CODE' && (
          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Scan QR Code</h2>
            <p className="text-muted-foreground mb-4">
              Silakan scan QR code berikut dengan aplikasi WhatsApp Anda untuk menghubungkan akun.
            </p>
            
            <div className="flex justify-center mb-4">
              {qrCode ? (
                <img src={qrCode} alt="QR Code" className="w-64 h-64 border rounded-lg" />
              ) : (
                <div className="w-64 h-64 bg-muted rounded-lg flex items-center justify-center">
                  <Button onClick={getQRCode}>Tampilkan QR Code</Button>
                </div>
              )}
            </div>

            <div className="text-center">
              <Button onClick={getQRCode} variant="outline">
                Refresh QR Code
              </Button>
            </div>
          </div>
        )}

        {/* Session Controls */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Kontrol Session</h2>
          <p className="text-muted-foreground mb-4">
            Kelola session WhatsApp untuk memulai atau menghentikan koneksi.
          </p>
          
          <div className="flex space-x-3">
            <Button
              onClick={startSession}
              disabled={connectionStatus?.status === 'WORKING'}
              className="bg-green-600 hover:bg-green-700"
            >
              Start Session
            </Button>
            <Button
              onClick={stopSession}
              disabled={connectionStatus?.status === 'STOPPED'}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              Stop Session
            </Button>
          </div>
        </div>

        {/* WAHA Configuration */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Konfigurasi WAHA</h2>
          <p className="text-muted-foreground mb-4">
            Pengaturan koneksi ke WAHA API server.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                WAHA Server URL
              </label>
              <Input
                type="text"
                value="https://waha-qwaukuvset8t.brokoli.sumopod.my.id"
                disabled
                className="bg-muted"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Session Name
              </label>
              <Input
                type="text"
                value="Toni"
                disabled
                className="bg-muted"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                API Key
              </label>
              <Input
                type="password"
                value="XoPxIaKZAexQLhktB6kptPsd1Eg4xR7R"
                disabled
                className="bg-muted"
              />
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">Cara Penggunaan</h2>
          <div className="space-y-3 text-blue-800">
            <div className="flex items-start">
              <span className="text-blue-600 font-bold mr-2">1.</span>
              <p>Pastikan status koneksi menunjukkan "Aktif" atau scan QR code jika diperlukan</p>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 font-bold mr-2">2.</span>
              <p>Buka halaman Tagihan untuk mengirim notifikasi WhatsApp</p>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 font-bold mr-2">3.</span>
              <p>Gunakan tombol "WhatsApp" untuk mengirim tagihan individual</p>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 font-bold mr-2">4.</span>
              <p>Gunakan "Kirim Semua via WhatsApp" untuk mengirim notifikasi massal</p>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 font-bold mr-2">5.</span>
              <p>Pastikan pelanggan memiliki nomor WhatsApp yang valid di data profil</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppSettingsPage;
