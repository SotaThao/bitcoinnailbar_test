/**
 * Service Form Dialog Component (Molecule)
 * Popup form for creating/editing services with validation
 */

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/dialog";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Switch } from "../../ui/switch";
import { SelectItem } from "../../ui/select";
import { SelectField } from "../../ui/select-field";
import { validateServiceForm } from "../../../lib/service-menu-utils";
import { toast } from "sonner";
import { Search, Plus, X, Check } from "lucide-react";
import type { Service } from "../../../lib/admin-types";
import type { ServiceCategory } from "../../../lib/service-constants";

interface ServiceFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  editingService: Service | null;
  categories: ServiceCategory[];
  defaultCategory: string;
  onSave: (
    formData: {
      name: string;
      category: string;
      groupName: string;
      price: string;
      memberPrice: string;
      status: "active" | "disabled";
      serviceType: "regular" | "addon";
      compatibleServiceIds: string[];
      ownerRecommended?: boolean;
      durationMinutes?: number;
    },
    editingServiceId?: string,
  ) => Promise<boolean>;
  onQuickCreate?: (data: {
    name: string;
    price: string;
    memberPrice: string;
  }) => Promise<string | null>;
  allServices: Service[]; // For addon compatibility selection
  onEditAddon?: (service: Service) => void;
  onDeleteAddon?: (serviceId: string) => Promise<boolean>;
}

export function ServiceFormSheet({
  isOpen,
  onClose,
  editingService,
  categories,
  defaultCategory,
  onSave,
  onQuickCreate,
  allServices,
  onEditAddon,
  onDeleteAddon,
}: ServiceFormSheetProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: defaultCategory,
    groupName: "General",
    price: "",
    memberPrice: "",
    status: "active" as "active" | "disabled",
    serviceType: "regular" as "regular" | "addon",
    compatibleServiceIds: [] as string[],
    selectedAddons: [] as string[],
    ownerRecommended: false, // NEW: Owner recommendation flag
    durationMinutes: 45,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // New state for adding services on the fly
  const [isAddingService, setIsAddingService] = useState(false);
  const [newServiceData, setNewServiceData] = useState({
    name: "",
    price: "",
    memberPrice: "",
  });

  // Update form when editing service changes
  useEffect(() => {
    // Helper to determine initial category ID based on defaultCategory (active tab name)
    const getInitialCategory = () => {
      if (defaultCategory) {
        const match = categories.find(
          (c) => c.name === defaultCategory,
        );
        if (match) return match.name;
      }
      return categories.length > 0 ? categories[0].name : "";
    };

    if (isOpen && editingService) {
      setFormData({
        name: editingService.name,
        category:
          editingService.category || getInitialCategory(),
        groupName: editingService.groupName || "General",
        price: String(
          editingService.regular || editingService.price || "",
        ),
        memberPrice: String(
          editingService.member ||
            editingService.memberPrice ||
            "",
        ),
        status: (editingService as any).status || "active",
        serviceType: editingService.serviceType || "regular",
        compatibleServiceIds:
          editingService.compatibleServiceIds || [],
        selectedAddons: [],
        ownerRecommended:
          editingService.ownerRecommended || false, // NEW: Owner recommendation flag
        durationMinutes: editingService.durationMinutes || 45,
      });
    } else if (isOpen && !editingService) {
      // New service - use defaults
      setFormData({
        name: "",
        category: getInitialCategory(),
        groupName: "General",
        price: "",
        memberPrice: "",
        status: "active",
        serviceType: "regular",
        compatibleServiceIds: [],
        selectedAddons: [],
        ownerRecommended: false, // NEW: Owner recommendation flag
        durationMinutes: 45,
      });
    }

    if (!isOpen) {
      // Reset state when dialog closes
    }
    setSearchTerm("");
    setIsAddingService(false);
    setNewServiceData({ name: "", price: "", memberPrice: "" });
  }, [isOpen, editingService, defaultCategory, categories]);

  const handleSave = async () => {
    // Validate form
    const validation = validateServiceForm(formData);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    setIsSaving(true);

    try {
      const success = await onSave(
        formData,
        editingService?.id,
      );
      if (success) {
        onClose();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save service");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      onClose();
    }
  };

  // Filter compatible services based on search term
  // For REGULAR services: show add-ons to select
  // For ADD-ON services: no need to show compatible services
  const filteredServices = allServices.filter(
    (s) =>
      s.id !== editingService?.id &&
      s.serviceType === "addon" && // Only show add-on services for regular services to select
      s.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleCreateNewService = async () => {
    // Validation for new service - only name is required, price is optional
    if (!newServiceData.name.trim()) {
      toast.error("Please enter add-on name");
      return;
    }

    if (onQuickCreate) {
      const newId = await onQuickCreate(newServiceData);
      if (newId) {
        setIsAddingService(false);
        setNewServiceData({
          name: "",
          price: "",
          memberPrice: "",
        });

        // Automatically select the new service
        setFormData((prev) => ({
          ...prev,
          compatibleServiceIds: [
            ...prev.compatibleServiceIds,
            newId,
          ],
        }));
      }
    } else {
      // Simulation fallback
      toast.success(
        `Service "${newServiceData.name}" created (Simulation)`,
      );
      setIsAddingService(false);
      setNewServiceData({
        name: "",
        price: "",
        memberPrice: "",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingService
              ? "Edit Service"
              : "Add New Service"}
          </DialogTitle>
          <DialogDescription>
            {editingService
              ? "Make changes to the service details below."
              : "Add a new service to your menu."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Service Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Service Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
              placeholder="e.g. Gel Manicure"
              disabled={isSaving}
            />
          </div>

          {/* Category & Group */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <SelectField
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
                disabled={
                  isSaving ||
                  (formData.serviceType === "addon" &&
                    !!categories.find((cat) =>
                      ["add-on", "add-ons", "addon"].includes(
                        cat.name.toLowerCase(),
                      ),
                    ))
                }
                placeholder="Select Category"
              >
                {categories.map((cat, index) => (
                  <SelectItem
                    key={`${cat.id}-${cat.name}-${index}`}
                    value={cat.name}
                  >
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectField>
            </div>

            <div className="space-y-2">
              <Label htmlFor="group">Group / Subheader</Label>
              <Input
                id="group"
                value={formData.groupName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    groupName: e.target.value,
                  })
                }
                placeholder="e.g. FULL SET"
                disabled={isSaving}
              />
            </div>
          </div>

          {/* Prices - Enhanced with range and "+" support */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">
                Regular Price ($){" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="price"
                type="text"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: e.target.value,
                  })
                }
                placeholder="0.00"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="memberPrice">
                Member Price ($) - Optional
              </Label>
              <Input
                id="memberPrice"
                type="text"
                value={formData.memberPrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    memberPrice: e.target.value,
                  })
                }
                placeholder="Leave blank if no member price"
                disabled={isSaving}
              />
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (Minutes)</Label>
            <Input
              id="duration"
              type="number"
              min="0"
              step="5"
              value={formData.durationMinutes}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  durationMinutes:
                    parseInt(e.target.value) || 0,
                })
              }
              placeholder="e.g. 45"
              disabled={isSaving}
            />
          </div>

          {/* Service Type */}
          <div className="space-y-2">
            <Label htmlFor="serviceType">Service Type</Label>
            <SelectField
              value={formData.serviceType}
              onValueChange={(value: "regular" | "addon") => {
                const addonCategory = categories.find((cat) =>
                  ["add-on", "add-ons", "addon"].includes(
                    cat.name.toLowerCase(),
                  ),
                );

                setFormData({
                  ...formData,
                  serviceType: value,
                  groupName:
                    value === "addon"
                      ? "Add on"
                      : formData.groupName,
                  // Auto-select Add-on category if switching to Add-on type
                  category:
                    value === "addon" && addonCategory
                      ? addonCategory.name
                      : formData.category,
                  // Clear add-ons when switching to addon type
                  compatibleServiceIds:
                    value === "addon"
                      ? []
                      : formData.compatibleServiceIds,
                });
              }}
              disabled={isSaving}
              placeholder="Select Service Type"
              triggerClassName="h-auto !py-6 px-4 [&>span]:text-left"
            >
              <SelectItem value="regular">
                <div className="flex flex-col items-start text-left">
                  <span className="font-medium">
                    Regular Service
                  </span>
                  <span className="text-xs text-gray-500">
                    Standalone service (default)
                  </span>
                </div>
              </SelectItem>
              <SelectItem value="addon">
                <div className="flex flex-col items-start text-left">
                  <span className="font-medium">
                    Add-on Service
                  </span>
                  <span className="text-xs text-gray-500">
                    Enhancement for other services
                  </span>
                </div>
              </SelectItem>
            </SelectField>
          </div>

          {/* Add-ons Selection (Only show for REGULAR services) */}
          {formData.serviceType === "regular" && (
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="addons" className="text-base">
                    Service Add-ons
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Select add-ons that can be added to this
                    service
                  </p>
                </div>
                {!isAddingService ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1 text-orange-600 border-orange-200 hover:bg-orange-50"
                    onClick={() => setIsAddingService(true)}
                    type="button"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New</span>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 gap-1 text-gray-500 hover:text-gray-700"
                    onClick={() => setIsAddingService(false)}
                    type="button"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </Button>
                )}
              </div>

              {/* Add New Add-on Form */}
              {isAddingService && (
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-100 space-y-3 mb-3">
                  <div className="space-y-1">
                    <Label
                      htmlFor="new-name"
                      className="text-xs"
                    >
                      Add-on Name
                    </Label>
                    <Input
                      id="new-name"
                      placeholder="e.g. Shellac Polish"
                      className="h-8 text-sm bg-white"
                      value={newServiceData.name}
                      onChange={(e) =>
                        setNewServiceData({
                          ...newServiceData,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label
                        htmlFor="new-price"
                        className="text-xs"
                      >
                        Regular Price (Optional)
                      </Label>
                      <Input
                        id="new-price"
                        type="text"
                        placeholder="Leave blank if free"
                        className="h-8 text-sm bg-white"
                        value={newServiceData.price}
                        onChange={(e) =>
                          setNewServiceData({
                            ...newServiceData,
                            price: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor="new-member-price"
                        className="text-xs"
                      >
                        Member Price (Optional)
                      </Label>
                      <Input
                        id="new-member-price"
                        type="text"
                        placeholder="Leave blank if no member price"
                        className="h-8 text-sm bg-white"
                        value={newServiceData.memberPrice}
                        onChange={(e) =>
                          setNewServiceData({
                            ...newServiceData,
                            memberPrice: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <Button
                      size="sm"
                      onClick={handleCreateNewService}
                      className="h-7 text-xs bg-[#FF9F1C] hover:bg-[#e0890f] text-white"
                      type="button"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Create Add-on
                    </Button>
                  </div>
                </div>
              )}

              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search add-ons..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                  className="pl-9"
                />
              </div>

              <div className="border rounded-lg max-h-60 overflow-y-auto bg-gray-50 divide-y divide-gray-100">
                {filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
                    <div
                      key={service.id}
                      className="group flex items-center justify-between p-3 hover:bg-white transition-colors rounded-md"
                    >
                      <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={formData.compatibleServiceIds.includes(
                            service.id,
                          )}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                compatibleServiceIds: [
                                  ...formData.compatibleServiceIds,
                                  service.id,
                                ],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                compatibleServiceIds:
                                  formData.compatibleServiceIds.filter(
                                    (id) => id !== service.id,
                                  ),
                              });
                            }
                          }}
                          disabled={isSaving}
                          className="w-4 h-4 text-[#FF9800] focus:ring-[#FF9800] rounded border-gray-300"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {service.name}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider font-medium">
                              ADD-ON
                            </span>
                            <span>•</span>
                            <span>${service.price}</span>
                          </div>
                        </div>
                      </label>

                      {/* Edit/Delete Actions for Add-on */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:bg-orange-100 text-gray-500 hover:text-orange-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onEditAddon) {
                              onEditAddon(service);
                            } else {
                              toast.info(
                                "Edit functionality requires component update",
                              );
                            }
                          }}
                          title="Edit Add-on"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                          </svg>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 hover:bg-red-100 text-gray-500 hover:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              confirm(
                                `Delete add-on "${service.name}"?`,
                              )
                            ) {
                              toast.info(
                                "Delete functionality requires component update",
                              );
                            }
                          }}
                          title="Delete Add-on"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                          </svg>
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                    <p className="text-sm text-gray-500">
                      {searchTerm
                        ? `No add-ons found matching "${searchTerm}"`
                        : 'No add-ons available. Click "Add New" to create one.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
            <div className="space-y-0.5">
              <Label
                htmlFor="status"
                className="text-base font-medium"
              >
                Service Status
              </Label>
              <p className="text-sm text-gray-500">
                {formData.status === "active"
                  ? "Active and visible"
                  : "Disabled and hidden"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="status"
                checked={formData.status === "active"}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    status: checked ? "active" : "disabled",
                  })
                }
                disabled={isSaving}
                className="data-[state=checked]:bg-green-500"
              />
            </div>
          </div>

          {/* Owner Recommended - NEW FIELD */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-amber-50 border-amber-200">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="ownerRec"
                  className="text-base font-medium"
                >
                  ⭐ Owner Recommended
                </Label>
              </div>
              <p className="text-sm text-gray-600">
                Featured as priority in chatbot recommendations
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="ownerRec"
                checked={formData.ownerRecommended}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    ownerRecommended: checked,
                  })
                }
                disabled={isSaving}
                className="data-[state=checked]:bg-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[#FF9F1C] hover:bg-[#e0890f] text-white"
            disabled={isSaving}
          >
            {isSaving
              ? "Saving..."
              : editingService
                ? "Save Changes"
                : "Create Service"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}