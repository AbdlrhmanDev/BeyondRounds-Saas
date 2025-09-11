# BeyondRounds - Medical Professional Networking Platform

## 🏥 Project Overview

BeyondRounds is a sophisticated SaaS platform designed specifically for medical professionals to build meaningful professional and personal connections. The platform uses AI-powered matching algorithms to connect doctors based on medical specialties, shared interests, geographic proximity, and availability.

### Mission Statement
"To help doctors discover friendships that enrich their lives outside the hospital. Because when you find your people – your tribe – everything else falls into place."

### Target Audience
- Medical professionals (doctors, residents, fellows)
- Healthcare workers seeking professional networking
- Medical professionals looking for social connections beyond work

## 🎯 Core Features

### 1. **Verification System**
- Medical license verification
- Photo ID confirmation
- Usually approved within 24 hours
- Ensures all members are legitimate healthcare professionals

### 2. **AI-Powered Matching Algorithm**
- **Weekly Matching**: Every Thursday at 4 PM local time
- **7-Step Algorithm**: Sophisticated compatibility scoring
- **Group Formation**: Creates groups of 3-4 doctors
- **Compatibility Factors**:
  - Medical Specialty (20%)
  - Shared Interests (40%)
  - Social Preferences (20%)
  - Availability (10%)
  - Geographic Proximity (5%)
  - Lifestyle Compatibility (5%)

### 3. **Comprehensive Profile System**
- Medical specialty and preferences
- Sports activities with interest ratings (1-5 scale)
- Music, movie/TV preferences
- Social energy level and conversation style
- Life stage and activity level
- Dietary restrictions
- Availability slots
- Profile completion tracking

### 4. **Private Group Chats**
- Secure, private conversations
- AI assistant (RoundsBot) facilitation
- System welcome messages
- Real-time messaging

### 5. **Subscription Model**
- Paid membership required for matching
- 30-day money-back guarantee
- Stripe integration for payments

## 🏗️ Technical Architecture

### **Frontend Stack**
- **Framework**: Next.js 14.2.16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom animations
- **UI Components**: Radix UI primitives
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

### **Backend & Database**
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Storage**: Supabase Storage for file uploads
- **CRON Jobs**: Supabase Edge Functions
- **Payments**: Stripe integration

### **Development Tools**
- **Testing**: Jest with React Testing Library
- **Linting**: ESLint
- **Type Checking**: TypeScript
- **Build Tool**: Next.js built-in
- **Deployment**: Vercel

## 📁 Project Structure

```
beyondrounds/
├── app/                          # Next.js App Router pages
│   ├── about/                   # About page
│   ├── admin/                   # Admin dashboard
│   ├── api/                     # API routes
│   │   ├── admin/               # Admin operations
│   │   ├── chat/                # Chat functionality
│   │   ├── cron/                # Scheduled tasks
│   │   ├── matching/            # Matching algorithm
│   │   └── stripe/              # Payment processing
│   ├── auth/                    # Authentication pages
│   ├── blog/                    # Blog section
│   ├── chat/                    # Chat interface
│   ├── contact/                 # Contact page
│   ├── dashboard/               # Main dashboard
│   ├── debug/                   # Debug tools
│   ├── faq/                     # FAQ page
│   ├── how-it-works/            # How it works page
│   ├── join/                    # Join page
│   ├── mobile-demo/             # Mobile demo
│   ├── my-chats/                # Chat management
│   ├── payment/                 # Payment pages
│   ├── pricing/                 # Pricing plans
│   ├── profile/                 # Profile management
│   ├── settings/                # User settings
│   ├── verify/                  # Verification process
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing page
│
├── components/                  # React components
│   ├── common/                  # Common components
│   ├── dashboard/               # Dashboard-specific components
│   ├── landing/                 # Landing page components
│   ├── ui/                      # Reusable UI components (51 files)
│   ├── compatibility-score-display.tsx
│   ├── comprehensive-profile-form.tsx
│   ├── cookie-consent-banner.tsx
│   ├── enhanced-matching-dashboard.tsx
│   ├── footer.tsx
│   ├── modern-nav.tsx
│   └── theme-provider.tsx
│
├── hooks/                       # Custom React hooks
│   ├── use-auth.ts              # Authentication hook
│   ├── use-dashboard.ts         # Dashboard data hook
│   ├── use-dashboard-enhanced.ts # Enhanced dashboard hook
│   ├── use-dashboard-query.ts   # Dashboard query hook
│   ├── use-landing-auth.ts      # Landing page auth
│   ├── use-mobile.ts            # Mobile detection
│   ├── use-profile-form.ts      # Profile form management
│   └── use-toast.ts             # Toast notifications
│
├── lib/                         # Core library code
│   ├── auth.ts                  # Authentication utilities
│   ├── matching-algorithm.ts    # Core matching algorithm
│   ├── providers/               # Context providers
│   ├── services/                # Service layer
│   ├── supabase/                # Supabase configuration
│   ├── types/                   # TypeScript type definitions
│   ├── utils/                   # Utility functions
│   └── utils.ts                 # General utilities
│
├── scripts/                     # Database scripts (43 files)
│   ├── 000_complete_schema.sql  # Complete database schema
│   ├── 001_set_admin.sql        # Admin user setup
│   ├── 002_verification_rls_policies.sql # RLS policies
│   ├── 003_matching_indexes.sql # Performance indexes
│   ├── 004_profile_trigger.sql  # Profile triggers
│   ├── 005_cron_logging.sql     # CRON logging
│   ├── 006_comprehensive_profile_schema.sql # Profile schema
│   ├── 007_supabase_cron_matching.sql # CRON matching
│   ├── 008_fix_missing_functions.sql # Function fixes
│   ├── 009_complete_supabase_cron_system.sql # Complete CRON
│   ├── 010_setup_test_data.sql  # Test data
│   ├── 011_system_readiness_check.sql # System checks
│   ├── 012_test_readiness_functions.sql # Test functions
│   ├── 013_quick_enable_users.sql # User enablement
│   ├── 014_enable_and_test.sql  # Enable and test
│   ├── 015_fix_admin_and_test.sql # Admin fixes
│   ├── 016_complete_setup_and_admin.sql # Complete setup
│   ├── 017_test_after_setup.sql # Post-setup testing
│   ├── 018_fixed_complete_setup.sql # Fixed setup
│   ├── 019_final_fixed_setup.sql # Final setup
│   ├── 020_fix_matching_logs_table.sql # Logs table fix
│   ├── 021_create_test_users.sql # Test users
│   ├── 022_fixed_test_users.sql # Fixed test users
│   ├── 023_check_constraints_and_create_users.sql # Constraints
│   ├── 024_fix_specialty_similarity.sql # Specialty fixes
│   ├── 025_lower_matching_threshold.sql # Threshold adjustment
│   ├── 026_comprehensive_diagnosis.sql # System diagnosis
│   ├── 027_final_threshold_fix.sql # Final threshold fix
│   ├── 028_fix_foreign_key_constraint.sql # Foreign key fixes
│   ├── 029_fix_foreign_key_clean.sql # Clean foreign keys
│   ├── 030_debug_and_force_create_group.sql # Group creation
│   ├── 031_update_profiles_for_matching.sql # Profile updates
│   ├── 032_fixed_profile_updates.sql # Fixed profiles
│   ├── 033_final_user_distribution.sql # User distribution
│   ├── 034_check_and_create_groups.sql # Group checks
│   ├── 035_secure_matching_logs.sql # Secure logs
│   ├── 036_authorize_all_users.sql # User authorization
│   ├── 037_fixed_authorize_users.sql # Fixed authorization
│   ├── 043_complete_rls_reset.sql # RLS reset
│   ├── 044_check_chat_permissions.sql # Chat permissions
│   ├── 045_fix_chat_policies.sql # Chat policy fixes
│   ├── cron_comparison_test.sql # CRON comparison
│   └── simulate_matching_engine.ts # Matching simulation
│
├── __tests__/                   # Test files
│   ├── components/              # Component tests
│   └── hooks/                   # Hook tests
│
├── public/                      # Static assets
│   ├── placeholder-logo.png
│   ├── placeholder-logo.svg
│   ├── placeholder-user.jpg
│   ├── placeholder.jpg
│   └── placeholder.svg
│
├── styles/                      # Global styles
│   └── globals.css
│
├── package.json                 # Dependencies and scripts
├── next.config.mjs              # Next.js configuration
├── tailwind.config.js           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
├── jest.setup.js                # Jest test setup
├── middleware.ts                 # Next.js middleware
├── vercel.json                  # Vercel deployment config
└── components.json              # UI components configuration
```

## 🔧 Key Components

### **Matching Algorithm (`lib/matching-algorithm.ts`)**
- **Class**: `MatchingAlgorithm`
- **Method**: `createMatches()` - Main matching logic
- **Features**:
  - 7-step matching process
  - Weighted scoring system
  - Gender balance consideration
  - 6-week cooldown period
  - Group formation (3-4 members)

### **Authentication System (`hooks/use-auth.ts`)**
- Supabase authentication integration
- Profile management
- Verification status tracking
- Payment status monitoring

### **Dashboard System (`hooks/use-dashboard.ts`)**
- Real-time match data
- Group management
- Notification handling
- Statistics tracking

### **Profile Management (`components/comprehensive-profile-form.tsx`)**
- 8-step profile creation process
- Comprehensive data collection
- Progress tracking
- Validation and error handling

## 🗄️ Database Schema

### **Core Tables**
- **`profiles`**: User profile information
- **`matches`**: Match groups
- **`match_members`**: Group membership
- **`chat_messages`**: Message history
- **`matching_logs`**: CRON job logs
- **`notifications`**: User notifications

### **Key Features**
- Row Level Security (RLS) policies
- Performance indexes
- Automated triggers
- Comprehensive constraints

## 🚀 Deployment & Infrastructure

### **Hosting**
- **Frontend**: Vercel
- **Database**: Supabase
- **CDN**: Vercel Edge Network

### **Environment Variables**
- Supabase URL and keys
- Stripe API keys
- Next.js configuration

### **CI/CD**
- Automated testing with Jest
- TypeScript compilation
- ESLint validation
- Vercel deployment pipeline

## 📊 Performance & Monitoring

### **Testing**
- **Unit Tests**: Jest with React Testing Library
- **Coverage**: 70% threshold for branches, functions, lines, statements
- **Test Files**: Component and hook tests

### **Performance**
- Database indexes for query optimization
- React Query for efficient data fetching
- Image optimization with Next.js
- Code splitting and lazy loading

## 🔒 Security Features

### **Authentication**
- Supabase Auth with email verification
- Row Level Security (RLS) policies
- Secure session management

### **Data Protection**
- Encrypted data transmission
- Secure file uploads
- Input validation and sanitization
- CSRF protection

### **Privacy**
- GDPR compliance considerations
- Cookie consent management
- Data retention policies

## 📈 Business Model

### **Revenue Streams**
- Monthly/annual subscriptions
- Premium features
- Verification services

### **Pricing Strategy**
- Transparent pricing model
- 30-day money-back guarantee
- Multiple subscription tiers

## 🎨 User Experience

### **Design Principles**
- Medical professional-focused design
- Clean, modern interface
- Mobile-responsive design
- Accessibility considerations

### **Key User Flows**
1. **Onboarding**: Sign up → Verification → Profile completion → Payment
2. **Matching**: Weekly algorithm → Group formation → Chat initiation
3. **Engagement**: Chat participation → Meetup coordination → Relationship building

## 🔮 Future Roadmap

### **Planned Features**
- Mobile app development
- Advanced matching preferences
- Event coordination tools
- Professional development resources
- Integration with medical conferences

### **Technical Improvements**
- Performance optimizations
- Advanced analytics
- Machine learning enhancements
- API expansion

## 📚 Documentation

The project includes comprehensive documentation:
- **Setup Guides**: Database setup, CRON configuration
- **API Documentation**: Endpoint specifications
- **Testing Guides**: Testing procedures and best practices
- **Deployment Guides**: Production deployment instructions

## 🤝 Contributing

### **Development Setup**
1. Clone repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run database migrations
5. Start development server: `npm run dev`

### **Code Standards**
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Conventional commits for version control

---

*BeyondRounds represents a comprehensive solution for medical professional networking, combining sophisticated matching algorithms with modern web technologies to create meaningful connections in the healthcare community.*
