import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import { Button } from "@/app/components/ui/button";
import {
  Tag,
  ChevronDown,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./utils";

interface CategorySelectorProps {
  selectedCategory: string;
  serviceCategories: string[];
  customCategories: string[];
  onSelectCategory: (category: string) => void;
  onAddCategory: (category: string) => void;
  onEditCategory: (oldName: string, newName: string) => void;
  onDeleteCategory: (category: string) => void;
  className?: string;
}

export function CategorySelector({
  selectedCategory,
  serviceCategories,
  customCategories,
  onSelectCategory,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  className,
}: CategorySelectorProps) {
  const [open, setOpen] = useState(false);
  const [showNewInput, setShowNewInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<
    string | null
  >(null);
  const [editValue, setEditValue] = useState("");

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    onAddCategory(newCategoryName.trim());
    setNewCategoryName("");
    setShowNewInput(false);
  };

  const handleEditCategory = (oldName: string) => {
    if (!editValue.trim() || editValue === oldName) {
      setEditingCategory(null);
      return;
    }
    onEditCategory(oldName, editValue.trim());
    setEditingCategory(null);
  };

  const handleDeleteCategory = (category: string) => {
    if (confirm(`Delete category "${category}"?`)) {
      onDeleteCategory(category);
      if (selectedCategory === category) {
        onSelectCategory("General");
      }
    }
  };

  const CategoryItem = ({
    category,
    isCustom = false,
  }: {
    category: string;
    isCustom?: boolean;
  }) => {
    const isSelected = selectedCategory === category;
    const isEditing = editingCategory === category;

    return (
      <div
        className={cn(
          "group relative flex items-center gap-2 px-3 py-2 rounded-md transition-all cursor-pointer",
          isSelected
            ? "bg-primary text-primary-foreground"
            : "hover:bg-accent text-foreground",
        )}
      >
        {isEditing ? (
          <div
            className="flex items-center gap-1 flex-1"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  handleEditCategory(category);
                if (e.key === "Escape")
                  setEditingCategory(null);
              }}
              className="flex-1 bg-background border border-border rounded px-2 py-0.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
            <button
              onClick={() => handleEditCategory(category)}
              className="p-1 hover:bg-background/50 rounded"
            >
              <Check className="w-3 h-3 text-green-600" />
            </button>
            <button
              onClick={() => setEditingCategory(null)}
              className="p-1 hover:bg-background/50 rounded"
            >
              <X className="w-3 h-3 text-destructive" />
            </button>
          </div>
        ) : (
          <>
            <span
              className="flex-1 text-sm font-medium"
              onClick={() => {
                onSelectCategory(category);
                setOpen(false);
              }}
            >
              {category}
            </span>

            {isCustom && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingCategory(category);
                    setEditValue(category);
                  }}
                  className={cn(
                    "p-1 rounded hover:bg-background/50 transition-colors",
                    isSelected
                      ? "text-primary-foreground/80 hover:text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCategory(category);
                  }}
                  className={cn(
                    "p-1 rounded hover:bg-background/50 transition-colors",
                    isSelected
                      ? "text-primary-foreground/80 hover:text-primary-foreground"
                      : "text-destructive/70 hover:text-destructive",
                  )}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
        Categories
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between bg-background border-border hover:border-primary/50 transition-all",
              open && "border-primary ring-2 ring-primary/20",
              className,
            )}
          >
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">
                {selectedCategory}
              </span>
            </div>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-muted-foreground transition-transform duration-200",
                open && "rotate-180",
              )}
            />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-2"
          align="start"
        >
          <div className="space-y-1">
            {/* General Category */}
            <div className="mb-2">
              <CategoryItem category="General" />
            </div>

            {/* Service Categories */}
            {serviceCategories.length > 0 && (
              <>
                <div className="px-2 py-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Service Categories
                  </p>
                </div>
                {serviceCategories.map((category) => (
                  <CategoryItem
                    key={category}
                    category={category}
                  />
                ))}
              </>
            )}

            {/* Custom Categories */}
            {customCategories.length > 0 && (
              <>
                <div className="px-2 py-1.5 mt-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Custom Categories
                  </p>
                </div>
                {customCategories.map((category) => (
                  <CategoryItem
                    key={category}
                    category={category}
                    isCustom
                  />
                ))}
              </>
            )}

            {/* Separator */}
            <div className="border-t border-border my-2" />

            {/* New Category Section */}
            <AnimatePresence>
              {showNewInput ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2 p-2 bg-accent/30 rounded-md border border-border">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) =>
                        setNewCategoryName(e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter")
                          handleAddCategory();
                        if (e.key === "Escape") {
                          setShowNewInput(false);
                          setNewCategoryName("");
                        }
                      }}
                      placeholder="Category name..."
                      className="flex-1 bg-background border border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      autoFocus
                    />
                    <button
                      onClick={handleAddCategory}
                      className="p-1.5 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setShowNewInput(false);
                        setNewCategoryName("");
                      }}
                      className="p-1.5 bg-background border border-border rounded hover:bg-accent transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <button
                  onClick={() => setShowNewInput(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-primary hover:bg-accent transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create New Category
                </button>
              )}
            </AnimatePresence>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}