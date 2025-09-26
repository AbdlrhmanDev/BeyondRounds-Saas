'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Stethoscope, Search, Plus, X, AlertCircle } from 'lucide-react'

// Comprehensive medical specialties organized by category
const MEDICAL_SPECIALTY_CATEGORIES = {
  'Primary Care': [
    'General Practice/Family Medicine',
    'Internal Medicine',
    'Pediatrics',
    'Geriatrics',
    'Preventive Medicine',
    'Occupational Medicine'
  ],
  'Surgical Specialties': [
    'General Surgery',
    'Cardiothoracic Surgery',
    'Neurosurgery',
    'Orthopedic Surgery',
    'Plastic Surgery',
    'Urological Surgery',
    'Vascular Surgery',
    'Colorectal Surgery',
    'Trauma Surgery',
    'Minimally Invasive Surgery'
  ],
  'Medical Specialties': [
    'Cardiology',
    'Endocrinology',
    'Gastroenterology',
    'Hematology',
    'Infectious Diseases',
    'Nephrology',
    'Oncology',
    'Pulmonology',
    'Rheumatology',
    'Allergy & Immunology'
  ],
  'Diagnostic & Imaging': [
    'Radiology',
    'Nuclear Medicine',
    'Pathology',
    'Laboratory Medicine',
    'Clinical Chemistry',
    'Microbiology',
    'Cytopathology'
  ],
  'Emergency & Critical Care': [
    'Emergency Medicine',
    'Critical Care Medicine',
    'Anesthesiology',
    'Pain Medicine',
    'Intensive Care Medicine'
  ],
  'Mental Health': [
    'Psychiatry',
    'Child & Adolescent Psychiatry',
    'Geriatric Psychiatry',
    'Addiction Psychiatry',
    'Forensic Psychiatry',
    'Psychosomatic Medicine'
  ],
  'Specialized Medicine': [
    'Dermatology',
    'Neurology',
    'Ophthalmology',
    'Otolaryngology (ENT)',
    'Physical Medicine & Rehabilitation',
    'Sports Medicine',
    'Travel Medicine'
  ],
  'Women\'s Health': [
    'Obstetrics & Gynecology',
    'Maternal-Fetal Medicine',
    'Reproductive Endocrinology',
    'Gynecologic Oncology',
    'Urogynecology'
  ],
  'Training Levels': [
    'Medical Student',
    'Resident (PGY-1)',
    'Resident (PGY-2)',
    'Resident (PGY-3)',
    'Resident (PGY-4+)',
    'Fellow',
    'Attending Physician',
    'Consultant'
  ],
  'Academic & Research': [
    'Medical Education',
    'Clinical Research',
    'Medical Informatics',
    'Public Health',
    'Epidemiology',
    'Health Policy',
    'Medical Ethics'
  ],
  'Other Specialties': [
    'Aerospace Medicine',
    'Forensic Medicine',
    'Medical Genetics',
    'Sleep Medicine',
    'Undersea Medicine',
    'Other'
  ]
}

interface SpecialtySelectionProps {
  selectedSpecialties: string[]
  onSpecialtiesChange: (specialties: string[]) => void
  selectedPreferences?: string[]
  onPreferencesChange?: (preferences: string[]) => void
  error?: string
  maxSelections?: number
  maxPreferences?: number
}

export default function SpecialtySelection({ 
  selectedSpecialties, 
  onSpecialtiesChange, 
  selectedPreferences = [],
  onPreferencesChange,
  error,
  maxSelections = 10,
  maxPreferences = 8
}: SpecialtySelectionProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Primary Care', 'Medical Specialties'])
  const [customSpecialty, setCustomSpecialty] = useState('')

  // Specialty preferences for groups
  const SPECIALTY_PREFERENCES = [
    'Same specialty preferred',
    'Different specialties preferred',
    'No preference',
    'General Practice/Family Medicine preferred',
    'Internal Medicine preferred',
    'Surgery specialties preferred',
    'Pediatrics preferred',
    'Psychiatry preferred',
    'Emergency Medicine preferred',
    'Radiology/Imaging preferred',
    'Medical students/residents preferred',
    'Senior consultants preferred',
    'Academic medicine preferred',
    'Private practice preferred',
    'Hospital-based preferred',
    'Community medicine preferred',
  ]

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const toggleSpecialty = (specialty: string) => {
    if (selectedSpecialties.includes(specialty)) {
      onSpecialtiesChange(selectedSpecialties.filter(s => s !== specialty))
    } else if (selectedSpecialties.length < maxSelections) {
      onSpecialtiesChange([...selectedSpecialties, specialty])
    }
  }

  const addCustomSpecialty = () => {
    if (customSpecialty.trim() && !selectedSpecialties.includes(customSpecialty.trim())) {
      if (selectedSpecialties.length < maxSelections) {
        onSpecialtiesChange([...selectedSpecialties, customSpecialty.trim()])
        setCustomSpecialty('')
      }
    }
  }

  const removeSpecialty = (specialty: string) => {
    onSpecialtiesChange(selectedSpecialties.filter(s => s !== specialty))
  }

  const filteredCategories = Object.entries(MEDICAL_SPECIALTY_CATEGORIES).filter(([category, specialties]) => {
    if (!searchTerm) return true
    return category.toLowerCase().includes(searchTerm.toLowerCase()) ||
           specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  })

  const filteredSpecialties = (specialties: string[]) => {
    if (!searchTerm) return specialties
    return specialties.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Stethoscope className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Medical Specialties</h3>
        <Badge variant="outline" className="ml-auto">
          {selectedSpecialties.length}/{maxSelections} selected
        </Badge>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search specialties or categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Selected Specialties */}
      {selectedSpecialties.length > 0 && (
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Selected Specialties:
          </Label>
          <div className="flex flex-wrap gap-2">
            {selectedSpecialties.map((specialty) => (
              <Badge 
                key={specialty} 
                variant="secondary" 
                className="flex items-center gap-1 pr-1"
              >
                {specialty}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-gray-300"
                  onClick={() => removeSpecialty(specialty)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Custom Specialty Input */}
      <div className="space-y-2">
        <Label htmlFor="custom-specialty">Add Custom Specialty</Label>
        <div className="flex gap-2">
          <Input
            id="custom-specialty"
            placeholder="Enter specialty not listed above..."
            value={customSpecialty}
            onChange={(e) => setCustomSpecialty(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomSpecialty()}
            disabled={selectedSpecialties.length >= maxSelections}
          />
          <Button 
            onClick={addCustomSpecialty}
            disabled={!customSpecialty.trim() || selectedSpecialties.length >= maxSelections}
            size="sm"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Separator />

      {/* Specialty Categories */}
      <div className="space-y-4">
        {filteredCategories.map(([category, specialties]) => {
          const isExpanded = expandedCategories.includes(category)
          const filteredSpecialtiesList = filteredSpecialties(specialties)
          
          return (
            <Card key={category} className="border border-gray-200">
              <CardHeader 
                className="pb-2 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleCategory(category)}
              >
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{category}</span>
                  <Badge variant="outline" className="text-xs">
                    {filteredSpecialtiesList.length} specialties
                  </Badge>
                </CardTitle>
              </CardHeader>
              
              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {filteredSpecialtiesList.map((specialty) => {
                      const isSelected = selectedSpecialties.includes(specialty)
                      const isDisabled = !isSelected && selectedSpecialties.length >= maxSelections
                      
                      return (
                        <div 
                          key={specialty} 
                          className={`flex items-center space-x-2 p-2 rounded-lg border transition-colors ${
                            isSelected 
                              ? 'bg-blue-50 border-blue-200' 
                              : isDisabled 
                                ? 'bg-gray-50 border-gray-200 opacity-50' 
                                : 'hover:bg-gray-50 border-gray-200'
                          }`}
                        >
                          <Checkbox
                            id={specialty}
                            checked={isSelected}
                            onCheckedChange={() => toggleSpecialty(specialty)}
                            disabled={isDisabled}
                          />
                          <Label 
                            htmlFor={specialty} 
                            className={`text-sm cursor-pointer flex-1 ${
                              isDisabled ? 'text-gray-400' : ''
                            }`}
                          >
                            {specialty}
                          </Label>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* Selection Limit Warning */}
      {selectedSpecialties.length >= maxSelections && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You've reached the maximum of {maxSelections} specialty selections. 
            Remove a specialty to add another.
          </AlertDescription>
        </Alert>
      )}

      {/* Specialty Preferences for Groups */}
      {onPreferencesChange && (
        <div className="space-y-4">
          <Separator />
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Specialty Preference for Groups</Label>
              <div className="text-sm text-gray-500">
                {selectedPreferences.length}/{maxPreferences} selected
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Select your preferences for group composition and networking
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {SPECIALTY_PREFERENCES.map((preference) => {
                const isSelected = selectedPreferences.includes(preference)
                const isDisabled = !isSelected && selectedPreferences.length >= maxPreferences
                
                return (
                  <div 
                    key={preference} 
                    className={`flex items-center space-x-2 p-2 rounded-lg border transition-colors ${
                      isSelected 
                        ? 'bg-green-50 border-green-200' 
                        : isDisabled 
                          ? 'bg-gray-50 border-gray-200 opacity-50' 
                          : 'hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <Checkbox
                      id={`pref-${preference}`}
                      checked={isSelected}
                      onCheckedChange={() => {
                        if (isSelected) {
                          onPreferencesChange(selectedPreferences.filter(p => p !== preference))
                        } else if (selectedPreferences.length < maxPreferences) {
                          onPreferencesChange([...selectedPreferences, preference])
                        }
                      }}
                      disabled={isDisabled}
                    />
                    <Label 
                      htmlFor={`pref-${preference}`} 
                      className={`text-sm cursor-pointer flex-1 ${
                        isDisabled ? 'text-gray-400' : ''
                      }`}
                    >
                      {preference}
                    </Label>
                  </div>
                )
              })}
            </div>
            
            {selectedPreferences.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedPreferences.map((preference) => (
                  <Badge key={preference} variant="outline" className="flex items-center gap-1">
                    {preference}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => onPreferencesChange(selectedPreferences.filter(p => p !== preference))}
                    />
                  </Badge>
                ))}
              </div>
            )}
            
            {selectedPreferences.length >= maxPreferences && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You've reached the maximum of {maxPreferences} specialty preferences. 
                  Remove a preference to add another.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
