import { useState, useEffect } from 'react';
import AdminLayout from '@/app/components/AdminLayout';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Upload, ExternalLink, ImageIcon, Loader2 } from 'lucide-react';

interface MenuImage {
  id: string;
  cloudinary_url: string;
  public_id: string;
  order: number;
  width: number;
  height: number;
  uploadedAt: string;
}

function SortableItem({ image, onDelete }: { image: MenuImage; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-3 p-3">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
          <GripVertical className="w-5 h-5" />
        </button>
        
        <img
          src={image.cloudinary_url}
          alt={`Menu page ${image.order + 1}`}
          className="w-20 h-28 object-cover rounded border border-gray-200"
        />
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">Page {image.order + 1}</p>
          <p className="text-xs text-gray-500 truncate">{image.public_id}</p>
          <p className="text-xs text-gray-400">{image.width} × {image.height}</p>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(image.id)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default function MenuUpload() {
  const [images, setImages] = useState<MenuImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
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
        toast.success('Image uploaded successfully');
        e.target.value = ''; // Reset input
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#FF9F1C] animate-spin" />
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Menu Images</h1>
          <p className="text-gray-600">Upload and manage menu pages for the flipbook viewer</p>
        </div>

        {/* Upload Section */}
        <Card className="p-6 mb-6">
          <label className="block">
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
            <Button
              disabled={uploading}
              className="w-full bg-[#FF9F1C] hover:bg-[#E68F0F] text-white mb-2"
              onClick={(e) => {
                e.preventDefault();
                (e.target as HTMLButtonElement).previousElementSibling?.dispatchEvent(new MouseEvent('click'));
              }}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Menu Page
                </>
              )}
            </Button>
          </label>
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Images will be displayed in the order shown below. Drag to reorder.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('/menu', '_blank')}
              className="border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>
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
                  <SortableItem key={image.id} image={image} onDelete={handleDelete} />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}