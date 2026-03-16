import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "@utils/supabase/info";
import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  TouchSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Trash2,
  Upload,
  ExternalLink,
  ImageIcon,
  Loader2,
  Edit2,
  X,
  Check,
  Image,
  Files,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/app/components/ui/input";

// MenuImage interface with name field
interface MenuImage {
  id: string;
  name: string;
  cloudinary_url: string;
  public_id: string;
  order: number;
  width: number;
  height: number;
  uploadedAt: string;
}

interface PendingFile {
  file: File;
  name: string;
  preview: string;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

function SortableItem({
  image,
  onDelete,
  onUpdate,
}: {
  image: MenuImage;
  onDelete: (id: string) => void;
  onUpdate: (
    id: string,
    name: string,
    file?: File,
  ) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(image.name);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Update editName when image.name changes (after successful save)
  useEffect(() => {
    setEditName(image.name);
  }, [image.name]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: image.id,
    disabled: isEditing, // Disable dragging when editing
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    setNewFile(file);
  };

  const handleSave = async () => {
    if (!editName.trim()) {
      toast.error("Menu name is required");
      return;
    }

    setIsSaving(true);
    try {
      await onUpdate(
        image.id,
        editName.trim(),
        newFile || undefined,
      );
      setIsEditing(false);
      setNewFile(null);
    } catch (error) {
      // Error already handled in parent
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditName(image.name);
    setNewFile(null);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden"
    >
      <div
        {...attributes}
        {...listeners}
        className={`flex items-center gap-3 p-3 ${
          isEditing
            ? "cursor-default"
            : "cursor-grab active:cursor-grabbing hover:bg-gray-50"
        } transition-colors`}
      >
        <div
          className={`text-gray-400 ${isEditing ? "opacity-30" : ""}`}
        >
          <GripVertical className="w-5 h-5" />
        </div>

        {/* Image Preview */}
        <div className="relative">
          <img
            src={
              newFile
                ? URL.createObjectURL(newFile)
                : image.cloudinary_url
            }
            alt={`Menu page ${image.order + 1}`}
            className="w-20 h-28 object-cover rounded border border-gray-200"
          />
          {isEditing && (
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded cursor-pointer group hover:bg-black/60 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isSaving}
              />
              <Image className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </label>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <Input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Menu name"
                className="text-sm"
                disabled={isSaving}
              />
              {newFile && (
                <p className="text-xs text-gray-500">
                  New image: {newFile.name}
                </p>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-900">
                {image.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {image.public_id}
              </p>
              <p className="text-xs text-gray-400">
                {image.width} &times; {image.height}
              </p>
            </>
          )}
        </div>

        {/* Actions */}
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !editName.trim()}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={isSaving}
              className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(image.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MenuUploadContent() {
  const [images, setImages] = useState<MenuImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Multiple upload state
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Desktop: Move 8px to start dragging
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 1000, // Mobile: Hold 1s before dragging
        tolerance: 5, // Allow 5px movement during hold
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    fetchImages();
  }, []);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      pendingFiles.forEach((pf) => URL.revokeObjectURL(pf.preview));
    };
  }, [pendingFiles]);

  const fetchImages = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/menu/images`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        },
      );
      const data = await response.json();
      if (data.success) {
        setImages(data.data);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      toast.error("Failed to load menu images");
    } finally {
      setLoading(false);
    }
  };

  // Generate a default name from file name
  const generateMenuName = (fileName: string): string => {
    // Remove file extension and replace special chars
    const name = fileName
      .replace(/\.[^/.]+$/, "") // remove extension
      .replace(/[_-]+/g, " ") // replace underscores/dashes with spaces
      .replace(/\s+/g, " ") // normalize spaces
      .trim();
    // Capitalize first letter of each word
    return name
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const handleMultipleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const newPending: PendingFile[] = [];
    const errors: string[] = [];

    Array.from(fileList).forEach((file) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        errors.push(`${file.name}: Not an image file`);
        return;
      }
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name}: File size exceeds 10MB`);
        return;
      }

      newPending.push({
        file,
        name: generateMenuName(file.name),
        preview: URL.createObjectURL(file),
        status: "pending",
      });
    });

    if (errors.length > 0) {
      errors.forEach((err) => toast.error(err));
    }

    if (newPending.length > 0) {
      setPendingFiles((prev) => [...prev, ...newPending]);
    }

    // Reset input so same files can be selected again
    e.target.value = "";
  };

  const updatePendingName = (index: number, name: string) => {
    setPendingFiles((prev) =>
      prev.map((pf, i) => (i === index ? { ...pf, name } : pf)),
    );
  };

  const removePending = (index: number) => {
    setPendingFiles((prev) => {
      const removed = prev[index];
      URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleUploadAll = async () => {
    const validFiles = pendingFiles.filter(
      (pf) => pf.name.trim() && pf.status === "pending",
    );

    if (validFiles.length === 0) {
      toast.error("Please provide names for all files");
      return;
    }

    // Check all have names
    const missingNames = pendingFiles.filter(
      (pf) => !pf.name.trim() && pf.status === "pending",
    );
    if (missingNames.length > 0) {
      toast.error(
        `${missingNames.length} file(s) missing a name`,
      );
      return;
    }

    setUploading(true);
    setUploadProgress({ current: 0, total: pendingFiles.length });

    let successCount = 0;
    let currentOrder = images.length;

    for (let i = 0; i < pendingFiles.length; i++) {
      const pf = pendingFiles[i];
      if (pf.status !== "pending") continue;

      // Mark as uploading
      setPendingFiles((prev) =>
        prev.map((f, idx) =>
          idx === i ? { ...f, status: "uploading" } : f,
        ),
      );
      setUploadProgress({ current: i + 1, total: pendingFiles.length });

      const formData = new FormData();
      formData.append("file", pf.file);
      formData.append("name", pf.name.trim());
      formData.append("order", currentOrder.toString());

      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/admin/menu/upload`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${publicAnonKey}` },
            body: formData,
          },
        );

        const data = await response.json();
        if (data.success) {
          setImages((prev) => [...prev, data.data]);
          setPendingFiles((prev) =>
            prev.map((f, idx) =>
              idx === i ? { ...f, status: "done" } : f,
            ),
          );
          successCount++;
          currentOrder++;
        } else {
          setPendingFiles((prev) =>
            prev.map((f, idx) =>
              idx === i
                ? {
                    ...f,
                    status: "error",
                    error: data.error || "Upload failed",
                  }
                : f,
            ),
          );
        }
      } catch (error) {
        console.error("Upload error:", error);
        setPendingFiles((prev) =>
          prev.map((f, idx) =>
            idx === i
              ? { ...f, status: "error", error: "Network error" }
              : f,
          ),
        );
      }
    }

    setUploading(false);
    setUploadProgress(null);

    if (successCount > 0) {
      toast.success(
        `${successCount} image${successCount > 1 ? "s" : ""} uploaded successfully`,
      );
    }

    // Remove completed files after a short delay
    setTimeout(() => {
      setPendingFiles((prev) => {
        prev
          .filter((pf) => pf.status === "done")
          .forEach((pf) => URL.revokeObjectURL(pf.preview));
        return prev.filter((pf) => pf.status !== "done");
      });
    }, 1500);
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this menu page?",
      )
    )
      return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/admin/menu/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        },
      );

      const data = await response.json();
      if (data.success) {
        setImages(images.filter((img) => img.id !== id));
        toast.success("Image deleted");
      } else {
        toast.error(data.error || "Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete image");
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = images.findIndex(
        (img) => img.id === active.id,
      );
      const newIndex = images.findIndex(
        (img) => img.id === over.id,
      );

      const newImages = arrayMove(images, oldIndex, newIndex);
      setImages(newImages);

      // Update order on server
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/admin/menu/reorder`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ images: newImages }),
          },
        );

        const data = await response.json();
        if (!data.success) {
          toast.error("Failed to save order");
          fetchImages(); // Revert to server state
        }
      } catch (error) {
        console.error("Reorder error:", error);
        toast.error("Failed to save order");
        fetchImages();
      }
    }
  };

  const handleUpdate = async (
    id: string,
    name: string,
    file?: File,
  ) => {
    const formData = new FormData();
    formData.append("name", name);
    if (file) {
      formData.append("file", file);
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/admin/menu/${id}/update`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${publicAnonKey}` },
          body: formData,
        },
      );

      const data = await response.json();
      if (data.success) {
        setImages(
          images.map((img) =>
            img.id === id ? data.data : img,
          ),
        );
        toast.success("Menu image updated successfully");
      } else {
        toast.error(data.error || "Update failed");
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update image");
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#FF9F1C] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Upload Section */}
      <Card className="p-6 mb-6">
        {/* Drop Zone / File Selector */}
        <label className="block cursor-pointer">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleMultipleFileSelect}
            disabled={uploading}
            className="hidden"
            id="menu-file-input"
          />
          <div
            className="border-2 border-dashed border-gray-300 hover:border-[#FF9F1C] rounded-xl p-8 text-center transition-colors"
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById("menu-file-input")
                ?.click();
            }}
          >
            <Files className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700">
              Click to select images
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Select multiple files at once &bull; PNG, JPG, WebP
              &bull; Max 10MB each
            </p>
          </div>
        </label>

        {/* Pending Files Preview */}
        {pendingFiles.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">
                {pendingFiles.length} file
                {pendingFiles.length > 1 ? "s" : ""} selected
              </p>
              {!uploading && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    pendingFiles.forEach((pf) =>
                      URL.revokeObjectURL(pf.preview),
                    );
                    setPendingFiles([]);
                  }}
                  className="text-gray-500 hover:text-red-600 text-xs"
                >
                  Clear All
                </Button>
              )}
            </div>

            {/* File List */}
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {pendingFiles.map((pf, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    pf.status === "done"
                      ? "bg-green-50 border-green-200"
                      : pf.status === "error"
                        ? "bg-red-50 border-red-200"
                        : pf.status === "uploading"
                          ? "bg-orange-50 border-orange-200"
                          : "bg-gray-50 border-gray-200"
                  }`}
                >
                  {/* Preview Thumbnail */}
                  <img
                    src={pf.preview}
                    alt={pf.name}
                    className="w-12 h-16 object-cover rounded border border-gray-200 flex-shrink-0"
                  />

                  {/* Name Input */}
                  <div className="flex-1 min-w-0">
                    <Input
                      type="text"
                      value={pf.name}
                      onChange={(e) =>
                        updatePendingName(index, e.target.value)
                      }
                      placeholder="Menu name *"
                      className="text-sm h-8"
                      disabled={
                        uploading || pf.status !== "pending"
                      }
                    />
                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                      {pf.file.name} &bull;{" "}
                      {(pf.file.size / 1024 / 1024).toFixed(1)}MB
                    </p>
                    {pf.error && (
                      <p className="text-[10px] text-red-500 mt-0.5">
                        {pf.error}
                      </p>
                    )}
                  </div>

                  {/* Status / Actions */}
                  <div className="flex-shrink-0">
                    {pf.status === "uploading" ? (
                      <Loader2 className="w-5 h-5 text-[#FF9F1C] animate-spin" />
                    ) : pf.status === "done" ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : pf.status === "error" ? (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePending(index)}
                        disabled={uploading}
                        className="text-gray-400 hover:text-red-500 p-1 h-auto"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Upload Progress Bar */}
            {uploadProgress && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>
                    Uploading {uploadProgress.current} of{" "}
                    {uploadProgress.total}
                  </span>
                  <span>
                    {Math.round(
                      (uploadProgress.current /
                        uploadProgress.total) *
                        100,
                    )}
                    %
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FF9F1C] rounded-full transition-all duration-300"
                    style={{
                      width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Upload All Button */}
            <div className="flex gap-2">
              <Button
                onClick={handleUploadAll}
                disabled={
                  uploading ||
                  pendingFiles.every((pf) => pf.status !== "pending") ||
                  pendingFiles.some(
                    (pf) =>
                      pf.status === "pending" && !pf.name.trim(),
                  )
                }
                className="flex-1 bg-[#FF9F1C] hover:bg-[#E68F0F] text-white"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload{" "}
                    {
                      pendingFiles.filter(
                        (pf) => pf.status === "pending",
                      ).length
                    }{" "}
                    Image
                    {pendingFiles.filter(
                      (pf) => pf.status === "pending",
                    ).length > 1
                      ? "s"
                      : ""}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  pendingFiles.forEach((pf) =>
                    URL.revokeObjectURL(pf.preview),
                  );
                  setPendingFiles([]);
                }}
                disabled={uploading}
                className="border-gray-200"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {pendingFiles.length === 0 && (
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Images will be displayed in the order shown below.
              Drag to reorder.
            </p>
          </div>
        )}
      </Card>

      {/* Images List */}
      {images.length === 0 ? (
        <Card className="p-12">
          <div className="text-center text-gray-400">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">
              No menu images uploaded yet
            </p>
            <p className="text-sm mt-2">
              Upload your first menu page to get started
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-3">
            {images.length} page{images.length !== 1 ? "s" : ""}{" "}
            &bull; Drag to reorder
          </p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={images.map((img) => img.id)}
              strategy={verticalListSortingStrategy}
            >
              {images.map((image) => (
                <SortableItem
                  key={image.id}
                  image={image}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}
