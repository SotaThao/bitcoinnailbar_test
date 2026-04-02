/**
 * Technician Assignment Modal (Organism)
 * Allows admin to manually assign/reassign technician with reason tracking
 */

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Textarea } from "@/app/components/ui/textarea";
import { LoadingSpinner } from "../atoms/LoadingSpinner";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import {
  getStaffDisplayName,
  normalizeStaffList,
} from "@/app/lib/staffNickName";

interface TechnicianAssignModalProps {
  open: boolean;
  onClose: () => void;
  appointmentId: string;
  currentTechnicianId?: string | null;
  onSuccess: () => void;
}

interface Technician {
  id: string;
  name: string;
  nickname?: string;
  nick_name?: string | null;
  is_available: boolean; // Changed from is_active to match backend
}

interface AssignmentReason {
  id: string;
  text: string; // Changed from 'reason' to 'text' to match backend
  category: string;
}

export function TechnicianAssignModal({
  open,
  onClose,
  appointmentId,
  currentTechnicianId,
  onSuccess,
}: TechnicianAssignModalProps) {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [reasons, setReasons] = useState<AssignmentReason[]>([]);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>("");
  const [selectedReasonId, setSelectedReasonId] = useState<string>("");
  const [customReason, setCustomReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  // Fetch technicians and reasons on mount
  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    setFetchingData(true);
    try {
      console.log('🔍 [MODAL] Fetching technicians and reasons...');

      const [techRes, reasonsRes] = await Promise.all([
        fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/staff`,
          {
            headers: { Authorization: `Bearer ${publicAnonKey}` },
          }
        ),
        fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/assignment-reasons`,
          {
            headers: { Authorization: `Bearer ${publicAnonKey}` },
          }
        ),
      ]);

      console.log('📡 [MODAL] Response status:', { 
        technicians: techRes.status, 
        reasons: reasonsRes.status 
      });

      const [techData, reasonsData] = await Promise.all([
        techRes.json(),
        reasonsRes.json(),
      ]);

      console.log('📦 [MODAL] Raw data received:', { 
        techData,
        reasonsData 
      });

      console.log('📦 [MODAL] Data summary:', { 
        technicians: techData.success ? `${techData.data?.length} items` : 'Failed',
        reasons: reasonsData.success ? `${reasonsData.data?.length} items` : 'Failed',
        techDataStructure: techData.data?.[0],
        reasonsDataStructure: reasonsData.data?.[0]
      });

      if (techData.success) {
        const techs = normalizeStaffList(techData.data || []);
        // Filter only active technicians
        const activeTechs = techs.filter((t: Technician) => t.is_available);
        console.log('✅ [MODAL] Setting technicians state:', activeTechs);
        setTechnicians(activeTechs);
      } else {
        console.error('❌ [MODAL] Technicians fetch failed:', techData.error);
      }

      if (reasonsData.success) {
        console.log('✅ [MODAL] Setting reasons state:', reasonsData.data);
        setReasons(reasonsData.data);
      } else {
        console.error('❌ [MODAL] Reasons fetch failed:', reasonsData.error);
      }
    } catch (error) {
      console.error("❌ [MODAL] Failed to fetch data:", error);
    } finally {
      setFetchingData(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedTechnicianId) {
      alert("Please select a technician");
      return;
    }

    if (!selectedReasonId) {
      alert("Please select a reason");
      return;
    }

    setLoading(true);

    try {
      // Determine final reason text
      const selectedReason = reasons.find((r) => r.id === selectedReasonId);
      let reasonText = selectedReason?.text || "";

      // If "Other" or custom input provided, use custom reason
      if (
        selectedReason?.category === "other" ||
        customReason.trim().length > 0
      ) {
        reasonText = customReason.trim() || reasonText;
      }

      // Call manual assign API
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/assignments/manual`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            appointment_id: appointmentId,
            technician_id: selectedTechnicianId,
            reason: reasonText,
            changed_by: "admin", // TODO: Replace with actual admin user
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        alert("✅ Technician assigned successfully!");
        onSuccess();
        onClose();
      } else {
        alert(`❌ Failed to assign: ${result.error}`);
      }
    } catch (error: any) {
      console.error("Assignment error:", error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const selectedReason = reasons.find((r) => r.id === selectedReasonId);
  const showCustomInput =
    selectedReason?.category === "other" || customReason.length > 0;

  // Debug render
  console.log('🎨 [MODAL] Render state:', { 
    techniciansCount: technicians.length,
    reasonsCount: reasons.length,
    fetchingData,
    technicians,
    reasons
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {currentTechnicianId ? "Reassign" : "Assign"} Technician
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Select a technician and provide a reason for this assignment.
          </DialogDescription>
        </DialogHeader>

        {fetchingData ? (
          <div className="py-8">
            <LoadingSpinner text="Loading technicians..." />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Technician Selection */}
            <div className="space-y-2">
              <Label htmlFor="technician" className="text-sm font-medium text-gray-700">
                Technician *
              </Label>
              <Select
                value={selectedTechnicianId}
                onValueChange={setSelectedTechnicianId}
              >
                <SelectTrigger id="technician" className="w-full">
                  <SelectValue placeholder="Select a technician" />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {getStaffDisplayName(tech)}
                      {tech.id === currentTechnicianId && " (Current)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reason Selection */}
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-medium text-gray-700">
                Reason *
              </Label>
              <Select
                value={selectedReasonId}
                onValueChange={setSelectedReasonId}
              >
                <SelectTrigger id="reason" className="w-full">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {reasons.map((reason) => (
                    <SelectItem key={reason.id} value={reason.id}>
                      {reason.text}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Reason Input (shown if "Other" selected or user starts typing) */}
            {showCustomInput && (
              <div className="space-y-2">
                <Label htmlFor="customReason" className="text-sm font-medium text-gray-700">
                  Custom Reason
                </Label>
                <Textarea
                  id="customReason"
                  placeholder="Provide additional details..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  rows={3}
                  className="w-full"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssign}
                disabled={loading || !selectedTechnicianId || !selectedReasonId}
                className="flex-1 bg-orange-500 text-white hover:bg-orange-600"
              >
                {loading ? "Assigning..." : "Confirm Assignment"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}