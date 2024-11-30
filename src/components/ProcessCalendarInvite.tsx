'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast-context';
import { useLoadingStates } from '@/hooks/useLoadingStates';
import Button from '@/components/Button';
import { Calendar, Clock, X } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Meeting {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  suggestedDate?: string;
  scheduledDate?: string;
  completedAt?: string;
}

interface Props {
  clientId: string;
  meeting: Meeting;
  onUpdate: () => void;
}

export default function ProcessCalendarInvite({ clientId, meeting, onUpdate }: Props) {
  const [selectedDate, setSelectedDate] = useState<string>(
    meeting.scheduledDate || meeting.suggestedDate || ''
  );
  const [selectedTime, setSelectedTime] = useState<string>('09:00');
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();

  const handleSchedule = async () => {
    if (!selectedDate) {
      addToast('Please select a date', 'error');
      return;
    }

    setLoading('scheduleMeeting', true);
    try {
      const dateTime = new Date(`${selectedDate}T${selectedTime}`);

      const response = await fetch(`/api/clients/${clientId}/process/meetings/${meeting.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'SCHEDULED',
          scheduledDate: dateTime.toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to schedule meeting');

      addToast('Meeting scheduled successfully', 'success');
      onUpdate();
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to schedule meeting', 'error');
    } finally {
      setLoading('scheduleMeeting', false);
    }
  };

  const handleComplete = async () => {
    setLoading('completeMeeting', true);
    try {
      const response = await fetch(`/api/clients/${clientId}/process/meetings/${meeting.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'COMPLETED',
          completedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to complete meeting');

      addToast('Meeting marked as completed', 'success');
      onUpdate();
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to complete meeting', 'error');
    } finally {
      setLoading('completeMeeting', false);
    }
  };

  const handleCancel = async () => {
    setLoading('cancelMeeting', true);
    try {
      const response = await fetch(`/api/clients/${clientId}/process/meetings/${meeting.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'CANCELLED',
        }),
      });

      if (!response.ok) throw new Error('Failed to cancel meeting');

      addToast('Meeting cancelled', 'success');
      onUpdate();
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to cancel meeting', 'error');
    } finally {
      setLoading('cancelMeeting', false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-50 text-green-800';
      case 'SCHEDULED':
        return 'bg-blue-50 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-50 text-red-800';
      default:
        return 'bg-yellow-50 text-yellow-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-gray-900">{meeting.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{meeting.description}</p>
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${getStatusColor(meeting.status)}`}>
            {meeting.status}
          </div>
        </div>
      </div>

      {meeting.status === 'PENDING' && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Time</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              onClick={handleCancel}
              variant="danger"
              size="small"
              isLoading={isLoading('cancelMeeting')}
            >
              Cancel Meeting
            </Button>
            <Button
              onClick={handleSchedule}
              variant="primary"
              size="small"
              isLoading={isLoading('scheduleMeeting')}
            >
              Schedule Meeting
            </Button>
          </div>
        </div>
      )}

      {meeting.status === 'SCHEDULED' && (
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            Scheduled for: {formatDate(meeting.scheduledDate || '')}
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              onClick={handleCancel}
              variant="danger"
              size="small"
              isLoading={isLoading('cancelMeeting')}
            >
              Cancel Meeting
            </Button>
            <Button
              onClick={handleComplete}
              variant="primary"
              size="small"
              isLoading={isLoading('completeMeeting')}
            >
              Complete Meeting
            </Button>
          </div>
        </div>
      )}

      {meeting.status === 'COMPLETED' && meeting.completedAt && (
        <p className="mt-4 text-sm text-gray-500">
          Completed on: {formatDate(meeting.completedAt)}
        </p>
      )}

      {meeting.status === 'CANCELLED' && (
        <p className="mt-4 text-sm text-red-500">
          This meeting has been cancelled
        </p>
      )}
    </div>
  );
} 