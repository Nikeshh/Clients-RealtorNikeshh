import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface ProcessStatusBadgeProps {
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  size?: 'small' | 'medium' | 'large';
}

export default function ProcessStatusBadge({ status, size = 'medium' }: ProcessStatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'IN_PROGRESS':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'FAILED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className={`${size === 'small' ? 'h-3 w-3' : size === 'large' ? 'h-6 w-6' : 'h-4 w-4'} text-green-500`} />;
      case 'IN_PROGRESS':
        return <Clock className={`${size === 'small' ? 'h-3 w-3' : size === 'large' ? 'h-6 w-6' : 'h-4 w-4'} text-yellow-500`} />;
      case 'FAILED':
        return <AlertCircle className={`${size === 'small' ? 'h-3 w-3' : size === 'large' ? 'h-6 w-6' : 'h-4 w-4'} text-red-500`} />;
      default:
        return <Clock className={`${size === 'small' ? 'h-3 w-3' : size === 'large' ? 'h-6 w-6' : 'h-4 w-4'} text-gray-400`} />;
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'small':
        return 'px-2 py-1 text-xs';
      case 'large':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1.5 text-sm';
    }
  };

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border ${getStatusColor(status)} ${getSizeClasses(size)}`}>
      {getStatusIcon(status)}
      <span className="font-medium">
        {status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ')}
      </span>
    </div>
  );
} 