/**
 * Service Table Row Component (Molecule)
 * Displays a single service row with actions dropdown
 */

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Edit2, Trash2, MoreHorizontal, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Switch } from "../../ui/switch";
import type { Service } from "../../../lib/admin-types";

interface ServiceTableRowProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (serviceId: string) => void;
  isCategoryDisabled?: boolean;
  isAddonChild?: boolean; // New prop to indicate this is a child add-on
  parentServiceName?: string; // Name of parent service (optional for context)
  onToggleStatus?: (service: Service) => void;
}

export function ServiceTableRow({
  service,
  onEdit,
  onDelete,
  isCategoryDisabled = false,
  isAddonChild = false,
  onToggleStatus,
}: ServiceTableRowProps) {
  const [showDescription, setShowDescription] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  // Close menu on click outside
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  // Close menu on scroll
  useEffect(() => {
    if (!menuOpen) return;
    const handler = () => setMenuOpen(false);
    window.addEventListener("scroll", handler, true);
    return () => window.removeEventListener("scroll", handler, true);
  }, [menuOpen]);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!menuOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 4,
        left: rect.right - 160, // 160px = min-w of dropdown
      });
    }
    setMenuOpen((prev) => !prev);
  };

  const handleDelete = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this service?",
      )
    ) {
      onDelete(service.id);
    }
  };

  const handleToggleClick = () => {
    console.log(
      "🔘 [ServiceTableRow] Toggle clicked for:",
      service.name,
    );
    console.log("   - Current status:", service.status);
    console.log("   - Service object:", service);
    console.log(
      "   - onToggleStatus function exists:",
      !!onToggleStatus,
    );
    console.log("   - isCategoryDisabled:", isCategoryDisabled);

    if (onToggleStatus) {
      onToggleStatus(service);
    } else {
      console.error(
        "❌ [ServiceTableRow] onToggleStatus is undefined!",
      );
    }
  };

  const isDisabled = isCategoryDisabled;

  // Ensure status has a default value
  const currentStatus = service.status || "active";
  const isActive = currentStatus === "active";

  return (
    <tr
      className={`transition-colors group ${isDisabled ? "opacity-50 bg-gray-50" : isAddonChild ? "bg-orange-50/30 hover:bg-orange-50/50" : "hover:bg-gray-50"}`}
    >
      <td
        className={`px-6 py-4 font-medium transition-colors ${isDisabled ? "text-gray-500" : "text-gray-900 group-hover:text-[#FF9F1C]"} ${isAddonChild ? "pl-12" : ""}`}
      >
        <div>
          <div className="flex items-center gap-1">
            {isAddonChild && (
              <span className="inline-block mr-2 text-gray-400">
                └─
              </span>
            )}
            <span>{service.name}</span>
            {isDisabled && (
              <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-red-100 text-red-600">
                Category Disabled
              </span>
            )}
            {service.description && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDescription(!showDescription);
                }}
                className="ml-1 p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                title={showDescription ? "Hide description" : "Show description"}
              >
                {showDescription ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>
            )}
          </div>
          {showDescription && service.description && (
            <div className="mt-2 text-xs text-gray-500 font-normal leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-md p-3 border border-gray-100 max-w-md">
              {service.description}
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-xs uppercase tracking-wide">
        {service.serviceType === "addon" ? (
          <span className="text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-sm">
            ADD ON
          </span>
        ) : (
          <span className="text-gray-500">
            {service.groupName}
          </span>
        )}
      </td>
      <td className="px-6 py-4 font-bold text-gray-900">
        ${service.priceDisplay || service.price}
      </td>
      <td className="px-6 py-4 font-bold text-[#FF9F1C]">
        {service.memberPriceDisplay
          ? `$${service.memberPriceDisplay}`
          : service.memberPrice || service.member
            ? `$${service.memberPrice || service.member}`
            : "-"}
      </td>
      <td className="px-6 py-4">
        {onToggleStatus && !isCategoryDisabled ? (
          <div className="flex items-center gap-3">
            <Switch
              checked={isActive}
              onCheckedChange={handleToggleClick}
              disabled={isCategoryDisabled}
              className="data-[state=checked]:bg-green-500"
            />
            <span
              className={`text-sm font-medium transition-colors ${isActive ? "text-green-700" : "text-gray-500"}`}
            >
              {isActive ? "Active" : "Disabled"}
            </span>
          </div>
        ) : (
          // Read-only badge if no toggle function or category disabled
          <div className="flex items-center gap-3 opacity-50">
            <Switch
              checked={isActive}
              disabled={true}
              className="data-[state=checked]:bg-green-500"
            />
            <span
              className={`text-sm font-medium ${isActive ? "text-green-700" : "text-gray-500"}`}
            >
              {isActive ? "Active" : "Disabled"}
            </span>
          </div>
        )}
      </td>
      <td className="px-6 py-4 text-right">
        {isDisabled ? (
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 text-gray-300 cursor-not-allowed"
            disabled
            title="Actions disabled - Category is disabled"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        ) : (
          <div className="relative inline-block">
            <Button
              variant="ghost"
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-900"
              onClick={toggleMenu}
              ref={triggerRef}
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            {menuOpen && createPortal(
              <div
                ref={dropdownRef}
                className="fixed z-[9999] min-w-[160px] bg-white border border-gray-200 rounded-md shadow-lg py-1 animate-in fade-in-0 zoom-in-95"
                style={{ top: menuPos.top, left: menuPos.left }}
              >
                <button
                  type="button"
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onEdit(service);
                  }}
                >
                  <Edit2 className="w-4 h-4 text-gray-500" />
                  Edit Service
                </button>
                <div className="border-t border-gray-100 my-0.5" />
                <button
                  type="button"
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    handleDelete();
                  }}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                  Delete
                </button>
              </div>,
              document.body
            )}
          </div>
        )}
      </td>
    </tr>
  );
}