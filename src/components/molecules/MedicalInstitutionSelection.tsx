'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { GraduationCap, Plus, X, Search, AlertCircle, MapPin, Building } from 'lucide-react'

// Import medical institutions data from separate file for better performance
import { MEDICAL_INSTITUTIONS, COUNTRIES } from '@/lib/data/medical-institutions'

const INSTITUTION_TYPES = [
  'Medical School',
  'Teaching Hospital',
  'Research Institution',
  'Private Practice',
  'Government Hospital',
  'Community Hospital',
  'Specialty Clinic',
  'Other'
]

export interface InstitutionData {
  name: string
  country: string
  type: string
  city: string
  state?: string
  graduationYear?: string
  degree?: string
}

interface MedicalInstitutionSelectionProps {
  institutions: InstitutionData[]
  onInstitutionsChange: (institutions: InstitutionData[]) => void
  error?: string
  maxInstitutions?: number
}

export default function MedicalInstitutionSelection({ 
  institutions, 
  onInstitutionsChange, 
  error,
  maxInstitutions = 3 
}: MedicalInstitutionSelectionProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newInstitution, setNewInstitution] = useState<Partial<InstitutionData>>({
    name: '',
    country: '',
    type: '',
    city: '',
    state: '',
    graduationYear: '',
    degree: ''
  })

  const addInstitution = () => {
    if (newInstitution.name && newInstitution.country && newInstitution.type && newInstitution.city) {
      if (institutions.length < maxInstitutions) {
        onInstitutionsChange([...institutions, newInstitution as InstitutionData])
        setNewInstitution({
          name: '',
          country: '',
          type: '',
          city: '',
          state: '',
          graduationYear: '',
          degree: ''
        })
        setShowAddForm(false)
      }
    }
  }

  const removeInstitution = (index: number) => {
    onInstitutionsChange(institutions.filter((_, i) => i !== index))
  }

  const filteredInstitutions = (country: string) => {
    const countryInstitutions = MEDICAL_INSTITUTIONS[country as keyof typeof MEDICAL_INSTITUTIONS] || []
    if (!searchTerm) return countryInstitutions
    return countryInstitutions.filter(inst => 
      inst.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const getFilteredCountries = () => {
    if (!searchTerm) return COUNTRIES
    return COUNTRIES.filter(country => 
      country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      MEDICAL_INSTITUTIONS[country as keyof typeof MEDICAL_INSTITUTIONS]?.some(inst => 
        inst.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <GraduationCap className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Medical Institutions</h3>
        <Badge variant="outline" className="ml-auto">
          {institutions.length}/{maxInstitutions} added
        </Badge>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search institutions or countries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Current Institutions */}
      {institutions.length > 0 && (
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Your Institutions:
          </Label>
          <div className="space-y-2">
            {institutions.map((institution, index) => (
              <Card key={index} className="border border-gray-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Building className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{institution.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {institution.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{institution.city}{institution.state && `, ${institution.state}`}</span>
                        </div>
                        <span>{institution.country}</span>
                        {institution.graduationYear && (
                          <span>Graduated: {institution.graduationYear}</span>
                        )}
                        {institution.degree && (
                          <span>{institution.degree}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      onClick={() => removeInstitution(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
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

      {/* Add Institution Button */}
      {institutions.length < maxInstitutions && (
        <Button
          variant="outline"
          onClick={() => setShowAddForm(true)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Medical Institution
        </Button>
      )}

      {/* Add Institution Form */}
      {showAddForm && (
        <Card className="border border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-base">Add New Institution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="institution-name">Institution Name *</Label>
                <Input
                  id="institution-name"
                  value={newInstitution.name}
                  onChange={(e) => setNewInstitution(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter institution name"
                />
              </div>
              
              <div>
                <Label htmlFor="institution-country">Country *</Label>
                <Select value={newInstitution.country} onValueChange={(value) => setNewInstitution(prev => ({ ...prev, country: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {getFilteredCountries().map(country => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="institution-type">Institution Type *</Label>
                <Select value={newInstitution.type} onValueChange={(value) => setNewInstitution(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {INSTITUTION_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="institution-city">City *</Label>
                <Input
                  id="institution-city"
                  value={newInstitution.city}
                  onChange={(e) => setNewInstitution(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Enter city"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="institution-state">State/Province</Label>
                <Input
                  id="institution-state"
                  value={newInstitution.state}
                  onChange={(e) => setNewInstitution(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="Enter state/province"
                />
              </div>
              
              <div>
                <Label htmlFor="graduation-year">Graduation Year</Label>
                <Input
                  id="graduation-year"
                  type="number"
                  value={newInstitution.graduationYear}
                  onChange={(e) => setNewInstitution(prev => ({ ...prev, graduationYear: e.target.value }))}
                  placeholder="YYYY"
                  min="1950"
                  max="2030"
                />
              </div>
              
              <div>
                <Label htmlFor="degree">Degree</Label>
                <Input
                  id="degree"
                  value={newInstitution.degree}
                  onChange={(e) => setNewInstitution(prev => ({ ...prev, degree: e.target.value }))}
                  placeholder="e.g., MD, MBBS, DO"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={addInstitution} disabled={!newInstitution.name || !newInstitution.country || !newInstitution.type || !newInstitution.city}>
                Add Institution
              </Button>
              <Button variant="outline" onClick={() => {
                setShowAddForm(false)
                setNewInstitution({
                  name: '',
                  country: '',
                  type: '',
                  city: '',
                  state: '',
                  graduationYear: '',
                  degree: ''
                })
              }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Add from List */}
      {institutions.length < maxInstitutions && (
        <div className="space-y-4">
          <Separator />
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Quick Add from Popular Institutions:
            </Label>
            <div className="space-y-2">
              {getFilteredCountries().slice(0, 3).map(country => (
                <div key={country}>
                  <h4 className="text-sm font-medium text-gray-600 mb-1">{country}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                    {filteredInstitutions(country).slice(0, 4).map(institution => (
                      <Button
                        key={institution}
                        variant="ghost"
                        size="sm"
                        className="justify-start text-left h-auto p-2"
                        onClick={() => {
                          const newInst: InstitutionData = {
                            name: institution,
                            country: country,
                            type: 'Medical School',
                            city: 'Unknown',
                            state: '',
                            graduationYear: '',
                            degree: ''
                          }
                          if (institutions.length < maxInstitutions) {
                            onInstitutionsChange([...institutions, newInst])
                          }
                        }}
                        disabled={institutions.length >= maxInstitutions}
                      >
                        <GraduationCap className="h-3 w-3 mr-2" />
                        <span className="text-xs">{institution}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Limit Warning */}
      {institutions.length >= maxInstitutions && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You've reached the maximum of {maxInstitutions} institution entries. 
            Remove an institution to add another.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}


