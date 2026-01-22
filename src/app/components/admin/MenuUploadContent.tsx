import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '@utils/supabase/info';
import { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, TouchSensor } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Upload, ExternalLink, ImageIcon, Loader2, Edit2, X, Check, Image } from 'lucide-react';
import { Input } from '@/app/components/ui/input';

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

function SortableItem({ 
  image, 
  onDelete, 
  onUpdate 
}: { 
  image: MenuImage; 
  onDelete: (id: string) => void;
  onUpdate: (id: string, name: string, file?: File) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(image.name);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Update editName when image.name changes (after successful save)
  useEffect(() => {
    setEditName(image.name);
  }, [image.name]);
  
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ 
    id: image.id,
    disabled: isEditing // Disable dragging when editing
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    setNewFile(file);
  };

  const handleSave = async () => {
    if (!editName.trim()) {
      toast.error('Menu name is required');
      return;
    }

    setIsSaving(true);
    try {
      await onUpdate(image.id, editName.trim(), newFile || undefined);
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
    <div ref={setNodeRef} style={style} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div 
        {...attributes} 
        {...listeners}
        className={`flex items-center gap-3 p-3 ${
          isEditing 
            ? 'cursor-default' 
            : 'cursor-grab active:cursor-grabbing hover:bg-gray-50'
        } transition-colors`}
      >
        <div className={`text-gray-400 ${isEditing ? 'opacity-30' : ''}`}>
          <GripVertical className="w-5 h-5" />
        </div>
        
        {/* Image Preview */}
        <div className="relative">
          <img
            src={newFile ? URL.createObjectURL(newFile) : image.cloudinary_url}
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
                <p className="text-xs text-gray-500">New image: {newFile.name}</p>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-900">{image.name}</p>
              <p className="text-xs text-gray-500 truncate">{image.public_id}</p>
              <p className="text-xs text-gray-400">{image.width} × {image.height}</p>
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
  const [menuName, setMenuName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
    })
  );

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/menu/images`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setImages(data.data);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('Failed to load menu images');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setMenuName('');
  };

  const handleUpload = async () => {
    if (!selectedFile || !menuName.trim()) {
      toast.error('Please provide a menu name');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('name', menuName.trim());
    formData.append('order', images.length.toString());

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/admin/menu/upload`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${publicAnonKey}` },
          body: formData,
        }
      );

      const data = await response.json();
      if (data.success) {
        setImages([...images, data.data]);
        toast.success('Menu image uploaded successfully');
        setSelectedFile(null);
        setMenuName('');
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu page?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/admin/menu/${id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );

      const data = await response.json();
      if (data.success) {
        setImages(images.filter(img => img.id !== id));
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
      const oldIndex = images.findIndex(img => img.id === active.id);
      const newIndex = images.findIndex(img => img.id === over.id);

      const newImages = arrayMove(images, oldIndex, newIndex);
      setImages(newImages);

      // Update order on server
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/admin/menu/reorder`,
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

  const handleUpdate = async (id: string, name: string, file?: File) => {
    const formData = new FormData();
    formData.append('name', name);
    if (file) {
      formData.append('file', file);
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/admin/menu/${id}/update`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${publicAnonKey}` },
          body: formData,
        }
      );

      const data = await response.json();
      if (data.success) {
        setImages(images.map(img => (img.id === id ? data.data : img)));
        toast.success('Menu image updated successfully');
      } else {
        toast.error(data.error || 'Update failed');
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update image');
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
        {!selectedFile ? (
          <label className="block">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="hidden"
            />
            <Button
              disabled={uploading}
              className="w-full bg-[#FF9F1C] hover:bg-[#E68F0F] text-white"
              onClick={(e) => {
                e.preventDefault();
                (e.target as HTMLButtonElement).previousElementSibling?.dispatchEvent(new MouseEvent('click'));
              }}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Menu Image
            </Button>
          </label>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <ImageIcon className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-700 flex-1">{selectedFile.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedFile(null);
                  setMenuName('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                Change
              </Button>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Menu Name *</label>
              <Input
                type="text"
                value={menuName}
                onChange={(e) => setMenuName(e.target.value)}
                placeholder="e.g., Acrylic Services, Pedicure Menu, Spa Treatments"
                className="w-full"
                disabled={uploading}
              />
              <p className="text-xs text-gray-500">This name will appear in the homepage services dropdown</p>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={uploading || !menuName.trim()}
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
                    Upload
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedFile(null);
                  setMenuName('');
                }}
                disabled={uploading}
                className="border-gray-200"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        
        {!selectedFile && (
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Images will be displayed in the order shown below. Drag to reorder.
            </p>
          </div>
        )}
      </Card>

      {/* Images List */}
      {images.length === 0 ? (
        <Card className="p-12">
          <div className="text-center text-gray-400">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No menu images uploaded yet</p>
            <p className="text-sm mt-2">Upload your first menu page to get started</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 mb-3">
            {images.length} page{images.length !== 1 ? 's' : ''} • Drag to reorder
          </p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={images.map(img => img.id)} strategy={verticalListSortingStrategy}>
              {images.map(image => (
                <SortableItem key={image.id} image={image} onDelete={handleDelete} onUpdate={handleUpdate} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}