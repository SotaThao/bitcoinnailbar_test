import { useState, useEffect } from "react";
import {
  GripVertical,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Upload,
  X,
  Loader2,
  Save,
  Plus,
  Trash2,
  Calendar,
  Clock,
  MapPin,
} from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { getAuthToken } from "/utils/auth";
import { toast } from "sonner";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO format (YYYY-MM-DD)
  time: string; // HH:MM format
  location: string;
  buttonText: string; // CHANGED: Now required (removed ?)
  buttonLink: string; // CHANGED: Now required (removed ?)
  backgroundColor?: string; // NEW: Auto-preview background color
  textColor?: string; // NEW: Auto-preview text color
  imageUrl?: string;
  imagePath?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function EventEditor() {
  const [events, setEvents] = useState<Event[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(
    null,
  );
  const [uploadingImages, setUploadingImages] = useState<
    Record<string, boolean>
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(
    null,
  );

  // Fetch events from backend on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = await getAuthToken();

      console.log(
        "[EVENT EDITOR DEBUG] Fetching events with token:",
        token ? "EXISTS" : "MISSING",
      );
      
      if (!token) {
        console.error("[EVENT EDITOR] No auth token found!");
        toast.error("Authentication required", {
          description: "Please log in to access admin features.",
        });
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/admin/events`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "X-Session-Token": token,
          },
        },
      );

      console.log(
        "[EVENT EDITOR DEBUG] Response status:",
        response.status,
      );

      const text = await response.text();
      console.log(
        "[EVENT EDITOR DEBUG] Raw response:",
        text.substring(0, 200),
      );

      let result;
      try {
        result = JSON.parse(text);
      } catch (parseError) {
        console.error(
          "[EVENT EDITOR DEBUG] JSON parse failed. Raw response:",
          text,
        );
        throw new Error(
          `Invalid JSON response: ${text.substring(0, 100)}`,
        );
      }

      if (result.success && result.data) {
        setEvents(result.data);
        console.log(
          "✅ [EVENT EDITOR] Loaded",
          result.data.length,
          "events from backend",
        );
      } else {
        console.error(
          "[EVENT EDITOR] API returned error:",
          result,
        );
        
        // If unauthorized, might be token issue
        if (result.error === "Unauthorized") {
          toast.error("Authentication failed", {
            description: "Your session may have expired. Please log in again.",
          });
        } else {
          toast.error("Failed to load events", {
            description: result.error || "Unknown error",
          });
        }
      }
    } catch (error: any) {
      console.error(
        "❌ [EVENT EDITOR] Failed to fetch events:",
        error,
      );
      toast.error("Failed to load events", {
        description:
          error.message || "Please try refreshing the page.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleToggleActive = (id: string) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === id
          ? { ...event, isActive: !event.isActive }
          : event,
      ),
    );
  };

  const handleUpdateField = (
    id: string,
    field: keyof Event,
    value: string,
  ) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === id ? { ...event, [field]: value } : event,
      ),
    );
  };

  const handleAddNew = () => {
    const newEvent: Event = {
      id: `new_${Date.now()}`,
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0], // Today's date
      time: "18:00",
      location: "",
      buttonText: "",
      buttonLink: "",
      backgroundColor: "#0B0F19",
      textColor: "white",
      imageUrl: "",
      imagePath: "",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEvents((prev) => [newEvent, ...prev]);
    setExpandedId(newEvent.id);

    toast.success("New event added", {
      description:
        "Fill in the details and click Save Changes.",
    });
  };

  const handleImageUpload = async (
    eventId: string,
    file: File,
  ) => {
    setUploadingImages((prev) => ({
      ...prev,
      [eventId]: true,
    }));

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("eventId", eventId);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/events/upload-image`,
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

      // Update event with image URL
      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId
            ? {
                ...event,
                imageUrl: result.data.publicUrl,
                imagePath: result.data.path,
              }
            : event,
        ),
      );

      toast.success("Image uploaded", {
        description: "Remember to click Save Changes.",
      });

      console.log(
        "✅ Image uploaded successfully:",
        result.data.filename,
      );
    } catch (error: any) {
      console.error("❌ Upload error:", error);
      toast.error("Upload failed", {
        description: error.message,
      });
    } finally {
      setUploadingImages((prev) => ({
        ...prev,
        [eventId]: false,
      }));
    }
  };

  const handleRemoveImage = async (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event?.imagePath) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/events/delete-image`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ path: event.imagePath }),
        },
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Delete failed");
      }

      // Remove image from event
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? {
                ...e,
                imageUrl: "",
                imagePath: "",
              }
            : e,
        ),
      );

      console.log("✅ Image removed successfully");
    } catch (error: any) {
      console.error("❌ Delete error:", error);
      toast.error("Failed to remove image", {
        description: error.message,
      });
    }
  };

  const handleDelete = async (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${event.title}"?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) return;

    // If it's a new event (not saved yet), just remove from state
    if (eventId.startsWith("new_")) {
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      toast.success("Event removed");
      return;
    }

    setDeletingId(eventId);

    try {
      const token = await getAuthToken();
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/admin/events/${eventId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "X-Session-Token": token || "",
          },
        },
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.error || "Failed to delete event",
        );
      }

      setEvents((prev) => prev.filter((e) => e.id !== eventId));

      toast.success("Event deleted", {
        description: "The event has been permanently removed.",
      });

      console.log("✅ Event deleted successfully");
    } catch (error: any) {
      console.error("❌ Delete error:", error);
      toast.error("Failed to delete event", {
        description: error.message,
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleSave = async () => {
    // Validation
    const invalidEvents = events.filter(
      (e) =>
        !e.title.trim() ||
        !e.description.trim() ||
        !e.date ||
        !e.time ||
        !e.location.trim() ||
        !e.buttonText.trim() ||
        !e.buttonLink.trim(),
    );

    if (invalidEvents.length > 0) {
      toast.error("Validation failed", {
        description:
          "Please fill in all required fields for all events.",
      });
      return;
    }

    setIsSaving(true);

    try {
      const token = await getAuthToken();
      
      // Save each event
      const savePromises = events.map(async (event) => {
        const isNew = event.id.startsWith("new_");
        const endpoint = isNew
          ? `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/admin/events`
          : `https://${projectId}.supabase.co/functions/v1/make-server-84f9c112/admin/events/${event.id}`;

        const method = isNew ? "POST" : "PUT";

        const response = await fetch(endpoint, {
          method,
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "X-Session-Token": token || "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(
            result.error ||
              `Failed to save event: ${event.title}`,
          );
        }

        return result.data;
      });

      const savedEvents = await Promise.all(savePromises);

      // Update state with saved events (with real IDs)
      setEvents(savedEvents);

      toast.success("✅ All events saved!", {
        description: "Your changes have been applied.",
      });

      console.log("✅ All events saved successfully");
    } catch (error: any) {
      console.error("❌ Save events error:", error);
      toast.error("❌ Failed to save events", {
        description: error.message || "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          Manage upcoming events and special occasions
        </p>
        <Button
          onClick={handleAddNew}
          variant="outline"
          className="border-[#F97316] text-[#F97316] hover:bg-[#F97316] hover:text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Event
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-[#F97316] animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No events yet</p>
          <p className="text-sm text-gray-400 mb-4">
            Create your first event to get started
          </p>
          <Button
            onClick={handleAddNew}
            variant="outline"
            className="border-[#F97316] text-[#F97316] hover:bg-[#F97316]/10"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Event
          </Button>
        </div>
      ) : (
        <>
          {events.map((event) => {
            const isExpanded = expandedId === event.id;
            const isNew = event.id.startsWith("new_");

            return (
              <div
                key={event.id}
                className={`border rounded-lg overflow-hidden transition-all ${
                  event.isActive
                    ? "border-gray-200 bg-white"
                    : "border-gray-100 bg-gray-50"
                }`}
              >
                {/* Header */}
                <div className="flex items-center gap-3 p-4 bg-gray-50/50">
                  {/* Drag Handle */}
                  <button className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                    <GripVertical className="h-5 w-5" />
                  </button>

                  {/* New Badge */}
                  {isNew && (
                    <span className="px-2 py-1 rounded text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                      NEW
                    </span>
                  )}

                  {/* Title Preview */}
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <span
                      className={`font-semibold truncate ${event.isActive ? "text-gray-900" : "text-gray-400"}`}
                    >
                      {event.title || "Untitled Event"}
                    </span>
                    {event.date && (
                      <span
                        className={`text-sm flex items-center gap-1 ${event.isActive ? "text-gray-500" : "text-gray-400"}`}
                      >
                        • <Calendar className="h-3 w-3" />{" "}
                        {formatDate(event.date)}
                      </span>
                    )}
                    {event.time && (
                      <span
                        className={`text-sm flex items-center gap-1 ${event.isActive ? "text-gray-500" : "text-gray-400"}`}
                      >
                        • <Clock className="h-3 w-3" />{" "}
                        {event.time}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleToggleActive(event.id)
                      }
                      className="h-8 px-2 gap-1"
                    >
                      {event.isActive ? (
                        <>
                          <Eye className="h-4 w-4 text-green-600" />
                          <span className="text-xs text-green-600 hidden sm:inline">
                            Active
                          </span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-400 hidden sm:inline">
                            Inactive
                          </span>
                        </>
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(event.id)}
                      disabled={deletingId === event.id}
                      className="h-8 px-2 gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {deletingId === event.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleToggleExpand(event.id)
                      }
                      className="h-8 w-8 p-0"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Expanded Form */}
                {isExpanded && (
                  <div className="p-6 border-t border-gray-100">
                    <EventForm
                      event={event}
                      onUpdateField={handleUpdateField}
                      onImageUpload={handleImageUpload}
                      onRemoveImage={handleRemoveImage}
                      uploadingImage={uploadingImages[event.id]}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button
              onClick={handleSave}
              className="bg-[#F97316] hover:bg-[#EA580C] text-white"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

// Event Form Component
interface EventFormProps {
  event: Event;
  onUpdateField: (
    id: string,
    field: keyof Event,
    value: string,
  ) => void;
  onImageUpload: (eventId: string, file: File) => void;
  onRemoveImage: (eventId: string) => void;
  uploadingImage?: boolean;
}

function EventForm({
  event,
  onUpdateField,
  onImageUpload,
  onRemoveImage,
  uploadingImage,
}: EventFormProps) {
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(event.id, file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Image Upload with Live Preview */}
      <div className="space-y-2">
        <Label>Event Visual</Label>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Upload Area */}
          <div className="relative border-2 border-dashed border-gray-200 rounded-lg overflow-hidden bg-gray-50 hover:border-gray-300 transition-colors">
            {event.imageUrl ? (
              <div className="relative group">
                <img
                  src={event.imageUrl}
                  alt="Event"
                  className="w-full h-64 object-cover bg-gray-100"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveImage(event.id)}
                    className="text-white hover:text-red-400 hover:bg-red-500/20"
                  >
                    <X className="h-5 w-5 mr-2" />
                    Remove Image
                  </Button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-64 cursor-pointer">
                {uploadingImage ? (
                  <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">
                      Upload Event Image (Optional)
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      PNG, JPG, WebP (max 5MB)
                    </span>
                    <span className="text-xs text-gray-500 mt-3 max-w-[200px] text-center">
                      Or leave empty to use auto-generated
                      design
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleFileChange}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Auto-Generated Preview (shown when no image) */}
          {!event.imageUrl && (
            <div className="relative rounded-lg overflow-hidden shadow-lg">
              <div
                className="relative p-8 h-64 flex flex-col items-center justify-center text-center"
                style={{
                  backgroundColor: event.backgroundColor || "#0B0F19",
                }}
              >
                {/* Calendar Icon */}
                <div className="mb-3">
                  <div className="w-12 h-12 rounded-lg bg-[#F97316]/10 border-2 border-[#F97316] flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-[#F97316]" />
                  </div>
                </div>

                {/* Date Badge */}
                {event.date && (
                  <div className="mb-3">
                    <div className="inline-block px-4 py-2 bg-[#F97316] rounded-lg shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                      <span className="text-sm font-bold text-white uppercase tracking-wide">
                        {new Date(
                          event.date,
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                )}

                {/* Title */}
                <h3
                  className="text-lg font-black mb-2 leading-tight max-w-xs line-clamp-2"
                  style={{ color: event.textColor || "white" }}
                >
                  {event.title || "Event Title"}
                </h3>

                {/* Time & Location */}
                <div className="space-y-1 mb-3">
                  {event.time && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 justify-center">
                      <Clock className="h-3 w-3" /> {event.time}
                    </p>
                  )}
                  {event.location && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 justify-center line-clamp-1">
                      <MapPin className="h-3 w-3" />{" "}
                      {event.location}
                    </p>
                  )}
                </div>

                {/* Description Preview */}
                {event.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 max-w-xs">
                    {event.description}
                  </p>
                )}

                {/* Label */}
                <div className="absolute bottom-2 right-2">
                  <span className="text-[10px] text-gray-600 bg-gray-800/50 px-2 py-1 rounded">
                    Auto Preview
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500">
          {event.imageUrl
            ? "✅ Custom image uploaded. Remove to use auto-generated design."
            : "💡 No image uploaded. An auto-generated design will be used based on event details."}
        </p>
      </div>

      {/* Text Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor={`${event.id}-title`}>
            Event Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id={`${event.id}-title`}
            value={event.title}
            onChange={(e) =>
              onUpdateField(event.id, "title", e.target.value)
            }
            placeholder="e.g., Crypto Payment Workshop"
          />
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label htmlFor={`${event.id}-date`}>
            Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id={`${event.id}-date`}
            type="date"
            value={event.date}
            onChange={(e) =>
              onUpdateField(event.id, "date", e.target.value)
            }
            className="[&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:invert"
          />
        </div>

        {/* Time */}
        <div className="space-y-2">
          <Label htmlFor={`${event.id}-time`}>
            Time <span className="text-red-500">*</span>
          </Label>
          <Input
            id={`${event.id}-time`}
            type="time"
            value={event.time}
            onChange={(e) =>
              onUpdateField(event.id, "time", e.target.value)
            }
            className="[&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:invert"
          />
        </div>

        {/* Location */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor={`${event.id}-location`}>
            Location <span className="text-red-500">*</span>
          </Label>
          <Input
            id={`${event.id}-location`}
            value={event.location}
            onChange={(e) =>
              onUpdateField(
                event.id,
                "location",
                e.target.value,
              )
            }
            placeholder="e.g., Bitcoin Nail Bar - Main Street"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor={`${event.id}-description`}>
          Description <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id={`${event.id}-description`}
          value={event.description}
          onChange={(e) =>
            onUpdateField(
              event.id,
              "description",
              e.target.value,
            )
          }
          placeholder="Describe your event..."
          rows={4}
        />
      </div>

      {/* NEW: Button Text & Link - NOW REQUIRED */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${event.id}-buttonText`}>
            Button Text <span className="text-red-500">*</span>
          </Label>
          <Input
            id={`${event.id}-buttonText`}
            value={event.buttonText || ""}
            onChange={(e) =>
              onUpdateField(
                event.id,
                "buttonText",
                e.target.value,
              )
            }
            placeholder="e.g., RSVP Now, Register"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${event.id}-buttonLink`}>
            Button Link <span className="text-red-500">*</span>
          </Label>
          <Input
            id={`${event.id}-buttonLink`}
            value={event.buttonLink || ""}
            onChange={(e) =>
              onUpdateField(
                event.id,
                "buttonLink",
                e.target.value,
              )
            }
            placeholder="https://... or #section"
          />
        </div>
      </div>

      {/* NEW: Auto-Preview Customization */}
      {!event.imageUrl && (
        <div className="border-t pt-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#F97316] to-[#EA580C]" />
            <h4 className="text-sm font-semibold text-gray-900">
              Auto-Preview Customization
            </h4>
          </div>
          <p className="text-xs text-gray-500">
            Customize colors for the auto-generated preview (only applies when no image is uploaded)
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Background Color */}
            <div className="space-y-2">
              <Label htmlFor={`${event.id}-backgroundColor`}>
                Background Color
              </Label>
              <div className="flex gap-2">
                <Input
                  id={`${event.id}-backgroundColor`}
                  type="color"
                  value={event.backgroundColor || "#0B0F19"}
                  onChange={(e) =>
                    onUpdateField(
                      event.id,
                      "backgroundColor",
                      e.target.value,
                    )
                  }
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  type="text"
                  value={event.backgroundColor || "#0B0F19"}
                  onChange={(e) =>
                    onUpdateField(
                      event.id,
                      "backgroundColor",
                      e.target.value,
                    )
                  }
                  placeholder="#0B0F19"
                  className="flex-1"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateField(
                      event.id,
                      "backgroundColor",
                      "#0B0F19",
                    )
                  }
                  className="px-2 py-1 text-xs bg-gray-900 text-white rounded hover:bg-gray-800"
                >
                  Dark
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateField(
                      event.id,
                      "backgroundColor",
                      "#F97316",
                    )
                  }
                  className="px-2 py-1 text-xs bg-[#F97316] text-white rounded hover:bg-[#EA580C]"
                >
                  Orange
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateField(
                      event.id,
                      "backgroundColor",
                      "#3B82F6",
                    )
                  }
                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Blue
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateField(
                      event.id,
                      "backgroundColor",
                      "#8B5CF6",
                    )
                  }
                  className="px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
                >
                  Purple
                </button>
              </div>
            </div>

            {/* Text Color */}
            <div className="space-y-2">
              <Label htmlFor={`${event.id}-textColor`}>
                Text Color
              </Label>
              <div className="flex gap-2">
                <Input
                  id={`${event.id}-textColor`}
                  type="color"
                  value={event.textColor || "white"}
                  onChange={(e) =>
                    onUpdateField(
                      event.id,
                      "textColor",
                      e.target.value,
                    )
                  }
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  type="text"
                  value={event.textColor || "white"}
                  onChange={(e) =>
                    onUpdateField(
                      event.id,
                      "textColor",
                      e.target.value,
                    )
                  }
                  placeholder="white"
                  className="flex-1"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateField(event.id, "textColor", "white")
                  }
                  className="px-2 py-1 text-xs bg-white text-gray-900 border rounded hover:bg-gray-50"
                >
                  White
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateField(event.id, "textColor", "#000000")
                  }
                  className="px-2 py-1 text-xs bg-gray-900 text-white rounded hover:bg-gray-800"
                >
                  Black
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateField(
                      event.id,
                      "textColor",
                      "#F97316",
                    )
                  }
                  className="px-2 py-1 text-xs border border-[#F97316] text-[#F97316] rounded hover:bg-[#F97316]/10"
                >
                  Orange
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}