// ==============================================
// Comprehensive User Form Validation
// ==============================================
// Validation utilities for the comprehensive profile system

import { 
  type UserFormData,
  type GenderType,
  type GenderPreferenceType,
  type SpecialtyPreferenceType,
  type CareerStageType,
  type ActivityLevelType,
  type SocialEnergyType,
  type ConversationStyleType,
  type MeetingFrequencyType,
  type LifeStageType,
  type IdealWeekendType
} from '@/lib/types/database'

// Define constants locally since they are not exported from components
const MEDICAL_SPECIALTIES = [
  'General Practice/Family Medicine', 'Internal Medicine', 'Surgery (General)', 'Pediatrics',
  'Cardiology', 'Neurology', 'Psychiatry', 'Emergency Medicine', 'Anesthesiology', 'Radiology',
  'Pathology', 'Dermatology', 'Ophthalmology', 'Orthopedics', 'Gynecology', 'Urology', 'Oncology',
  'Medical Student', 'Resident', 'Fellow', 'Other (specify)'
]

const SPORTS_ACTIVITIES = [
  'Running', 'Swimming', 'Cycling', 'Tennis', 'Basketball', 'Football', 'Soccer', 'Golf',
  'Yoga', 'Pilates', 'Weightlifting', 'Hiking', 'Rock Climbing', 'Martial Arts', 'Dancing',
  'Skiing', 'Snowboarding', 'Surfing', 'Volleyball', 'Badminton', 'Table Tennis', 'Other'
]

const MUSIC_GENRES = [
  'Pop', 'Rock', 'Hip-Hop', 'R&B', 'Jazz', 'Classical', 'Electronic', 'Country',
  'Folk', 'Blues', 'Reggae', 'Latin', 'World', 'Alternative', 'Indie', 'Other'
]

const MOVIE_GENRES = [
  'Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Documentary',
  'Animation', 'Fantasy', 'Mystery', 'Crime', 'Adventure', 'Family', 'War', 'Other'
]

const OTHER_INTERESTS = [
  'Photography', 'Cooking', 'Travel', 'Reading', 'Art', 'Music', 'Writing', 'Gardening',
  'Volunteering', 'Languages', 'Technology', 'Fashion', 'Gaming', 'Collecting', 'Crafts', 'Other'
]

const MEETING_ACTIVITIES = [
  'Coffee/Tea', 'Lunch/Dinner', 'Outdoor Activities', 'Cultural Events', 'Sports',
  'Study Groups', 'Professional Networking', 'Casual Hangouts', 'Other'
]

const DIETARY_PREFERENCES = [
  'No Restrictions', 'Vegetarian', 'Vegan', 'Halal', 'Kosher', 'Gluten-Free', 'Other Allergies'
]

const LOOKING_FOR_OPTIONS = [
  'Networking', 'Mentorship', 'Study Partners', 'Research Collaboration', 'Social Connections'
]

const IDEAL_WEEKEND_OPTIONS = [
  'Adventure & Exploration', 'Relaxation & Self-Care', 'Social Activities', 'Cultural Activities',
  'Sports & Fitness', 'Home Projects', 'Mix of Active & Relaxing'
]

// Define missing constants
const PREFERRED_TIMES = [
  'Morning (6-12)',
  'Afternoon (12-18)',
  'Evening (18-24)',
  'Late Night (24-6)',
  'Weekends',
  'Flexible'
]

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
}

// ==============================================
// FIELD VALIDATION FUNCTIONS
// ==============================================

export function validateFirstName(firstName: string): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (!firstName || firstName.trim().length === 0) {
    errors.push({
      field: 'firstName',
      message: 'First name is required',
      code: 'REQUIRED'
    })
  } else if (firstName.trim().length < 2) {
    errors.push({
      field: 'firstName',
      message: 'First name must be at least 2 characters',
      code: 'MIN_LENGTH'
    })
  } else if (firstName.trim().length > 50) {
    errors.push({
      field: 'firstName',
      message: 'First name must be less than 50 characters',
      code: 'MAX_LENGTH'
    })
  } else if (!/^[a-zA-Z\s\-']+$/.test(firstName.trim())) {
    errors.push({
      field: 'firstName',
      message: 'First name can only contain letters, spaces, hyphens, and apostrophes',
      code: 'INVALID_FORMAT'
    })
  }
  
  return errors
}

export function validateLastName(lastName?: string): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (lastName && lastName.trim().length > 0) {
    if (lastName.trim().length < 2) {
      errors.push({
        field: 'lastName',
        message: 'Last name must be at least 2 characters',
        code: 'MIN_LENGTH'
      })
    } else if (lastName.trim().length > 50) {
      errors.push({
        field: 'lastName',
        message: 'Last name must be less than 50 characters',
        code: 'MAX_LENGTH'
      })
    } else if (!/^[a-zA-Z\s\-']+$/.test(lastName.trim())) {
      errors.push({
        field: 'lastName',
        message: 'Last name can only contain letters, spaces, hyphens, and apostrophes',
        code: 'INVALID_FORMAT'
      })
    }
  }
  
  return errors
}

export function validateAge(age?: string): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (age && age.trim().length > 0) {
    const ageNum = parseInt(age)
    
    if (isNaN(ageNum)) {
      errors.push({
        field: 'age',
        message: 'Age must be a valid number',
        code: 'INVALID_NUMBER'
      })
    } else if (ageNum < 18) {
      errors.push({
        field: 'age',
        message: 'Age must be at least 18',
        code: 'MIN_AGE'
      })
    } else if (ageNum > 100) {
      errors.push({
        field: 'age',
        message: 'Age must be less than 100',
        code: 'MAX_AGE'
      })
    }
  }
  
  return errors
}

export function validateGender(gender: GenderType): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (!gender) {
    errors.push({
      field: 'gender',
      message: 'Gender is required',
      code: 'REQUIRED'
    })
  } else if (!['male', 'female', 'non-binary', 'prefer-not-to-say'].includes(gender)) {
    errors.push({
      field: 'gender',
      message: 'Invalid gender selection',
      code: 'INVALID_VALUE'
    })
  }
  
  return errors
}

export function validateGenderPreference(genderPreference: GenderPreferenceType): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (!genderPreference) {
    errors.push({
      field: 'genderPreference',
      message: 'Gender preference is required',
      code: 'REQUIRED'
    })
  } else if (!['no_preference', 'mixed_preferred', 'same_gender_only', 'same_gender_preferred'].includes(genderPreference)) {
    errors.push({
      field: 'genderPreference',
      message: 'Invalid gender preference selection',
      code: 'INVALID_VALUE'
    })
  }
  
  return errors
}

export function validateCity(city: string): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (!city || city.trim().length === 0) {
    errors.push({
      field: 'city',
      message: 'City is required',
      code: 'REQUIRED'
    })
  } else if (city.trim().length < 2) {
    errors.push({
      field: 'city',
      message: 'City must be at least 2 characters',
      code: 'MIN_LENGTH'
    })
  } else if (city.trim().length > 100) {
    errors.push({
      field: 'city',
      message: 'City must be less than 100 characters',
      code: 'MAX_LENGTH'
    })
  }
  
  return errors
}

export function validateNationality(nationality?: string): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (nationality && nationality.trim().length > 0) {
    if (nationality.trim().length < 2) {
      errors.push({
        field: 'nationality',
        message: 'Nationality must be at least 2 characters',
        code: 'MIN_LENGTH'
      })
    } else if (nationality.trim().length > 50) {
      errors.push({
        field: 'nationality',
        message: 'Nationality must be less than 50 characters',
        code: 'MAX_LENGTH'
      })
    }
  }
  
  return errors
}

export function validateSpecialties(specialties: string[]): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (!specialties || specialties.length === 0) {
    errors.push({
      field: 'specialties',
      message: 'At least one medical specialty is required',
      code: 'REQUIRED'
    })
  } else if (specialties.length > 5) {
    errors.push({
      field: 'specialties',
      message: 'Maximum 5 specialties allowed',
      code: 'MAX_SELECTIONS'
    })
  } else {
    const invalidSpecialties = specialties.filter(s => !MEDICAL_SPECIALTIES.includes(s))
    if (invalidSpecialties.length > 0) {
      errors.push({
        field: 'specialties',
        message: `Invalid specialties: ${invalidSpecialties.join(', ')}`,
        code: 'INVALID_VALUES'
      })
    }
  }
  
  return errors
}

export function validateSpecialtyPreference(specialtyPreference?: SpecialtyPreferenceType): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (specialtyPreference && !['same-specialty', 'different-specialties', 'no-preference'].includes(specialtyPreference)) {
    errors.push({
      field: 'specialtyPreference',
      message: 'Invalid specialty preference selection',
      code: 'INVALID_VALUE'
    })
  }
  
  return errors
}

export function validateCareerStage(careerStage?: CareerStageType): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (careerStage && !['medical_student', 'resident_1_2', 'resident_3_plus', 'fellow', 'attending_0_5', 'attending_5_plus', 'private_practice', 'academic_medicine', 'other'].includes(careerStage)) {
    errors.push({
      field: 'careerStage',
      message: 'Invalid career stage selection',
      code: 'INVALID_VALUE'
    })
  }
  
  return errors
}

export function validateSports(sports: string[]): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (!sports || sports.length === 0) {
    errors.push({
      field: 'sports',
      message: 'At least one sport/activity is required',
      code: 'REQUIRED'
    })
  } else if (sports.length > 10) {
    errors.push({
      field: 'sports',
      message: 'Maximum 10 sports/activities allowed',
      code: 'MAX_SELECTIONS'
    })
  } else {
    const invalidSports = sports.filter(s => !SPORTS_ACTIVITIES.includes(s))
    if (invalidSports.length > 0) {
      errors.push({
        field: 'sports',
        message: `Invalid sports: ${invalidSports.join(', ')}`,
        code: 'INVALID_VALUES'
      })
    }
  }
  
  return errors
}

export function validateActivityLevel(activityLevel?: ActivityLevelType): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (activityLevel && !['very-active', 'active', 'moderately-active', 'occasionally-active', 'non-physical'].includes(activityLevel)) {
    errors.push({
      field: 'activityLevel',
      message: 'Invalid activity level selection',
      code: 'INVALID_VALUE'
    })
  }
  
  return errors
}

export function validateMusicGenres(musicGenres: string[]): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (!musicGenres || musicGenres.length === 0) {
    errors.push({
      field: 'musicGenres',
      message: 'At least one music genre is required',
      code: 'REQUIRED'
    })
  } else if (musicGenres.length > 8) {
    errors.push({
      field: 'musicGenres',
      message: 'Maximum 8 music genres allowed',
      code: 'MAX_SELECTIONS'
    })
  } else {
    const invalidGenres = musicGenres.filter(g => !MUSIC_GENRES.includes(g))
    if (invalidGenres.length > 0) {
      errors.push({
        field: 'musicGenres',
        message: `Invalid music genres: ${invalidGenres.join(', ')}`,
        code: 'INVALID_VALUES'
      })
    }
  }
  
  return errors
}

export function validateMovieGenres(movieGenres: string[]): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (!movieGenres || movieGenres.length === 0) {
    errors.push({
      field: 'movieGenres',
      message: 'At least one movie/TV genre is required',
      code: 'REQUIRED'
    })
  } else if (movieGenres.length > 8) {
    errors.push({
      field: 'movieGenres',
      message: 'Maximum 8 movie/TV genres allowed',
      code: 'MAX_SELECTIONS'
    })
  } else {
    const invalidGenres = movieGenres.filter(g => !MOVIE_GENRES.includes(g))
    if (invalidGenres.length > 0) {
      errors.push({
        field: 'movieGenres',
        message: `Invalid movie/TV genres: ${invalidGenres.join(', ')}`,
        code: 'INVALID_VALUES'
      })
    }
  }
  
  return errors
}

export function validateOtherInterests(otherInterests: string[]): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (otherInterests && otherInterests.length > 10) {
    errors.push({
      field: 'otherInterests',
      message: 'Maximum 10 other interests allowed',
      code: 'MAX_SELECTIONS'
    })
  } else if (otherInterests && otherInterests.length > 0) {
    const invalidInterests = otherInterests.filter(i => !OTHER_INTERESTS.includes(i))
    if (invalidInterests.length > 0) {
      errors.push({
        field: 'otherInterests',
        message: `Invalid interests: ${invalidInterests.join(', ')}`,
        code: 'INVALID_VALUES'
      })
    }
  }
  
  return errors
}

export function validateMeetingActivities(meetingActivities: string[]): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (!meetingActivities || meetingActivities.length === 0) {
    errors.push({
      field: 'meetingActivities',
      message: 'At least one meeting activity is required',
      code: 'REQUIRED'
    })
  } else if (meetingActivities.length > 5) {
    errors.push({
      field: 'meetingActivities',
      message: 'Maximum 5 meeting activities allowed',
      code: 'MAX_SELECTIONS'
    })
  } else {
    const invalidActivities = meetingActivities.filter(a => !MEETING_ACTIVITIES.includes(a))
    if (invalidActivities.length > 0) {
      errors.push({
        field: 'meetingActivities',
        message: `Invalid meeting activities: ${invalidActivities.join(', ')}`,
        code: 'INVALID_VALUES'
      })
    }
  }
  
  return errors
}

export function validateSocialEnergyLevel(socialEnergyLevel?: SocialEnergyType): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (socialEnergyLevel && !['very-high', 'high', 'moderate', 'low', 'very-low'].includes(socialEnergyLevel)) {
    errors.push({
      field: 'socialEnergyLevel',
      message: 'Invalid social energy level selection',
      code: 'INVALID_VALUE'
    })
  }
  
  return errors
}

export function validateConversationStyle(conversationStyle?: ConversationStyleType): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (conversationStyle && !['deep-philosophical', 'light-casual', 'professional-focused', 'mixed'].includes(conversationStyle)) {
    errors.push({
      field: 'conversationStyle',
      message: 'Invalid conversation style selection',
      code: 'INVALID_VALUE'
    })
  }
  
  return errors
}

export function validatePreferredTimes(preferredTimes: string[]): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (!preferredTimes || preferredTimes.length === 0) {
    errors.push({
      field: 'preferredTimes',
      message: 'At least one preferred meeting time is required',
      code: 'REQUIRED'
    })
  } else if (preferredTimes.length > 6) {
    errors.push({
      field: 'preferredTimes',
      message: 'Maximum 6 preferred times allowed',
      code: 'MAX_SELECTIONS'
    })
  } else {
    const invalidTimes = preferredTimes.filter(t => !PREFERRED_TIMES.includes(t))
    if (invalidTimes.length > 0) {
      errors.push({
        field: 'preferredTimes',
        message: `Invalid preferred times: ${invalidTimes.join(', ')}`,
        code: 'INVALID_VALUES'
      })
    }
  }
  
  return errors
}

export function validateMeetingFrequency(meetingFrequency?: MeetingFrequencyType): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (meetingFrequency && !['weekly', 'bi-weekly', 'monthly', 'flexible'].includes(meetingFrequency)) {
    errors.push({
      field: 'meetingFrequency',
      message: 'Invalid meeting frequency selection',
      code: 'INVALID_VALUE'
    })
  }
  
  return errors
}

export function validateDietaryPreferences(dietaryPreferences?: string): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (dietaryPreferences && !DIETARY_PREFERENCES.includes(dietaryPreferences)) {
    errors.push({
      field: 'dietaryPreferences',
      message: 'Invalid dietary preferences selection',
      code: 'INVALID_VALUE'
    })
  }
  
  return errors
}

export function validateLifeStage(lifeStage?: LifeStageType): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (lifeStage && !['single', 'dating', 'married', 'parent', 'empty-nester', 'prefer-not-to-say'].includes(lifeStage)) {
    errors.push({
      field: 'lifeStage',
      message: 'Invalid life stage selection',
      code: 'INVALID_VALUE'
    })
  }
  
  return errors
}

export function validateLookingFor(lookingFor: string[]): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (!lookingFor || lookingFor.length === 0) {
    errors.push({
      field: 'lookingFor',
      message: 'At least one option is required',
      code: 'REQUIRED'
    })
  } else if (lookingFor.length > 8) {
    errors.push({
      field: 'lookingFor',
      message: 'Maximum 8 options allowed',
      code: 'MAX_SELECTIONS'
    })
  } else {
    const invalidOptions = lookingFor.filter(o => !LOOKING_FOR_OPTIONS.includes(o))
    if (invalidOptions.length > 0) {
      errors.push({
        field: 'lookingFor',
        message: `Invalid options: ${invalidOptions.join(', ')}`,
        code: 'INVALID_VALUES'
      })
    }
  }
  
  return errors
}

export function validateIdealWeekend(idealWeekend?: IdealWeekendType): ValidationError[] {
  const errors: ValidationError[] = []
  
  if (idealWeekend && !IDEAL_WEEKEND_OPTIONS.includes(idealWeekend)) {
    errors.push({
      field: 'idealWeekend',
      message: 'Invalid ideal weekend selection',
      code: 'INVALID_VALUE'
    })
  }
  
  return errors
}

// ==============================================
// COMPREHENSIVE VALIDATION
// ==============================================

export function validateProfileForm(formData: UserFormData): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []

  // Basic Information
  errors.push(...validateFirstName(formData.firstName))
  errors.push(...validateLastName(formData.lastName))
  errors.push(...validateAge(formData.age))
  errors.push(...validateGender(formData.gender))
  errors.push(...validateGenderPreference(formData.genderPreference))
  errors.push(...validateCity(formData.city))
  errors.push(...validateNationality(formData.nationality))

  // Medical Background
  errors.push(...validateSpecialties(formData.specialties))
  // Note: specialtyPreference is not in UserFormData interface, skipping validation
  errors.push(...validateCareerStage(formData.careerStage))

  // Sports & Activities
  errors.push(...validateSports(formData.sports))
  errors.push(...validateActivityLevel(formData.activityLevel))

  // Entertainment
  // Note: musicGenres is not in UserFormData interface, skipping validation
  // Note: movieGenres is not in UserFormData interface, skipping validation
  // Note: otherInterests is not in UserFormData interface, skipping validation

  // Social Preferences
  // Note: meetingActivities is not in UserFormData interface, skipping validation
  errors.push(...validateSocialEnergyLevel(formData.socialEnergy))
  errors.push(...validateConversationStyle(formData.conversationStyle))

  // Availability
  // Note: preferredTimes is not in UserFormData interface, skipping validation
  errors.push(...validateMeetingFrequency(formData.meetingFrequency))

  // Lifestyle
  // Note: dietaryPreferences is not in UserFormData interface, skipping validation
  errors.push(...validateLifeStage(formData.lifeStage))
  if (Array.isArray(formData.lookingFor)) {
    errors.push(...validateLookingFor(formData.lookingFor))
  }
  // Note: idealWeekend is not in UserFormData interface, skipping validation

  // Add warnings for incomplete users
  if (!formData.age) {
    warnings.push({
      field: 'age',
      message: 'Adding your age helps with age-based compatibility matching',
      code: 'RECOMMENDED'
    })
  }

  if (!formData.nationality) {
    warnings.push({
      field: 'nationality',
      message: 'Nationality helps with premium filtering features',
      code: 'RECOMMENDED'
    })
  }

  // Note: specialtyPreference is not in UserFormData interface, skipping validation

  if (!formData.careerStage) {
    warnings.push({
      field: 'careerStage',
      message: 'Career stage helps match you with peers at similar levels',
      code: 'RECOMMENDED'
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// ==============================================
// STEP-BY-STEP VALIDATION
// ==============================================

export function validateProfileStep(step: number, formData: UserFormData): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []

  switch (step) {
    case 1: // Basic Information
      errors.push(...validateFirstName(formData.firstName))
      errors.push(...validateLastName(formData.lastName))
      errors.push(...validateAge(formData.age))
      errors.push(...validateGender(formData.gender))
      errors.push(...validateGenderPreference(formData.genderPreference))
      errors.push(...validateCity(formData.city))
      errors.push(...validateNationality(formData.nationality))
      
      if (!formData.age) {
        warnings.push({
          field: 'age',
          message: 'Adding your age helps with age-based compatibility matching',
          code: 'RECOMMENDED'
        })
      }
      break

    case 2: // Medical Background
      errors.push(...validateSpecialties(formData.specialties))
      // Note: specialtyPreference is not in UserFormData interface, skipping validation
      errors.push(...validateCareerStage(formData.careerStage))
      
      // Note: specialtyPreference is not in UserFormData interface, skipping validation
      if (!formData.careerStage) {
        warnings.push({
          field: 'careerStage',
          message: 'Career stage helps match you with peers at similar levels',
          code: 'RECOMMENDED'
        })
      }
      break

    case 3: // Sports & Activities
      errors.push(...validateSports(formData.sports))
      errors.push(...validateActivityLevel(formData.activityLevel))
      break

    case 4: // Entertainment
      // Note: musicGenres is not in UserFormData interface, skipping validation
      // Note: movieGenres is not in UserFormData interface, skipping validation
      // Note: otherInterests is not in UserFormData interface, skipping validation
      break

    case 5: // Social Preferences
      // Note: meetingActivities is not in UserFormData interface, skipping validation
      errors.push(...validateSocialEnergyLevel(formData.socialEnergy))
      errors.push(...validateConversationStyle(formData.conversationStyle))
      break

    case 6: // Availability
      // Note: preferredTimes is not in UserFormData interface, skipping validation
      errors.push(...validateMeetingFrequency(formData.meetingFrequency))
      break

    case 7: // Lifestyle
      // Note: dietaryPreferences is not in UserFormData interface, skipping validation
      errors.push(...validateLifeStage(formData.lifeStage))
      if (Array.isArray(formData.lookingFor)) {
        errors.push(...validateLookingFor(formData.lookingFor))
      }
      // Note: idealWeekend is not in UserFormData interface, skipping validation
      break

    case 8: { // Review
      // Final validation - check all required fields
      const fullValidation = validateProfileForm(formData)
      errors.push(...fullValidation.errors)
      warnings.push(...fullValidation.warnings)
      break
    }

    default:
      break
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

export function getFieldErrorMessage(field: string, errors: ValidationError[]): string {
  const fieldError = errors.find(error => error.field === field)
  return fieldError ? fieldError.message : ''
}

export function hasFieldError(field: string, errors: ValidationError[]): boolean {
  return errors.some(error => error.field === field)
}

export function getFieldWarningMessage(field: string, warnings: ValidationError[]): string {
  const fieldWarning = warnings.find(warning => warning.field === field)
  return fieldWarning ? fieldWarning.message : ''
}

export function hasFieldWarning(field: string, warnings: ValidationError[]): boolean {
  return warnings.some(warning => warning.field === field)
}

export function calculateProfileCompletion(formData: UserFormData): number {
  const fields = [
    formData.firstName,
    formData.lastName,
    formData.age,
    formData.gender,
    formData.genderPreference,
    formData.city,
    formData.nationality,
    formData.specialties?.length,
    // formData.specialtyPreference, // Not in UserFormData interface
    formData.careerStage,
    formData.sports?.length,
    formData.activityLevel,
    // formData.musicGenres?.length, // Not in UserFormData interface
    // formData.movieGenres?.length, // Not in UserFormData interface
    // formData.otherInterests?.length, // Not in UserFormData interface
    // formData.meetingActivities?.length, // Not in UserFormData interface
    formData.socialEnergy,
    formData.conversationStyle,
    // formData.preferredTimes?.length, // Not in UserFormData interface
    formData.meetingFrequency,
    // formData.dietaryPreferences, // Not in UserFormData interface
    formData.lifeStage,
    formData.lookingFor?.length,
    // formData.idealWeekend // Not in UserFormData interface
  ]

  const filledFields = fields.filter(field => field && (typeof field === 'number' ? field > 0 : true)).length
  return Math.round((filledFields / fields.length) * 100)
}
