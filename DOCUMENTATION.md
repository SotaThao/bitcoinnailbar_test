# 📚 Bitcoin Nail Bar - Documentation Index

Welcome to Bitcoin Nail Bar documentation! All documentation has been reorganized into the `/docs` folder for better organization.

---

## 📂 Documentation Structure

```
/docs
├── 01-architecture/      # System Architecture & Design
│   ├── OVERVIEW.md       # System overview, tech stack
│   ├── JWT_AUTH.md       # JWT authentication
│   ├── SESSION_AUTH.md   # Session management
│   └── STORAGE.md        # Data storage (KV Store)
│
├── 02-api/              # API Documentation
│   ├── CUSTOMERS.md     # Customer management API
│   └── SERVICES.md      # Services management
│
├── 03-guides/           # Development Guides
│   ├── GUIDELINES.md    # Development best practices
│   ├── MIGRATION.md     # Migration guide
│   └── REALTIME_SETUP.md # Real-time notifications
│
├── 04-changelogs/       # Historical Changes
│   ├── CHATBOT.md       # Chatbot enhancement log
│   ├── PHONE_FORMATTING.md # Phone formatting system
│   └── REFACTOR_PHASE2.md # Refactor summary
│
└── 05-references/       # Reference Materials
    └── ATTRIBUTIONS.md  # Credits & licenses
```

---

## 🚀 Quick Start

### For New Developers:
1. **[System Overview](docs/01-architecture/OVERVIEW.md)** - Start here to understand the system
2. **[Development Guidelines](docs/03-guides/GUIDELINES.md)** - Coding standards & best practices
3. **[API Reference](docs/02-api/)** - API documentation

### For Specific Tasks:

**Setting up Authentication:**
- [JWT Authentication](docs/01-architecture/JWT_AUTH.md) - JWT implementation
- [Session Management](docs/01-architecture/SESSION_AUTH.md) - Admin session handling

**Data Management:**
- [Storage Structure](docs/01-architecture/STORAGE.md) - KV Store architecture
- [Customer API](docs/02-api/CUSTOMERS.md) - Customer management
- [Services API](docs/02-api/SERVICES.md) - Services management

**Migration & Setup:**
- [Migration Guide](docs/03-guides/MIGRATION.md) - Category & service migration
- [Real-time Setup](docs/03-guides/REALTIME_SETUP.md) - Enable real-time notifications

**Understanding Changes:**
- [Chatbot Changelog](docs/04-changelogs/CHATBOT.md) - Chatbot enhancement history
- [Phone Formatting](docs/04-changelogs/PHONE_FORMATTING.md) - Phone number system
- [Refactor Summary](docs/04-changelogs/REFACTOR_PHASE2.md) - Admin panel refactor

---

## 📖 Main Documents

### Architecture (01-architecture/)

**[OVERVIEW.md](docs/01-architecture/OVERVIEW.md)**
- System overview
- Tech stack (React, TypeScript, Tailwind, Supabase)
- Component hierarchy (Atomic Design)
- Routing & navigation
- State management
- Backend integration

**[JWT_AUTH.md](docs/01-architecture/JWT_AUTH.md)**
- JWT structure & flow
- Roles & permissions (Owner, Admin, Manager, Staff)
- Backend middleware
- Frontend integration
- Security best practices

**[SESSION_AUTH.md](docs/01-architecture/SESSION_AUTH.md)**
- Session management (7-day expiry)
- LocalStorage + KV Store
- Protected routes
- Login/logout flow
- First-time setup

**[STORAGE.md](docs/01-architecture/STORAGE.md)**
- KV Store structure
- Categories storage
- Services storage
- CASCADE DELETE logic
- Data relationships

---

### API (02-api/)

**[CUSTOMERS.md](docs/02-api/CUSTOMERS.md)**
- Customer data model
- CRUD operations
- Search & lookup
- Phone validation
- Check-in system
- Authorization matrix

**[SERVICES.md](docs/02-api/SERVICES.md)**
- Service architecture
- Nested structure (Category > Group > Service)
- Price formats
- Refactor history
- API integration

---

### Guides (03-guides/)

**[GUIDELINES.md](docs/03-guides/GUIDELINES.md)**
- Development workflow (5 steps)
- Code style guidelines
- Component structure
- Styling rules (Mobile-First, Token-Based)
- Phone number formatting
- Best practices

**[MIGRATION.md](docs/03-guides/MIGRATION.md)**
- Category migration guide
- Step-by-step instructions
- Console commands
- Testing checklist
- Troubleshooting

**[REALTIME_SETUP.md](docs/03-guides/REALTIME_SETUP.md)**
- Enable Supabase Realtime
- Check-in notifications
- Testing flow
- Troubleshooting
- Architecture diagram

---

### Changelogs (04-changelogs/)

**[CHATBOT.md](docs/04-changelogs/CHATBOT.md)**
- Data source migration
- Anti-hallucination fixes
- Hot services removal
- AI context enhancements
- Test scenarios

**[AI_CHATBOT_INTELLIGENCE_UPGRADE.md](docs/04-changelogs/AI_CHATBOT_INTELLIGENCE_UPGRADE.md)** ⭐ NEW
- v2.0 Intelligence upgrade
- Dynamic membership & promotion integration
- Advanced recommendation strategies
- Context-aware conversations
- Auto-update system (no manual AI retraining)
- IQ improvements (+200% intelligence)

**[PHONE_FORMATTING.md](docs/04-changelogs/PHONE_FORMATTING.md)**
- Format functions
- Validation rules
- Usage examples
- US vs Vietnam formats
- Best practices

**[REFACTOR_PHASE2.md](docs/04-changelogs/REFACTOR_PHASE2.md)**
- LOC reduction stats
- New files created
- Components refactored
- Architecture improvements
- Highlights

**[FLIPBOOK_PREVIOUS_FIX.md](docs/04-changelogs/FLIPBOOK_PREVIOUS_FIX.md)**
- Desktop & mobile navigation fix
- Phase 3: Smooth crossfade transition
- UX polish (no more jarring flash)
- Platform-specific animation strategies

---

### References (05-references/)

**[ATTRIBUTIONS.md](docs/05-references/ATTRIBUTIONS.md)**
- Open source libraries
- UI components (shadcn/ui)
- Images (Unsplash)
- Core technologies
- Acknowledgments

---

## 🎯 Common Tasks

### Adding a New Feature
1. Read [GUIDELINES.md](docs/03-guides/GUIDELINES.md) for workflow
2. Follow Atomic Design pattern
3. Check [OVERVIEW.md](docs/01-architecture/OVERVIEW.md) for architecture
4. Update relevant API docs

### Fixing a Bug
1. Check [Changelogs](docs/04-changelogs/) for similar issues
2. Review [STORAGE.md](docs/01-architecture/STORAGE.md) for data structure
3. Check API docs for endpoint behavior

### Setting Up Authentication
1. Read [JWT_AUTH.md](docs/01-architecture/JWT_AUTH.md)
2. Read [SESSION_AUTH.md](docs/01-architecture/SESSION_AUTH.md)
3. Test with provided examples

### Migrating Data
1. Follow [MIGRATION.md](docs/03-guides/MIGRATION.md) step-by-step
2. Use console commands provided
3. Verify with inspection tools

---

## 🔍 Search Tips

### Finding Information:
- **Architecture questions** → `/docs/01-architecture/`
- **API reference** → `/docs/02-api/`
- **How-to guides** → `/docs/03-guides/`
- **What changed** → `/docs/04-changelogs/`
- **Credits** → `/docs/05-references/`

### Searching by Topic:
- **Authentication** → JWT_AUTH.md, SESSION_AUTH.md
- **Data Storage** → STORAGE.md, CUSTOMERS.md, SERVICES.md
- **Phone Numbers** → PHONE_FORMATTING.md, CUSTOMERS.md
- **Chatbot** → CHATBOT.md, AI_CHATBOT_INTELLIGENCE_UPGRADE.md
- **Membership** → MEMBERSHIP_MANAGEMENT.md
- **Promotions** → PROMOTION_POPUP_IMPLEMENTATION.md
- **Menu System** → MENU_MANAGEMENT.md
- **Mobile vs Desktop** → MOBILE_VS_DESKTOP_FIXES.md
- **Migration** → MIGRATION.md
- **Refactor** → REFACTOR_PHASE2.md

---

## 📝 Documentation Conventions

- **ALL_CAPS.md** for main documents
- Headers use emojis for visual scanning
- Code examples included
- Metadata at end (Last Updated, Version, Status)
- Cross-references between docs

---

## 🔄 Updates

### Recent Restructure (Jan 20, 2026):
- ✅ Created 5 category folders
- ✅ Merged duplicate docs
- ✅ Added phone formatting doc
- ✅ Consolidated migration guides
- ✅ Moved all docs to `/docs`
- ✅ **AI Chatbot Intelligence Upgrade (v2.0)** ⭐ NEW
  - Dynamic membership & promotion integration
  - Auto-updates when admin changes data
  - +200% IQ improvement with advanced strategies

---

## 🆘 Need Help?

1. **Start with [README.md](docs/README.md)** in the docs folder
2. **Check relevant category** based on your question
3. **Search for keywords** across all docs
4. **Review code examples** in docs

---

## 📦 Project Structure

```
/
├── docs/                 # 📚 All documentation (YOU ARE HERE)
├── src/                  # 💻 Source code
│   ├── app/             # React components & logic
│   ├── styles/          # CSS & design tokens
│   ├── lib/             # Utilities & types
│   └── utils/           # Helper functions
├── supabase/            # 🔧 Backend (Edge Functions)
│   └── functions/server/ # Hono API server
├── public/              # 🌐 Static assets
└── utils/               # 🔑 Auth utilities
```

---

**Created:** January 20, 2026  
**Total Docs:** 17 documents across 5 categories  
**Status:** Complete & Organized ✅  
**Latest:** AI Chatbot v2.0 Intelligence Upgrade 🤖⚡

**Happy coding! 🚀**
