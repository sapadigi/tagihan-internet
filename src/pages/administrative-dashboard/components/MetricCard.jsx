import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeType, 
  icon, 
  iconColor, 
  onClick, 
  loading = false,
  subtitle,
  alert
}) => {
  const getChangeColor = () => {
    if (changeType === 'positive') return 'text-success';
    if (changeType === 'negative') return 'text-error';
    return 'text-muted-foreground';
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') return 'TrendingUp';
    if (changeType === 'negative') return 'TrendingDown';
    return 'Minus';
  };

  return (
    <div 
      className={`bg-card border border-border rounded-lg p-6 hover:shadow-md transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-primary/20' : ''
      } ${alert ? 'border-warning/30 bg-warning/5' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconColor}`}>
              <Icon name={icon} size={20} color="white" />
            </div>
            {alert && (
              <div className="w-2 h-2 bg-warning rounded-full animate-pulse" />
            )}
          </div>
          
          <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
          
          {loading ? (
            <div className="h-8 bg-muted animate-pulse rounded w-24 mb-2" />
          ) : (
            <div className="text-2xl font-semibold text-card-foreground mb-2">{value}</div>
          )}
          
          {subtitle && (
            <p className="text-xs text-muted-foreground mb-2">{subtitle}</p>
          )}
          
          {change && (
            <div className={`flex items-center space-x-1 text-sm ${getChangeColor()}`}>
              <Icon name={getChangeIcon()} size={14} />
              <span>{change}</span>
            </div>
          )}
        </div>
        
        {onClick && (
          <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
        )}
      </div>
    </div>
  );
};

export default MetricCard;