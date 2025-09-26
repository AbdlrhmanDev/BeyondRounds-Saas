# BeyondRounds Development Guide

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project
- Git for version control

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. Set up the database:
   ```bash
   # Run the complete schema in Supabase SQL editor
   # Use database/complete_schema_optimized.sql
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
beyondrounds/
├── src/
│   ├── app/                    # Next.js App Router pages
│   ├── components/
│   │   ├── features/           # Feature-specific components
│   │   │   ├── auth/
│   │   │   ├── chat/
│   │   │   ├── dashboard/
│   │   │   ├── matching/
│   │   │   ├── profile/
│   │   │   └── payments/
│   │   ├── ui/                 # Reusable UI components
│   │   ├── layouts/            # Layout components
│   │   └── shared/             # Shared components
│   ├── hooks/
│   │   ├── features/           # Feature-specific hooks
│   │   └── shared/             # Shared hooks
│   ├── lib/
│   │   ├── api/                # API layer
│   │   ├── database/           # Database clients
│   │   ├── services/           # Business logic
│   │   ├── utils/              # Utility functions
│   │   ├── types/              # TypeScript types
│   │   ├── constants/           # App constants
│   │   └── config/             # Configuration
│   └── styles/                 # Global styles
├── database/
│   ├── migrations/             # SQL migration files
│   ├── seeds/                  # Seed data
│   ├── functions/              # Database functions
│   └── schema.sql              # Database schema
├── tests/                      # Test files
├── docs/                       # Documentation
└── tools/                      # Development tools
```

## 🛠️ Development Commands

### Basic Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run format          # Format code with Prettier

# Testing
npm run test            # Run tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage
npm run test:ci         # Run tests for CI
```

### Database Commands

```bash
# Run migrations
npm run db:migrate

# Reset database
npm run db:reset

# Seed database
npm run db:seed
```

## 🏗️ Architecture Patterns

### Feature-Based Organization

Components and hooks are organized by feature rather than by type:

```
src/components/features/auth/
├── LoginForm.tsx
├── SignUpForm.tsx
└── AuthGuard.tsx

src/hooks/features/auth/
├── useAuthUser.ts
├── useAuthActions.ts
└── useAuthGuard.ts
```

### API Layer

All data fetching goes through the API layer:

```typescript
// ✅ Good - Use API layer
import { authAPI } from '@/lib/api'
const user = await authAPI.getCurrentUser()

// ❌ Bad - Direct Supabase calls in components
import { createClient } from '@/lib/database/supabase-browser'
const supabase = createClient()
const { data } = await supabase.auth.getUser()
```

### Error Handling

Use error boundaries and consistent error handling:

```typescript
// Wrap components with error boundaries
<ErrorBoundary level="component">
  <MyComponent />
</ErrorBoundary>

// Use error utilities
import { handleSupabaseError } from '@/lib/utils/error'
try {
  await someOperation()
} catch (error) {
  throw handleSupabaseError(error)
}
```

### React Query Integration

Use React Query for all data fetching:

```typescript
// Define query keys
const queryKeys = {
  auth: {
    user: ['auth', 'user'] as const,
    profile: (userId: string) => ['auth', 'profile', userId] as const,
  }
}

// Use in hooks
export function useAuthUser() {
  return useQuery({
    queryKey: queryKeys.auth.user,
    queryFn: () => authAPI.getCurrentUser(),
    staleTime: 5 * 60 * 1000,
  })
}
```

## 🧪 Testing

### Test Structure

```
tests/
├── __mocks__/              # Mock implementations
├── components/             # Component tests
├── hooks/                  # Hook tests
├── pages/                  # Page tests
└── utils/                  # Utility tests
```

### Writing Tests

```typescript
// Component test example
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LoginForm } from '@/components/features/auth/LoginForm'

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

test('renders login form', () => {
  const queryClient = createTestQueryClient()
  
  render(
    <QueryClientProvider client={queryClient}>
      <LoginForm />
    </QueryClientProvider>
  )
  
  expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument()
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
})
```

## 🔧 Configuration

### Environment Variables

Required environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Optional environment variables:

```bash
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id
```

### TypeScript Configuration

Path aliases are configured in `tsconfig.json`:

```json
{
  "paths": {
    "@/*": ["./*"],
    "@/app/*": ["./src/app/*"],
    "@/components/*": ["./src/components/*"],
    "@/hooks/*": ["./src/hooks/*"],
    "@/lib/*": ["./src/lib/*"],
    "@/styles/*": ["./src/styles/*"],
    "@/tests/*": ["./tests/*"],
    "@/database/*": ["./database/*"],
    "@/docs/*": ["./docs/*"],
    "@/tools/*": ["./tools/*"]
  }
}
```

## 📝 Code Style

### ESLint Rules

- Use TypeScript strict mode
- Prefer functional components with hooks
- Use React Query for data fetching
- Handle errors consistently
- Write accessible components

### Prettier Configuration

- Single quotes for strings
- Semicolons required
- 2-space indentation
- 80 character line length
- Trailing commas in ES5

## 🚀 Deployment

### Vercel Deployment

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Setup

Production environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🐛 Debugging

### Common Issues

1. **Hydration Mismatch**: Use `useIsClient()` hook for client-only components
2. **Supabase Auth Issues**: Check RLS policies and user permissions
3. **React Query Cache**: Use React Query DevTools for debugging
4. **TypeScript Errors**: Ensure all imports use path aliases

### Debug Tools

- React Query DevTools (development only)
- Supabase Dashboard for database debugging
- Browser DevTools for client-side debugging
- Vercel Analytics for production monitoring

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
