# Component Architecture - Atomic Design

This directory follows the atomic design methodology to organize components by complexity and reusability.

## Structure

```
components/
├── atoms/          # Basic UI elements
│   ├── Avatar.tsx
│   ├── Badge.tsx
│   ├── Button.tsx
│   ├── Input.tsx
│   └── index.ts
├── molecules/      # Simple component combinations  
│   ├── SpecialtySelection.tsx
│   ├── CareerStageSelection.tsx
│   ├── MedicalInstitutionSelection.tsx
│   ├── DashboardStats.tsx
│   ├── QuickActions.tsx
│   ├── PaymentForm.tsx
│   ├── ActivityFeed.tsx
│   └── index.ts
├── organisms/      # Complex UI sections
│   ├── MatchCard.tsx
│   ├── ProfileForm.tsx
│   ├── UserDashboard.tsx
│   ├── ChatComponent.tsx
│   ├── GroupMatching.tsx
│   ├── SubscriptionManagement.tsx
│   ├── VerificationManagement.tsx
│   ├── Navigation.tsx
│   └── index.ts
├── templates/      # Page layouts
│   ├── AppProviders.tsx
│   ├── Footer.tsx
│   └── index.ts
└── pages/         # Specific page components
    ├── FeaturesSection.tsx
    ├── PricingSection.tsx
    └── index.ts
```

## Atomic Design Principles

### Atoms
Basic building blocks that can't be broken down further:
- Buttons, inputs, labels
- Icons, avatars, badges
- Basic form elements

### Molecules
Simple combinations of atoms that work together:
- Search boxes (input + button)
- Form fields (label + input + validation)
- Card headers (avatar + text + badge)

### Organisms
Complex UI components made of molecules and atoms:
- Navigation bars
- Product cards
- Form sections
- Dashboard widgets

### Templates
Page-level layouts that define structure:
- Header + main content + footer
- Sidebar + content area
- Grid layouts

### Pages
Specific instances of templates with real content:
- Home page
- Product listing page
- User profile page

## Usage

Import components from their respective atomic level:

```typescript
// Import from specific atomic level
import { Button } from '@/components/atoms'
import { SearchBox } from '@/components/molecules'
import { Navigation } from '@/components/organisms'

// Or import from main index (includes all levels)
import { Button, SearchBox, Navigation } from '@/components'
```

## Migration Notes

- Components have been moved from `features/` to appropriate atomic levels
- Legacy exports are maintained in `index.ts` for backward compatibility
- New components should be placed in the appropriate atomic level
- Consider component complexity and reusability when choosing placement
