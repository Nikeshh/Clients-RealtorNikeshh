"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/toast-context";
import { useLoadingStates } from "@/hooks/useLoadingStates";
import Button from "@/components/Button";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  ListChecks,
  ClipboardList,
  Building2,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import StageTemplates from "./StageTemplates";
import ProcessTemplates from "./ProcessTemplates";
import RequirementForm from "./RequirementForm";
import ChecklistForm from "./ChecklistForm";
import ProcessList from "./ProcessList";
import RequirementList from "./RequirementList";
import ChecklistList from "./ChecklistList";
import SharedPropertiesList from "./SharedPropertiesList";

interface Stage {
  id: string;
  title: string;
  description?: string;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  startDate: string;
  endDate?: string;
  order: number;
  processes: Array<{
    id: string;
    title: string;
    description?: string;
    type: string;
    status: string;
    tasks: Array<{
      id: string;
      type: string;
      status: string;
    }>;
  }>;
  requirements: Array<{
    id: string;
    name: string;
    type: string;
    propertyType: string;
    budgetMin: number;
    budgetMax: number;
    bedrooms?: number;
    bathrooms?: number;
    preferredLocations: string[];
    status: string;
  }>;
  checklist: Array<{
    id: string;
    text: string;
    completed: boolean;
  }>;
  sharedProperties: Array<{
    id: string;
    property: {
      id: string;
      title: string;
      address: string;
      price: number;
      images?: string[];
    };
  }>;
}

interface Props {
  clientId: string;
  showAddStageModal: boolean;
  setShowAddStageModal: (show: boolean) => void;
}

export default function ClientStages({
  clientId,
  showAddStageModal,
  setShowAddStageModal,
}: Props) {
  const [stages, setStages] = useState<Stage[]>([]);
  const [showAddProcessModal, setShowAddProcessModal] = useState(false);
  const [showAddRequirementModal, setShowAddRequirementModal] = useState(false);
  const [showAddChecklistModal, setShowAddChecklistModal] = useState(false);
  const [expandedStages, setExpandedStages] = useState<string[]>([]);
  const [selectedStageId, setSelectedStageId] = useState<string>("");
  const { addToast } = useToast();
  const { setLoading, isLoading } = useLoadingStates();

  useEffect(() => {
    loadStages();
  }, []);

  useEffect(() => {
    if (showAddStageModal) {
      setShowAddProcessModal(false);
    }
  }, [showAddStageModal]);

  const loadStages = async () => {
    setLoading("loadStages", true);
    try {
      const response = await fetch(`/api/clients/${clientId}/stages`);
      if (!response.ok) throw new Error("Failed to fetch stages");
      const data = await response.json();
      setStages(data);
      // Expand the first stage by default
      if (data.length > 0 && expandedStages.length === 0) {
        setExpandedStages([data[0].id]);
      }
    } catch (error) {
      console.error("Error:", error);
      addToast("Failed to load stages", "error");
    } finally {
      setLoading("loadStages", false);
    }
  };

  const handleAddStage = async (template: any) => {
    setLoading("addStage", true);
    try {
      const response = await fetch(`/api/clients/${clientId}/stages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(template),
      });

      if (!response.ok) throw new Error("Failed to create stage");

      addToast("Stage created successfully", "success");
      loadStages();
      setShowAddStageModal(false);
    } catch (error) {
      console.error("Error:", error);
      addToast("Failed to create stage", "error");
    } finally {
      setLoading("addStage", false);
    }
  };

  const handleAddProcess = async (stageId: string, template: any) => {
    setLoading("addProcess", true);
    try {
      const response = await fetch(
        `/api/clients/${clientId}/stages/${stageId}/processes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(template),
        }
      );

      if (!response.ok) throw new Error("Failed to create process");

      addToast("Process created successfully", "success");
      loadStages();
      setShowAddProcessModal(false);
    } catch (error) {
      console.error("Error:", error);
      addToast("Failed to create process", "error");
    } finally {
      setLoading("addProcess", false);
    }
  };

  const toggleStageExpansion = (stageId: string) => {
    setExpandedStages((prev) =>
      prev.includes(stageId)
        ? prev.filter((id) => id !== stageId)
        : [...prev, stageId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {stages.map((stage) => (
          <div key={stage.id} className="bg-white rounded-lg shadow">
            <div
              className="p-4 flex items-center justify-between cursor-pointer"
              onClick={() => toggleStageExpansion(stage.id)}
            >
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold">{stage.title}</h2>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    stage.status === "COMPLETED"
                      ? "bg-green-100 text-green-800"
                      : stage.status === "CANCELLED"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {stage.status}
                </span>
              </div>
              {expandedStages.includes(stage.id) ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>

            {expandedStages.includes(stage.id) && (
              <div className="p-4 border-t">
                <div className="flex gap-2 mb-6">
                  <Button
                    onClick={() => {
                      setSelectedStageId(stage.id);
                      setShowAddProcessModal(true);
                    }}
                    variant="secondary"
                    size="small"
                  >
                    Add Process
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedStageId(stage.id);
                      setShowAddRequirementModal(true);
                    }}
                    variant="secondary"
                    size="small"
                  >
                    Add Requirement
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedStageId(stage.id);
                      setShowAddChecklistModal(true);
                    }}
                    variant="secondary"
                    size="small"
                  >
                    Add Checklist Item
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <ProcessList
                    processes={stage.processes}
                    clientId={clientId}
                    stageId={stage.id}
                    onUpdate={loadStages}
                  />

                  <RequirementList
                    requirements={stage.requirements}
                    clientId={clientId}
                    stageId={stage.id}
                    onUpdate={loadStages}
                  />

                  <ChecklistList
                    checklist={stage.checklist}
                    clientId={clientId}
                    stageId={stage.id}
                    onUpdate={loadStages}
                  />

                  <SharedPropertiesList
                    properties={stage.sharedProperties}
                    clientId={clientId}
                    stageId={stage.id}
                    onUpdate={loadStages}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showAddStageModal && (
        <StageTemplates
          isOpen={showAddStageModal}
          onSelect={handleAddStage}
          onClose={() => setShowAddStageModal(false)}
        />
      )}

      {showAddProcessModal && (
        <ProcessTemplates
          isOpen={showAddProcessModal}
          onSelect={(template) => handleAddProcess(selectedStageId, template)}
          onClose={() => setShowAddProcessModal(false)}
        />
      )}

      {showAddRequirementModal && (
        <Modal
          isOpen={showAddRequirementModal}
          onClose={() => setShowAddRequirementModal(false)}
          title="Add Requirement"
        >
          <RequirementForm
            stageId={selectedStageId}
            onSubmit={() => {
              loadStages();
              setShowAddRequirementModal(false);
            }}
            onCancel={() => setShowAddRequirementModal(false)}
          />
        </Modal>
      )}

      {showAddChecklistModal && (
        <Modal
          isOpen={showAddChecklistModal}
          onClose={() => setShowAddChecklistModal(false)}
          title="Add Checklist Item"
        >
          <ChecklistForm
            stageId={selectedStageId}
            onSubmit={() => {
              loadStages();
              setShowAddChecklistModal(false);
            }}
            onCancel={() => setShowAddChecklistModal(false)}
          />
        </Modal>
      )}
    </div>
  );
}
