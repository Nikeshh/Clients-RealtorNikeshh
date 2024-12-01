import { useState } from 'react';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import Button from './Button';
import Modal from './ui/Modal';
import ProcessList from './ProcessList';
import RequirementList from './RequirementList';
import ChecklistList from './ChecklistList';

interface Request {
  id: string;
  type: string;
  status: string;
  processes: any[];
  requirements: any[];
  checklist: any[];
}

interface Props {
  clientId: string;
  requests: Request[];
  onUpdate: () => void;
}

export default function ClientRequests({ clientId, requests, onUpdate }: Props) {
  const [expandedRequests, setExpandedRequests] = useState<string[]>([]);
  const [showAddRequestModal, setShowAddRequestModal] = useState(false);
  const [showAddProcessModal, setShowAddProcessModal] = useState(false);
  const [showAddRequirementModal, setShowAddRequirementModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');

  const handleAddRequest = async (type: string) => {
    try {
      const response = await fetch(`/api/clients/${clientId}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) throw new Error('Failed to create request');
      onUpdate();
      setShowAddRequestModal(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Requests</h2>
        <Button onClick={() => setShowAddRequestModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Request
        </Button>
      </div>

      <div className="space-y-4">
        {requests.map((request) => (
          <div key={request.id} className="border rounded-lg bg-white">
            <div 
              className="p-4 flex justify-between items-center cursor-pointer"
              onClick={() => setExpandedRequests(prev => 
                prev.includes(request.id) 
                  ? prev.filter(id => id !== request.id)
                  : [...prev, request.id]
              )}
            >
              <div className="flex items-center gap-4">
                <span className="font-medium">{request.type}</span>
                <span className={`px-2 py-1 rounded-full text-sm ${
                  request.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100'
                }`}>
                  {request.status}
                </span>
              </div>
              {expandedRequests.includes(request.id) ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </div>

            {expandedRequests.includes(request.id) && (
              <div className="p-4 border-t">
                <div className="flex gap-2 mb-4">
                  <Button 
                    variant="secondary"
                    size="small"
                    onClick={() => {
                      setSelectedRequestId(request.id);
                      setShowAddProcessModal(true);
                    }}
                  >
                    Add Process
                  </Button>
                  <Button 
                    variant="secondary"
                    size="small"
                    onClick={() => {
                      setSelectedRequestId(request.id);
                      setShowAddRequirementModal(true);
                    }}
                  >
                    Add Requirement
                  </Button>
                </div>

                <div className="space-y-6">
                  <ProcessList 
                    processes={request.processes}
                    clientId={clientId}
                    requestId={request.id}
                    onUpdate={onUpdate}
                  />
                  <RequirementList 
                    requirements={request.requirements}
                    clientId={clientId}
                    requestId={request.id}
                    onUpdate={onUpdate}
                  />
                  <ChecklistList 
                    checklist={request.checklist}
                    clientId={clientId}
                    requestId={request.id}
                    onUpdate={onUpdate}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Request Modal */}
      <Modal
        isOpen={showAddRequestModal}
        onClose={() => setShowAddRequestModal(false)}
        title="Add New Request"
      >
        <div className="space-y-4">
          <Button onClick={() => handleAddRequest('RENTAL')} className="w-full">
            Rental Request
          </Button>
          <Button onClick={() => handleAddRequest('BUYING')} className="w-full">
            Buying Request
          </Button>
          <Button onClick={() => handleAddRequest('SELLER')} className="w-full">
            Seller Request
          </Button>
        </div>
      </Modal>

      {/* Other modals for processes and requirements */}
    </div>
  );
} 