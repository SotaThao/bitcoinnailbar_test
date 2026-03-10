import { useState, useEffect } from "react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { CategorySelector } from "@/app/components/ui/category-selector";
import { ImageCategoryDialog } from "@/app/components/ui/image-category-dialog";
import { LogoBadge } from "@/app/components/atoms/LogoBadge";
import { SelectField } from "@/app/components/ui/select-field";
import { toast } from "sonner";
import { projectId, publicAnonKey } from "@utils/supabase/info";
import AdminLayout from "@/app/components/AdminLayout";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Trash2,
  Upload,
  ImageIcon,
  Loader2,
  X,
  ZoomIn,
  Plus,
  Tag,
  Edit2,
  Check,
  Layers,
  ChevronLeft,
  ChevronRight,
  Star,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/app/components/ui/utils";

interface GalleryImage {
  id: string;
  cloudinary_url: string;
  public_id: string;
  category: string;
  order: number;
  width: number;
  height: number;
  uploadedAt: string;
  showLogo?: boolean; // Flag to display logo on this image
  featured?: boolean; // Admin marks as featured
  views?: number; // Track view count
}

interface SortableItemProps {
  image: GalleryImage;
  onDelete: (id: string) => void;
  onPreview: (image: GalleryImage) => void;
  onEdit: (image: GalleryImage) => void;
  onToggleFeatured: (id: string, featured: boolean) => void;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  isBulkMode: boolean;
  logoUrl: string | null;
}

function SortableItem({
  image,
  onDelete,
  onPreview,
  onEdit,
  onToggleFeatured,
  isSelected,
  onToggleSelect,
  isBulkMode,
  logoUrl,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative aspect-square rounded-lg overflow-hidden bg-gray-100 transition-all duration-300 cursor-pointer",
        isSelected
          ? "ring-4 ring-primary ring-offset-2 border-2 border-primary"
          : "border-2 border-gray-200 hover:border-[#FF9800]",
      )}
      onClick={() => {
        // Always open preview when clicking the card (unless in bulk mode)
        if (!isBulkMode) {
          onPreview(image);
        }
      }}
    >
      {/* Checkbox - Top Left */}
      {isBulkMode && (
        <div className="absolute top-2 left-2 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(image.id);
            }}
            className={cn(
              "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all shadow-lg",
              isSelected
                ? "bg-primary border-primary"
                : "bg-white/90 border-gray-300 hover:border-primary",
            )}
          >
            {isSelected && (
              <Check className="w-4 h-4 text-primary-foreground" />
            )}
          </button>
        </div>
      )}

      {/* Order Badge */}
      {!isBulkMode && (
        <div className="absolute top-2 left-2 z-10 bg-[#FF9800] text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
          {image.order + 1}
        </div>
      )}

      {/* Drag Handle - Top Right */}
      {!isBulkMode && (
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2 right-2 z-10 cursor-grab active:cursor-grabbing bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-white"
        >
          <GripVertical className="w-4 h-4 text-gray-600" />
        </button>
      )}

      {/* Image */}
      <img
        src={image.cloudinary_url}
        alt={`Gallery ${image.order + 1}`}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 pointer-events-none"
      />

      {/* Category Badge - Bottom Left */}
      <div className="absolute bottom-2 left-2 z-10 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
        {image.category}
      </div>

      {/* Hover Overlay with Actions */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 pointer-events-none">
        {!isBulkMode && (
          <>
            {/* Edit Category Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(image);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-xl transition-transform transform hover:scale-110 pointer-events-auto"
              title="Change category"
            >
              <Edit2 className="w-5 h-5" />
            </button>

            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(image.id);
              }}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3 shadow-xl transition-transform transform hover:scale-110 pointer-events-auto"
              title="Delete image"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Zoom Icon (on non-bulk mode) */}
      {!isBulkMode && (
        <div
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
          onClick={(e) => {
            e.stopPropagation();
            onPreview(image);
          }}
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors">
            <ZoomIn className="w-4 h-4 text-gray-700" />
          </div>
        </div>
      )}

      {/* Logo Badge */}
      {image.showLogo && logoUrl && (
        <LogoBadge logoUrl={logoUrl} visible={true} size="sm" />
      )}
      
      {/* Featured Star Badge - Top Right (when featured) */}
      {!isBulkMode && image.featured && (
        <div className="absolute top-2 right-2 z-10 bg-yellow-500 text-white p-1.5 rounded-full shadow-lg">
          <Star className="w-3 h-3 fill-current" />
        </div>
      )}
      
      {/* Views Badge - Bottom Right Corner */}
      {!isBulkMode && (image.views || 0) > 0 && (
        <div className="absolute bottom-2 right-2 z-10 bg-black/70 backdrop-blur-sm text-white text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Eye className="w-3 h-3" />
          {image.views}
        </div>
      )}
    </div>
  );
}

export default function GalleryManagement() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] =
    useState<GalleryImage | null>(null);

  // Category Management
  const [serviceCategories, setServiceCategories] = useState<
    string[]
  >([]);
  const [customCategories, setCustomCategories] = useState<
    string[]
  >([]);
  const [selectedCategory, setSelectedCategory] =
    useState<string>("General");
  const [showNewCategoryInput, setShowNewCategoryInput] =
    useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Filter Management
  const [filterCategory, setFilterCategory] =
    useState<string>("All");
  const [contentFilter, setContentFilter] = useState<string>("all");

  // Bulk Selection & Edit
  const [selectedImages, setSelectedImages] = useState<
    string[]
  >([]);
  const [isBulkMode, setIsBulkMode] = useState(false);

  // Image Category Edit
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingImage, setEditingImage] =
    useState<GalleryImage | null>(null);

  // Logo Management  
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [showLogoOnUpload, setShowLogoOnUpload] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    fetchImages();
    fetchServiceCategories();
    fetchLogo(); // Fetch logo on mount
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/gallery/images`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        },
      );
      const data = await response.json();
      if (data.success) {
        setImages(data.data);
      } else {
        toast.error("Failed to load gallery images");
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      toast.error("Failed to load gallery images");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validate category selection
    if (!selectedCategory || selectedCategory === "_new_") {
      toast.error(
        "Please select a valid category before uploading",
      );
      return;
    }

    // Validate file type and size
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 10MB`);
        return;
      }
    }

    setUploading(true);
    let successCount = 0;
    let failCount = 0;

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", selectedCategory); // Use selected category
        formData.append("showLogo", showLogoOnUpload ? "true" : "false"); // Add logo flag

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/admin/gallery/upload`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: formData,
          },
        );

        const data = await response.json();
        if (data.success) {
          setImages((prev) => [...prev, data.data]);
          successCount++;
        } else {
          console.error(
            `Failed to upload ${file.name}:`,
            data.error,
          );
          failCount++;
        }
      } catch (error) {
        console.error(`Upload error for ${file.name}:`, error);
        failCount++;
      }
    }

    setUploading(false);
    e.target.value = ""; // Reset input

    if (successCount > 0) {
      toast.success(
        `${successCount} image${successCount > 1 ? "s" : ""} uploaded to ${selectedCategory}`,
      );
    }
    if (failCount > 0) {
      toast.error(
        `Failed to upload ${failCount} image${failCount > 1 ? "s" : ""}`,
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this image from the gallery?",
      )
    )
      return;

    // OPTIMISTIC UPDATE: Remove from UI immediately
    const deletedImage = images.find((img) => img.id === id);
    if (!deletedImage) return;

    setImages((prev) => prev.filter((img) => img.id !== id));

    // Show immediate success feedback (optimistic)
    const loadingToast = toast.loading("Deleting image...", {
      description: "Removing from server and Cloudinary",
    });

    // BACKGROUND: Call API to delete from backend/Cloudinary
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/admin/gallery/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        },
      );

      const data = await response.json();
      if (!data.success) {
        // ROLLBACK: Restore image if API fails
        console.error(
          "Delete API failed, rolling back:",
          data.error,
        );
        setImages((prev) =>
          [...prev, deletedImage].sort(
            (a, b) => a.order - b.order,
          ),
        );
        toast.error(
          "Failed to delete from server. Image restored.",
          { id: loadingToast },
        );
      } else {
        toast.success("Image deleted successfully", {
          id: loadingToast,
        });
      }
    } catch (error) {
      // ROLLBACK: Restore image on network error
      console.error("Delete error, rolling back:", error);
      setImages((prev) =>
        [...prev, deletedImage].sort(
          (a, b) => a.order - b.order,
        ),
      );
      toast.error("Network error. Image restored.", {
        id: loadingToast,
      });
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
          `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/admin/gallery/reorder`,
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

  const fetchServiceCategories = async () => {
    try {
      // Fetch service categories from existing API
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/settings/categories`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        },
      );

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status}`,
        );
      }

      const data = await response.json();

      if (data.success && data.data) {
        // Extract category names from service categories
        const categoryNames = data.data
          .filter((cat: any) => cat.status === "active")
          .map((cat: any) => cat.name);
        setServiceCategories(categoryNames);
      }

      // Load custom categories from localStorage as fallback
      const savedCustomCategories = localStorage.getItem(
        "gallery_custom_categories",
      );
      if (savedCustomCategories) {
        setCustomCategories(JSON.parse(savedCustomCategories));
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Don't show error toast - just use empty arrays as fallback
      setServiceCategories([]);
      setCustomCategories([]);
    }
  };

  const fetchLogo = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/gallery-logo`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );
      const data = await response.json();
      if (data.logo) {
        setLogoUrl(data.logo.url);
      }
    } catch (error) {
      console.error('Error fetching logo:', error);
      // Don't show error - logo is optional
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith('image/')) {
      toast.error('File must be an image (PNG, SVG, or JPEG)');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo must be less than 2MB');
      return;
    }

    setUploadingLogo(true);

    try {
      // Upload to Cloudinary via utilities route
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/upload`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${publicAnonKey}` },
          body: formData,
        }
      );

      const uploadData = await uploadResponse.json();
      if (!uploadData.url) {
        throw new Error('Upload failed');
      }

      // Save logo URL to KV
      const saveResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/gallery-logo`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: uploadData.url }),
        }
      );

      const saveData = await saveResponse.json();
      if (saveData.success) {
        setLogoUrl(uploadData.url);
        toast.success('Logo uploaded successfully!');
      } else {
        throw new Error(saveData.error || 'Failed to save logo');
      }
    } catch (error: any) {
      console.error('Logo upload error:', error);
      toast.error(error.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
      e.target.value = ''; // Reset
    }
  };

  const handleEditCategory = (
    oldName: string,
    newName: string,
  ) => {
    if (!newName.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    // Check if new name already exists
    const allCategories = [
      ...serviceCategories,
      ...customCategories.filter((c) => c !== oldName),
      "General",
    ];
    if (allCategories.includes(newName.trim())) {
      toast.error("Category already exists");
      return;
    }

    // Update custom categories
    const updatedCustomCategories = customCategories.map(
      (cat) => (cat === oldName ? newName.trim() : cat),
    );
    setCustomCategories(updatedCustomCategories);
    localStorage.setItem(
      "gallery_custom_categories",
      JSON.stringify(updatedCustomCategories),
    );

    // Update selected category if it was the edited one
    if (selectedCategory === oldName) {
      setSelectedCategory(newName.trim());
    }

    toast.success(`Category renamed to "${newName.trim()}"`);
  };

  const handleDeleteCategory = (category: string) => {
    // Remove from custom categories
    const updatedCustomCategories = customCategories.filter(
      (cat) => cat !== category,
    );
    setCustomCategories(updatedCustomCategories);
    localStorage.setItem(
      "gallery_custom_categories",
      JSON.stringify(updatedCustomCategories),
    );

    toast.success(`Category "${category}" deleted`);
  };

  // Single Image Category Edit
  const handleEditImage = (image: GalleryImage) => {
    setEditingImage(image);
    setEditDialogOpen(true);
  };

  const handleUpdateImageCategory = async (
    newCategory: string,
  ) => {
    if (!editingImage) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/admin/gallery/${editingImage.id}/category`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ category: newCategory }),
        },
      );

      const data = await response.json();
      if (data.success) {
        setImages((prev) =>
          prev.map((img) =>
            img.id === editingImage.id
              ? { ...img, category: newCategory }
              : img,
          ),
        );
        toast.success(`Image moved to "${newCategory}"`);
      } else {
        toast.error(data.error || "Failed to update category");
      }
    } catch (error) {
      console.error("Update category error:", error);
      toast.error("Failed to update category");
    }
  };

  // Toggle Featured Status
  const handleToggleFeatured = async (id: string, featured: boolean) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/admin/gallery/${id}/featured`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ featured }),
        },
      );

      const data = await response.json();
      if (data.success) {
        setImages((prev) =>
          prev.map((img) =>
            img.id === id ? { ...img, featured } : img,
          ),
        );
        toast.success(featured ? "Marked as featured" : "Unmarked as featured");
      } else {
        toast.error(data.error || "Failed to update featured status");
      }
    } catch (error) {
      console.error("Toggle featured error:", error);
      toast.error("Failed to update featured status");
    }
  };

  // Bulk Selection
  const handleToggleSelect = (id: string) => {
    setSelectedImages((prev) =>
      prev.includes(id)
        ? prev.filter((imgId) => imgId !== id)
        : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    const allIds = filteredImages.map((img) => img.id);
    setSelectedImages(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedImages([]);
  };

  // Bulk Actions
  const handleBulkUpdateCategory = async (
    newCategory: string,
  ) => {
    if (selectedImages.length === 0) return;

    try {
      let successCount = 0;
      let failCount = 0;

      for (const imageId of selectedImages) {
        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/admin/gallery/${imageId}/category`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${publicAnonKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ category: newCategory }),
            },
          );

          const data = await response.json();
          if (data.success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          failCount++;
        }
      }

      // Update local state
      setImages((prev) =>
        prev.map((img) =>
          selectedImages.includes(img.id)
            ? { ...img, category: newCategory }
            : img,
        ),
      );

      if (successCount > 0) {
        toast.success(
          `Updated ${successCount} image${successCount > 1 ? "s" : ""} to "${newCategory}"`,
        );
      }
      if (failCount > 0) {
        toast.error(
          `Failed to update ${failCount} image${failCount > 1 ? "s" : ""}`,
        );
      }

      // Reset selection
      setSelectedImages([]);
      setIsBulkMode(false);
    } catch (error) {
      console.error("Bulk update error:", error);
      toast.error("Failed to update images");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedImages.length === 0) return;

    if (
      !confirm(
        `Delete ${selectedImages.length} selected image${selectedImages.length > 1 ? "s" : ""}?`,
      )
    ) {
      return;
    }

    // OPTIMISTIC UPDATE: Remove from UI immediately
    const deletedImages = images.filter((img) =>
      selectedImages.includes(img.id),
    );
    const remainingImages = images.filter(
      (img) => !selectedImages.includes(img.id),
    );

    setImages(remainingImages);

    // Show loading toast
    const loadingToast = toast.loading(
      `Deleting ${selectedImages.length} image${selectedImages.length > 1 ? "s" : ""}...`,
      {
        description: "Removing from server and Cloudinary",
      },
    );

    // Store for potential rollback
    const failedDeletes: GalleryImage[] = [];

    // BACKGROUND: Call API to delete from backend/Cloudinary
    try {
      for (const imageId of selectedImages) {
        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/admin/gallery/${imageId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${publicAnonKey}`,
              },
            },
          );

          const data = await response.json();
          if (!data.success) {
            // Track failed deletes
            const failedImage = deletedImages.find(
              (img) => img.id === imageId,
            );
            if (failedImage) {
              failedDeletes.push(failedImage);
            }
          }
        } catch (error) {
          // Track failed deletes
          const failedImage = deletedImages.find(
            (img) => img.id === imageId,
          );
          if (failedImage) {
            failedDeletes.push(failedImage);
          }
        }
      }

      // ROLLBACK: Restore failed deletes
      if (failedDeletes.length > 0) {
        setImages((prev) =>
          [...prev, ...failedDeletes].sort(
            (a, b) => a.order - b.order,
          ),
        );
        toast.error(
          `Failed to delete ${failedDeletes.length} image${failedDeletes.length > 1 ? "s" : ""}. Restored.`,
          { id: loadingToast },
        );
      } else {
        toast.success(
          `Successfully deleted ${selectedImages.length} image${selectedImages.length > 1 ? "s" : ""}`,
          { id: loadingToast },
        );
      }

      // Reset selection
      setSelectedImages([]);
      setIsBulkMode(false);
    } catch (error) {
      // ROLLBACK ALL: Restore all images on critical error
      console.error(
        "Bulk delete error, rolling back all:",
        error,
      );
      setImages((prev) =>
        [...prev, ...deletedImages].sort(
          (a, b) => a.order - b.order,
        ),
      );
      toast.error("Failed to delete images. All restored.", {
        id: loadingToast,
      });

      // Reset selection
      setSelectedImages([]);
      setIsBulkMode(false);
    }
  };

  // Get all unique categories from images
  const getAllCategories = () => {
    const categories = new Set<string>([
      "All",
      "General",
      ...serviceCategories,
      ...customCategories,
    ]);
    images.forEach((img) => {
      if (img.category) {
        categories.add(img.category);
      }
    });
    return Array.from(categories);
  };

  // Apply Content Filter + Category Filter
  const getFilteredImages = () => {
    let result = [...images];

    // Step 1: Apply Content Filter
    switch (contentFilter) {
      case "new":
        result = result.sort((a, b) => 
          new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );
        break;
      case "popular":
        result = result.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case "featured":
        result = result.filter((img) => img.featured);
        break;
      case "all":
      default:
        // No filtering, keep original order
        break;
    }

    // Step 2: Apply Category Filter
    if (filterCategory !== "All") {
      result = result.filter((img) => img.category === filterCategory);
    }

    return result;
  };

  const filteredImages = getFilteredImages();

  // Count images by Content Filter
  const getContentFilterCount = (filter: string) => {
    const lowerFilter = filter.toLowerCase();
    switch (lowerFilter) {
      case "new":
      case "all":
        return images.length;
      case "popular":
        return images.filter((img) => (img.views || 0) > 0).length;
      case "featured":
        return images.filter((img) => img.featured).length;
      default:
        return 0;
    }
  };

  // Count images by category
  const getCategoryCount = (category: string) => {
    if (category === "All") return images.length;
    return images.filter((img) => img.category === category)
      .length;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-[#FF9F1C] animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 lg:p-6 max-w-7xl mx-auto p-[0px]">
        {/* Upload Section */}
        <Card className="p-6 lg:p-8 mb-8 border-none shadow-lg bg-card/50 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Upload Gallery Images
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Add new photos to your portfolio.
              </p>
            </div>

            {/* Category Selector - Compact on Desktop */}
            <div className="flex-1 md:max-w-md">
              <CategorySelector
                selectedCategory={selectedCategory}
                serviceCategories={serviceCategories}
                customCategories={customCategories}
                onSelectCategory={setSelectedCategory}
                onAddCategory={(category) => {
                  // Check if category already exists
                  const allCategories = [
                    ...serviceCategories,
                    ...customCategories,
                    "General",
                  ];
                  if (allCategories.includes(category)) {
                    toast.error("Category already exists");
                    return;
                  }

                  // Save to localStorage
                  const updatedCustomCategories = [
                    ...customCategories,
                    category,
                  ];
                  setCustomCategories(updatedCustomCategories);
                  localStorage.setItem(
                    "gallery_custom_categories",
                    JSON.stringify(updatedCustomCategories),
                  );

                  // Set as selected category
                  setSelectedCategory(category);
                  toast.success(`Category "${category}" added`);
                }}
                onEditCategory={handleEditCategory}
                onDeleteCategory={handleDeleteCategory}
              />
            </div>
          </div>

          {/* Logo Upload Section */}
          <div className="mt-6 border-t border-border pt-6">
            <div className="flex flex-col gap-4">
              {/* Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={showLogoOnUpload}
                  onChange={(e) => setShowLogoOnUpload(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  Show logo on uploaded images
                </span>
              </label>

              {/* Logo Upload (shown when checkbox checked) */}
              <AnimatePresence>
                {showLogoOnUpload && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="file"
                          accept="image/png,image/svg+xml,image/jpeg"
                          onChange={handleLogoUpload}
                          disabled={uploadingLogo}
                          className="hidden"
                          id="logo-upload-input"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={uploadingLogo}
                          className="gap-2"
                          onClick={(e) => {
                            e.preventDefault();
                            document.getElementById('logo-upload-input')?.click();
                          }}
                        >
                          {uploadingLogo ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          {logoUrl ? 'Change Logo' : 'Upload Logo'}
                        </Button>
                        {logoUrl && (
                          <div className="flex items-center gap-2">
                            <img
                              src={logoUrl}
                              alt="Logo preview"
                              className="h-8 w-auto object-contain border border-border rounded px-2 bg-white"
                            />
                            <span className="text-xs text-green-600 font-medium">✓ Uploaded</span>
                          </div>
                        )}
                      </label>
                      <p className="text-xs text-muted-foreground">
                        PNG, SVG, or JPEG (max 2MB, horizontal layout recommended)
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Upload Dropzone */}
          <label
            className={`
              relative block w-full rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden group
              ${
                uploading
                  ? "border-primary/50 bg-primary/5 cursor-wait"
                  : "border-border bg-accent/10 hover:border-primary/70 hover:bg-accent/30 hover:shadow-inner"
              }
            `}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
              id="gallery-upload"
            />

            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              {uploading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping blur-sm"></div>
                    <div className="relative bg-background rounded-full p-4 shadow-sm border border-border">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-primary">
                    Uploading Images...
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Adding to {selectedCategory}
                  </p>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 rounded-full bg-background shadow-sm border border-border group-hover:scale-110 group-hover:border-primary/50 transition-all duration-300">
                    <Upload className="w-8 h-8 text-primary/80 group-hover:text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      Click to upload or drag and drop
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      SVG, PNG, JPG or GIF (max. 10MB)
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-background/50 px-3 py-1.5 rounded-full border border-border/50">
                    <span className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></div>
                      Multiple files
                    </span>
                    <span className="w-px h-3 bg-border"></span>
                    <span className="flex items-center">
                      <Tag className="w-3 h-3 mr-1.5" />
                      Category:{" "}
                      <span className="font-medium text-foreground ml-1">
                        {selectedCategory}
                      </span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </label>
        </Card>

        {/* Images List */}
        {images.length === 0 ? (
          <Card className="p-12">
            <div className="text-center text-gray-400">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">
                No gallery images uploaded yet
              </p>
              <p className="text-sm mt-2">
                Upload your first image to get started
              </p>
            </div>
          </Card>
        ) : (
          <div>
            {/* Filters Section - Compact Row */}
            <div className="mb-6 flex flex-wrap items-center gap-4">
              {/* Content Filter */}
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-muted-foreground" />
                <SelectField
                  value={contentFilter}
                  onValueChange={setContentFilter}
                  triggerClassName="min-w-[160px]"
                  options={["New", "Popular", "Featured", "All"].map((label) => ({
                    value: label.toLowerCase(),
                    label: `${label} (${getContentFilterCount(label)})`,
                  }))}
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <SelectField
                  value={filterCategory}
                  onValueChange={setFilterCategory}
                  triggerClassName="min-w-[160px]"
                  options={getAllCategories().map((category) => ({
                    value: category,
                    label: `${category} (${getCategoryCount(category)})`,
                  }))}
                />
              </div>
            </div>

            {/* Images Grid */}
            {filteredImages.length === 0 ? (
              <Card className="p-12">
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="text-base font-medium">
                    No images in "{filterCategory}"
                  </p>
                  <p className="text-sm mt-1">
                    Try selecting a different category
                  </p>
                </div>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-muted-foreground">
                      Showing {filteredImages.length} image
                      {filteredImages.length !== 1 ? "s" : ""}
                      {filterCategory !== "All" &&
                        ` in ${filterCategory}`}
                    </p>

                    {/* Bulk Mode Toggle */}
                    <Button
                      variant={
                        isBulkMode ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => {
                        setIsBulkMode(!isBulkMode);
                        if (isBulkMode) {
                          setSelectedImages([]);
                        }
                      }}
                      className="gap-2"
                    >
                      <Layers className="w-4 h-4" />
                      {isBulkMode ? "Done" : "Select Multiple"}
                    </Button>
                  </div>

                  {!isBulkMode && (
                    <p className="text-xs text-muted-foreground">
                      💡 Drag to reorder
                    </p>
                  )}
                </div>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={filteredImages.map((img) => img.id)}
                    strategy={rectSortingStrategy}
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {filteredImages.map((image) => (
                        <SortableItem
                          key={image.id}
                          image={image}
                          onDelete={handleDelete}
                          onPreview={setPreviewImage}
                          onEdit={handleEditImage}
                          onToggleFeatured={handleToggleFeatured}
                          isSelected={selectedImages.includes(
                            image.id,
                          )}
                          onToggleSelect={handleToggleSelect}
                          isBulkMode={isBulkMode}
                          logoUrl={logoUrl}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </>
            )}
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {isBulkMode && selectedImages.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <Card className="p-4 shadow-2xl border-2 border-primary/20 bg-card/95 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                    {selectedImages.length}
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {selectedImages.length} image
                    {selectedImages.length > 1 ? "s" : ""}{" "}
                    selected
                  </span>
                </div>

                <div className="h-6 w-px bg-border" />

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="text-xs"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeselectAll}
                    className="text-xs"
                  >
                    Deselect All
                  </Button>
                </div>

                <div className="h-6 w-px bg-border" />

                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      setEditingImage(null);
                      setEditDialogOpen(true);
                    }}
                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-[rgb(255,255,255)]"
                  >
                    <Edit2 className="w-4 h-4" />
                    Change Category
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Selected
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Category Edit Dialog */}
      <ImageCategoryDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        currentCategory={editingImage?.category}
        serviceCategories={serviceCategories}
        customCategories={customCategories}
        onConfirm={(category) => {
          if (editingImage) {
            // Single image edit
            handleUpdateImageCategory(category);
          } else {
            // Bulk edit
            handleBulkUpdateCategory(category);
          }
        }}
        title={
          editingImage
            ? "Change Image Category"
            : "Change Category for Selected Images"
        }
        description={
          editingImage
            ? "Select a new category for this image"
            : `Select a new category for ${selectedImages.length} selected images`
        }
        isMultiple={!editingImage}
      />

      {/* Image Preview Lightbox */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 bg-[rgba(0,0,0,0.6)]"
            onClick={() => setPreviewImage(null)}
            onKeyDown={(e) => {
              const currentIndex = filteredImages.findIndex(
                (img) => img.id === previewImage.id,
              );
              if (e.key === "ArrowLeft" && currentIndex > 0) {
                setPreviewImage(filteredImages[currentIndex - 1]);
              } else if (
                e.key === "ArrowRight" &&
                currentIndex < filteredImages.length - 1
              ) {
                setPreviewImage(filteredImages[currentIndex + 1]);
              } else if (e.key === "Escape") {
                setPreviewImage(null);
              }
            }}
            tabIndex={0}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-50 p-2"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Previous Button */}
            {(() => {
              const currentIndex = filteredImages.findIndex(
                (img) => img.id === previewImage.id,
              );
              return currentIndex > 0 ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewImage(filteredImages[currentIndex - 1]);
                  }}
                  className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full p-3 transition-all hover:scale-110 z-50"
                  title="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              ) : null;
            })()}

            {/* Next Button */}
            {(() => {
              const currentIndex = filteredImages.findIndex(
                (img) => img.id === previewImage.id,
              );
              return currentIndex < filteredImages.length - 1 ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewImage(filteredImages[currentIndex + 1]);
                  }}
                  className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full p-3 transition-all hover:scale-110 z-50"
                  title="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              ) : null;
            })()}

            <div
              className="relative w-full max-w-7xl flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                key={previewImage.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative w-full h-full flex flex-col items-center justify-center gap-4"
              >
                <div className="relative">
                  <img
                    src={previewImage.cloudinary_url}
                    alt="Preview"
                    className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl"
                  />
                  
                  {/* Logo Badge on Preview */}
                  {previewImage.showLogo && logoUrl && (
                    <LogoBadge logoUrl={logoUrl} visible={true} size="lg" />
                  )}
                </div>
                
                {/* Image Info */}
                <div className="bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-lg flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    <span className="font-semibold">{previewImage.category}</span>
                  </span>
                  <span className="text-white/50">•</span>
                  <span>
                    {previewImage.width} × {previewImage.height}
                  </span>
                  <span className="text-white/50">•</span>
                  <span>
                    {filteredImages.findIndex((img) => img.id === previewImage.id) + 1} / {filteredImages.length}
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}