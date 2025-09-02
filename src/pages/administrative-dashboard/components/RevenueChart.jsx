import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import Button from '../../../components/ui/Button';

const RevenueChart = () => {
  const [viewMode, setViewMode] = useState('monthly');
  
  const monthlyData = [
    { name: 'Jan', revenue: 45000000, customers: 850 },
    { name: 'Feb', revenue: 52000000, customers: 920 },
    { name: 'Mar', revenue: 48000000, customers: 890 },
    { name: 'Apr', revenue: 61000000, customers: 1050 },
    { name: 'May', revenue: 55000000, customers: 980 },
    { name: 'Jun', revenue: 67000000, customers: 1120 },
    { name: 'Jul', revenue: 72000000, customers: 1200 },
    { name: 'Aug', revenue: 69000000, customers: 1180 }
  ];

  const yearlyData = [
    { name: '2020', revenue: 580000000, customers: 8500 },
    { name: '2021', revenue: 650000000, customers: 9200 },
    { name: '2022', revenue: 720000000, customers: 10100 },
    { name: '2023', revenue: 810000000, customers: 11500 },
    { name: '2024', revenue: 890000000, customers: 12800 }
  ];

  const currentData = viewMode === 'monthly' ? monthlyData : yearlyData;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-popover-foreground">{label}</p>
          <p className="text-primary">
            Pendapatan: {formatCurrency(payload?.[0]?.value)}
          </p>
          <p className="text-muted-foreground text-sm">
            Pelanggan: {payload?.[0]?.payload?.customers?.toLocaleString('id-ID')}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">Grafik Pendapatan</h3>
          <p className="text-sm text-muted-foreground">
            Tren pendapatan {viewMode === 'monthly' ? 'bulanan' : 'tahunan'}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'monthly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('monthly')}
          >
            Bulanan
          </Button>
          <Button
            variant={viewMode === 'yearly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('yearly')}
          >
            Tahunan
          </Button>
        </div>
      </div>
      <div className="w-full h-80" aria-label="Revenue Chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={currentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="name" 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <YAxis 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
              tickFormatter={(value) => `${(value / 1000000)?.toFixed(0)}M`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="revenue" 
              fill="var(--color-primary)" 
              radius={[4, 4, 0, 0]}
              name="Pendapatan"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary rounded-sm" />
            <span className="text-sm text-muted-foreground">Pendapatan</span>
          </div>
        </div>
        
        <Button variant="ghost" size="sm" iconName="Download">
          Ekspor Data
        </Button>
      </div>
    </div>
  );
};

export default RevenueChart;