'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Building2, Search, Plus, X, AlertCircle, MapPin } from 'lucide-react'

// Sample medical schools and institutions (in a real app, this would come from an API)
const MEDICAL_INSTITUTIONS = [
  // US Medical Schools
  { name: 'Harvard Medical School', country: 'United States', type: 'Medical School', city: 'Boston', state: 'MA' },
  { name: 'Johns Hopkins School of Medicine', country: 'United States', type: 'Medical School', city: 'Baltimore', state: 'MD' },
  { name: 'Stanford School of Medicine', country: 'United States', type: 'Medical School', city: 'Stanford', state: 'CA' },
  { name: 'Mayo Clinic Alix School of Medicine', country: 'United States', type: 'Medical School', city: 'Rochester', state: 'MN' },
  { name: 'University of California San Francisco', country: 'United States', type: 'Medical School', city: 'San Francisco', state: 'CA' },
  { name: 'Yale School of Medicine', country: 'United States', type: 'Medical School', city: 'New Haven', state: 'CT' },
  { name: 'Columbia University Vagelos College of Physicians', country: 'United States', type: 'Medical School', city: 'New York', state: 'NY' },
  { name: 'University of Pennsylvania Perelman School of Medicine', country: 'United States', type: 'Medical School', city: 'Philadelphia', state: 'PA' },
  
  // UK Medical Schools
  { name: 'University of Oxford Medical School', country: 'United Kingdom', type: 'Medical School', city: 'Oxford', state: 'England' },
  { name: 'University of Cambridge School of Clinical Medicine', country: 'United Kingdom', type: 'Medical School', city: 'Cambridge', state: 'England' },
  { name: 'Imperial College London Faculty of Medicine', country: 'United Kingdom', type: 'Medical School', city: 'London', state: 'England' },
  { name: 'University College London Medical School', country: 'United Kingdom', type: 'Medical School', city: 'London', state: 'England' },
  { name: 'King\'s College London School of Medicine', country: 'United Kingdom', type: 'Medical School', city: 'London', state: 'England' },
  
  // Canadian Medical Schools
  { name: 'University of Toronto Faculty of Medicine', country: 'Canada', type: 'Medical School', city: 'Toronto', state: 'ON' },
  { name: 'McGill University Faculty of Medicine', country: 'Canada', type: 'Medical School', city: 'Montreal', state: 'QC' },
  { name: 'University of British Columbia Faculty of Medicine', country: 'Canada', type: 'Medical School', city: 'Vancouver', state: 'BC' },
  
  // Major Hospitals/Institutions
  { name: 'Cleveland Clinic', country: 'United States', type: 'Hospital System', city: 'Cleveland', state: 'OH' },
  { name: 'Massachusetts General Hospital', country: 'United States', type: 'Hospital', city: 'Boston', state: 'MA' },
  { name: 'Mount Sinai Hospital', country: 'United States', type: 'Hospital', city: 'New York', state: 'NY' },
  { name: 'Cedars-Sinai Medical Center', country: 'United States', type: 'Hospital', city: 'Los Angeles', state: 'CA' },
  { name: 'Mayo Clinic', country: 'United States', type: 'Hospital System', city: 'Rochester', state: 'MN' },
  { name: 'Johns Hopkins Hospital', country: 'United States', type: 'Hospital', city: 'Baltimore', state: 'MD' },
  { name: 'NewYork-Presbyterian Hospital', country: 'United States', type: 'Hospital', city: 'New York', state: 'NY' },
  
  // International
  { name: 'Karolinska Institute', country: 'Sweden', type: 'Medical School', city: 'Stockholm', state: 'Stockholm' },
  { name: 'University of Melbourne Medical School', country: 'Australia', type: 'Medical School', city: 'Melbourne', state: 'VIC' },
  { name: 'University of Sydney Medical School', country: 'Australia', type: 'Medical School', city: 'Sydney', state: 'NSW' },
]

interface InstitutionData {
  name: string
  country: string
  type: string
  city: string
  state: string
}

interface MedicalInstitutionFieldsProps {
  institutions: InstitutionData[]
  onInstitutionsChange: (institutions: InstitutionData[]) => void
  error?: string
  maxInstitutions?: number
}

export default function MedicalInstitutionFields({ 
  institutions, 
  onInstitutionsChange, 
  error,
  maxInstitutions = 3 
}: MedicalInstitutionFieldsProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredInstitutions, setFilteredInstitutions] = useState<InstitutionData[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [customInstitution, setCustomInstitution] = useState({
    name: '',
    country: '',
    type: 'Medical School',
    city: '',
    state: ''
  })

  // Filter institutions based on search term
  useEffect(() => {
    if (searchTerm.length > 1) {
      const filtered = MEDICAL_INSTITUTIONS.filter(inst => 
        inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.country.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 10) // Limit to 10 suggestions
      setFilteredInstitutions(filtered)
      setShowSuggestions(true)
    } else {
      setFilteredInstitutions([])
      setShowSuggestions(false)
    }
  }, [searchTerm])

  const addInstitution = (institution: InstitutionData) => {
    if (!institutions.find(inst => inst.name === institution.name)) {
      if (institutions.length < maxInstitutions) {
        onInstitutionsChange([...institutions, institution])
        setSearchTerm('')
        setShowSuggestions(false)
      }
    }
  }

  const addCustomInstitution = () => {
    if (customInstitution.name.trim()) {
      const institution: InstitutionData = {
        name: customInstitution.name.trim(),
        country: customInstitution.country.trim() || 'Unknown',
        type: customInstitution.type,
        city: customInstitution.city.trim() || 'Unknown',
        state: customInstitution.state.trim() || 'Unknown'
      }
      
      if (!institutions.find(inst => inst.name === institution.name)) {
        if (institutions.length < maxInstitutions) {
          onInstitutionsChange([...institutions, institution])
          setCustomInstitution({
            name: '',
            country: '',
            type: 'Medical School',
            city: '',
            state: ''
          })
        }
      }
    }
  }

  const removeInstitution = (index: number) => {
    onInstitutionsChange(institutions.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Medical Institutions</h3>
        <Badge variant="outline" className="ml-auto">
          {institutions.length}/{maxInstitutions} added
        </Badge>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Institution Search */}
      <div className="space-y-2">
        <Label htmlFor="institution-search">Search Medical Schools & Institutions</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="institution-search"
            placeholder="Search by name, city, or country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            disabled={institutions.length >= maxInstitutions}
          />
          
          {/* Suggestions Dropdown */}
          {showSuggestions && filteredInstitutions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredInstitutions.map((institution, index) => (
                <div
                  key={index}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => addInstitution(institution)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{institution.name}</p>
                      <p className="text-xs text-gray-600">
                        {institution.type} • {institution.city}, {institution.state}, {institution.country}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected Institutions */}
      {institutions.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Selected Institutions:
          </Label>
          <div className="space-y-2">
            {institutions.map((institution, index) => (
              <Card key={index} className="p-3 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-4 w-4 text-gray-600" />
                    <div>
                      <p className="font-medium text-sm">{institution.name}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <Badge variant="outline" className="text-xs">
                          {institution.type}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{institution.city}, {institution.state}, {institution.country}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    onClick={() => removeInstitution(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Custom Institution Form */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Add Custom Institution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="custom-name">Institution Name *</Label>
              <Input
                id="custom-name"
                placeholder="Enter institution name..."
                value={customInstitution.name}
                onChange={(e) => setCustomInstitution(prev => ({ ...prev, name: e.target.value }))}
                disabled={institutions.length >= maxInstitutions}
              />
            </div>
            
            <div>
              <Label htmlFor="custom-type">Institution Type</Label>
              <Select 
                value={customInstitution.type} 
                onValueChange={(value) => setCustomInstitution(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Medical School">Medical School</SelectItem>
                  <SelectItem value="Hospital">Hospital</SelectItem>
                  <SelectItem value="Hospital System">Hospital System</SelectItem>
                  <SelectItem value="Research Institute">Research Institute</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="custom-city">City</Label>
              <Input
                id="custom-city"
                placeholder="Enter city..."
                value={customInstitution.city}
                onChange={(e) => setCustomInstitution(prev => ({ ...prev, city: e.target.value }))}
                disabled={institutions.length >= maxInstitutions}
              />
            </div>
            
            <div>
              <Label htmlFor="custom-state">State/Province</Label>
              <Input
                id="custom-state"
                placeholder="Enter state/province..."
                value={customInstitution.state}
                onChange={(e) => setCustomInstitution(prev => ({ ...prev, state: e.target.value }))}
                disabled={institutions.length >= maxInstitutions}
              />
            </div>
            
            <div>
              <Label htmlFor="custom-country">Country</Label>
              <Input
                id="custom-country"
                placeholder="Enter country..."
                value={customInstitution.country}
                onChange={(e) => setCustomInstitution(prev => ({ ...prev, country: e.target.value }))}
                disabled={institutions.length >= maxInstitutions}
              />
            </div>
          </div>
          
          <Button 
            onClick={addCustomInstitution}
            disabled={!customInstitution.name.trim() || institutions.length >= maxInstitutions}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Institution
          </Button>
        </CardContent>
      </Card>

      {/* Selection Limit Warning */}
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
