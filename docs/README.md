# 📚 README - Documentation Structure

## 📁 Docs Organization

Documentation được tổ chức thành 5 categories chính:

```
/docs
├── 01-architecture/      # System Architecture & Design
├── 02-api/              # API Documentation
├── 03-guides/           # Development Guides
├── 04-changelogs/       # Historical Changes
└── 05-references/       # Reference Materials
```

---

## 📖 Quick Links

### Architecture
- [**OVERVIEW.md**](01-architecture/OVERVIEW.md) - System overview, tech stack, component hierarchy
- [**JWT_AUTH.md**](01-architecture/JWT_AUTH.md) - JWT authentication system
- [**SESSION_AUTH.md**](01-architecture/SESSION_AUTH.md) - Session management
- [**STORAGE.md**](01-architecture/STORAGE.md) - Data storage structure (KV Store)

### API
- [**CUSTOMERS.md**](02-api/CUSTOMERS.md) - Customer management API
- [**SERVICES.md**](02-api/SERVICES.md) - Services management architecture

### Guides
- [**GUIDELINES.md**](03-guides/GUIDELINES.md) - Development guidelines & best practices
- [**MIGRATION.md**](03-guides/MIGRATION.md) - Category & service migration guide
- [**REALTIME_SETUP.md**](03-guides/REALTIME_SETUP.md) - Real-time notifications setup

### Changelogs
- [**CHATBOT.md**](04-changelogs/CHATBOT.md) - Chatbot enhancement history
- [**PHONE_FORMATTING.md**](04-changelogs/PHONE_FORMATTING.md) - Phone formatting system
- [**REFACTOR_PHASE2.md**](04-changelogs/REFACTOR_PHASE2.md) - Admin panel refactor summary

### References
- [**ATTRIBUTIONS.md**](05-references/ATTRIBUTIONS.md) - Credits & licenses

---

## 🎯 Getting Started

### For New Developers:
1. Start with [OVERVIEW.md](01-architecture/OVERVIEW.md) to understand the system
2. Read [GUIDELINES.md](03-guides/GUIDELINES.md) for coding standards
3. Check [CUSTOMERS.md](02-api/CUSTOMERS.md) or [SERVICES.md](02-api/SERVICES.md) for API references

### For Authentication Setup:
1. Read [JWT_AUTH.md](01-architecture/JWT_AUTH.md) for JWT implementation
2. Check [SESSION_AUTH.md](01-architecture/SESSION_AUTH.md) for session management

### For Data Migration:
1. Follow [MIGRATION.md](03-guides/MIGRATION.md) step-by-step

---

## 📝 Documentation Conventions

### File Naming:
- ALL_CAPS.md for main documents
- PascalCase for component docs
- kebab-case for specific features

### Structure:
- Start with Overview/Summary
- Include Table of Contents for long docs
- Use clear section headers
- Provide code examples
- End with metadata (Last Updated, Version, Status)

---

## 🔄 Updates

### Recent Changes:
- **Jan 20, 2026**: Restructured docs into 5 categories
- **Jan 20, 2026**: Added phone formatting documentation
- **Jan 20, 2026**: Merged migration guides

### Maintaining Docs:
- Update Last Updated date when making changes
- Keep code examples in sync with actual implementation
- Remove outdated information
- Add new features to appropriate category

---

## 🆘 Need Help?

- Check relevant doc category first
- Search for keywords across all docs
- Review code examples in docs
- Check changelogs for recent changes

---

**Created:** January 20, 2026  
**Structure:** 5 Categories, 12 Documents  
**Status:** Complete ✅
