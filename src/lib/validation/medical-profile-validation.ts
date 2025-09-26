'use client'

import { type UserFormData, type InstitutionData } from '@/lib/types/database'

export interface ValidationError {
  field: string
  message: string
  severity: 'error' | 'warning' | 'info'
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  suggestions: ValidationError[]
}

// Medical specialty validation
export const validateMedicalSpecialties = (specialties: string[]): ValidationError[] => {
  const errors: ValidationError[] = []
  
  if (specialties.length === 0) {
    errors.push({
      field: 'specialties',
      message: 'At least one medical specialty is required',
      severity: 'error'
    })
  }
  
  if (specialties.length > 5) {
    errors.push({
      field: 'specialties',
      message: 'Maximum 5 specialties allowed',
      severity: 'error'
    })
  }
  
  // Check for duplicate specialties
  const duplicates = specialties.filter((item, index) => specialties.indexOf(item) !== index)
  if (duplicates.length > 0) {
    errors.push({
      field: 'specialties',
      message: `Duplicate specialties found: ${duplicates.join(', ')}`,
      severity: 'warning'
    })
  }
  
  return errors
}

// Career stage validation
export const validateCareerStage = (careerStage: string | undefined): ValidationError[] => {
  const errors: ValidationError[] = []
  
  if (!careerStage) {
    errors.push({
      field: 'careerStage',
      message: 'Career stage is required',
      severity: 'error'
    })
    return errors
  }
  
  const validStages = [
    'medical_student',
    'resident_1_2',
    'resident_3_plus',
    'fellow',
    'attending_0_5',
    'attending_5_plus',
    'private_practice',
    'academic_medicine',
    'other'
  ]
  
  if (!validStages.includes(careerStage)) {
    errors.push({
      field: 'careerStage',
      message: 'Invalid career stage selected',
      severity: 'error'
    })
  }
  
  return errors
}

// Institution validation
export const validateInstitutions = (institutions: InstitutionData[]): ValidationError[] => {
  const errors: ValidationError[] = []
  
  if (institutions.length > 3) {
    errors.push({
      field: 'institutions',
      message: 'Maximum 3 institutions allowed',
      severity: 'error'
    })
  }
  
  institutions.forEach((institution, index) => {
    if (!institution.name.trim()) {
      errors.push({
        field: `institutions[${index}].name`,
        message: 'Institution name is required',
        severity: 'error'
      })
    }
    
    if (!institution.country.trim()) {
      errors.push({
        field: `institutions[${index}].country`,
        message: 'Country is required',
        severity: 'error'
      })
    }
    
    if (!institution.type.trim()) {
      errors.push({
        field: `institutions[${index}].type`,
        message: 'Institution type is required',
        severity: 'error'
      })
    }
    
    if (!institution.city.trim()) {
      errors.push({
        field: `institutions[${index}].city`,
        message: 'City is required',
        severity: 'error'
      })
    }
    
    // Validate graduation year if provided
    if (institution.graduationYear) {
      const year = parseInt(institution.graduationYear)
      const currentYear = new Date().getFullYear()
      
      if (isNaN(year) || year < 1950 || year > currentYear + 10) {
        errors.push({
          field: `institutions[${index}].graduationYear`,
          message: 'Invalid graduation year',
          severity: 'error'
        })
      }
    }
    
    // Validate degree if provided
    if (institution.degree) {
      const validDegrees = ['MD', 'MBBS', 'DO', 'DDS', 'DMD', 'PhD', 'MSc', 'BSc', 'Other']
      const degreeMatch = validDegrees.some(degree => 
        institution.degree?.toUpperCase().includes(degree.toUpperCase())
      )
      
      if (!degreeMatch) {
        errors.push({
          field: `institutions[${index}].degree`,
          message: 'Please use standard medical degree abbreviations (MD, MBBS, DO, etc.)',
          severity: 'warning'
        })
      }
    }
  })
  
  // Check for duplicate institutions
  const institutionNames = institutions.map(inst => inst.name.toLowerCase().trim())
  const duplicates = institutionNames.filter((name, index) => institutionNames.indexOf(name) !== index)
  
  if (duplicates.length > 0) {
    errors.push({
      field: 'institutions',
      message: 'Duplicate institutions detected',
      severity: 'warning'
    })
  }
  
  return errors
}

// Specialty preference validation
export const validateSpecialtyPreference = (preference: string | undefined): ValidationError[] => {
  const errors: ValidationError[] = []
  
  if (!preference) {
    errors.push({
      field: 'specialtyPreference',
      message: 'Specialty preference is required',
      severity: 'error'
    })
    return errors
  }
  
  const validPreferences = [
    'same_specialty',
    'different_specialties',
    'no_preference'
  ]
  
  if (!validPreferences.includes(preference)) {
    errors.push({
      field: 'specialtyPreference',
      message: 'Invalid specialty preference selected',
      severity: 'error'
    })
  }
  
  return errors
}

// Comprehensive medical profile validation
export const validateMedicalProfile = (formData: UserFormData): ValidationResult => {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []
  const suggestions: ValidationError[] = []
  
  // Validate specialties
  const specialtyErrors = validateMedicalSpecialties(formData.specialties)
  errors.push(...specialtyErrors.filter(e => e.severity === 'error'))
  warnings.push(...specialtyErrors.filter(e => e.severity === 'warning'))
  
  // Validate career stage
  const careerErrors = validateCareerStage(formData.careerStage)
  errors.push(...careerErrors.filter(e => e.severity === 'error'))
  warnings.push(...careerErrors.filter(e => e.severity === 'warning'))
  
  // Validate institutions
  const institutionErrors = validateInstitutions(formData.institutions || [])
  errors.push(...institutionErrors.filter(e => e.severity === 'error'))
  warnings.push(...institutionErrors.filter(e => e.severity === 'warning'))
  
  // Validate specialty preference
  const preferenceErrors = validateSpecialtyPreference(formData.specialtyPreference)
  errors.push(...preferenceErrors.filter(e => e.severity === 'error'))
  warnings.push(...preferenceErrors.filter(e => e.severity === 'warning'))
  
  // Cross-field validation
  if (formData.specialties.length > 0 && formData.careerStage) {
    // Check for logical consistency between specialties and career stage
    const trainingSpecialties = ['Medical Student', 'Resident (PGY-1)', 'Resident (PGY-2)', 'Resident (PGY-3)', 'Resident (PGY-4+)']
    const attendingSpecialties = ['Attending Physician', 'Consultant', 'Private Practice', 'Academic Medicine']
    
    const hasTrainingSpecialty = formData.specialties.some(s => trainingSpecialties.includes(s))
    const hasAttendingSpecialty = formData.specialties.some(s => attendingSpecialties.includes(s))
    
    if (hasTrainingSpecialty && hasAttendingSpecialty) {
      warnings.push({
        field: 'specialties',
        message: 'Mixing training and attending-level specialties may cause confusion',
        severity: 'warning'
      })
    }
    
    // Check career stage consistency
    if (formData.careerStage === 'medical_student' && hasAttendingSpecialty) {
      warnings.push({
        field: 'careerStage',
        message: 'Medical students typically don\'t have attending-level specialties',
        severity: 'warning'
      })
    }
  }
  
  // Institution consistency checks
  if (formData.institutions && formData.institutions.length > 0) {
    const hasMedicalSchool = formData.institutions.some(inst => 
      inst.type === 'Medical School' || inst.name.toLowerCase().includes('medical school')
    )
    
    if (formData.careerStage && formData.careerStage !== 'medical_student' && !hasMedicalSchool) {
      suggestions.push({
        field: 'institutions',
        message: 'Consider adding your medical school to complete your educational background',
        severity: 'info'
      })
    }
  }
  
  // User completeness suggestions
  if (!formData.institutions || formData.institutions.length === 0) {
    suggestions.push({
      field: 'institutions',
      message: 'Adding your medical institutions helps with better matching',
      severity: 'info'
    })
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  }
}

// Step-specific validation
export const validateStep = (step: number, formData: UserFormData): ValidationResult => {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []
  const suggestions: ValidationError[] = []
  
  switch (step) {
    case 2: // Medical Specialties
      const specialtyErrors = validateMedicalSpecialties(formData.specialties)
      errors.push(...specialtyErrors.filter(e => e.severity === 'error'))
      warnings.push(...specialtyErrors.filter(e => e.severity === 'warning'))
      break
      
    case 3: // Career Stage
      const careerErrors = validateCareerStage(formData.careerStage)
      errors.push(...careerErrors.filter(e => e.severity === 'error'))
      warnings.push(...careerErrors.filter(e => e.severity === 'warning'))
      break
      
    case 4: // Medical Institutions
      const institutionErrors = validateInstitutions(formData.institutions || [])
      errors.push(...institutionErrors.filter(e => e.severity === 'error'))
      warnings.push(...institutionErrors.filter(e => e.severity === 'warning'))
      suggestions.push(...institutionErrors.filter(e => e.severity === 'info'))
      break
      
    default:
      break
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  }
}