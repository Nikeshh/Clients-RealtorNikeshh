'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Mail, 
  Phone, 
  MessageSquare, 
  MoreVertical, 
  Trash2, 
  Edit,
  UserCheck 
} from 'lucide-react';
import Button from '@/components/Button';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/toast-context';

interface LeadActionsProps {
  lead: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    status: string;
  };
  onAction: () => void;
  onEdit: (lead: any) => void;
}

export default function LeadActions({ lead, onAction, onEdit }: LeadActionsProps) {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showConvertConfirm, setShowConvertConfirm] = useState(false);
  const [emailContent, setEmailContent] = useState('');
  const [callNotes, setCallNotes] = useState('');
  const [note, setNote] = useState('');
  const { addToast } = useToast();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowActionsDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete lead');

      addToast('Lead deleted successfully', 'success');
      onAction();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to delete lead', 'error');
    }
  };

  const handleConvert = async () => {
    try {
      const response = await fetch(`/api/leads/${lead.id}/convert`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to convert lead');

      addToast('Lead converted to client successfully', 'success');
      onAction();
      setShowConvertConfirm(false);
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to convert lead', 'error');
    }
  };

  const handleSendEmail = async () => {
    try {
      const response = await fetch(`/api/leads/${lead.id}/communicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'EMAIL',
          content: emailContent,
        }),
      });

      if (!response.ok) throw new Error('Failed to send email');

      addToast('Email sent successfully', 'success');
      setShowEmailModal(false);
      setEmailContent('');
      onAction();
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to send email', 'error');
    }
  };

  const handleLogCall = async () => {
    try {
      const response = await fetch(`/api/leads/${lead.id}/communicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'CALL',
          content: callNotes,
        }),
      });

      if (!response.ok) throw new Error('Failed to log call');

      addToast('Call logged successfully', 'success');
      setShowCallModal(false);
      setCallNotes('');
      onAction();
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to log call', 'error');
    }
  };

  const handleAddNote = async () => {
    try {
      const response = await fetch(`/api/leads/${lead.id}/communicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'NOTE',
          content: note,
        }),
      });

      if (!response.ok) throw new Error('Failed to add note');

      addToast('Note added successfully', 'success');
      setShowNoteModal(false);
      setNote('');
      onAction();
    } catch (error) {
      console.error('Error:', error);
      addToast('Failed to add note', 'error');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShowActionsDropdown(!showActionsDropdown);
        }}
        className="inline-flex items-center p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {showActionsDropdown && (
        <div 
          className="fixed transform -translate-x-full mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
          style={{
            top: dropdownRef.current?.getBoundingClientRect().bottom,
            left: dropdownRef.current?.getBoundingClientRect().right,
          }}
        >
          <div className="py-1" role="menu">
            <button
              onClick={() => {
                setShowEmailModal(true);
                setShowActionsDropdown(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </button>

            <button
              onClick={() => {
                setShowCallModal(true);
                setShowActionsDropdown(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Phone className="h-4 w-4 mr-2" />
              Log Call
            </button>

            <button
              onClick={() => {
                setShowNoteModal(true);
                setShowActionsDropdown(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Add Note
            </button>

            <div className="border-t border-gray-100" />

            <button
              onClick={() => {
                onEdit(lead);
                setShowActionsDropdown(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Lead
            </button>

            {lead.status !== 'CONVERTED' && (
              <>
                <button
                  onClick={() => {
                    setShowConvertConfirm(true);
                    setShowActionsDropdown(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Convert to Client
                </button>

                <button
                  onClick={() => {
                    setShowDeleteConfirm(true);
                    setShowActionsDropdown(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Lead
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Email Modal */}
      <Modal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        title={`Email ${lead.firstName} ${lead.lastName}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">To</label>
            <input
              type="text"
              value={lead.email}
              disabled
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Message</label>
            <textarea
              value={emailContent}
              onChange={(e) => setEmailContent(e.target.value)}
              rows={6}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              onClick={() => setShowEmailModal(false)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={!emailContent.trim()}
            >
              Send Email
            </Button>
          </div>
        </div>
      </Modal>

      {/* Call Modal */}
      <Modal
        isOpen={showCallModal}
        onClose={() => setShowCallModal(false)}
        title={`Call ${lead.firstName} ${lead.lastName}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="text"
              value={lead.phone}
              disabled
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Call Notes</label>
            <textarea
              value={callNotes}
              onChange={(e) => setCallNotes(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter notes about the call..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              onClick={() => setShowCallModal(false)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleLogCall}
              disabled={!callNotes.trim()}
            >
              Log Call
            </Button>
          </div>
        </div>
      </Modal>

      {/* Note Modal */}
      <Modal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        title="Add Note"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter your note..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              onClick={() => setShowNoteModal(false)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddNote}
              disabled={!note.trim()}
            >
              Add Note
            </Button>
          </div>
        </div>
      </Modal>

      {/* Convert Confirmation Modal */}
      <Modal
        isOpen={showConvertConfirm}
        onClose={() => setShowConvertConfirm(false)}
        title="Convert Lead to Client"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Are you sure you want to convert this lead to a client? This will create a new client record and mark the lead as converted.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => setShowConvertConfirm(false)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConvert}
              variant="primary"
            >
              Convert to Client
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Lead"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this lead? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => setShowDeleteConfirm(false)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              variant="danger"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 