# Bitcoinnailbarcom

A modern web application built with React, Vite, Tailwind CSS, and Supabase.

## 📋 Project Overview

This is a React-based single-page application using:
- **Frontend Framework**: React 18.3.1 with React Router v7
- **Build Tool**: Vite 6.3.5
- **Styling**: Tailwind CSS 4.1.12 with shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **UI Components**: Material-UI, Radix UI, Recharts
- **State Management**: TanStack React Query

## 🚀 Local Development Commands

### Prerequisites

- Node.js 22+ 
- npm or pnpm
- Supabase CLI (for backend functions)

### Installation

```bash
# Install dependencies
npm install
```

### Development Server

```bash
# Start local development server (default mode)
npm run dev


The dev server runs on `http://localhost:5173` with hot module replacement.


Build output is generated in the `dist/` directory.

### Supabase Backend Commands

```bash
# Link to Supabase project
npm run supabase:link

# Check Supabase project status
npm run supabase:status

# List available branches
npm run supabase:branch:list

# Switch to staging branch
npm run supabase:branch:staging

# Switch to main branch
npm run supabase:branch:main

# Deploy Edge Functions to staging
npm run deploy:staging

# Deploy Edge Functions to production
npm run deploy:production
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Access the application at http://localhost:8088
```

## 📁 Project Structure

```
Bitcoinnailbarcom/
├── src/                    # Source code
│   ├── app/               # Application code
│   │   ├── components/    # React components
│   │   │   ├── atoms/     # Small, reusable components
│   │   │   ├── molecules/ # Composite components
│   │   │   └── organisms/ # Complex components
│   │   └── pages/         # Page components
│   ├── assets/            # Static assets
│   │   └── figma/        # Figma-generated assets
│   └── utils/             # Utility functions
├── supabase/              # Supabase backend
│   └── functions/         # Edge Functions
├── utils/                 # Shared utilities
│   └── supabase/         # Supabase configuration
├── docker/                # Docker configuration
├── docker-compose.yml     # Docker Compose configuration
├── Dockerfile            # Docker build configuration
├── package.json          # Dependencies and scripts
├── vite.config.ts        # Vite configuration
└── tsconfig.json         # TypeScript configuration
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory (not committed to git):

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Path Aliases

The project uses the following path aliases (configured in `vite.config.ts`):

- `@` → `./src`
- `@utils` → `./utils`

## 🎨 Component Libraries

### Installed UI Libraries

- **shadcn/ui** - Radix UI primitives with Tailwind CSS
- **Material-UI** - Complete component library
- **Lucide React** - Icon library
- **Recharts** - Data visualization
- **React Hook Form** - Form handling
- **TanStack Query** - Data fetching and caching

## 📦 Deployment

### Local Docker Build

```bash
docker-compose up --build
```

This builds the application and serves it via Nginx on port 8088.

### Production Deployment

1. Build the application:
   ```bash
   npm run build:production
   ```

2. Deploy to your hosting platform (Vercel, Netlify, etc.)

3. Deploy Supabase functions:
   ```bash
   npm run deploy:production
   ```

## 🛠️ Development Workflow

1. **Start development server**: `npm run dev`
2. **Make changes** - hot reload will update automatically
3. **Test locally** on `http://localhost:5173`
4. **Build and test**: `npm run build`
5. **Deploy to staging**: `npm run build:staging` + `npm run deploy:staging`
6. **Deploy to production**: `npm run build:production` + `npm run deploy:production`

## 📝 Additional Notes

- The project uses Figma Make for design-to-code workflow
- Assets from Figma are automatically handled by a custom Vite plugin
- Missing Figma assets use placeholder images during build
- Real assets should be placed in `src/assets/figma/<hash>.png`

## 🔗 Related Documentation

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)