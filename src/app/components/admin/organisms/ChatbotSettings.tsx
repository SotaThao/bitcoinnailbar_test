import { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "../../ui/button";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface ChatbotSettingsProps {
  avatarUrl?: string;
  avatarPath?: string;
  onAvatarUpdate?: (url: string, path: string) => void;
}

export function ChatbotSettings({
  avatarUrl,
  avatarPath,
  onAvatarUpdate,
}: ChatbotSettingsProps) {
  const [uploading, setUploading] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(avatarUrl);

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", "en"); // Use 'en' as default
      formData.append("promotionId", "chatbot"); // Use 'chatbot' as folder
      formData.append("imageType", "avatar");

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

      // Update local state
      setCurrentAvatar(result.data.signedUrl);

      // Notify parent
      onAvatarUpdate?.(result.data.signedUrl, result.data.path);

      console.log(
        "✅ Chatbot avatar uploaded:",
        result.data.filename,
      );
    } catch (error: any) {
      console.error("❌ Upload error:", error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!currentAvatar) return;

    try {
      // Clear from state (backend will be called by parent's save)
      setCurrentAvatar(undefined);
      onAvatarUpdate?.("", "");

      console.log("✅ Chatbot avatar removed");
    } catch (error: any) {
      console.error("❌ Remove error:", error);
      alert(`Remove failed: ${error.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative border-2 border-dashed border-gray-200 rounded-lg overflow-hidden bg-gray-50 hover:border-gray-300 transition-colors">
        {currentAvatar ? (
          <div className="relative group">
            <img
              src={currentAvatar}
              alt="Chatbot Avatar Preview"
              className="w-full h-48 object-contain bg-gray-100"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="text-white hover:text-red-400 hover:bg-red-500/20"
              >
                <X className="h-5 w-5 mr-2" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-48 cursor-pointer">
            {uploading ? (
              <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
            ) : (
              <>
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">
                  Upload Chatbot Avatar
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  PNG, JPG, WebP (max 5MB)
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  Recommended: Square image (1:1 ratio)
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          💡 This avatar appears in the chatbot widget on the
          homepage and other pages.
        </p>
      </div>
    </div>
  );
}