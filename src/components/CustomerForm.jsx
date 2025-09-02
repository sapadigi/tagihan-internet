import React, { useState, useEffect } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import { customerService, packageService } from '../services/customerService';

const CustomerForm = ({ customer = null, onSave, onCancel, isOpen }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    package_name: '',
    package_speed: '',
    monthly_fee: '',
    status: 'active'
  });
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Load packages on component mount
  useEffect(() => {
    loadPackages();
  }, []);

  // Populate form when editing
  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        package_name: customer.package_name || '',
        package_speed: customer.package_speed || '',
        monthly_fee: customer.monthly_fee || '',
        status: customer.status || 'active'
      });
    } else {
      // Reset form for new customer
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        package_name: '',
        package_speed: '',
        monthly_fee: '',
        status: 'active'
      });
    }
    setErrors({});
  }, [customer, isOpen]);

  const loadPackages = async () => {
    try {
      const { data, error } = await packageService.getPackages();
      if (error) {
        console.error('Error loading packages:', error);
      } else {
        setPackages(data || []);
      }
    } catch (err) {
      console.error('Error loading packages:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };


  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama pelanggan wajib diisi';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Nomor telepon wajib diisi';
    }

    if (!formData.package_name) {
      newErrors.package_name = 'Paket wajib dipilih';
    }

    if (!formData.monthly_fee || formData.monthly_fee <= 0) {
      newErrors.monthly_fee = 'Biaya bulanan harus lebih dari 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      let result;
      if (customer) {
        // Update existing customer
        result = await customerService.updateCustomer(customer.id, formData);
      } else {
        // Create new customer
        result = await customerService.createCustomer(formData);
      }

      if (result.error) {
        alert(`Gagal ${customer ? 'mengupdate' : 'menambah'} pelanggan: ${result.error}`);
      } else {
        onSave(result.data);
      }
    } catch (err) {
      console.error('Error saving customer:', err);
      alert(`Gagal ${customer ? 'mengupdate' : 'menambah'} pelanggan`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {customer ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nama Pelanggan *
              </label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Masukkan nama pelanggan"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email *
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Masukkan email"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nomor Telepon *
              </label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Masukkan nomor telepon"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Status
              </label>
              <Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="active">Aktif</option>
                <option value="suspended">Suspend</option>
                <option value="terminated">Terminate</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Alamat
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Masukkan alamat lengkap"
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Paket Internet *
              </label>
              <Select
                name="package_name"
                value={formData.package_name}
                onChange={(value) => {
                  const selectedPackage = packages.find(pkg => pkg.name === value);
                  if (selectedPackage) {
                    setFormData(prev => ({
                      ...prev,
                      package_name: selectedPackage.name,
                      package_speed: selectedPackage.speed,
                      monthly_fee: selectedPackage.price
                    }));
                  }
                }}
                options={packages.map(pkg => ({
                  value: pkg.name,
                  label: `${pkg.name} - ${pkg.speed}`
                }))}
                placeholder="Pilih Paket"
                className={errors.package_name ? 'border-red-500' : ''}
              />
              {errors.package_name && <p className="text-red-500 text-xs mt-1">{errors.package_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Biaya Bulanan (IDR) *
              </label>
              <Input
                type="number"
                name="monthly_fee"
                value={formData.monthly_fee}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                className={errors.monthly_fee ? 'border-red-500' : ''}
              />
              {errors.monthly_fee && <p className="text-red-500 text-xs mt-1">{errors.monthly_fee}</p>}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : (customer ? 'Update' : 'Simpan')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerForm;