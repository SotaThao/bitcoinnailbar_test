import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { Tag } from 'lucide-react';
import { cn } from './utils';

interface ImageCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCategory?: string;
  serviceCategories: string[];
  customCategories: string[];
  onConfirm: (category: string) => void;
  title?: string;
  description?: string;
  isMultiple?: boolean;
}

export function ImageCategoryDialog({
  open,
  onOpenChange,
  currentCategory,
  serviceCategories,
  customCategories,
  onConfirm,
  title = "Change Category",
  description = "Select a new category for this image",
  isMultiple = false,
}: ImageCategoryDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState(currentCategory || 'General');

  const handleConfirm = () => {
    onConfirm(selectedCategory);
    onOpenChange(false);
  };

  const CategoryButton = ({ category }: { category: string }) => {
    const isSelected = selectedCategory === category;
    return (
      <button
        onClick={() => setSelectedCategory(category)}
        className={cn(
          "px-4 py-3 rounded-lg text-sm font-medium transition-all text-left",
          isSelected
            ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20"
            : "bg-card border border-border text-foreground hover:bg-accent hover:border-primary/50"
        )}
      >
        {category}
      </button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {isMultiple 
              ? `Select a category for the selected images` 
              : description
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* General Category */}
          <div>
            <CategoryButton category="General" />
          </div>

          {/* Service Categories */}
          {serviceCategories.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
                Service Categories
              </p>
              <div className="grid grid-cols-1 gap-2">
                {serviceCategories.map((category) => (
                  <CategoryButton key={category} category={category} />
                ))}
              </div>
            </div>
          )}

          {/* Custom Categories */}
          {customCategories.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
                Custom Categories
              </p>
              <div className="grid grid-cols-1 gap-2">
                {customCategories.map((category) => (
                  <CategoryButton key={category} category={category} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isMultiple ? 'Update All' : 'Update Category'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
