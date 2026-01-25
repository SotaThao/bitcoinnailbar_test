/**
 * Service Category Sidebar Component (Molecule)
 * Displays category navigation with drag & drop reordering
 */

import {
  Plus,
  Edit2,
  Trash2,
  GripVertical,
} from "lucide-react";
import { Button } from "../../ui/button";
import type { ServiceCategory } from "../../../lib/service-constants";
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

interface ServiceCategorySidebarProps {
  categories: ServiceCategory[];
  activeTab: string;
  onTabChange: (categoryName: string) => void;
  onAddCategory?: () => void;
  onEditCategory?: (category: ServiceCategory) => void;
  onDeleteCategory?: (categoryId: number) => void;
  onReorder?: (newOrder: ServiceCategory[]) => void;
}

function SortableCategoryItem({
  category,
  index,
  isActive,
  isDisabled,
  onTabChange,
  onEditCategory,
  onDeleteCategory,
}: {
  category: ServiceCategory;
  index: number;
  isActive: boolean;
  isDisabled: boolean;
  onTabChange: (categoryName: string) => void;
  onEditCategory?: (category: ServiceCategory) => void;
  onDeleteCategory?: (categoryId: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: category.id.toString(),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      key={`${category.id}-${category.name}-${index}`}
      className={`group w-full flex items-center justify-between px-3 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 ${
        isActive
          ? "bg-[#FF9F1C] text-white shadow-md shadow-orange-200"
          : "text-gray-500 hover:bg-orange-50 hover:text-[#FF9F1C] bg-transparent"
      } ${isDisabled ? "opacity-50" : ""}`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className={`${isActive ? "text-white/60" : "text-gray-400"} cursor-grab active:cursor-grabbing mr-1 touch-none`}
      >
        <GripVertical className="w-4 h-4" />
      </div>

      <div
        className="flex items-center gap-3 overflow-hidden flex-1 cursor-pointer"
        onClick={() => onTabChange(category.name)}
      >
        <span className="truncate">{category.name}</span>
        {isDisabled && (
          <span className="text-[10px] px-2 py-0.5 rounded bg-gray-200 text-gray-600">
            Disabled
          </span>
        )}
      </div>

      {/* Action Buttons - Only show when editing is enabled */}
      {(onEditCategory || onDeleteCategory) && (
        <div
          className={`flex items-center gap-1 ml-2 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity`}
        >
          {onEditCategory && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditCategory(category);
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                isActive
                  ? "hover:bg-white/20"
                  : "hover:bg-orange-100"
              }`}
              title="Edit category"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          {onDeleteCategory && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log(
                  `🗑️ [UI] Delete button clicked for category:`,
                  { id: category.id, name: category.name },
                );

                // Guard: Check if category exists before attempting delete
                if (!category.id || category.id <= 0) {
                  console.error(
                    `❌ [UI] Invalid category ID: ${category.id}`,
                  );
                  alert("Cannot delete: Invalid category ID");
                  return;
                }

                if (
                  confirm(
                    `Are you sure you want to delete "${category.name}" (ID: ${category.id})?\n\nThis will also delete all services in this category.`,
                  )
                ) {
                  console.log(
                    `✅ [UI] User confirmed delete for category ID: ${category.id}`,
                  );
                  onDeleteCategory(category.id);
                } else {
                  console.log(`❌ [UI] User cancelled delete`);
                }
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                isActive
                  ? "hover:bg-white/20"
                  : "hover:bg-red-100 hover:text-red-600"
              }`}
              title="Delete category"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function ServiceCategorySidebar({
  categories,
  activeTab,
  onTabChange,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onReorder,
}: ServiceCategorySidebarProps) {
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

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active && over && active.id !== over.id) {
      const oldIndex = categories.findIndex(
        (cat) => cat.id.toString() === active.id,
      );
      const newIndex = categories.findIndex(
        (cat) => cat.id.toString() === over.id,
      );

      const newOrder = arrayMove(
        categories,
        oldIndex,
        newIndex,
      );

      // Call parent callback to update order
      if (onReorder) {
        onReorder(newOrder);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 sticky top-0">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-lg font-bold text-gray-900">
          Categories
        </h2>
        {onAddCategory && (
          <Button
            onClick={onAddCategory}
            size="sm"
            variant="outline"
            className="h-8 px-3 border-[#FF9F1C] text-[#FF9F1C] hover:bg-[#FF9F1C] hover:text-white"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add New
          </Button>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={categories.map((cat) => cat.id.toString())}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1">
            {categories.map((cat, index) => {
              const isActive = activeTab === cat.name;
              const isDisabled =
                (cat as any).status === "disabled";

              return (
                <SortableCategoryItem
                  key={`${cat.id}-${cat.name}-${index}`}
                  category={cat}
                  index={index}
                  isActive={isActive}
                  isDisabled={isDisabled}
                  onTabChange={onTabChange}
                  onEditCategory={onEditCategory}
                  onDeleteCategory={onDeleteCategory}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}