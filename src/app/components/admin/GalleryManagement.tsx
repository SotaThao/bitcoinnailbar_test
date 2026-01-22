import { useState, useEffect } from 'react';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '@utils/supabase/info';
import AdminLayout from '@/app/components/AdminLayout';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Upload, ImageIcon, Loader2, X, ZoomIn, Plus, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GalleryImage {
  id: string;
  cloudinary_url: string;
  public_id: string;
  category: string;
  order: number;
  width: number;
  height: number;
  uploadedAt: string;
}

interface SortableItemProps {
  image: GalleryImage;
  onDelete: (id: string) => void;
  onPreview: (image: GalleryImage) => void;
}

function SortableItem({ image, onDelete, onPreview }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200 hover:border-[#FF9800] transition-all duration-300"
    >
      {/* Drag Handle - Top Right */}
      <button
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 z-10 cursor-grab active:cursor-grabbing bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-white"
      >
        <GripVertical className="w-4 h-4 text-gray-600" />
      </button>

      {/* Order Badge - Top Left */}
      <div className="absolute top-2 left-2 z-10 bg-[#FF9800] text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
        {image.order + 1}
      </div>

      {/* Image */}
      <img
        src={image.cloudinary_url}
        alt={`Gallery ${image.order + 1}`}
        className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
        onClick={() => onPreview(image)}
      />

      {/* Hover Overlay with Remove Icon */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(image.id);
          }}
          className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3 shadow-xl transition-transform transform hover:scale-110"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Zoom Icon (secondary action on hover) */}
      <div 
        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        onClick={() => onPreview(image)}
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors">
          <ZoomIn className="w-4 h-4 text-gray-700" />
        </div>
      </div>
    </div>
  );
}

export default function GalleryManagement() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<GalleryImage | null>(null);
  
  // Category Management
  const [serviceCategories, setServiceCategories] = useState<string[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('General');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchImages();
    fetchServiceCategories();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/gallery/images`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setImages(data.data);
      } else {
        toast.error('Failed to load gallery images');
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('Failed to load gallery images');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validate category selection
    if (!selectedCategory || selectedCategory === '_new_') {
      toast.error('Please select a valid category before uploading');
      return;
    }

    // Validate file type and size
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
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
        formData.append('file', file);
        formData.append('category', selectedCategory); // Use selected category

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/admin/gallery/upload`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${publicAnonKey}` },
            body: formData,
          }
        );

        const data = await response.json();
        if (data.success) {
          setImages((prev) => [...prev, data.data]);
          successCount++;
        } else {
          console.error(`Failed to upload ${file.name}:`, data.error);
          failCount++;
        }
      } catch (error) {
        console.error(`Upload error for ${file.name}:`, error);
        failCount++;
      }
    }

    setUploading(false);
    e.target.value = ''; // Reset input

    if (successCount > 0) {
      toast.success(`${successCount} image${successCount > 1 ? 's' : ''} uploaded to ${selectedCategory}`);
    }
    if (failCount > 0) {
      toast.error(`Failed to upload ${failCount} image${failCount > 1 ? 's' : ''}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image from the gallery?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/admin/gallery/${id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );

      const data = await response.json();
      if (data.success) {
        setImages((prev) => prev.filter((img) => img.id !== id));
        toast.success('Image deleted');
      } else {
        toast.error(data.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete image');
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over.id);

      const newImages = arrayMove(images, oldIndex, newIndex);
      setImages(newImages);

      // Update order on server
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/admin/gallery/reorder`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ images: newImages }),
          }
        );

        const data = await response.json();
        if (!data.success) {
          toast.error('Failed to save order');
          fetchImages(); // Revert to server state
        }
      } catch (error) {
        console.error('Reorder error:', error);
        toast.error('Failed to save order');
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
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        // Extract category names from service categories
        const categoryNames = data.data
          .filter((cat: any) => cat.status === 'active')
          .map((cat: any) => cat.name);
        setServiceCategories(categoryNames);
      }
      
      // Load custom categories from localStorage as fallback
      const savedCustomCategories = localStorage.getItem('gallery_custom_categories');
      if (savedCustomCategories) {
        setCustomCategories(JSON.parse(savedCustomCategories));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Don't show error toast - just use empty arrays as fallback
      setServiceCategories([]);
      setCustomCategories([]);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }

    // Check if category already exists
    const allCategories = [...serviceCategories, ...customCategories, 'General'];
    if (allCategories.includes(newCategoryName.trim())) {
      toast.error('Category already exists');
      return;
    }

    // Save to localStorage as fallback until backend API is ready
    const updatedCustomCategories = [...customCategories, newCategoryName.trim()];
    setCustomCategories(updatedCustomCategories);
    localStorage.setItem('gallery_custom_categories', JSON.stringify(updatedCustomCategories));
    
    // Set as selected category
    setSelectedCategory(newCategoryName.trim());
    setNewCategoryName('');
    setShowNewCategoryInput(false);
    
    toast.success(`Category "${newCategoryName.trim()}" added`);
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
        <Card className="p-4 lg:p-6 mb-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-foreground mb-2">Upload Images</h2>
            <p className="text-sm text-muted-foreground">Select images to upload (max 10MB each, supports multiple files)</p>
          </div>

          {/* Category Selector */}
          <div className="mb-4 pb-4 border-b border-border">
            <label className="block text-sm font-medium text-foreground mb-2">
              <Tag className="w-4 h-4 inline mr-2" />
              Select Category
            </label>
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '_new_') {
                    setShowNewCategoryInput(true);
                  } else {
                    setSelectedCategory(value);
                    setShowNewCategoryInput(false);
                  }
                }}
                className="flex-1 sm:flex-initial sm:min-w-[250px] bg-input-background border border-input rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              >
                <option value="General">General</option>
                {serviceCategories.map((category) => (
                  <option key={category} value={category}>
                    📋 {category} (from Services)
                  </option>
                ))}
                {customCategories.map((category) => (
                  <option key={category} value={category}>
                    ✨ {category} (Custom)
                  </option>
                ))}
                <option value="_new_">➕ Add New Category...</option>
              </select>

              {showNewCategoryInput && (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddCategory();
                      }
                    }}
                    placeholder="Enter category name"
                    className="bg-input-background border border-input rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    autoFocus
                  />
                  <Button
                    type="button"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2"
                    onClick={handleAddCategory}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="px-4 py-2"
                    onClick={() => {
                      setShowNewCategoryInput(false);
                      setNewCategoryName('');
                      setSelectedCategory('General');
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              💡 Categories from Services List are shown for reference. Creating new categories here won't affect Services.
            </p>
          </div>

          <label className="block">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
              id="gallery-upload"
            />
            <Button
              type="button"
              disabled={uploading}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-base"
              onClick={() => document.getElementById('gallery-upload')?.click()}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Uploading to {selectedCategory}...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Upload to {selectedCategory}
                </>
              )}
            </Button>
          </label>

          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              💡 Tip: You can select multiple images at once for batch upload
            </p>
          </div>
        </Card>

        {/* Images List */}
        {images.length === 0 ? (
          <Card className="p-12">
            <div className="text-center text-gray-400">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No gallery images uploaded yet</p>
              <p className="text-sm mt-2">Upload your first image to get started</p>
            </div>
          </Card>
        ) : (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              {images.length} image{images.length !== 1 ? 's' : ''} • Drag to reorder
            </p>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {images.map((image) => (
                    <SortableItem
                      key={image.id}
                      image={image}
                      onDelete={handleDelete}
                      onPreview={setPreviewImage}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={() => setPreviewImage(null)}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-2"
            >
              <X className="w-8 h-8" />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewImage.cloudinary_url}
                alt="Preview"
                className="w-full h-auto max-h-[85vh] object-contain rounded-lg shadow-2xl"
              />
              <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-white text-sm">
                  {previewImage.width} × {previewImage.height}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}