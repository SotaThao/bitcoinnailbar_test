import { useState, useEffect } from "react";
import {
  GripVertical,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Upload,
  X,
  Loader2,
  Save,
  Star,
} from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import {
  PillTabs,
  PillTabsContent,
  PillTabsList,
  PillTabsTrigger,
} from "../../ui/pill-tabs";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { toast } from "sonner";

interface PromotionLanguageData {
  badge?: string;
  title: string;
  subtitle?: string;
  discount: string;
  description: string;
  days?: string;
  time?: string;
  buttonText: string;
  buttonLink: string;
  backgroundImage?: string;
  backgroundImagePath?: string;
  iconImage?: string;
  iconImagePath?: string;
}

interface Promotion {
  id: string;
  type: "crypto" | "golden-hour" | "vip-royalty";
  enabled: boolean;
  featured: boolean; // For homepage carousel popup
  vi: PromotionLanguageData;
  en: PromotionLanguageData;
}

interface PromotionEditorProps {
  onSave?: (promotions: Promotion[]) => void;
}

export function PromotionEditor({
  onSave,
}: PromotionEditorProps) {
  const [promotions, setPromotions] = useState<Promotion[]>([
    {
      id: "1",
      type: "crypto",
      enabled: true,
      featured: true, // For homepage carousel popup
      vi: {
        badge: "THANH TOÁN 4.0",
        title: "THANH TOÁN BẰNG",
        subtitle: "CRYPTO",
        discount: "GIẢM 10%",
        description:
          "Nhận ngay ưu đãi giảm 10% khi thanh toán bằng Bitcoin, USDT hoặc ví VLinkPay.",
        buttonText: "THANH TOÁN NGAY",
        buttonLink:
          "https://bitcoinnailbarnew1.tiiny.site/#contact",
      },
      en: {
        badge: "PAYMENT 4.0",
        title: "PAY WITH",
        subtitle: "CRYPTO",
        discount: "10% OFF",
        description:
          "Get an instant 10% OFF when you pay with Bitcoin, USDT or VLinkPay wallet.",
        buttonText: "PAY NOW",
        buttonLink:
          "https://bitcoinnailbarnew1.tiiny.site/#contact",
      },
    },
    {
      id: "2",
      type: "golden-hour",
      enabled: true,
      featured: true, // For homepage carousel popup
      vi: {
        title: "GIỜ VÀNG",
        days: "THỨ HAI - THỨ NĂM",
        time: "12:00 PM - 3:30 PM",
        discount: "GIẢM 15%",
        description: "Ưu đãi đặc biệt trong khung giờ vàng",
        buttonText: "ĐẶT LỊCH NGAY",
        buttonLink:
          "https://bitcoinnailbarnew1.tiiny.site/#contact",
      },
      en: {
        title: "GOLDEN HOUR",
        days: "MONDAY - THURSDAY",
        time: "12:00 PM - 3:30 PM",
        discount: "15% OFF",
        description: "Special discount during our golden hours",
        buttonText: "BOOK APPOINTMENT",
        buttonLink:
          "https://bitcoinnailbarnew1.tiiny.site/#contact",
      },
    },
    {
      id: "3",
      type: "vip-royalty",
      enabled: true,
      featured: true, // For homepage carousel popup
      vi: {
        badge: "THÀNH VIÊN ĐẶC BIỆT",
        title: "VIP HOÀNG GIA",
        discount: "TẶNG $50",
        description:
          "Tham gia câu lạc bộ độc quyền ngay hôm nay. Nhận ngay $50 CREDIT khi đăng ký.",
        buttonText: "THAM GIA NGAY",
        buttonLink: "#membership",
      },
      en: {
        badge: "MEMBERS ONLY",
        title: "VIP ROYALTY",
        discount: "$50 CREDIT",
        description:
          "Join our exclusive club today. Receive $50 CREDIT instantly upon registration.",
        buttonText: "JOIN CLUB",
        buttonLink: "#membership",
      },
    },
  ]);

  const [expandedId, setExpandedId] = useState<string | null>(
    null,
  );
  const [uploadingImages, setUploadingImages] = useState<
    Record<string, boolean>
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch promotions from backend on mount
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/settings/promotions`,
          {
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
          },
        );

        const result = await response.json();

        if (result.success && result.data?.promotions) {
          setPromotions(result.data.promotions);
          console.log(
            "✅ [PROMOTION EDITOR] Loaded promotions from backend",
          );
        }
      } catch (error) {
        console.error(
          "❌ [PROMOTION EDITOR] Failed to fetch promotions:",
          error,
        );
        toast.error("Failed to load promotions", {
          description: "Using default promotions instead.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleToggleEnabled = (id: string) => {
    setPromotions((prev) =>
      prev.map((promo) =>
        promo.id === id
          ? { ...promo, enabled: !promo.enabled }
          : promo,
      ),
    );
  };

  const handleToggleFeatured = (id: string) => {
    setPromotions((prev) =>
      prev.map((promo) =>
        promo.id === id
          ? { ...promo, featured: !promo.featured }
          : promo,
      ),
    );
  };

  const handleUpdateField = (
    id: string,
    lang: "vi" | "en",
    field: keyof PromotionLanguageData,
    value: string,
  ) => {
    setPromotions((prev) =>
      prev.map((promo) =>
        promo.id === id
          ? {
              ...promo,
              [lang]: { ...promo[lang], [field]: value },
            }
          : promo,
      ),
    );
  };

  const handleImageUpload = async (
    promoId: string,
    lang: "vi" | "en",
    imageType: "background" | "icon",
    file: File,
  ) => {
    const uploadKey = `${promoId}-${lang}-${imageType}`;
    setUploadingImages((prev) => ({
      ...prev,
      [uploadKey]: true,
    }));

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", lang);
      formData.append("promotionId", promoId);
      formData.append("imageType", imageType);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/promotions/upload-image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: formData,
        },
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Upload failed");
      }

      // Update promotion with signed URL
      const imageField =
        imageType === "background"
          ? "backgroundImage"
          : "iconImage";
      const pathField =
        imageType === "background"
          ? "backgroundImagePath"
          : "iconImagePath";

      setPromotions((prev) =>
        prev.map((promo) =>
          promo.id === promoId
            ? {
                ...promo,
                [lang]: {
                  ...promo[lang],
                  [imageField]: result.data.signedUrl,
                  [pathField]: result.data.path,
                },
              }
            : promo,
        ),
      );

      console.log(
        "✅ Image uploaded successfully:",
        result.data.filename,
      );
    } catch (error: any) {
      console.error("❌ Upload error:", error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploadingImages((prev) => ({
        ...prev,
        [uploadKey]: false,
      }));
    }
  };

  const handleRemoveImage = async (
    promoId: string,
    lang: "vi" | "en",
    imageType: "background" | "icon",
  ) => {
    const promo = promotions.find((p) => p.id === promoId);
    if (!promo) return;

    const pathField =
      imageType === "background"
        ? "backgroundImagePath"
        : "iconImagePath";
    const path = promo[lang][pathField];

    if (!path) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/promotions/delete-image`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ path }),
        },
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Delete failed");
      }

      // Remove image from promotion
      const imageField =
        imageType === "background"
          ? "backgroundImage"
          : "iconImage";

      setPromotions((prev) =>
        prev.map((p) =>
          p.id === promoId
            ? {
                ...p,
                [lang]: {
                  ...p[lang],
                  [imageField]: undefined,
                  [pathField]: undefined,
                },
              }
            : p,
        ),
      );

      console.log("✅ Image removed successfully");
    } catch (error: any) {
      console.error("❌ Delete error:", error);
      alert(`Delete failed: ${error.message}`);
    }
  };

  const getPromotionTypeLabel = (type: Promotion["type"]) => {
    switch (type) {
      case "crypto":
        return "Pay With Crypto";
      case "golden-hour":
        return "Golden Hour";
      case "vip-royalty":
        return "VIP Royalty";
      default:
        return type;
    }
  };

  const getPromotionTypeColor = (type: Promotion["type"]) => {
    switch (type) {
      case "crypto":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "golden-hour":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "vip-royalty":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Call backend API to save promotions
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/admin/settings/promotions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ promotions }),
        },
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.error || "Failed to save promotions",
        );
      }

      // Call onSave callback if provided
      onSave?.(promotions);

      // Dispatch custom event to notify App.tsx to refetch promotions
      window.dispatchEvent(
        new CustomEvent("promotions-updated"),
      );

      // Show success toast
      toast.success("✅ Promotions saved successfully!", {
        description:
          "Your changes have been applied to the homepage carousel.",
      });

      console.log("✅ Promotions saved successfully");
    } catch (error: any) {
      console.error("❌ Save promotions error:", error);
      toast.error("❌ Failed to save promotions", {
        description: error.message || "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPromotion = () => {
    const newId = String(Date.now()); // Simple unique ID
    const newPromotion: Promotion = {
      id: newId,
      type: "crypto", // Default type
      enabled: true,
      featured: false,
      vi: {
        title: "CHƯƠNG TRÌNH MỚI",
        discount: "GIẢM 10%",
        description: "Mô tả chương trình khuyến mãi mới",
        buttonText: "XEM NGAY",
        buttonLink: "#",
      },
      en: {
        title: "NEW PROMOTION",
        discount: "10% OFF",
        description: "New promotion description",
        buttonText: "LEARN MORE",
        buttonLink: "#",
      },
    };

    setPromotions((prev) => [...prev, newPromotion]);
    setExpandedId(newId); // Auto-expand new promotion
    
    toast.success("✨ New promotion added!", {
      description: "Don't forget to customize and save your changes.",
    });
  };

  const handleDeletePromotion = (id: string) => {
    if (promotions.length <= 1) {
      toast.error("Cannot delete the last promotion", {
        description: "You must have at least one promotion.",
      });
      return;
    }

    if (confirm("Are you sure you want to delete this promotion?")) {
      setPromotions((prev) => prev.filter((p) => p.id !== id));
      if (expandedId === id) {
        setExpandedId(null);
      }
      toast.success("Promotion deleted");
    }
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-[#F97316] animate-spin" />
        </div>
      ) : (
        <>
          {/* Add Promotion Button */}
          <div className="flex justify-between items-center pb-2">
            <p className="text-sm text-gray-500">
              Manage promotions that appear on the homepage carousel
            </p>
            <Button
              onClick={handleAddPromotion}
              variant="outline"
              className="border-[#F97316] text-[#F97316] hover:bg-[#F97316] hover:text-white"
            >
              <Star className="h-4 w-4 mr-2" />
              Add New Promotion
            </Button>
          </div>

          {promotions.map((promo) => {
            const isExpanded = expandedId === promo.id;

            return (
              <div
                key={promo.id}
                className={`border rounded-lg overflow-hidden transition-all ${
                  promo.enabled
                    ? "border-gray-200 bg-white"
                    : "border-gray-100 bg-gray-50"
                }`}
              >
                {/* Header */}
                <div className="flex items-center gap-3 p-4 bg-gray-50/50">
                  {/* Drag Handle */}
                  <button className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                    <GripVertical className="h-5 w-5" />
                  </button>

                  {/* Type Badge */}
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold border ${getPromotionTypeColor(promo.type)}`}
                  >
                    {getPromotionTypeLabel(promo.type)}
                  </span>

                  {/* Title Preview (English) */}
                  <div className="flex-1 flex items-center gap-2">
                    <span
                      className={`font-semibold ${promo.enabled ? "text-gray-900" : "text-gray-400"}`}
                    >
                      {promo.en.title}
                      {promo.en.subtitle && (
                        <span className="text-[#F97316] ml-1">
                          {promo.en.subtitle}
                        </span>
                      )}
                    </span>
                    <span
                      className={`text-sm ${promo.enabled ? "text-gray-500" : "text-gray-400"}`}
                    >
                      • {promo.en.discount}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleToggleEnabled(promo.id)
                      }
                      className="h-8 px-2 gap-1"
                    >
                      {promo.enabled ? (
                        <>
                          <Eye className="h-4 w-4 text-green-600" />
                          <span className="text-xs text-green-600 hidden sm:inline">
                            Visible
                          </span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-400 hidden sm:inline">
                            Hidden
                          </span>
                        </>
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleToggleFeatured(promo.id)
                      }
                      className="h-8 px-2 gap-1"
                    >
                      {promo.featured ? (
                        <>
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs text-yellow-600 hidden sm:inline">
                            Featured
                          </span>
                        </>
                      ) : (
                        <>
                          <Star className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-500 hidden sm:inline">
                            Feature
                          </span>
                        </>
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleToggleExpand(promo.id)
                      }
                      className="h-8 w-8 p-0"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleDeletePromotion(promo.id)
                      }
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>

                {/* Expanded Form with Language Tabs */}
                {isExpanded && (
                  <div className="p-6 border-t border-gray-100">
                    <PillTabs
                      defaultValue="vi"
                      className="w-full"
                    >
                      <PillTabsList className="mb-6">
                        <PillTabsTrigger value="vi">
                          Tiếng Việt 🇻🇳
                        </PillTabsTrigger>
                        <PillTabsTrigger value="en">
                          English 🇺🇸
                        </PillTabsTrigger>
                      </PillTabsList>

                      {/* Vietnamese Tab */}
                      <PillTabsContent
                        value="vi"
                        className="mt-0"
                      >
                        <LanguageForm
                          promo={promo}
                          lang="vi"
                          onUpdateField={handleUpdateField}
                          onImageUpload={handleImageUpload}
                          onRemoveImage={handleRemoveImage}
                          uploadingImages={uploadingImages}
                        />
                      </PillTabsContent>

                      {/* English Tab */}
                      <PillTabsContent
                        value="en"
                        className="mt-0"
                      >
                        <LanguageForm
                          promo={promo}
                          lang="en"
                          onUpdateField={handleUpdateField}
                          onImageUpload={handleImageUpload}
                          onRemoveImage={handleRemoveImage}
                          uploadingImages={uploadingImages}
                        />
                      </PillTabsContent>
                    </PillTabs>
                  </div>
                )}
              </div>
            );
          })}

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button
              onClick={handleSave}
              className="bg-[#F97316] hover:bg-[#EA580C] text-white"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

// Language Form Component
interface LanguageFormProps {
  promo: Promotion;
  lang: "vi" | "en";
  onUpdateField: (
    id: string,
    lang: "vi" | "en",
    field: keyof PromotionLanguageData,
    value: string,
  ) => void;
  onImageUpload: (
    promoId: string,
    lang: "vi" | "en",
    imageType: "background" | "icon",
    file: File,
  ) => void;
  onRemoveImage: (
    promoId: string,
    lang: "vi" | "en",
    imageType: "background" | "icon",
  ) => void;
  uploadingImages: Record<string, boolean>;
}

function LanguageForm({
  promo,
  lang,
  onUpdateField,
  onImageUpload,
  onRemoveImage,
  uploadingImages,
}: LanguageFormProps) {
  const data = promo[lang];

  return (
    <div className="space-y-6">
      {/* Images Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Background Image */}
        <div className="space-y-2">
          <Label>Background Image</Label>
          <ImageUploadBox
            image={data.backgroundImage}
            uploading={
              uploadingImages[`${promo.id}-${lang}-background`]
            }
            onUpload={(file) =>
              onImageUpload(promo.id, lang, "background", file)
            }
            onRemove={() =>
              onRemoveImage(promo.id, lang, "background")
            }
            label="Upload Background"
          />
        </div>

        {/* Icon Image (optional) */}
        {(promo.type === "crypto" ||
          promo.type === "vip-royalty") && (
          <div className="space-y-2">
            <Label>Icon/Logo (Optional)</Label>
            <ImageUploadBox
              image={data.iconImage}
              uploading={
                uploadingImages[`${promo.id}-${lang}-icon`]
              }
              onUpload={(file) =>
                onImageUpload(promo.id, lang, "icon", file)
              }
              onRemove={() =>
                onRemoveImage(promo.id, lang, "icon")
              }
              label="Upload Icon"
            />
          </div>
        )}
      </div>

      {/* Text Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Badge */}
        {(promo.type === "crypto" ||
          promo.type === "vip-royalty") && (
          <div className="space-y-2">
            <Label htmlFor={`${promo.id}-${lang}-badge`}>
              Badge Text (Optional)
            </Label>
            <Input
              id={`${promo.id}-${lang}-badge`}
              value={data.badge || ""}
              onChange={(e) =>
                onUpdateField(
                  promo.id,
                  lang,
                  "badge",
                  e.target.value,
                )
              }
              placeholder={
                lang === "vi"
                  ? "VD: THANH TOÁN 4.0"
                  : "e.g., PAYMENT 4.0"
              }
            />
          </div>
        )}

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor={`${promo.id}-${lang}-title`}>
            Title *
          </Label>
          <Input
            id={`${promo.id}-${lang}-title`}
            value={data.title}
            onChange={(e) =>
              onUpdateField(
                promo.id,
                lang,
                "title",
                e.target.value,
              )
            }
            placeholder={
              lang === "vi"
                ? "VD: GIỜ VÀNG"
                : "e.g., GOLDEN HOUR"
            }
          />
        </div>

        {/* Subtitle (crypto only) */}
        {promo.type === "crypto" && (
          <div className="space-y-2">
            <Label htmlFor={`${promo.id}-${lang}-subtitle`}>
              Subtitle (Optional)
            </Label>
            <Input
              id={`${promo.id}-${lang}-subtitle`}
              value={data.subtitle || ""}
              onChange={(e) =>
                onUpdateField(
                  promo.id,
                  lang,
                  "subtitle",
                  e.target.value,
                )
              }
              placeholder={
                lang === "vi" ? "VD: CRYPTO" : "e.g., CRYPTO"
              }
            />
          </div>
        )}

        {/* Discount */}
        <div className="space-y-2">
          <Label htmlFor={`${promo.id}-${lang}-discount`}>
            Discount/Offer *
          </Label>
          <Input
            id={`${promo.id}-${lang}-discount`}
            value={data.discount}
            onChange={(e) =>
              onUpdateField(
                promo.id,
                lang,
                "discount",
                e.target.value,
              )
            }
            placeholder={
              lang === "vi" ? "VD: GIẢM 15%" : "e.g., 15% OFF"
            }
          />
        </div>

        {/* Days (golden hour only) */}
        {promo.type === "golden-hour" && (
          <div className="space-y-2">
            <Label htmlFor={`${promo.id}-${lang}-days`}>
              Days *
            </Label>
            <Input
              id={`${promo.id}-${lang}-days`}
              value={data.days || ""}
              onChange={(e) =>
                onUpdateField(
                  promo.id,
                  lang,
                  "days",
                  e.target.value,
                )
              }
              placeholder={
                lang === "vi"
                  ? "VD: THỨ HAI - THỨ NĂM"
                  : "e.g., MONDAY - THURSDAY"
              }
            />
          </div>
        )}

        {/* Time (golden hour only) */}
        {promo.type === "golden-hour" && (
          <div className="space-y-2">
            <Label htmlFor={`${promo.id}-${lang}-time`}>
              Time *
            </Label>
            <Input
              id={`${promo.id}-${lang}-time`}
              value={data.time || ""}
              onChange={(e) =>
                onUpdateField(
                  promo.id,
                  lang,
                  "time",
                  e.target.value,
                )
              }
              placeholder="12:00 PM - 3:30 PM"
            />
          </div>
        )}

        {/* Button Text */}
        <div className="space-y-2">
          <Label htmlFor={`${promo.id}-${lang}-buttonText`}>
            Button Text *
          </Label>
          <Input
            id={`${promo.id}-${lang}-buttonText`}
            value={data.buttonText}
            onChange={(e) =>
              onUpdateField(
                promo.id,
                lang,
                "buttonText",
                e.target.value,
              )
            }
            placeholder={
              lang === "vi"
                ? "VD: ĐẶT LỊCH NGAY"
                : "e.g., BOOK NOW"
            }
          />
        </div>

        {/* Button Link */}
        <div className="space-y-2">
          <Label htmlFor={`${promo.id}-${lang}-buttonLink`}>
            Button Link *
          </Label>
          <Input
            id={`${promo.id}-${lang}-buttonLink`}
            value={data.buttonLink}
            onChange={(e) =>
              onUpdateField(
                promo.id,
                lang,
                "buttonLink",
                e.target.value,
              )
            }
            placeholder="https://example.com or #section"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor={`${promo.id}-${lang}-description`}>
          Description *
        </Label>
        <Textarea
          id={`${promo.id}-${lang}-description`}
          value={data.description}
          onChange={(e) =>
            onUpdateField(
              promo.id,
              lang,
              "description",
              e.target.value,
            )
          }
          placeholder={
            lang === "vi"
              ? "Nhập mô tả khuyến mãi"
              : "Enter promotion description"
          }
          rows={3}
        />
      </div>
    </div>
  );
}

// Image Upload Box Component
interface ImageUploadBoxProps {
  image?: string;
  uploading?: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
  label: string;
}

function ImageUploadBox({
  image,
  uploading,
  onUpload,
  onRemove,
  label,
}: ImageUploadBoxProps) {
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="relative border-2 border-dashed border-gray-200 rounded-lg overflow-hidden bg-gray-50 hover:border-gray-300 transition-colors">
      {image ? (
        <div className="relative group">
          <img
            src={image}
            alt="Preview"
            className="w-full h-40 object-contain bg-gray-100"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-white hover:text-red-400 hover:bg-red-500/20"
            >
              <X className="h-5 w-5 mr-2" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center h-40 cursor-pointer">
          {uploading ? (
            <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
          ) : (
            <>
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">
                {label}
              </span>
              <span className="text-xs text-gray-400 mt-1">
                PNG, JPG, WebP (max 5MB)
              </span>
            </>
          )}
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}