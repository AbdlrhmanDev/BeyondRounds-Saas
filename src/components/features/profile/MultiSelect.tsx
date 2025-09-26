"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Search, X } from 'lucide-react'

interface MultiSelectProps {
  title: string
  description?: string
  options: readonly string[]
  selectedValues: string[]
  onSelectionChange: (values: string[]) => void
  maxSelections?: number
  searchable?: boolean
  required?: boolean
  error?: string
  icon?: React.ReactNode
}

export default function MultiSelect({
  title,
  description,
  options,
  selectedValues,
  onSelectionChange,
  maxSelections,
  searchable = false,
  required = false,
  error,
  icon
}: MultiSelectProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAll, setShowAll] = useState(false)

  const filteredOptions = searchable 
    ? options.filter(option => 
        option.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options

  const displayedOptions = showAll 
    ? filteredOptions 
    : filteredOptions.slice(0, 12)

  const toggleOption = (option: string) => {
    if (selectedValues.includes(option)) {
      onSelectionChange(selectedValues.filter(value => value !== option))
    } else {
      if (maxSelections && selectedValues.length >= maxSelections) {
        return // Don't add if max selections reached
      }
      onSelectionChange([...selectedValues, option])
    }
  }

  const removeSelected = (option: string) => {
    onSelectionChange(selectedValues.filter(value => value !== option))
  }

  const clearAll = () => {
    onSelectionChange([])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
          {required && <span className="text-red-500">*</span>}
        </CardTitle>
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search */}
        {searchable && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search options..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {/* Selected Items */}
        {selectedValues.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Selected ({selectedValues.length})
                {maxSelections && ` / ${maxSelections}`}
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearAll}
                className="text-xs"
              >
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedValues.map((value) => (
                <Badge key={value} variant="secondary" className="flex items-center gap-1">
                  {value}
                  <button
                    type="button"
                    onClick={() => removeSelected(value)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Options Grid */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Available Options
            {maxSelections && selectedValues.length >= maxSelections && (
              <span className="text-red-500 ml-2">
                (Maximum {maxSelections} selections reached)
              </span>
            )}
          </Label>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {displayedOptions.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={option}
                  checked={selectedValues.includes(option)}
                  onCheckedChange={() => toggleOption(option)}
                  disabled={maxSelections ? selectedValues.length >= maxSelections && !selectedValues.includes(option) : false}
                />
                <Label 
                  htmlFor={option} 
                  className={`text-sm cursor-pointer ${
                    maxSelections && selectedValues.length >= maxSelections && !selectedValues.includes(option)
                      ? 'text-gray-400 cursor-not-allowed'
                      : ''
                  }`}
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>

          {/* Show More/Less */}
          {filteredOptions.length > 12 && (
            <div className="text-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? 'Show Less' : `Show All (${filteredOptions.length})`}
              </Button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
      </CardContent>
    </Card>
  )
}
