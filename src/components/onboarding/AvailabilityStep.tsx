'use client'

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface AvailabilityStepProps {
  data: Record<string, unknown>;
  onNext: (data?: Record<string, unknown>) => void;
  onPrevious: () => void;
}

const timeSlots = [
  { id: 'weekday-morning', label: 'Weekday Mornings', time: '6:00 AM - 12:00 PM', icon: '🌅' },
  { id: 'weekday-afternoon', label: 'Weekday Afternoons', time: '12:00 PM - 5:00 PM', icon: '☀️' },
  { id: 'weekday-evening', label: 'Weekday Evenings', time: '5:00 PM - 10:00 PM', icon: '🌆' },
  { id: 'weekday-late', label: 'Weekday Late Night', time: '10:00 PM - 12:00 AM', icon: '🌙' },
  { id: 'friday-evening', label: 'Friday Evenings', time: '5:00 PM onwards', icon: '🎉' },
  { id: 'saturday-morning', label: 'Saturday Mornings', time: '8:00 AM - 12:00 PM', icon: '🌤️' },
  { id: 'saturday-afternoon', label: 'Saturday Afternoons', time: '12:00 PM - 5:00 PM', icon: '☀️' },
  { id: 'saturday-evening', label: 'Saturday Evenings', time: '5:00 PM onwards', icon: '🌃' },
  { id: 'sunday-morning', label: 'Sunday Mornings', time: '8:00 AM - 12:00 PM', icon: '🌅' },
  { id: 'sunday-afternoon', label: 'Sunday Afternoons', time: '12:00 PM - 5:00 PM', icon: '☀️' },
  { id: 'sunday-evening', label: 'Sunday Evenings', time: '5:00 PM - 9:00 PM', icon: '🌇' }
];

const meetingFrequencies = [
  { value: 'weekly', label: 'Weekly', description: 'I\'d love to meet regularly, once a week' },
  { value: 'biweekly', label: 'Bi-weekly', description: 'Every other week works well for me' },
  { value: 'monthly', label: 'Monthly', description: 'Once a month is perfect' },
  { value: 'occasional', label: 'Occasional', description: 'A few times a year when schedules align' },
  { value: 'flexible', label: 'Flexible', description: 'I\'m open to different frequencies' }
];

function AvailabilityStep({ data, onNext, onPrevious }: AvailabilityStepProps) {
  const [preferredTimes, setPreferredTimes] = useState<string[]>((data.preferredTimes as string[]) || []);
  const [meetingFrequency, setMeetingFrequency] = useState((data.meetingFrequency as string) || '');

  const updatePreferredTimes = (timeSlot: string, checked: boolean) => {
    const updated = checked 
      ? [...preferredTimes, timeSlot]
      : preferredTimes.filter(t => t !== timeSlot);
    setPreferredTimes(updated);
  };

  const handleNext = () => {
    onNext({
      availability: {
        preferredTimes,
        meetingFrequency
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Availability Preferences</h3>
        <p className="text-sm text-gray-600">
          Tell us about your availability for meetings and networking events
        </p>
      </div>

      {/* Preferred Meeting Times */}
      <div className="space-y-4">
        <div>
          <Label>Preferred Meeting Times * (Select all that work for you)</Label>
          <p className="text-sm text-muted-foreground mt-1">
            We understand medical schedules are unpredictable - select your generally available times
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {timeSlots.map((slot) => (
            <Card
              key={slot.id}
              className={`cursor-pointer transition-all ${
                preferredTimes.includes(slot.id)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 dark:border-blue-400'
                  : 'border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950'
              }`}
              onClick={() => updatePreferredTimes(slot.id, !preferredTimes.includes(slot.id))}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id={slot.id}
                    checked={preferredTimes.includes(slot.id)}
                    onCheckedChange={(checked) => updatePreferredTimes(slot.id, checked === true)}
                    className="text-blue-600"
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-lg">{slot.icon}</span>
                    <div>
                      <Label htmlFor={slot.id} className="cursor-pointer">{slot.label}</Label>
                      <p className="text-sm text-muted-foreground">{slot.time}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 <strong>Tip:</strong> The more time slots you select, the easier it will be to find matches with overlapping availability!
          </p>
        </div>
      </div>

      {/* Meeting Frequency Preference */}
      <div className="space-y-3">
        <Label>Meeting Frequency Preference *</Label>
        <Select value={meetingFrequency} onValueChange={setMeetingFrequency}>
          <SelectTrigger className="bg-blue-50/50 border-blue-200 focus:border-blue-400 dark:bg-blue-950/50 dark:border-blue-800">
            <SelectValue placeholder="How often would you like to meet?" />
          </SelectTrigger>
          <SelectContent>
            {meetingFrequencies.map((freq) => (
              <SelectItem key={freq.value} value={freq.value}>
                <div className="py-1">
                  <div>{freq.label}</div>
                  <div className="text-sm text-muted-foreground">{freq.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          We'll prioritize matching you with doctors who have similar availability expectations
        </p>
      </div>

      {/* Schedule Note */}
      <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-2">
          <span className="text-amber-600 dark:text-amber-400 mt-0.5">⚠️</span>
          <div className="text-sm">
            <p className="text-amber-800 dark:text-amber-200 mb-1">
              <strong>We understand medical schedules change!</strong>
            </p>
            <p className="text-amber-700 dark:text-amber-300">
              These preferences help with initial matching. You can always adjust plans as your schedule changes, 
              and we encourage flexible, understanding friendships that work around the demands of medical practice.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={onPrevious}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button 
          onClick={handleNext}
          disabled={preferredTimes.length === 0 || !meetingFrequency}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

export default AvailabilityStep;
