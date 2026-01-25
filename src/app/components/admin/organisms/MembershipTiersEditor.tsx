import { useState, useEffect } from "react";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { getAuthToken } from "/utils/auth";
import {
  useMembershipTiers,
  MembershipTier,
} from "../../../hooks/useMembershipTiers";
import { MembershipCard } from "../../molecules/MembershipCard";
import { TIER_VISUALS } from "../../../lib/membership-visuals";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { SelectItem } from "@/app/components/ui/select";
import { SelectField } from "@/app/components/ui/select-field";
import { Loader2, Save, RotateCcw } from "lucide-react";

export function MembershipTiersEditor() {
  const {
    tiers: initialTiers,
    loading: initialLoading,
    error,
  } = useMembershipTiers();
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [selectedTierId, setSelectedTierId] = useState<
    string | null
  >(null);
  const [saving, setSaving] = useState(false);
  const [benefitsText, setBenefitsText] = useState("");

  useEffect(() => {
    if (initialTiers.length > 0) {
      setTiers(initialTiers);
      // Select first tier by default
      if (!selectedTierId) {
        setSelectedTierId(initialTiers[0].id);
        setBenefitsText(initialTiers[0].benefits.join("\n"));
      }
    }
  }, [initialTiers, selectedTierId]);

  // Sync benefits text when selected tier changes
  useEffect(() => {
    if (selectedTierId) {
      const tier = tiers.find((t) => t.id === selectedTierId);
      if (tier) {
        setBenefitsText(tier.benefits.join("\n"));
      }
    }
  }, [selectedTierId, tiers]);

  const handleTierChange = (
    field: keyof MembershipTier,
    value: any,
  ) => {
    if (!selectedTierId) return;

    setTiers((prev) => {
      const updated = prev.map((t) => {
        if (t.id === selectedTierId) {
          return { ...t, [field]: value };
        }
        return t;
      });
      return updated;
    });
  };

  const handleBenefitsChange = (text: string) => {
    setBenefitsText(text);
    const benefitsArray = text
      .split("\n")
      .filter((line) => line.trim() !== "");

    // Update benefits directly without triggering the useEffect
    if (!selectedTierId) return;

    setTiers((prev) =>
      prev.map((t) => {
        if (t.id === selectedTierId) {
          return { ...t, benefits: benefitsArray };
        }
        return t;
      }),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/memberships/tiers/config`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "X-Session-Token": token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tiers }),
        },
      );

      const data = await response.json();
      if (data.success) {
        toast.success(
          "✅ Membership tiers updated successfully!",
        );
      } else {
        throw new Error(data.error || "Failed to save");
      }
    } catch (error: any) {
      console.error("Failed to save tiers:", error);
      toast.error(`❌ Failed to save: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Error loading tiers: {error}
      </div>
    );
  }

  const selectedTier = tiers.find(
    (t) => t.id === selectedTierId,
  );
  const selectedVisual = selectedTier
    ? TIER_VISUALS[selectedTier.name] || TIER_VISUALS["silver"]
    : TIER_VISUALS["silver"];

  return (
    <div className="space-y-4">
      {/* Header with Add Button - OUTSIDE grid */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          Manage membership tiers and pricing
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const newId = self.crypto.randomUUID();
            setTiers([
              ...tiers,
              {
                id: newId,
                name: "custom",
                display_name: "New Tier",
                price: 99,
                duration_months: 12,
                billing_cycle: "year",
                discount_percentage: 0,
                benefits: ["Access to features"],
                color: "text-gray-400",
              },
            ]);
            setSelectedTierId(newId);
          }}
          className="border-[#F97316] text-[#F97316] hover:bg-[#F97316] hover:text-white"
        >
          + Add Membership Tier
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar: Tier List */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardContent className="p-2">
              <div className="flex flex-col gap-2">
                {tiers.map((tier) => (
                  <div
                    key={tier.id}
                    onClick={() => setSelectedTierId(tier.id)}
                    className={`group flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      selectedTierId === tier.id
                        ? "bg-primary text-white shadow-md"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <span className="truncate mr-2">
                      {tier.display_name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-7 w-7 min-w-7 opacity-0 group-hover:opacity-100 transition-all ${
                        selectedTierId === tier.id
                          ? "text-white/70 hover:text-white hover:bg-white/20"
                          : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          confirm(
                            "Are you sure you want to delete this tier?",
                          )
                        ) {
                          setTiers(
                            tiers.filter((t) => t.id !== tier.id),
                          );
                          if (selectedTierId === tier.id)
                            setSelectedTierId(null);
                        }
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle: Editor Form */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Edit Tier</CardTitle>
              <CardDescription>
                Customize price and benefits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedTier ? (
                <>
                  <div className="space-y-2">
                    <Label>Display Name</Label>
                    <Input
                      value={selectedTier.display_name}
                      onChange={(e) =>
                        handleTierChange(
                          "display_name",
                          e.target.value,
                        )
                      }
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Price ($)</Label>
                      <Input
                        type="number"
                        value={selectedTier.price}
                        onChange={(e) =>
                          handleTierChange(
                            "price",
                            Number(e.target.value),
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Billing Cycle</Label>
                      <SelectField
                        value={
                          selectedTier.billing_cycle || "year"
                        }
                        onValueChange={(value) =>
                          handleTierChange("billing_cycle", value)
                        }
                      >
                        <SelectItem value="week">
                          Weekly
                        </SelectItem>
                        <SelectItem value="month">
                          Monthly
                        </SelectItem>
                        <SelectItem value="year">
                          Yearly
                        </SelectItem>
                      </SelectField>
                    </div>
                    <div className="space-y-2">
                      <Label>Discount (%)</Label>
                      <Input
                        type="number"
                        value={selectedTier.discount_percentage}
                        onChange={(e) =>
                          handleTierChange(
                            "discount_percentage",
                            Number(e.target.value),
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 py-2">
                    <input
                      type="checkbox"
                      id="is_popular"
                      checked={selectedTier.is_popular || false}
                      onChange={(e) =>
                        handleTierChange(
                          "is_popular",
                          e.target.checked,
                        )
                      }
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                    />
                    <Label
                      htmlFor="is_popular"
                      className="cursor-pointer"
                    >
                      Recommended (Most Popular)
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Benefits (One per line)</Label>
                    <Textarea
                      rows={8}
                      value={benefitsText}
                      onChange={(e) =>
                        handleBenefitsChange(e.target.value)
                      }
                      className="font-mono text-sm"
                    />
                  </div>
                </>
              ) : (
                <p className="text-gray-500">
                  Select a tier to edit
                </p>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto bg-orange-500 text-white hover:bg-orange-600"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="lg:col-span-4 space-y-4">
          <div className="sticky top-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
              Live Preview
            </h3>
            {selectedTier && (
              <div className="transform scale-90 origin-top">
                <MembershipCard
                  tier={selectedTier}
                  visual={
                    selectedVisual
                      ? {
                          ...selectedVisual,
                          popular:
                            selectedTier.is_popular || false,
                        }
                      : selectedVisual!
                  }
                  saveText={
                    selectedTier.discount_percentage > 0
                      ? `Save ${selectedTier.discount_percentage}%`
                      : null
                  }
                  previewMode={true}
                />
              </div>
            )}
            <p className="text-xs text-center text-gray-400 mt-4">
              Note: Visual styles (colors, icons) are linked to
              the tier type and cannot be changed here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}