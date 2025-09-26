'use client'

// Institution data interface
export interface InstitutionData {
  name: string
  country: string
  type: string
  city: string
  state: string
}

// Types for matching logic
export interface MedicalProfile {
  id: string
  specialties: string[]
  careerStage: string
  specialtyPreference: 'same_specialty' | 'different_specialties' | 'no_preference'
  institutions: InstitutionData[]
  city: string
  gender: string
  genderPreference: string
  age?: number
}

export interface CompatibilityScore {
  overall: number
  specialty: number
  career: number
  location: number
  institution: number
  demographics: number
  breakdown: {
    specialtyMatch: number
    careerStageCompatibility: number
    locationProximity: number
    institutionOverlap: number
    demographicCompatibility: number
  }
}

export interface MatchingResult {
  user1: MedicalProfile
  user2: MedicalProfile
  compatibility: CompatibilityScore
  matchReasons: string[]
  potentialIssues: string[]
}

// Specialty compatibility matrix
const SPECIALTY_COMPATIBILITY = {
  // High compatibility (same field)
  'Internal Medicine': ['Cardiology', 'Endocrinology', 'Gastroenterology', 'Hematology', 'Infectious Diseases', 'Nephrology', 'Oncology', 'Pulmonology', 'Rheumatology'],
  'Surgery': ['General Surgery', 'Cardiothoracic Surgery', 'Neurosurgery', 'Orthopedic Surgery', 'Plastic Surgery', 'Urological Surgery', 'Vascular Surgery'],
  'Emergency Medicine': ['Critical Care Medicine', 'Anesthesiology', 'Trauma Surgery'],
  'Pediatrics': ['Pediatric Cardiology', 'Pediatric Surgery', 'Child & Adolescent Psychiatry'],
  'Psychiatry': ['Child & Adolescent Psychiatry', 'Geriatric Psychiatry', 'Addiction Psychiatry'],
  
  // Medium compatibility (related fields)
  'Cardiology': ['Cardiothoracic Surgery', 'Emergency Medicine', 'Internal Medicine'],
  'Neurology': ['Neurosurgery', 'Psychiatry', 'Emergency Medicine'],
  'Oncology': ['Hematology', 'Internal Medicine', 'Radiology', 'Pathology'],
  'Radiology': ['Pathology', 'Oncology', 'Emergency Medicine'],
  'Anesthesiology': ['Critical Care Medicine', 'Emergency Medicine', 'Pain Medicine'],
  
  // Cross-specialty compatibility
  'Medical Student': ['Resident (PGY-1 to PGY-2)', 'Resident (PGY-3+)', 'Fellow'],
  'Resident (PGY-1 to PGY-2)': ['Medical Student', 'Resident (PGY-3+)', 'Fellow'],
  'Resident (PGY-3+)': ['Medical Student', 'Resident (PGY-1 to PGY-2)', 'Fellow', 'Attending/Consultant (0-5 years)'],
  'Fellow': ['Resident (PGY-3+)', 'Attending/Consultant (0-5 years)', 'Attending/Consultant (5+ years)'],
  'Attending/Consultant (0-5 years)': ['Fellow', 'Attending/Consultant (5+ years)', 'Resident (PGY-3+)'],
  'Attending/Consultant (5+ years)': ['Attending/Consultant (0-5 years)', 'Private Practice', 'Academic Medicine'],
  'Private Practice': ['Academic Medicine', 'Attending/Consultant (5+ years)'],
  'Academic Medicine': ['Private Practice', 'Attending/Consultant (5+ years)', 'Fellow']
}

// Career stage compatibility weights
const CAREER_STAGE_WEIGHTS = {
  'medical_student': { 'medical_student': 1.0, 'resident_1_2': 0.8, 'resident_3_plus': 0.6, 'fellow': 0.4, 'attending_0_5': 0.2, 'attending_5_plus': 0.1 },
  'resident_1_2': { 'medical_student': 0.8, 'resident_1_2': 1.0, 'resident_3_plus': 0.9, 'fellow': 0.7, 'attending_0_5': 0.5, 'attending_5_plus': 0.3 },
  'resident_3_plus': { 'medical_student': 0.6, 'resident_1_2': 0.9, 'resident_3_plus': 1.0, 'fellow': 0.8, 'attending_0_5': 0.6, 'attending_5_plus': 0.4 },
  'fellow': { 'medical_student': 0.4, 'resident_1_2': 0.7, 'resident_3_plus': 0.8, 'fellow': 1.0, 'attending_0_5': 0.8, 'attending_5_plus': 0.6 },
  'attending_0_5': { 'medical_student': 0.2, 'resident_1_2': 0.5, 'resident_3_plus': 0.6, 'fellow': 0.8, 'attending_0_5': 1.0, 'attending_5_plus': 0.9 },
  'attending_5_plus': { 'medical_student': 0.1, 'resident_1_2': 0.3, 'resident_3_plus': 0.4, 'fellow': 0.6, 'attending_0_5': 0.9, 'attending_5_plus': 1.0 },
  'private_practice': { 'private_practice': 1.0, 'academic_medicine': 0.8, 'attending_5_plus': 0.9 },
  'academic_medicine': { 'private_practice': 0.8, 'academic_medicine': 1.0, 'attending_5_plus': 0.9 }
}

// Calculate specialty compatibility score
export const calculateSpecialtyCompatibility = (specialties1: string[], specialties2: string[]): number => {
  if (specialties1.length === 0 || specialties2.length === 0) return 0
  
  let totalScore = 0
  let comparisons = 0
  
  for (const specialty1 of specialties1) {
    for (const specialty2 of specialties2) {
      comparisons++
      
      // Exact match
      if (specialty1 === specialty2) {
        totalScore += 1.0
        continue
      }
      
      // Check compatibility matrix
      const compatibleSpecialties = SPECIALTY_COMPATIBILITY[specialty1 as keyof typeof SPECIALTY_COMPATIBILITY]
      if (compatibleSpecialties && compatibleSpecialties.includes(specialty2)) {
        totalScore += 0.7
        continue
      }
      
      // Check reverse compatibility
      const reverseCompatibleSpecialties = SPECIALTY_COMPATIBILITY[specialty2 as keyof typeof SPECIALTY_COMPATIBILITY]
      if (reverseCompatibleSpecialties && reverseCompatibleSpecialties.includes(specialty1)) {
        totalScore += 0.7
        continue
      }
      
      // Partial match (same category)
      const category1 = getSpecialtyCategory(specialty1)
      const category2 = getSpecialtyCategory(specialty2)
      if (category1 === category2) {
        totalScore += 0.4
        continue
      }
      
      // No match
      totalScore += 0.1
    }
  }
  
  return comparisons > 0 ? totalScore / comparisons : 0
}

// Get specialty category for grouping
const getSpecialtyCategory = (specialty: string): string => {
  const categories = {
    'Primary Care': ['General Practice/Family Medicine', 'Internal Medicine', 'Pediatrics', 'Geriatrics'],
    'Surgical': ['General Surgery', 'Cardiothoracic Surgery', 'Neurosurgery', 'Orthopedic Surgery', 'Plastic Surgery', 'Urological Surgery', 'Vascular Surgery'],
    'Medical': ['Cardiology', 'Endocrinology', 'Gastroenterology', 'Hematology', 'Infectious Diseases', 'Nephrology', 'Oncology', 'Pulmonology', 'Rheumatology'],
    'Diagnostic': ['Radiology', 'Nuclear Medicine', 'Pathology', 'Laboratory Medicine'],
    'Emergency': ['Emergency Medicine', 'Critical Care Medicine', 'Anesthesiology', 'Pain Medicine'],
    'Mental Health': ['Psychiatry', 'Child & Adolescent Psychiatry', 'Geriatric Psychiatry', 'Addiction Psychiatry'],
    'Specialized': ['Dermatology', 'Neurology', 'Ophthalmology', 'Otolaryngology (ENT)', 'Physical Medicine & Rehabilitation'],
    'Training': ['Medical Student', 'Resident (PGY-1 to PGY-2)', 'Resident (PGY-3+)', 'Fellow'],
    'Attending': ['Attending/Consultant (0-5 years)', 'Attending/Consultant (5+ years)', 'Private Practice', 'Academic Medicine']
  }
  
  for (const [category, specialties] of Object.entries(categories)) {
    if (specialties.includes(specialty)) {
      return category
    }
  }
  
  return 'Other'
}

// Calculate career stage compatibility
export const calculateCareerStageCompatibility = (stage1: string, stage2: string): number => {
  const weights = CAREER_STAGE_WEIGHTS[stage1 as keyof typeof CAREER_STAGE_WEIGHTS]
  return weights ? (weights[stage2 as keyof typeof weights] || 0.1) : 0.1
}

// Calculate location compatibility
export const calculateLocationCompatibility = (city1: string, city2: string): number => {
  if (city1.toLowerCase() === city2.toLowerCase()) return 1.0
  
  // For now, assume different cities have low compatibility
  // In a real implementation, you'd calculate distance
  return 0.3
}

// Calculate institution compatibility
export const calculateInstitutionCompatibility = (institutions1: InstitutionData[], institutions2: InstitutionData[]): number => {
  if (institutions1.length === 0 || institutions2.length === 0) return 0.5
  
  let totalScore = 0
  let comparisons = 0
  
  for (const inst1 of institutions1) {
    for (const inst2 of institutions2) {
      comparisons++
      
      // Same institution
      if (inst1.name.toLowerCase() === inst2.name.toLowerCase()) {
        totalScore += 1.0
        continue
      }
      
      // Same city
      if (inst1.city.toLowerCase() === inst2.city.toLowerCase()) {
        totalScore += 0.6
        continue
      }
      
      // Same country
      if (inst1.country.toLowerCase() === inst2.country.toLowerCase()) {
        totalScore += 0.3
        continue
      }
      
      // Different country
      totalScore += 0.1
    }
  }
  
  return comparisons > 0 ? totalScore / comparisons : 0
}

// Calculate demographic compatibility
export const calculateDemographicCompatibility = (profile1: MedicalProfile, profile2: MedicalProfile): number => {
  let score = 0.5 // Base score
  
  // Age compatibility (if both have age)
  if (profile1.age && profile2.age) {
    const ageDiff = Math.abs(profile1.age - profile2.age)
    if (ageDiff <= 5) score += 0.3
    else if (ageDiff <= 10) score += 0.2
    else if (ageDiff <= 15) score += 0.1
  }
  
  // Gender preference compatibility
  if (profile1.genderPreference === 'no_preference' || profile2.genderPreference === 'no_preference') {
    score += 0.2
  } else if (profile1.genderPreference === profile2.genderPreference) {
    score += 0.3
  }
  
  return Math.min(score, 1.0)
}

// Apply specialty preference weighting
export const applySpecialtyPreferenceWeighting = (
  specialtyScore: number, 
  preference1: string, 
  preference2: string,
  specialties1: string[],
  specialties2: string[]
): number => {
  const hasSameSpecialties = specialties1.some(s => specialties2.includes(s))
  const hasDifferentSpecialties = specialties1.some(s => !specialties2.includes(s))
  
  let multiplier = 1.0
  
  // Both prefer same specialty
  if (preference1 === 'same_specialty' && preference2 === 'same_specialty') {
    multiplier = hasSameSpecialties ? 1.3 : 0.7
  }
  
  // Both prefer different specialties
  else if (preference1 === 'different_specialties' && preference2 === 'different_specialties') {
    multiplier = hasDifferentSpecialties ? 1.3 : 0.7
  }
  
  // Mixed preferences
  else if (preference1 !== preference2) {
    multiplier = 1.0 // Neutral
  }
  
  // One prefers same, one prefers different
  else if ((preference1 === 'same_specialty' && preference2 === 'different_specialties') ||
           (preference1 === 'different_specialties' && preference2 === 'same_specialty')) {
    multiplier = 0.9 // Slight penalty
  }
  
  return specialtyScore * multiplier
}

// Main compatibility calculation
export const calculateCompatibility = (profile1: MedicalProfile, profile2: MedicalProfile): CompatibilityScore => {
  // Calculate individual scores
  const specialtyMatch = calculateSpecialtyCompatibility(profile1.specialties, profile2.specialties)
  const careerStageCompatibility = calculateCareerStageCompatibility(profile1.careerStage, profile2.careerStage)
  const locationProximity = calculateLocationCompatibility(profile1.city, profile2.city)
  const institutionOverlap = calculateInstitutionCompatibility(profile1.institutions, profile2.institutions)
  const demographicCompatibility = calculateDemographicCompatibility(profile1, profile2)
  
  // Apply specialty preference weighting
  const adjustedSpecialtyScore = applySpecialtyPreferenceWeighting(
    specialtyMatch,
    profile1.specialtyPreference,
    profile2.specialtyPreference,
    profile1.specialties,
    profile2.specialties
  )
  
  // Weighted overall score
  const overall = (
    adjustedSpecialtyScore * 0.35 +
    careerStageCompatibility * 0.25 +
    locationProximity * 0.20 +
    institutionOverlap * 0.10 +
    demographicCompatibility * 0.10
  )
  
  return {
    overall: Math.round(overall * 100) / 100,
    specialty: Math.round(adjustedSpecialtyScore * 100) / 100,
    career: Math.round(careerStageCompatibility * 100) / 100,
    location: Math.round(locationProximity * 100) / 100,
    institution: Math.round(institutionOverlap * 100) / 100,
    demographics: Math.round(demographicCompatibility * 100) / 100,
    breakdown: {
      specialtyMatch: Math.round(specialtyMatch * 100) / 100,
      careerStageCompatibility: Math.round(careerStageCompatibility * 100) / 100,
      locationProximity: Math.round(locationProximity * 100) / 100,
      institutionOverlap: Math.round(institutionOverlap * 100) / 100,
      demographicCompatibility: Math.round(demographicCompatibility * 100) / 100
    }
  }
}

// Generate match reasons and potential issues
export const generateMatchAnalysis = (profile1: MedicalProfile, profile2: MedicalProfile, compatibility: CompatibilityScore): {
  matchReasons: string[]
  potentialIssues: string[]
} => {
  const matchReasons: string[] = []
  const potentialIssues: string[] = []
  
  // Specialty analysis
  const commonSpecialties = profile1.specialties.filter(s => profile2.specialties.includes(s))
  if (commonSpecialties.length > 0) {
    matchReasons.push(`Shared specialties: ${commonSpecialties.join(', ')}`)
  }
  
  if (compatibility.specialty > 0.7) {
    matchReasons.push('High specialty compatibility')
  } else if (compatibility.specialty < 0.3) {
    potentialIssues.push('Low specialty compatibility')
  }
  
  // Career stage analysis
  if (compatibility.career > 0.8) {
    matchReasons.push('Similar career stages')
  } else if (compatibility.career < 0.4) {
    potentialIssues.push('Significant career stage difference')
  }
  
  // Location analysis
  if (profile1.city.toLowerCase() === profile2.city.toLowerCase()) {
    matchReasons.push('Same city - easy to meet')
  } else if (compatibility.location > 0.5) {
    matchReasons.push('Nearby locations')
  } else {
    potentialIssues.push('Different cities - may limit meeting frequency')
  }
  
  // Institution analysis
  const commonInstitutions = profile1.institutions.filter(inst1 => 
    profile2.institutions.some(inst2 => inst1.name.toLowerCase() === inst2.name.toLowerCase())
  )
  if (commonInstitutions.length > 0) {
    matchReasons.push(`Shared institutions: ${commonInstitutions.map(inst => inst.name).join(', ')}`)
  }
  
  // Overall compatibility
  if (compatibility.overall > 0.8) {
    matchReasons.push('Excellent overall compatibility')
  } else if (compatibility.overall < 0.5) {
    potentialIssues.push('Low overall compatibility')
  }
  
  return { matchReasons, potentialIssues }
}

// Main matching function
export const calculateMatch = (profile1: MedicalProfile, profile2: MedicalProfile): MatchingResult => {
  const compatibility = calculateCompatibility(profile1, profile2)
  const analysis = generateMatchAnalysis(profile1, profile2, compatibility)
  
  return {
    user1: profile1,
    user2: profile2,
    compatibility,
    matchReasons: analysis.matchReasons,
    potentialIssues: analysis.potentialIssues
  }
}
