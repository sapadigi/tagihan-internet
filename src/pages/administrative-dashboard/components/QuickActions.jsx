import React from 'react';
import Button from '../../../components/ui/Button';

const QuickActions = () => {
  const handleQuickInvoice = () => {
    console.log('Generating quick invoice');
  };

  const handleCustomerLookup = () => {
    console.log('Opening customer lookup');
  };

  const handleEquipmentAssignment = () => {
    console.log('Opening equipment assignment');
  };

  const handleBulkReminder = () => {
    console.log('Sending bulk payment reminders');
  };

  const handleReports = () => {
    console.log('Generating reports');
  };

  const handleBackup = () => {
    console.log('Initiating data backup');
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">Aksi Cepat</h3>
        <p className="text-sm text-muted-foreground">
          Akses fitur yang sering digunakan
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          onClick={handleQuickInvoice}
          iconName="FileText"
          iconPosition="left"
          className="justify-start h-12"
        >
          <div className="text-left">
            <div className="font-medium">Buat Invoice</div>
            <div className="text-xs text-muted-foreground">Ctrl+I</div>
          </div>
        </Button>

        <Button
          variant="outline"
          onClick={handleCustomerLookup}
          iconName="Search"
          iconPosition="left"
          className="justify-start h-12"
        >
          <div className="text-left">
            <div className="font-medium">Cari Pelanggan</div>
            <div className="text-xs text-muted-foreground">Ctrl+F</div>
          </div>
        </Button>

        <Button
          variant="outline"
          onClick={handleEquipmentAssignment}
          iconName="Router"
          iconPosition="left"
          className="justify-start h-12"
        >
          <div className="text-left">
            <div className="font-medium">Assign Peralatan</div>
            <div className="text-xs text-muted-foreground">Ctrl+E</div>
          </div>
        </Button>

        <Button
          variant="outline"
          onClick={handleBulkReminder}
          iconName="MessageSquare"
          iconPosition="left"
          className="justify-start h-12"
        >
          <div className="text-left">
            <div className="font-medium">Kirim Reminder</div>
            <div className="text-xs text-muted-foreground">Ctrl+R</div>
          </div>
        </Button>

        <Button
          variant="outline"
          onClick={handleReports}
          iconName="BarChart3"
          iconPosition="left"
          className="justify-start h-12"
        >
          <div className="text-left">
            <div className="font-medium">Laporan</div>
            <div className="text-xs text-muted-foreground">Ctrl+L</div>
          </div>
        </Button>

        <Button
          variant="outline"
          onClick={handleBackup}
          iconName="Database"
          iconPosition="left"
          className="justify-start h-12"
        >
          <div className="text-left">
            <div className="font-medium">Backup Data</div>
            <div className="text-xs text-muted-foreground">Ctrl+B</div>
          </div>
        </Button>
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          <p className="mb-1">Pintasan Keyboard:</p>
          <p>1-4: Navigasi panel • Ctrl+Shift+D: Dashboard • Esc: Tutup dialog</p>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;