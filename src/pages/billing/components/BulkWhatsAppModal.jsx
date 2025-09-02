import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import { wahaService } from '../../../services/wahaService';

const BulkWhatsAppModal = ({ bills, onClose, onSent }) => {
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState([]);
  const [connectionTest, setConnectionTest] = useState(null);
  const [testingConnection, setTestingConnection] = useState(false);

  // Filter bills that have customer phone numbers
  const validBills = bills.filter(bill => bill.customers?.phone);
  const invalidBills = bills.filter(bill => !bill.customers?.phone);

  React.useEffect(() => {
    // Test WhatsApp connection when modal opens
    testConnection();
  }, []);

  const testConnection = async () => {
    setTestingConnection(true);
    try {
      const result = await wahaService.testConnection();
      setConnectionTest(result);
    } catch (error) {
      setConnectionTest({
        success: false,
        error: error.message,
        status: 'error',
        message: 'Gagal menghubungi server'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSendBulk = async () => {
    setSending(true);
    setProgress({ current: 0, total: validBills.length });
    setResults([]);

    const billsWithCustomers = validBills.map(bill => ({
      bill,
      customer: bill.customers
    }));

    try {
      const results = await wahaService.sendBulkBillNotifications(
        billsWithCustomers,
        (current, total, result) => {
          setProgress({ current, total });
          setResults(prev => [...prev, result]);
        }
      );

      if (onSent) onSent(results);
    } catch (error) {
      console.error('Error sending bulk WhatsApp:', error);
    } finally {
      setSending(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'WORKING':
        return <span className="text-green-500">✅</span>;
      case 'SCAN_QR_CODE':
        return <span className="text-yellow-500">⚠️</span>;
      case 'STARTING':
        return <span className="text-blue-500">🔄</span>;
      default:
        return <span className="text-red-500">❌</span>;
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'WORKING':
        return 'WhatsApp siap digunakan';
      case 'SCAN_QR_CODE':
        return 'Scan QR code diperlukan';
      case 'STARTING':
        return 'WhatsApp sedang starting...';
      default:
        return 'WhatsApp tidak tersedia';
    }
  };

  const successCount = results.filter(r => r.success).length;
  const failedCount = results.filter(r => !r.success).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Kirim Tagihan Massal via WhatsApp</h2>
              <p className="text-muted-foreground mt-1">
                Kirim notifikasi tagihan ke semua pelanggan sekaligus
              </p>
            </div>
            <Button variant="outline" onClick={onClose}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* WhatsApp Connection Status */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              Status WhatsApp
              <Button 
                variant="outline" 
                size="sm" 
                onClick={testConnection}
                disabled={testingConnection}
                className="ml-auto"
              >
                {testingConnection ? 'Testing...' : 'Test Koneksi'}
              </Button>
            </h3>
            
            {connectionTest && (
              <div className={`flex items-center p-3 rounded-lg ${
                connectionTest.success && connectionTest.status === 'WORKING' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-yellow-50 border border-yellow-200'
              }`}>
                {getStatusIcon(connectionTest.status)}
                <div className="ml-3">
                  <p className="font-medium text-sm">{getStatusMessage(connectionTest.status)}</p>
                  <p className="text-xs text-muted-foreground">{connectionTest.message}</p>
                </div>
              </div>
            )}
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-800">Siap Dikirim</p>
                  <p className="text-2xl font-bold text-green-600">{validBills.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-red-800">Tanpa No. HP</p>
                  <p className="text-2xl font-bold text-red-600">{invalidBills.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-800">Total Tagihan</p>
                  <p className="text-2xl font-bold text-blue-600">{bills.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress */}
          {sending && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">Mengirim pesan...</span>
                <span className="text-sm text-blue-600">{progress.current} / {progress.total}</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Hasil Pengiriman</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-800 font-medium">Berhasil: {successCount}</span>
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-red-800 font-medium">Gagal: {failedCount}</span>
                  </div>
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto border border-border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-2 text-left">Pelanggan</th>
                      <th className="px-4 py-2 text-left">No. HP</th>
                      <th className="px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr key={index} className="border-b border-border">
                        <td className="px-4 py-2">{result.customerName}</td>
                        <td className="px-4 py-2">{result.phone || '-'}</td>
                        <td className="px-4 py-2">
                          {result.success ? (
                            <span className="text-green-600 font-medium">✅ Berhasil</span>
                          ) : (
                            <span className="text-red-600 font-medium">❌ {result.error}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Warning for customers without phone */}
          {invalidBills.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Perhatian
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      {invalidBills.length} pelanggan tidak memiliki nomor WhatsApp dan akan dilewati. 
                      Silakan update data pelanggan terlebih dahulu.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <div className="flex justify-end space-x-3">
            {!sending && results.length === 0 && (
              <>
                <Button
                  variant="outline"
                  onClick={onClose}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleSendBulk}
                  disabled={validBills.length === 0 || (connectionTest && connectionTest.status !== 'WORKING')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  Kirim ke {validBills.length} Pelanggan
                </Button>
              </>
            )}
            {(sending || results.length > 0) && (
              <Button onClick={onClose}>
                {sending ? 'Tutup' : 'Selesai'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkWhatsAppModal;
