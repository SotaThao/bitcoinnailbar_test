# Event Management Frontend Implementation Guide

**Status**: 📋 Planning Phase - Ready for Implementation  
**Last Updated**: January 23, 2026

---

## 🎯 Overview

Guide này hướng dẫn implement frontend components cho Event Management System, bao gồm:
1. EventModal component (homepage popup)
2. ManageEventsPage (admin panel)
3. Integration với homepage và chatbot

---

## 📦 Phase 2: EventModal Component

### Component Structure

**Location**: `/src/app/components/EventModal.tsx`

**Reference**: Clone structure từ `/src/app/components/PromotionModal.tsx`

### Props Interface
```typescript
interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    imageUrl: string;
    isActive: boolean;
  };
  registrationUrl?: string; // External registration link
}
```

### Key Features

#### 1. Display Event Information
```typescript
// Display event details
<div className="event-modal">
  {event.imageUrl && (
    <img src={event.imageUrl} alt={event.title} />
  )}
  <h2>{event.title}</h2>
  <p className="description">{event.description}</p>
  
  <div className="event-details">
    <div className="detail-item">
      <CalendarIcon />
      <span>{formatDate(event.date)}</span>
    </div>
    <div className="detail-item">
      <ClockIcon />
      <span>{event.time}</span>
    </div>
    <div className="detail-item">
      <MapPinIcon />
      <span>{event.location}</span>
    </div>
  </div>
  
  {registrationUrl && (
    <Button onClick={handleRegister}>
      Register Now
    </Button>
  )}
</div>
```

#### 2. Registration Flow
```typescript
const handleRegister = () => {
  // Open external registration link in new tab
  window.open(registrationUrl, '_blank', 'noopener,noreferrer');
  
  // Optional: Track registration click
  trackEvent('event_registration_clicked', {
    eventId: event.id,
    eventTitle: event.title
  });
  
  // Optional: Auto-close modal or keep open?
  // onClose();
};
```

#### 3. Auto-Popup Logic
```typescript
// Check if event modal should show
const shouldShowEventModal = (eventId: string): boolean => {
  const dismissKey = `event_modal_dismissed_${eventId}`;
  const dismissedAt = localStorage.getItem(dismissKey);
  
  if (!dismissedAt) return true;
  
  const dismissedDate = new Date(dismissedAt);
  const now = new Date();
  const daysSinceDismiss = Math.floor(
    (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Show again after 7 days
  return daysSinceDismiss >= 7;
};

// Handle close with localStorage
const handleClose = () => {
  const dismissKey = `event_modal_dismissed_${event.id}`;
  localStorage.setItem(dismissKey, new Date().toISOString());
  
  // Set chatbot context flag
  localStorage.setItem('chatbot_event_context', JSON.stringify({
    eventId: event.id,
    dismissedAt: new Date().toISOString()
  }));
  
  onClose();
};
```

#### 4. Mobile-First Responsive Design
```typescript
// Use Tailwind classes for responsive design
<div className="
  fixed inset-0 z-50 flex items-center justify-center p-4
  bg-black/50 backdrop-blur-sm
">
  <div className="
    relative w-full max-w-lg max-h-[90vh] overflow-auto
    bg-white rounded-2xl shadow-2xl
    animate-in slide-in-from-bottom-4 duration-300
  ">
    {/* Close button */}
    <button
      onClick={handleClose}
      className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
    >
      <X className="w-5 h-5" />
    </button>
    
    {/* Content */}
    <div className="p-6 space-y-6">
      {/* Event image */}
      {event.imageUrl && (
        <div className="aspect-video overflow-hidden rounded-lg">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      {/* Event title */}
      <h2 className="text-2xl font-bold text-gray-900">
        {event.title}
      </h2>
      
      {/* Event description */}
      <p className="text-gray-600 leading-relaxed">
        {event.description}
      </p>
      
      {/* Event details */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-gray-700">
          <Calendar className="w-5 h-5 text-primary" />
          <span>{formatDate(event.date)}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-700">
          <Clock className="w-5 h-5 text-primary" />
          <span>{event.time}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-700">
          <MapPin className="w-5 h-5 text-primary" />
          <span>{event.location}</span>
        </div>
      </div>
      
      {/* CTA Button */}
      {registrationUrl && (
        <Button
          onClick={handleRegister}
          className="w-full py-3 text-lg font-semibold"
        >
          Register Now
        </Button>
      )}
    </div>
  </div>
</div>
```

### Helper Functions

```typescript
// Format date from ISO to readable format
const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  // Output: "Friday, February 14, 2026"
};

// Track analytics events (optional)
const trackEvent = (eventName: string, properties: Record<string, any>) => {
  // Implement analytics tracking here
  console.log(`[Analytics] ${eventName}`, properties);
};
```

---

## 📦 Phase 3: Admin Events Management Page

### Component Structure

**Location**: `/src/app/pages/admin/ManageEventsPage.tsx`

### Features Required

#### 1. Events List/Table
```typescript
interface ManageEventsPageState {
  events: Event[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filterStatus: 'all' | 'active' | 'inactive';
  isCreateModalOpen: boolean;
  editingEvent: Event | null;
}

// Fetch all events (admin)
const fetchEvents = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/events/all`,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      }
    );
    const data = await response.json();
    if (data.success) {
      setEvents(data.data);
    }
  } catch (error) {
    console.error('Failed to fetch events:', error);
  }
};
```

#### 2. Create Event Form/Modal
```typescript
interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  isActive: boolean;
}

const handleCreateEvent = async (formData: EventFormData) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/events`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(formData)
      }
    );
    const data = await response.json();
    
    if (data.success) {
      // Refresh events list
      fetchEvents();
      // Close modal
      setIsCreateModalOpen(false);
      // Show success message
      toast.success('Event created successfully!');
    }
  } catch (error) {
    toast.error('Failed to create event');
  }
};
```

#### 3. Edit Event
```typescript
const handleUpdateEvent = async (eventId: string, updates: Partial<EventFormData>) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/events/${eventId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(updates)
      }
    );
    const data = await response.json();
    
    if (data.success) {
      fetchEvents();
      toast.success('Event updated successfully!');
    }
  } catch (error) {
    toast.error('Failed to update event');
  }
};

// Quick toggle active status
const handleToggleActive = async (event: Event) => {
  await handleUpdateEvent(event.id, { isActive: !event.isActive });
};
```

#### 4. Delete Event
```typescript
const handleDeleteEvent = async (eventId: string) => {
  // Show confirmation dialog
  const confirmed = window.confirm(
    'Are you sure you want to delete this event? This action cannot be undone.'
  );
  
  if (!confirmed) return;
  
  try {
    const response = await fetch(
      `${API_BASE_URL}/events/${eventId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      }
    );
    const data = await response.json();
    
    if (data.success) {
      fetchEvents();
      toast.success('Event deleted successfully!');
    }
  } catch (error) {
    toast.error('Failed to delete event');
  }
};
```

#### 5. Table Component
```typescript
<div className="overflow-x-auto">
  <table className="w-full">
    <thead>
      <tr className="border-b">
        <th className="text-left p-4">Title</th>
        <th className="text-left p-4">Date</th>
        <th className="text-left p-4">Time</th>
        <th className="text-left p-4">Location</th>
        <th className="text-left p-4">Status</th>
        <th className="text-right p-4">Actions</th>
      </tr>
    </thead>
    <tbody>
      {filteredEvents.map(event => (
        <tr key={event.id} className="border-b hover:bg-gray-50">
          <td className="p-4 font-medium">{event.title}</td>
          <td className="p-4">{formatDate(event.date)}</td>
          <td className="p-4">{event.time}</td>
          <td className="p-4">{event.location}</td>
          <td className="p-4">
            <Badge variant={event.isActive ? 'success' : 'secondary'}>
              {event.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </td>
          <td className="p-4">
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleToggleActive(event)}
              >
                {event.isActive ? <EyeOff /> : <Eye />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditingEvent(event)}
              >
                <Edit />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDeleteEvent(event.id)}
              >
                <Trash2 />
              </Button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

#### 6. Search and Filter
```typescript
const filteredEvents = events.filter(event => {
  // Filter by search query
  const matchesSearch = 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase());
  
  // Filter by status
  const matchesStatus = 
    filterStatus === 'all' ||
    (filterStatus === 'active' && event.isActive) ||
    (filterStatus === 'inactive' && !event.isActive);
  
  return matchesSearch && matchesStatus;
});
```

---

## 📦 Phase 4: Homepage Integration

### Location: `/src/app/App.tsx` or `/src/app/pages/HomePage.tsx`

### Implementation

```typescript
// State management
const [activeEvent, setActiveEvent] = useState<Event | null>(null);
const [showEventModal, setShowEventModal] = useState(false);
const [showPromotionModal, setShowPromotionModal] = useState(false);

// Fetch active events on mount
useEffect(() => {
  const fetchActiveEvents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/events`);
      const data = await response.json();
      
      if (data.success && data.data.length > 0) {
        // Get the first (earliest) active event
        const event = data.data[0];
        
        // Check if should show
        if (shouldShowEventModal(event.id)) {
          setActiveEvent(event);
          setShowEventModal(true);
          return; // Event has priority
        }
      }
      
      // If no event, check for promotion
      checkPromotionModal();
      
    } catch (error) {
      console.error('Failed to fetch events:', error);
      // Fallback to promotion
      checkPromotionModal();
    }
  };
  
  fetchActiveEvents();
}, []);

// Priority logic: Event > Promotion
const checkPromotionModal = async () => {
  // Existing promotion modal logic
  // Only show if no event is being displayed
  if (!showEventModal) {
    // Show promotion modal
  }
};
```

### Event Modal Component Usage
```typescript
{activeEvent && (
  <EventModal
    isOpen={showEventModal}
    onClose={() => setShowEventModal(false)}
    event={activeEvent}
    registrationUrl="https://example.com/register" // External link
  />
)}
```

---

## 📦 Phase 5: Chatbot Integration

### Context Management

```typescript
// Check if user dismissed event modal
const getEventContext = (): { eventId: string; dismissedAt: string } | null => {
  const context = localStorage.getItem('chatbot_event_context');
  if (!context) return null;
  
  try {
    return JSON.parse(context);
  } catch {
    return null;
  }
};

// Clear event context after certain time
const clearEventContext = () => {
  localStorage.removeItem('chatbot_event_context');
};
```

### Chatbot Message Logic
```typescript
// In chatbot component
useEffect(() => {
  const eventContext = getEventContext();
  
  if (eventContext) {
    // User dismissed event modal recently
    const dismissedDate = new Date(eventContext.dismissedAt);
    const now = new Date();
    const hoursSinceDismiss = 
      (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60);
    
    // Mention event within 24 hours of dismissal
    if (hoursSinceDismiss < 24) {
      // Add event context to chatbot
      setChatbotMessage(
        "Hey! I noticed you checked out our event. " +
        "Do you have any questions about it? I'd be happy to help!"
      );
    }
  }
}, []);
```

---

## 🎨 Styling Guidelines

### Follow Atomic Design Principles
1. Use existing components from `/src/app/components/ui/`
2. Maintain consistent spacing using design tokens
3. Mobile-first responsive design
4. Use Tailwind CSS v4 classes

### Design Tokens Reference
```typescript
// Colors
var(--color-primary)
var(--color-secondary)
var(--color-accent)

// Spacing
var(--spacing-xs)
var(--spacing-sm)
var(--spacing-md)
var(--spacing-lg)

// Typography
var(--font-size-body)
var(--font-size-heading)
```

---

## 🧪 Testing Checklist

### EventModal Component
- [ ] Modal opens on homepage load
- [ ] Event information displays correctly
- [ ] Registration button opens external link in new tab
- [ ] Close button updates localStorage
- [ ] Responsive on mobile devices
- [ ] Responsive on desktop
- [ ] Auto-popup respects 7-day dismiss period
- [ ] Image loads correctly (or shows fallback)
- [ ] Date formatting is correct
- [ ] Animations are smooth

### ManageEventsPage
- [ ] Events list loads correctly
- [ ] Create event form works
- [ ] Edit event form works
- [ ] Delete confirmation dialog appears
- [ ] Toggle active status works
- [ ] Search functionality works
- [ ] Filter by status works
- [ ] Mobile responsive table/cards
- [ ] Error messages display
- [ ] Success toasts show

### Homepage Integration
- [ ] Event modal has priority over promotion
- [ ] Only shows when event is active
- [ ] Respects dismiss period
- [ ] Falls back to promotion if no event
- [ ] No double-modals appear

### Chatbot Integration
- [ ] Context flag is set on modal dismiss
- [ ] Chatbot mentions event when appropriate
- [ ] Context clears after 24 hours

---

## 📚 Required Packages

```json
{
  "lucide-react": "^0.x.x",  // Icons (Calendar, Clock, MapPin, etc.)
  "sonner": "^1.x.x"         // Toast notifications
}
```

Check if already installed in `package.json` before installing.

---

## 🔗 Related Files

**Backend**:
- `/supabase/functions/server/events.tsx` - API endpoints
- `/supabase/functions/server/index.tsx` - Route registration

**Documentation**:
- `/docs/02-api/EVENT_MANAGEMENT_API.md` - API reference
- `/docs/04-changelogs/EVENT_MANAGEMENT_SYSTEM.md` - Implementation log

**Reference Components**:
- `/src/app/components/PromotionModal.tsx` - Modal structure reference
- `/src/app/components/PaymentModal.tsx` - Modal behavior reference

**Design System**:
- `/src/styles/globals.css` - Design tokens
- `/src/app/components/ui/` - UI components library

---

## 🚀 Implementation Order

1. ✅ **Backend Complete** - API endpoints ready
2. 🔄 **EventModal Component** - Start here
3. 🔄 **ManageEventsPage** - Admin interface
4. 🔄 **Homepage Integration** - Auto-popup logic
5. 🔄 **Chatbot Integration** - Context awareness

---

## 📝 Notes for Developer

### Image Handling
- Use `unsplash_tool({ query: "event celebration party" })` for stock images
- Future: Implement Cloudinary upload for custom images
- Store full URL in `imageUrl` field

### Registration URL
- Currently not in Event schema
- **TODO**: Consider adding `registrationUrl` field to Event interface
- For now, can be hardcoded or passed as prop

### Analytics
- Consider adding event tracking:
  - Event modal views
  - Registration clicks
  - Modal dismiss rates
- Can use Google Analytics, Mixpanel, or custom solution

### Performance
- Lazy load EventModal component
- Optimize images (use next/image if using Next.js)
- Cache API responses where appropriate

### Accessibility
- Ensure keyboard navigation works
- Add proper ARIA labels
- Test with screen readers
- Focus management in modals

---

**Ready to implement?** Start with Phase 2 (EventModal Component)! 🚀

**Questions or issues?** Refer to:
- API documentation: `/docs/02-api/EVENT_MANAGEMENT_API.md`
- Implementation log: `/docs/04-changelogs/EVENT_MANAGEMENT_SYSTEM.md`
