'use client'

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface BasicInformationStepProps {
  data: Record<string, unknown>;
  onNext: (data?: Record<string, unknown>) => void;
  onPrevious: () => void;
}

function BasicInformationStep({ data, onNext, onPrevious }: BasicInformationStepProps) {
  const [formData, setFormData] = useState({
    fullName: (data.fullName as string) || '',
    age: (data.age as string) || '',
    gender: (data.gender as string) || '',
    genderPreference: (data.genderPreference as string) || '',
    city: (data.city as string) || '',
    nationality: (data.nationality as string) || ''
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    onNext({
      basic: formData
    });
  };

  const isFormValid = () => {
    return formData.fullName.trim() && formData.gender && formData.city.trim();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Basic Information</h3>
        <p className="text-sm text-gray-600">
          Tell us about yourself to help us create better matches
        </p>
      </div>

      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name *</Label>
        <Input
          id="fullName"
          value={formData.fullName}
          onChange={(e) => updateField('fullName', e.target.value)}
          placeholder="Enter your full name"
          className="bg-blue-50/50 border-blue-200 focus:border-blue-400 dark:bg-blue-950/50 dark:border-blue-800"
          required
        />
        {!formData.fullName.trim() && (
          <p className="text-sm text-red-500">Full name is required</p>
        )}
      </div>

      {/* Age */}
      <div className="space-y-2">
        <Label htmlFor="age">Age (Optional)</Label>
        <Input
          id="age"
          type="number"
          value={formData.age}
          onChange={(e) => updateField('age', e.target.value)}
          placeholder="Enter your age"
          min="20"
          max="80"
          className="bg-blue-50/50 border-blue-200 focus:border-blue-400 dark:bg-blue-950/50 dark:border-blue-800"
        />
      </div>

      {/* Gender */}
      <div className="space-y-3">
        <Label>Gender *</Label>
        <RadioGroup
          value={formData.gender}
          onValueChange={(value) => updateField('gender', value)}
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="male" id="male" className="text-blue-600" />
            <Label htmlFor="male" className="cursor-pointer">Male</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="female" id="female" className="text-blue-600" />
            <Label htmlFor="female" className="cursor-pointer">Female</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="non-binary" id="non-binary" className="text-blue-600" />
            <Label htmlFor="non-binary" className="cursor-pointer">Non-binary</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="prefer-not-to-say" id="prefer-not-to-say" className="text-blue-600" />
            <Label htmlFor="prefer-not-to-say" className="cursor-pointer">Prefer not to say</Label>
          </div>
        </RadioGroup>
        {!formData.gender && (
          <p className="text-sm text-red-500">Please select your gender</p>
        )}
      </div>

      {/* Gender Preference for Groups */}
      <div className="space-y-2">
        <Label>Gender Preference for Groups</Label>
        <Select value={formData.genderPreference} onValueChange={(value) => updateField('genderPreference', value)}>
          <SelectTrigger className="bg-blue-50/50 border-blue-200 focus:border-blue-400 dark:bg-blue-950/50 dark:border-blue-800">
            <SelectValue placeholder="Select your preference" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no-preference">No preference</SelectItem>
            <SelectItem value="mixed-preferred">Mixed preferred</SelectItem>
            <SelectItem value="same-gender-only">Same gender only</SelectItem>
            <SelectItem value="same-gender-preferred">Same gender preferred but mixed okay</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">This helps us create comfortable group dynamics</p>
      </div>

      {/* City of Residence */}
      <div className="space-y-2">
        <Label htmlFor="city">City of Residence *</Label>
        <Input
          id="city"
          value={formData.city}
          onChange={(e) => updateField('city', e.target.value)}
          placeholder="e.g., New York, London, Toronto"
          className="bg-blue-50/50 border-blue-200 focus:border-blue-400 dark:bg-blue-950/50 dark:border-blue-800"
          required
        />
        <p className="text-sm text-muted-foreground">We'll match you with doctors in your area</p>
        {!formData.city.trim() && (
          <p className="text-sm text-red-500">City is required</p>
        )}
      </div>

      {/* Nationality */}
      <div className="space-y-2">
        <Label>Nationality (Optional)</Label>
        <Select value={formData.nationality} onValueChange={(value) => updateField('nationality', value)}>
          <SelectTrigger className="bg-blue-50/50 border-blue-200 focus:border-blue-400 dark:bg-blue-950/50 dark:border-blue-800">
            <SelectValue placeholder="Select your nationality" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="american">American</SelectItem>
            <SelectItem value="canadian">Canadian</SelectItem>
            <SelectItem value="british">British</SelectItem>
            <SelectItem value="australian">Australian</SelectItem>
            <SelectItem value="german">German</SelectItem>
            <SelectItem value="french">French</SelectItem>
            <SelectItem value="indian">Indian</SelectItem>
            <SelectItem value="chinese">Chinese</SelectItem>
            <SelectItem value="japanese">Japanese</SelectItem>
            <SelectItem value="brazilian">Brazilian</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Validation Summary */}
      {!isFormValid() && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Please complete the required fields:</strong>
          </p>
          <ul className="text-sm text-amber-700 dark:text-amber-300 mt-1 space-y-1">
            {!formData.fullName.trim() && <li>• Full Name</li>}
            {!formData.gender && <li>• Gender</li>}
            {!formData.city.trim() && <li>• City of Residence</li>}
          </ul>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={onPrevious}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!isFormValid()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

export default BasicInformationStep;
