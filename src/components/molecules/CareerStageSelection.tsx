'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { GraduationCap, Briefcase, Star, AlertCircle, Info } from 'lucide-react'

// Comprehensive career stages with descriptions and requirements
const CAREER_STAGES = {
  'medical_student': {
    label: 'Medical Student',
    description: 'Currently enrolled in medical school',
    icon: GraduationCap,
    requirements: ['Enrolled in accredited medical school', 'Valid student ID'],
    matchingWeight: 1.0,
    experienceLevel: 'Entry Level'
  },
  'resident_1_2': {
    label: 'Resident (PGY-1 to PGY-2)',
    description: 'First or second year resident physician',
    icon: Briefcase,
    requirements: ['Valid medical license', 'Residency program enrollment'],
    matchingWeight: 1.2,
    experienceLevel: 'Junior Level'
  },
  'resident_3_plus': {
    label: 'Resident (PGY-3+)',
    description: 'Third year or higher resident physician',
    icon: Briefcase,
    requirements: ['Valid medical license', 'Advanced residency training'],
    matchingWeight: 1.4,
    experienceLevel: 'Mid Level'
  },
  'fellow': {
    label: 'Fellow',
    description: 'Completing subspecialty fellowship training',
    icon: Star,
    requirements: ['Completed residency', 'Fellowship program enrollment'],
    matchingWeight: 1.6,
    experienceLevel: 'Senior Level'
  },
  'attending_0_5': {
    label: 'Attending/Consultant (0-5 years)',
    description: 'Recently graduated attending physician',
    icon: Star,
    requirements: ['Board certification', 'Medical license', 'Hospital privileges'],
    matchingWeight: 1.8,
    experienceLevel: 'Expert Level'
  },
  'attending_5_plus': {
    label: 'Attending/Consultant (5+ years)',
    description: 'Experienced attending physician',
    icon: Star,
    requirements: ['Board certification', 'Medical license', 'Hospital privileges'],
    matchingWeight: 2.0,
    experienceLevel: 'Expert Level'
  },
  'private_practice': {
    label: 'Private Practice',
    description: 'Physician in private practice setting',
    icon: Briefcase,
    requirements: ['Medical license', 'Practice ownership/partnership'],
    matchingWeight: 1.9,
    experienceLevel: 'Expert Level'
  },
  'academic_medicine': {
    label: 'Academic Medicine',
    description: 'Physician in academic/research setting',
    icon: GraduationCap,
    requirements: ['Medical license', 'Academic appointment', 'Research credentials'],
    matchingWeight: 1.7,
    experienceLevel: 'Expert Level'
  },
  'other': {
    label: 'Other',
    description: 'Other medical career path or non-traditional role',
    icon: Briefcase,
    requirements: ['Medical degree', 'Relevant professional experience'],
    matchingWeight: 1.0,
    experienceLevel: 'Variable'
  }
}

interface CareerStageSelectionProps {
  selectedStage: string
  onStageChange: (stage: string) => void
  error?: string
  showRequirements?: boolean
}

export default function CareerStageSelection({ 
  selectedStage, 
  onStageChange, 
  error,
  showRequirements = true 
}: CareerStageSelectionProps) {
  const [showDetails, setShowDetails] = useState<string | null>(null)

  const toggleDetails = (stage: string) => {
    setShowDetails(showDetails === stage ? null : stage)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <GraduationCap className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Career Stage</h3>
        <Badge variant="outline" className="ml-auto">
          {CAREER_STAGES[selectedStage as keyof typeof CAREER_STAGES]?.experienceLevel || 'Not Selected'}
        </Badge>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Career Stage Selection */}
      <RadioGroup value={selectedStage} onValueChange={onStageChange}>
        <div className="space-y-4">
          {Object.entries(CAREER_STAGES).map(([key, stage]) => {
            const IconComponent = stage.icon
            const isSelected = selectedStage === key
            const isDetailsOpen = showDetails === key
            
            return (
              <Card 
                key={key} 
                className={`border transition-all duration-200 ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <CardHeader 
                  className="pb-2 cursor-pointer"
                  onClick={() => toggleDetails(key)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value={key} id={key} />
                      <div className="flex items-center space-x-2">
                        <IconComponent className="h-5 w-5 text-gray-600" />
                        <div>
                          <Label htmlFor={key} className="text-base font-medium cursor-pointer">
                            {stage.label}
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">
                            {stage.description}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {stage.experienceLevel}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleDetails(key)
                        }}
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {isDetailsOpen && (
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {/* Matching Weight */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium">Matching Priority:</span>
                        <Badge variant="secondary">
                          {stage.matchingWeight}x weight
                        </Badge>
                      </div>
                      
                      {/* Requirements */}
                      {showRequirements && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Typical Requirements:
                          </h4>
                          <ul className="space-y-1">
                            {stage.requirements.map((requirement, index) => (
                              <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                <span>{requirement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Additional Info */}
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Note:</strong> This information helps us match you with 
                          professionals at similar career stages for more relevant connections.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      </RadioGroup>

      {/* Selection Summary */}
      {selectedStage && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Selected:</strong> {CAREER_STAGES[selectedStage as keyof typeof CAREER_STAGES]?.label}
            <br />
            <strong>Experience Level:</strong> {CAREER_STAGES[selectedStage as keyof typeof CAREER_STAGES]?.experienceLevel}
            <br />
            <strong>Matching Weight:</strong> {CAREER_STAGES[selectedStage as keyof typeof CAREER_STAGES]?.matchingWeight}x priority
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
