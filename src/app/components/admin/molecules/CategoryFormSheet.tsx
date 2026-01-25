import { useState, useEffect } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Switch } from "../../ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/dialog";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react"; // Default icon for custom categories
import type { ServiceCategory } from "../../../lib/service-constants";

interface CategoryFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  editingCategory: ServiceCategory | null;
  onSave: (
    category: Omit<ServiceCategory, "id"> | ServiceCategory,
  ) => Promise<boolean>;
}

export function CategoryFormSheet({
  isOpen,
  onClose,
  editingCategory,
  onSave,
}: CategoryFormSheetProps) {
  const [formData, setFormData] = useState({
    name: "",
    key: "",
    status: "active" as "active" | "disabled",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Pre-fill form when editing
  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        key: editingCategory.key,
        status: (editingCategory as any).status || "active",
      });
    } else {
      setFormData({
        name: "",
        key: "",
        status: "active",
      });
    }
  }, [editingCategory, isOpen]);

  // Auto-generate key from name
  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      key: name
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, ""),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    if (!formData.key.trim()) {
      toast.error("Category key is required");
      return;
    }

    setIsSaving(true);

    try {
      const categoryData = {
        ...(editingCategory ? { id: editingCategory.id } : {}),
        name: formData.name.trim(),
        key: formData.key.trim(),
        status: formData.status,
      };

      const success = await onSave(categoryData as any);

      if (success) {
        onClose();
        setFormData({ name: "", key: "", status: "active" });
      }
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Failed to save category");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {editingCategory
              ? "Edit Category"
              : "Add New Category"}
          </DialogTitle>
          <DialogDescription>
            {editingCategory
              ? "Update the category details below"
              : "Create a new service category"}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 mt-6"
        >
          {/* Category Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Category Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g., Acrylic Nail Services"
              required
            />
          </div>

          {/* Category Key */}
          <div className="space-y-2">
            <Label htmlFor="key">Category Key *</Label>
            <Input
              id="key"
              value={formData.key}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  key: e.target.value,
                }))
              }
              placeholder="e.g., acrylic_nail_services"
              required
            />
            <p className="text-xs text-gray-500">
              Used internally (lowercase, underscores only)
            </p>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <div className="flex items-center gap-3">
              <Switch
                id="status"
                checked={formData.status === "active"}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: checked ? "active" : "disabled",
                  }))
                }
              />
              <div className="flex-1">
                <span
                  className={`font-semibold ${formData.status === "active" ? "text-green-600" : "text-gray-500"}`}
                >
                  {formData.status === "active"
                    ? "Active"
                    : "Disabled"}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.status === "active"
                    ? "Category and its services are visible and editable"
                    : "Category is hidden and all services are automatically disabled"}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#FF9F1C] hover:bg-[#e0890f] text-white"
              disabled={isSaving}
            >
              {isSaving
                ? "Saving..."
                : editingCategory
                  ? "Update"
                  : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}