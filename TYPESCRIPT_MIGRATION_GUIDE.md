# 🚀 BeyondRounds Codebase Cleanup & TypeScript Migration Guide

## 📋 Overview
This comprehensive guide provides a systematic approach to clean up the BeyondRounds codebase and migrate to optimized TypeScript types. The goal is to improve code quality, maintainability, and performance while ensuring a smooth transition.

## 🎯 Current State Analysis

### Identified Issues:
- ❌ **Multiple TypeScript type files** with inconsistent naming conventions
- ❌ **Mixed naming patterns** (snake_case vs camelCase vs kebab-case)
- ❌ **Outdated type definitions** that don't match current database schema
- ❌ **Inconsistent enum values** across different type files
- ❌ **Duplicate type definitions** in multiple files
- ❌ **Legacy code patterns** that need modernization

### Files Requiring Attention:
```
src/lib/types/
├── database.ts (1,410 lines - legacy types with kebab-case enums)
├── database-optimized.ts (1,078 lines - new optimized types with snake_case)
└── database-updated.ts (229 lines - intermediate types)

Key Components:
├── src/lib/api/profile-comprehensive.ts
├── src/lib/utils/profile-mapping.ts
├── src/hooks/features/auth/useAuthUser.ts
├── src/app/dashboard/DashboardClient.tsx
└── src/components/features/profile/ProfileEditor.tsx
```

## 🔧 Migration Strategy

### Phase 1: Type Consolidation & Standardization

**Primary Changes:**
1. **Table Name Migration**: `profiles` → `users`
2. **Type Name Updates**: `Profile` → `User`
3. **Enum Standardization**: `non-binary` → `non_binary`
4. **Import Path Updates**: Update all import statements
5. **Form Data Alignment**: Standardize form field naming

### Phase 2: Automated Migration Script

## 🛠️ Complete Migration Script

Create the following migration script to handle all transformations:

```typescript
// scripts/migrate-typescript-types.ts
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Comprehensive migration mapping
const MIGRATION_MAP = {
  // Table names
  'profiles': 'users',
  'profile_preferences': 'user_preferences',
  'profile_specialties': 'user_specialties',
  'profile_interests': 'user_interests',
  'profile_availability_slots': 'user_availability_slots',
  'profile_tags': 'user_tags',
  'profile_meeting_activities': 'user_meeting_activities',
  
  // Type names
  'Profile': 'User',
  'ProfileFormData': 'UserFormData',
  'ProfileInsert': 'UserInsert',
  'ProfileUpdate': 'UserUpdate',
  'ProfileWithMatches': 'UserWithMatches',
  'ProfileWithRelations': 'UserWithRelations',
  'ProfileCompletionData': 'UserCompletionData',
  'ProfileAvailabilitySlot': 'UserAvailabilitySlot',
  'ProfileTag': 'UserTag',
  
  // Enum value standardization (kebab-case → snake_case)
  'non-binary': 'non_binary',
  'prefer-not-to-say': 'prefer_not_to_say',
  'no-preference': 'no_preference',
  'mixed-preferred': 'mixed_preferred',
  'same-gender-only': 'same_gender_only',
  'same-gender-preferred': 'same_gender_preferred',
  'same-specialty-preferred': 'same_specialty',
  'different-specialties-preferred': 'different_specialties',
  'medical-student': 'medical_student',
  'resident-1-2': 'resident_1_2',
  'resident-3-plus': 'resident_3_plus',
  'resident-3plus': 'resident_3_plus',
  'attending-0-5': 'attending_0_5',
  'attending-5-plus': 'attending_5_plus',
  'attending-5plus': 'attending_5_plus',
  'private-practice': 'private_practice',
  'academic-medicine': 'academic_medicine',
  'very-active': 'very_active',
  'moderately-active': 'moderately_active',
  'occasionally-active': 'occasionally_active',
  'prefer-non-physical': 'non_physical',
  'high-energy-big-groups': 'very_high',
  'moderate-energy-small-groups': 'high',
  'low-key-intimate': 'moderate',
  'varies-by-mood': 'low',
  'deep-meaningful': 'deep_philosophical',
  'light-fun-casual': 'light_casual',
  'hobby-focused': 'professional_focused',
  'professional-career': 'professional_focused',
  'mix-everything': 'mixed',
  'bi-weekly': 'bi_weekly',
  'as-schedules-allow': 'flexible',
  'single-no-kids': 'single',
  'relationship-no-kids': 'dating',
  'married-no-kids': 'married',
  'young-children': 'parent',
  'older-children': 'parent',
  'empty-nester': 'empty_nester',
  'prefer-not-say': 'single',
  'adventure-exploration': 'adventure_exploration',
  'relaxation-self-care': 'relaxation_self_care',
  'social-activities': 'social_activities',
  'cultural-activities': 'cultural_activities',
  'sports-fitness': 'sports_fitness',
  'home-projects-hobbies': 'home_projects_hobbies',
  'mix-active-relaxing': 'mix_active_relaxing',
  
  // Field name standardization
  'profile_completion': 'profile_completion_percentage',
  'profile_completion_percentage': 'profile_completion_percentage',
  
  // Import path updates
  "'@/lib/types/database'": "'@/lib/types/database'",
  "'../types/database'": "'../types/database'",
  "'./types/database'": "'./types/database'",
  
  // Form field naming (camelCase consistency)
  'firstName': 'firstName',
  'lastName': 'lastName',
  'genderPreference': 'genderPreference',
  'medicalSpecialty': 'medicalSpecialty',
  'careerStage': 'careerStage',
  'activityLevel': 'activityLevel',
  'socialEnergyLevel': 'socialEnergyLevel',
  'conversationStyle': 'conversationStyle',
  'meetingFrequency': 'meetingFrequency',
  'lifeStage': 'lifeStage',
  'dietaryPreferences': 'dietaryPreferences',
  'idealWeekend': 'idealWeekend',
  'preferredTimes': 'preferredTimes',
  'meetingActivities': 'meetingActivities',
  'otherInterests': 'otherInterests',
  'lookingFor': 'lookingFor'
};

// Additional regex patterns for complex replacements
const REGEX_PATTERNS = [
  // Database table references in queries
  { pattern: /from\s+['"]profiles['"]/gi, replacement: 'from "users"' },
  { pattern: /join\s+['"]profiles['"]/gi, replacement: 'join "users"' },
  { pattern: /update\s+['"]profiles['"]/gi, replacement: 'update "users"' },
  { pattern: /insert\s+into\s+['"]profiles['"]/gi, replacement: 'insert into "users"' },
  
  // Supabase client references
  { pattern: /\.from\(['"]profiles['"]\)/gi, replacement: '.from("users")' },
  { pattern: /\.from\(['"]profile_preferences['"]\)/gi, replacement: '.from("user_preferences")' },
  { pattern: /\.from\(['"]profile_specialties['"]\)/gi, replacement: '.from("user_specialties")' },
  { pattern: /\.from\(['"]profile_interests['"]\)/gi, replacement: '.from("user_interests")' },
  { pattern: /\.from\(['"]profile_availability_slots['"]\)/gi, replacement: '.from("user_availability_slots")' },
  
  // Type imports
  { pattern: /import\s*{\s*([^}]*Profile[^}]*)\s*}\s*from\s*['"][^'"]*database['"]/gi, replacement: (match, types) => {
    const updatedTypes = types.replace(/Profile/g, 'User');
    return `import { ${updatedTypes} } from '@/lib/types/database'`;
  }},
  
  // Interface declarations
  { pattern: /interface\s+Profile\b/gi, replacement: 'interface User' },
  { pattern: /type\s+Profile\b/gi, replacement: 'type User' },
  { pattern: /:\s*Profile\b/gi, replacement: ': User' },
  { pattern: /<\s*Profile\b/gi, replacement: '<User' },
  
  // Function parameters and return types
  { pattern: /\(\s*profile:\s*Profile\b/gi, replacement: '(user: User' },
  { pattern: /\(\s*user:\s*Profile\b/gi, replacement: '(user: User' },
  { pattern: /:\s*Profile\[\]/gi, replacement: ': User[]' },
  { pattern: /:\s*Profile\s*\|\s*null/gi, replacement: ': User | null' },
  { pattern: /:\s*Profile\s*\|\s*undefined/gi, replacement: ': User | undefined' },
  
  // Object property access
  { pattern: /\.profile\b/gi, replacement: '.user' },
  { pattern: /profile\./gi, replacement: 'user.' },
  { pattern: /profiles\./gi, replacement: 'users.' },
  
  // Variable names
  { pattern: /\bprofile\b(?=\s*[=:])/gi, replacement: 'user' },
  { pattern: /\bprofiles\b(?=\s*[=:])/gi, replacement: 'users' },
  { pattern: /\bprofileData\b/gi, replacement: 'userData' },
  { pattern: /\bprofileForm\b/gi, replacement: 'userForm' },
  { pattern: /\bprofileUpdate\b/gi, replacement: 'userUpdate' },
  { pattern: /\bprofileInsert\b/gi, replacement: 'userInsert' },
  
  // Comments and strings
  { pattern: /\/\/\s*Profile/gi, replacement: '// User' },
  { pattern: /\/\*\s*Profile/gi, replacement: '/* User' },
  { pattern: /Profile\s*\*\//gi, replacement: 'User */' },
  
  // Form field mappings
  { pattern: /firstName:\s*formData\.firstName/gi, replacement: 'first_name: formData.firstName' },
  { pattern: /lastName:\s*formData\.lastName/gi, replacement: 'last_name: formData.lastName' },
  { pattern: /gender:\s*formData\.gender/gi, replacement: 'gender: formData.gender' },
  { pattern: /age:\s*formData\.age/gi, replacement: 'age: formData.age' },
  { pattern: /city:\s*formData\.city/gi, replacement: 'city: formData.city' },
  { pattern: /nationality:\s*formData\.nationality/gi, replacement: 'nationality: formData.nationality' },
  { pattern: /medicalSpecialty:\s*formData\.medicalSpecialty/gi, replacement: 'medical_specialty: formData.medicalSpecialty' },
  { pattern: /careerStage:\s*formData\.careerStage/gi, replacement: 'career_stage: formData.careerStage' },
  { pattern: /activityLevel:\s*formData\.activityLevel/gi, replacement: 'activity_level: formData.activityLevel' },
  { pattern: /socialEnergyLevel:\s*formData\.socialEnergyLevel/gi, replacement: 'social_energy_level: formData.socialEnergyLevel' },
  { pattern: /conversationStyle:\s*formData\.conversationStyle/gi, replacement: 'conversation_style: formData.conversationStyle' },
  { pattern: /meetingFrequency:\s*formData\.meetingFrequency/gi, replacement: 'meeting_frequency: formData.meetingFrequency' },
  { pattern: /lifeStage:\s*formData\.lifeStage/gi, replacement: 'life_stage: formData.lifeStage' },
  { pattern: /dietaryPreferences:\s*formData\.dietaryPreferences/gi, replacement: 'dietary_preferences: formData.dietaryPreferences' },
  { pattern: /idealWeekend:\s*formData\.idealWeekend/gi, replacement: 'ideal_weekend: formData.idealWeekend' },
  { pattern: /preferredTimes:\s*formData\.preferredTimes/gi, replacement: 'preferred_times: formData.preferredTimes' },
  { pattern: /meetingActivities:\s*formData\.meetingActivities/gi, replacement: 'meeting_activities: formData.meetingActivities' },
  { pattern: /otherInterests:\s*formData\.otherInterests/gi, replacement: 'other_interests: formData.otherInterests' },
  { pattern: /lookingFor:\s*formData\.lookingFor/gi, replacement: 'looking_for: formData.lookingFor' }
];

class TypeScriptMigration {
  private processedFiles: Set<string> = new Set();
  private errors: string[] = [];
  private stats = {
    filesProcessed: 0,
    replacementsMade: 0,
    errors: 0
  };

  constructor() {
    console.log('🚀 Starting TypeScript Migration...\n');
  }

  private findTypeScriptFiles(dir: string): string[] {
    const files: string[] = [];
    
    try {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== 'coverage') {
          files.push(...this.findTypeScriptFiles(fullPath));
        } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
          files.push(fullPath);
        }
      });
    } catch (error) {
      this.errors.push(`Error reading directory ${dir}: ${error}`);
    }
    
    return files;
  }

  private migrateFile(filePath: string): void {
    if (this.processedFiles.has(filePath)) {
      return;
    }

    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let originalContent = content;
      let replacements = 0;

      // Apply migration map
      Object.entries(MIGRATION_MAP).forEach(([old, newVal]) => {
        const regex = new RegExp(`\\b${old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
        const matches = content.match(regex);
        if (matches) {
          content = content.replace(regex, newVal);
          replacements += matches.length;
        }
      });

      // Apply regex patterns
      REGEX_PATTERNS.forEach(({ pattern, replacement }) => {
        const matches = content.match(pattern);
        if (matches) {
          if (typeof replacement === 'function') {
            content = content.replace(pattern, replacement);
          } else {
            content = content.replace(pattern, replacement);
          }
          replacements += matches.length;
        }
      });

      // Write file if changes were made
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        this.processedFiles.add(filePath);
        this.stats.filesProcessed++;
        this.stats.replacementsMade += replacements;
        console.log(`✅ ${filePath} (${replacements} replacements)`);
      } else {
        console.log(`⏭️  ${filePath} (no changes needed)`);
      }

    } catch (error) {
      this.errors.push(`Error processing ${filePath}: ${error}`);
      this.stats.errors++;
      console.log(`❌ ${filePath} (error: ${error})`);
    }
  }

  private replaceDatabaseTypes(): void {
    console.log('\n🔄 Replacing database types...');
    
    try {
      // Backup current database.ts
      const databasePath = path.join(process.cwd(), 'src/lib/types/database.ts');
      const backupPath = path.join(process.cwd(), 'src/lib/types/database-backup.ts');
      
      if (fs.existsSync(databasePath)) {
        fs.copyFileSync(databasePath, backupPath);
        console.log('✅ Created backup: database-backup.ts');
      }

      // Replace with optimized types
      const optimizedPath = path.join(process.cwd(), 'src/lib/types/database-optimized.ts');
      if (fs.existsSync(optimizedPath)) {
        fs.copyFileSync(optimizedPath, databasePath);
        console.log('✅ Replaced database.ts with optimized types');
      } else {
        console.log('⚠️  database-optimized.ts not found, skipping replacement');
      }

      // Remove intermediate files
      const filesToRemove = [
        'src/lib/types/database-updated.ts'
      ];

      filesToRemove.forEach(file => {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`🗑️  Removed ${file}`);
        }
      });

    } catch (error) {
      this.errors.push(`Error replacing database types: ${error}`);
    }
  }

  private updatePackageJson(): void {
    console.log('\n📦 Updating package.json scripts...');
    
    try {
      const packagePath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      // Add migration scripts
      packageJson.scripts = {
        ...packageJson.scripts,
        'migrate-types': 'ts-node scripts/migrate-typescript-types.ts',
        'type-check': 'tsc --noEmit',
        'cleanup-types': 'npm run migrate-types && npm run type-check'
      };
      
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
      console.log('✅ Updated package.json with migration scripts');
      
    } catch (error) {
      this.errors.push(`Error updating package.json: ${error}`);
    }
  }

  private generateReport(): void {
    console.log('\n📊 Migration Report:');
    console.log('==================');
    console.log(`Files processed: ${this.stats.filesProcessed}`);
    console.log(`Total replacements: ${this.stats.replacementsMade}`);
    console.log(`Errors: ${this.stats.errors}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      this.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    console.log('\n🎉 Migration completed!');
    console.log('\nNext steps:');
    console.log('1. Run: npm run type-check');
    console.log('2. Run: npm test');
    console.log('3. Run: npm run build');
    console.log('4. Test the application manually');
  }

  public async run(): Promise<void> {
    try {
      // Step 1: Replace database types
      this.replaceDatabaseTypes();
      
      // Step 2: Find and migrate all TypeScript files
      const srcDir = path.join(process.cwd(), 'src');
      const files = this.findTypeScriptFiles(srcDir);
      
      console.log(`\n🔍 Found ${files.length} TypeScript files to process...`);
      
      // Process files
      files.forEach(file => this.migrateFile(file));
      
      // Step 3: Update package.json
      this.updatePackageJson();
      
      // Step 4: Generate report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  const migration = new TypeScriptMigration();
  migration.run().catch(console.error);
}

export default TypeScriptMigration;
```

## 🚀 Execution Commands

### Quick Start Migration:

```bash
# 1. Create migration branch
git checkout -b feature/typescript-cleanup

# 2. Install dependencies (if not already installed)
npm install

# 3. Run the migration script
npx ts-node scripts/migrate-typescript-types.ts

# 4. Check TypeScript compilation
npm run type-check

# 5. Run tests
npm test

# 6. Build project
npm run build

# 7. Commit changes
git add .
git commit -m "feat: migrate to optimized TypeScript types

- Replace profiles table with users table
- Standardize enum values to snake_case
- Update all type references from Profile to User
- Consolidate type definitions
- Improve type safety and consistency"

git push origin feature/typescript-cleanup
```

### Manual Step-by-Step Migration:

```bash
# Step 1: Backup current types
cp src/lib/types/database.ts src/lib/types/database-legacy.ts

# Step 2: Replace with optimized types
cp src/lib/types/database-optimized.ts src/lib/types/database.ts

# Step 3: Remove intermediate files
rm src/lib/types/database-updated.ts

# Step 4: Update imports manually (if needed)
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/Profile/User/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/profiles/users/g'

# Step 5: Verify compilation
npm run type-check
```

## 🧪 Testing & Validation

### Pre-Migration Checklist:
- [ ] **Backup created** - All original files backed up
- [ ] **Migration script tested** - Script works on test files
- [ ] **Dependencies installed** - All required packages available
- [ ] **Git branch created** - Working on feature branch

### Post-Migration Validation:

```bash
# 1. TypeScript compilation
npm run type-check

# 2. Run all tests
npm test

# 3. Build project
npm run build

# 4. Lint code
npm run lint

# 5. Check for any remaining issues
grep -r "Profile" src/ --include="*.ts" --include="*.tsx"
grep -r "profiles" src/ --include="*.ts" --include="*.tsx"
```

### Expected Results:
- ✅ **Zero TypeScript compilation errors**
- ✅ **All tests passing**
- ✅ **Successful build**
- ✅ **No remaining Profile/profiles references**
- ✅ **Consistent snake_case enum values**
- ✅ **Proper User type usage throughout**

## 📊 Migration Benefits

### Immediate Improvements:
- ✅ **Consistent naming conventions** across entire codebase
- ✅ **Improved type safety** with strict TypeScript types
- ✅ **Better developer experience** with enhanced IntelliSense
- ✅ **Reduced code duplication** through consolidated types
- ✅ **Cleaner codebase** with removed legacy code

### Long-term Benefits:
- ✅ **Easier maintenance** with standardized patterns
- ✅ **Faster development** with better tooling support
- ✅ **Reduced bugs** through improved type safety
- ✅ **Better scalability** with optimized type system
- ✅ **Improved team productivity** with consistent conventions

## 🚨 Risk Mitigation

### Rollback Procedure:
```bash
# If issues arise, rollback to backup
git checkout main
cp src/lib/types/database-legacy.ts src/lib/types/database.ts
npm run build
```

### Gradual Migration:
If the full migration is too risky, migrate incrementally:
1. Start with type definitions only
2. Update one component at a time
3. Test each change thoroughly
4. Use feature flags for gradual rollout

## 🎯 Success Metrics

### Technical Metrics:
- ✅ **TypeScript compilation time** < 30 seconds
- ✅ **Build time** < 2 minutes
- ✅ **Type coverage** > 95%
- ✅ **Zero TypeScript errors**
- ✅ **All tests passing**

### Code Quality Metrics:
- ✅ **Consistent naming conventions**
- ✅ **Reduced code duplication**
- ✅ **Improved type safety**
- ✅ **Better IntelliSense support**

---

## 🎉 Conclusion

This comprehensive migration strategy will transform your BeyondRounds codebase into a more maintainable, type-safe, and developer-friendly system. The automated script handles all the heavy lifting while the validation steps ensure everything works correctly.

**Ready to execute?** Start with the Quick Start Migration commands above. The migration script will handle all transformations automatically, and the validation steps will ensure everything works correctly.

**Estimated Timeline:** 1-2 hours for complete migration and validation
**Risk Level:** Low (with proper backup and testing)
**Impact:** High (significant improvement in code quality and developer experience)
