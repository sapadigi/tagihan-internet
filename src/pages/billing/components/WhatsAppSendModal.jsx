import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import { wahaService } from '../../../services/wahaService';

const WhatsAppSendModal = ({ bill, customer, onClose, onSent }) => {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [messagePreview, setMessagePreview] = useState('');

  React.useEffect(() => {
    // Generate message preview
    const preview = wahaService.generateBillMessage(bill, customer);
    setMessagePreview(preview);
  }, [bill, customer]);

  const handleSendWhatsApp = async () => {
    setSending(true);
    setError('');
    setResult(null);

    try {
      const result = await wahaService.sendBillNotification(bill, customer);
      
      if (result.success) {
        setResult({
          success: true,
          message: 'Tagihan berhasil dikirim via WhatsApp!',
          messageId: result.messageId
        });
        if (onSent) onSent(result);
      } else {
        setError(result.error || 'Gagal mengirim pesan WhatsApp');
      }
    } catch (err) {
      console.error('Error sending WhatsApp:', err);
      setError('Terjadi kesalahan saat mengirim pesan');
    } finally {
      setSending(false);
    }
  };

  const formatPhoneDisplay = (phone) => {
    if (!phone) return 'Tidak ada nomor';
    return phone.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Kirim Tagihan via WhatsApp</h2>
              <p className="text-muted-foreground mt-1">
                Kirim notifikasi tagihan ke pelanggan melalui WhatsApp
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
          {/* Customer Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-foreground mb-3">Informasi Pelanggan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Nama:</span>
                <p className="font-medium text-foreground">{customer.name}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">ID Pelanggan:</span>
                <p className="font-medium text-foreground">{customer.customer_id}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">No. WhatsApp:</span>
                <p className="font-medium text-foreground">
                  {customer.phone ? formatPhoneDisplay(customer.phone) : 'Tidak ada nomor'}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Status:</span>
                <p className="font-medium text-foreground">{customer.status}</p>
              </div>
            </div>
          </div>

          {/* Bill Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-foreground mb-3">Informasi Tagihan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Nomor Tagihan:</span>
                <p className="font-medium text-foreground">{bill.bill_number}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Total Tagihan:</span>
                <p className="font-medium text-foreground">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0
                  }).format(bill.total_amount)}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Jatuh Tempo:</span>
                <p className="font-medium text-foreground">
                  {new Date(bill.due_date).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Status:</span>
                <p className="font-medium text-foreground">{bill.status}</p>
              </div>
            </div>
          </div>

          {/* Message Preview */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Preview Pesan</h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                {messagePreview}
              </pre>
            </div>
          </div>

          {/* Validation */}
          {!customer.phone && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Tidak Dapat Mengirim
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>Pelanggan tidak memiliki nomor WhatsApp. Silakan update data pelanggan terlebih dahulu.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Result Messages */}
          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Berhasil Dikirim!
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>{result.message}</p>
                    {result.messageId && (
                      <p className="text-xs mt-1">ID Pesan: {result.messageId}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Gagal Mengirim
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <div className="flex justify-end space-x-3">
            {!result && (
              <>
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={sending}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleSendWhatsApp}
                  disabled={sending || !customer.phone}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      Kirim via WhatsApp
                    </>
                  )}
                </Button>
              </>
            )}
            {result && (
              <Button onClick={onClose}>
                Selesai
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppSendModal;
