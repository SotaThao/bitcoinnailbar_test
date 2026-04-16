import { useState, useEffect } from "react";
import { QuillEditor } from "@/app/components/ui/quill-editor";
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
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { toast } from "sonner";

interface PromotionData {
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
  videoUrl?: string;
}

interface Promotion {
  id: string;
  type: "crypto" | "golden-hour" | "vip-royalty";
  enabled: boolean;
  featured: boolean;
  
  // User input data (free form - any language)
  input: PromotionData;
  
  // Backend generated translations
  vi?: PromotionData;
  en?: PromotionData;
}

interface PromotionEditorProps {
  onSave?: (promotions: Promotion[]) => void;
}

export function PromotionEditor({ onSave }: PromotionEditorProps) {
  const [promotions, setPromotions] = useState<Promotion[]>([
    {
      id: "1",
      type: "crypto",
      enabled: true,
      featured: true,
      input: {
        badge: "THANH TOÁN 4.0",
        title: "THANH TOÁN BẰNG",
        subtitle: "CRYPTO",
        discount: "GIẢM 10%",
        description:
          "Nhận ngay ưu đãi giảm 10% khi thanh toán bằng Bitcoin, USDT hoặc ví VLinkPay.",
        buttonText: "THANH TOÁN NGAY",
        buttonLink: "https://bitcoinnailbarnew1.tiiny.site/#contact",
      },
    },
    {
      id: "2",
      type: "golden-hour",
      enabled: true,
      featured: true,
      input: {
        title: "GIỜ VÀNG",
        days: "THỨ HAI - THỨ NĂM",
        time: "12:00 PM - 3:30 PM",
        discount: "GIẢM 15%",
        description: "Ưu đãi đặc biệt trong khung giờ vàng",
        buttonText: "ĐẶT LỊCH NGAY",
        buttonLink: "https://bitcoinnailbarnew1.tiiny.site/#contact",
      },
    },
    {
      id: "3",
      type: "vip-royalty",
      enabled: true,
      featured: true,
      input: {
        badge: "THÀNH VIÊN ĐẶC BIỆT",
        title: "VIP HOÀNG GIA",
        discount: "TẶNG $50",
        description:
          "Tham gia câu lạc bộ độc quyền ngay hôm nay. Nhận ngay $50 CREDIT khi đăng ký.",
        buttonText: "THAM GIA NGAY",
        buttonLink: "#membership",
      },
    },
  ]);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState<Record<string, boolean>>({});
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
          }
        );

        const result = await response.json();

        if (result.success && result.data?.promotions) {
          // Migrate old data structure to new structure
          const migratedPromotions = result.data.promotions.map((promo: any) => {
            // If input doesn't exist, create it from vi data (prefer vi over en)
            if (!promo.input) {
              const sourceData = promo.vi || promo.en || {};
              return {
                ...promo,
                input: {
                  title: sourceData.title || "",
                  discount: sourceData.discount || "",
                  description: sourceData.description || "",
                  buttonText: sourceData.buttonText || "Tìm hiểu thêm", // Default button text
                  buttonLink: sourceData.buttonLink || "#",
                  badge: sourceData.badge,
                  subtitle: sourceData.subtitle,
                  days: sourceData.days,
                  time: sourceData.time,
                  backgroundImage: sourceData.backgroundImage,
                  backgroundImagePath: sourceData.backgroundImagePath,
                  iconImage: sourceData.iconImage,
                  iconImagePath: sourceData.iconImagePath,
                },
              };
            }
            
            // Also fix if input exists but buttonText is missing
            if (promo.input && !promo.input.buttonText) {
              return {
                ...promo,
                input: {
                  ...promo.input,
                  buttonText: "Tìm hiểu thêm", // Default button text
                },
              };
            }
            
            return promo;
          });
          
          setPromotions(migratedPromotions);
          console.log("✅ [PROMOTION EDITOR] Loaded promotions from backend");
        }
      } catch (error) {
        console.error("❌ [PROMOTION EDITOR] Failed to fetch promotions:", error);
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
        promo.id === id ? { ...promo, enabled: !promo.enabled } : promo
      )
    );
  };

  const handleToggleFeatured = (id: string) => {
    setPromotions((prev) =>
      prev.map((promo) =>
        promo.id === id ? { ...promo, featured: !promo.featured } : promo
      )
    );
  };

  const handleUpdateField = (
    id: string,
    field: keyof PromotionData,
    value: string
  ) => {
    setPromotions((prev) =>
      prev.map((promo) =>
        promo.id === id
          ? {
              ...promo,
              input: { ...promo.input, [field]: value },
            }
          : promo
      )
    );
  };

  const handleImageUpload = async (
    promoId: string,
    imageType: "background" | "icon",
    file: File
  ) => {
    const uploadKey = `${promoId}-${imageType}`;
    setUploadingImages((prev) => ({
      ...prev,
      [uploadKey]: true,
    }));

    try {
      const formData = new FormData();
      formData.append("file", file);
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
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Upload failed");
      }

      // Update promotion with signed URL
      const imageField =
        imageType === "background" ? "backgroundImage" : "iconImage";
      const pathField =
        imageType === "background" ? "backgroundImagePath" : "iconImagePath";

      setPromotions((prev) =>
        prev.map((promo) =>
          promo.id === promoId
            ? {
                ...promo,
                input: {
                  ...promo.input,
                  [imageField]: result.data.signedUrl,
                  [pathField]: result.data.path,
                },
              }
            : promo
        )
      );

      toast.success("Image uploaded successfully!");
      console.log("✅ Image uploaded:", result.data.filename);
    } catch (error: any) {
      console.error("❌ Upload error:", error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploadingImages((prev) => ({
        ...prev,
        [uploadKey]: false,
      }));
    }
  };

  const handleRemoveImage = async (
    promoId: string,
    imageType: "background" | "icon"
  ) => {
    const promo = promotions.find((p) => p.id === promoId);
    if (!promo) return;

    const pathField =
      imageType === "background" ? "backgroundImagePath" : "iconImagePath";
    const path = promo.input[pathField];

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
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Delete failed");
      }

      // Remove image from promotion
      const imageField =
        imageType === "background" ? "backgroundImage" : "iconImage";

      setPromotions((prev) =>
        prev.map((p) =>
          p.id === promoId
            ? {
                ...p,
                input: {
                  ...p.input,
                  [imageField]: undefined,
                  [pathField]: undefined,
                },
              }
            : p
        )
      );

      toast.success("Image removed successfully!");
    } catch (error: any) {
      console.error("❌ Delete error:", error);
      toast.error(`Delete failed: ${error.message}`);
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
      // Backend will auto-detect language and translate
      // Use AbortController with 60s timeout (translations can be slow)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/admin/settings/promotions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ promotions }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to save promotions");
      }

      // Update with backend response (includes translations)
      if (result.data?.promotions) {
        setPromotions(result.data.promotions);
      }

      // Notify other components
      onSave?.(promotions);
      window.dispatchEvent(new CustomEvent("promotions-updated"));

      toast.success("✅ Promotions saved successfully!", {
        description: "Translations have been generated and applied.",
      });

      console.log("✅ Promotions saved with auto-translation");
    } catch (error: any) {
      console.error("❌ Save promotions error:", error);
      const isTimeout = error.name === "AbortError";
      toast.error(isTimeout ? "⏱️ Request timed out" : "❌ Failed to save promotions", {
        description: isTimeout
          ? "Translation is taking too long. Try saving fewer promotions at once."
          : error.message || "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPromotion = () => {
    const newId = String(Date.now());
    const newPromotion: Promotion = {
      id: newId,
      type: "crypto",
      enabled: true,
      featured: false,
      input: {
        title: "CHƯƠNG TRÌNH MỚI",
        discount: "GIẢM 10%",
        description: "Mô tả chương trình khuyến mãi mới",
        buttonText: "XEM NGAY",
        buttonLink: "#",
      },
    };

    setPromotions((prev) => [...prev, newPromotion]);
    setExpandedId(newId);

    toast.success("✨ New promotion added!", {
      description: "Customize and save to generate translations.",
    });
  };

  const handleDeletePromotion = (id: string) => {
    if (promotions.length <= 1) {
      toast.error("Cannot delete the last promotion");
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
          {/* Header */}
          <div className="flex justify-between items-center pb-2">
            <p className="text-sm text-gray-500">
              Manage promotions - backend will auto-translate to Vietnamese & English
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

          {/* Promotions List */}
          {promotions.map((promo) => {
            const isExpanded = expandedId === promo.id;
            const displayData = promo.vi || promo.input;

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
                  <button className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                    <GripVertical className="h-5 w-5" />
                  </button>

                  {/* Badge */}
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold border ${getPromotionTypeColor(
                      promo.type
                    )}`}
                  >
                    {displayData.badge || getPromotionTypeLabel(promo.type)}
                  </span>

                  {/* Title Preview */}
                  <div className="flex-1 flex items-center gap-2">
                    <span
                      className={`font-semibold ${
                        promo.enabled ? "text-gray-900" : "text-gray-400"
                      }`}
                    >
                      {displayData.title}
                      {displayData.subtitle && (
                        <span className="text-[#F97316] ml-1">
                          {displayData.subtitle}
                        </span>
                      )}
                    </span>
                    <span
                      className={`text-sm ${
                        promo.enabled ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      • {displayData.discount}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleEnabled(promo.id)}
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
                      onClick={() => handleToggleFeatured(promo.id)}
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
                      onClick={() => handleToggleExpand(promo.id)}
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
                      onClick={() => handleDeletePromotion(promo.id)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>

                {/* Expanded Form - Single Input (No Tabs) */}
                {isExpanded && (
                  <div className="p-6 border-t border-gray-100">
                    <PromotionForm
                      promo={promo}
                      onUpdateField={handleUpdateField}
                      onImageUpload={handleImageUpload}
                      onRemoveImage={handleRemoveImage}
                      uploadingImages={uploadingImages}
                    />
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
                  Saving & Translating...
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

// Single Form Component (No Language Tabs)
interface PromotionFormProps {
  promo: Promotion;
  onUpdateField: (id: string, field: keyof PromotionData, value: string) => void;
  onImageUpload: (
    promoId: string,
    imageType: "background" | "icon",
    file: File
  ) => void;
  onRemoveImage: (promoId: string, imageType: "background" | "icon") => void;
  uploadingImages: Record<string, boolean>;
}

function PromotionForm({
  promo,
  onUpdateField,
  onImageUpload,
  onRemoveImage,
  uploadingImages,
}: PromotionFormProps) {
  // Safety check: ensure input exists
  const data = promo.input || {
    title: "",
    discount: "",
    description: "",
    buttonText: "",
    buttonLink: "#",
  };

  return (
    <div className="space-y-6">
      {/* Images Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Background Image */}
        <div className="space-y-2">
          <Label>Background Image</Label>
          <ImageUploadBox
            image={data.backgroundImage}
            uploading={uploadingImages[`${promo.id}-background`]}
            onUpload={(file) => onImageUpload(promo.id, "background", file)}
            onRemove={() => onRemoveImage(promo.id, "background")}
            label="Upload Background"
          />
        </div>

        {/* Icon Image (optional) */}
        {(promo.type === "crypto" || promo.type === "vip-royalty") && (
          <div className="space-y-2">
            <Label>Icon/Logo (Optional)</Label>
            <ImageUploadBox
              image={data.iconImage}
              uploading={uploadingImages[`${promo.id}-icon`]}
              onUpload={(file) => onImageUpload(promo.id, "icon", file)}
              onRemove={() => onRemoveImage(promo.id, "icon")}
              label="Upload Icon"
            />
          </div>
        )}
      </div>

      {/* Text Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Badge */}
        {(promo.type === "crypto" || promo.type === "vip-royalty") && (
          <div className="space-y-2">
            <Label htmlFor={`${promo.id}-badge`}>Badge Text (Optional)</Label>
            <Input
              id={`${promo.id}-badge`}
              value={data.badge || ""}
              onChange={(e) => onUpdateField(promo.id, "badge", e.target.value)}
              placeholder="Opening"
            />
          </div>
        )}

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor={`${promo.id}-title`}>Title *</Label>
          <Input
            id={`${promo.id}-title`}
            value={data.title}
            onChange={(e) => onUpdateField(promo.id, "title", e.target.value)}
            placeholder="Grand Opening"
          />
        </div>

        {/* Subtitle (crypto only) */}
        {promo.type === "crypto" && (
          <div className="space-y-2">
            <Label htmlFor={`${promo.id}-subtitle`}>Subtitle (Optional)</Label>
            <Input
              id={`${promo.id}-subtitle`}
              value={data.subtitle || ""}
              onChange={(e) => onUpdateField(promo.id, "subtitle", e.target.value)}
              placeholder="VD: CRYPTO"
            />
          </div>
        )}

        {/* Discount */}
        <div className="space-y-2">
          <Label htmlFor={`${promo.id}-discount`}>Discount/Offer *</Label>
          <Input
            id={`${promo.id}-discount`}
            value={data.discount}
            onChange={(e) => onUpdateField(promo.id, "discount", e.target.value)}
            placeholder="Đăng ký ngay để tham gia Lucky Draw!"
          />
        </div>

        {/* Days (golden hour only) */}
        {promo.type === "golden-hour" && (
          <div className="space-y-2">
            <Label htmlFor={`${promo.id}-days`}>Days *</Label>
            <Input
              id={`${promo.id}-days`}
              value={data.days || ""}
              onChange={(e) => onUpdateField(promo.id, "days", e.target.value)}
              placeholder="THỨ HAI - THỨ NĂM"
            />
          </div>
        )}

        {/* Time (golden hour only) */}
        {promo.type === "golden-hour" && (
          <div className="space-y-2">
            <Label htmlFor={`${promo.id}-time`}>Time *</Label>
            <Input
              id={`${promo.id}-time`}
              value={data.time || ""}
              onChange={(e) => onUpdateField(promo.id, "time", e.target.value)}
              placeholder="12:00 PM - 3:30 PM"
            />
          </div>
        )}

        {/* Button Text */}
        <div className="space-y-2">
          <Label htmlFor={`${promo.id}-buttonText`}>Button Text *</Label>
          <Input
            id={`${promo.id}-buttonText`}
            value={data.buttonText}
            onChange={(e) => onUpdateField(promo.id, "buttonText", e.target.value)}
            placeholder="Đăng ký ngay"
          />
        </div>

        {/* Button Link */}
        <div className="space-y-2">
          <Label htmlFor={`${promo.id}-buttonLink`}>Button Link *</Label>
          <Input
            id={`${promo.id}-buttonLink`}
            value={data.buttonLink}
            onChange={(e) => onUpdateField(promo.id, "buttonLink", e.target.value)}
            placeholder="https://staging-register.vlinkpay.com/event?eventCode=bitcoinnailbar-grand-opening&lang=en"
          />
        </div>

        {/* Video URL (acts as background) */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor={`${promo.id}-videoUrl`}>Video URL (Optional - acts as background)</Label>
          <Input
            id={`${promo.id}-videoUrl`}
            value={data.videoUrl || ""}
            onChange={(e) => onUpdateField(promo.id, "videoUrl", e.target.value)}
            placeholder="https://www.youtube.com/embed/VIDEO_ID or direct video URL"
          />
          <p className="text-xs text-gray-400">
            Supports YouTube embed links, Vimeo embed, or direct video URLs (.mp4, .webm). If provided, this video will play as the background instead of the default theme.
          </p>
        </div>
      </div>

      {/* Description - WYSIWYG Editor */}
      <div className="space-y-2">
        <Label htmlFor={`${promo.id}-description`}>Description *</Label>
        <div className="border rounded-md overflow-hidden">
          <QuillEditor
            value={data.description}
            onChange={(content) => onUpdateField(promo.id, "description", content)}
            placeholder="Enter description with rich formatting..."
            className="bg-white"
          />
        </div>
        <p className="text-xs text-gray-400 italic">
          Use the toolbar above to format text, add lists, and links
        </p>
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
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
              <span className="text-sm text-gray-500">{label}</span>
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