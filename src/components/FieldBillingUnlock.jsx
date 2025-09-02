import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import Button from './ui/Button';
import Input from './ui/Input';

const FieldBillingUnlock = ({ onUnlock }) => {
  const { unlockFieldBilling } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = unlockFieldBilling(password);
    
    if (result.success) {
      onUnlock();
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">📱</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Field Billing</h1>
          <p className="text-gray-600">Penagihan Lapangan</p>
        </div>

        {/* Unlock Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔐 Password Akses
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password field billing"
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
            disabled={loading || !password}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Membuka...
              </div>
            ) : (
              '🔓 Buka Akses'
            )}
          </Button>
        </form>

        {/* Info */}
        <div className="mt-8 p-4 bg-green-50 rounded-lg">
          <h3 className="text-sm font-medium text-green-800 mb-2">ℹ️ Informasi</h3>
          <p className="text-xs text-green-700">
            Halaman ini digunakan untuk penagihan di lapangan. Masukkan password yang telah diberikan untuk mengakses sistem.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            © 2025 Internet Billing System - Field Access
          </p>
        </div>
      </div>
    </div>
  );
};

export default FieldBillingUnlock;
