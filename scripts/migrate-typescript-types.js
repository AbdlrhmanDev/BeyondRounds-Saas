#!/usr/bin/env node

/**
 * BeyondRounds TypeScript Types Migration Script (JavaScript Version)
 * 
 * This script handles the complete migration from legacy TypeScript types
 * to optimized types with consistent naming conventions.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
  constructor() {
    this.processedFiles = new Set();
    this.errors = [];
    this.stats = {
      filesProcessed: 0,
      replacementsMade: 0,
      errors: 0
    };
    console.log('🚀 Starting TypeScript Migration...\n');
  }

  findTypeScriptFiles(dir) {
    const files = [];
    
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

  migrateFile(filePath) {
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

  replaceDatabaseTypes() {
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

  updatePackageJson() {
    console.log('\n📦 Updating package.json scripts...');
    
    try {
      const packagePath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      // Add migration scripts
      packageJson.scripts = {
        ...packageJson.scripts,
        'migrate-types': 'node scripts/migrate-typescript-types.js',
        'type-check': 'tsc --noEmit',
        'cleanup-types': 'npm run migrate-types && npm run type-check'
      };
      
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
      console.log('✅ Updated package.json with migration scripts');
      
    } catch (error) {
      this.errors.push(`Error updating package.json: ${error}`);
    }
  }

  generateReport() {
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

  async run() {
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

module.exports = TypeScriptMigration;
