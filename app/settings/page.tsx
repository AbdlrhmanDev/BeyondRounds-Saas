"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  Heart, 
  User, 
  Stethoscope, 
  MapPin, 
  Users, 
  Calendar, 
  FileText, 
  CreditCard, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Settings
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

type Gender = 'male' | 'female'

interface ProfileData {
  firstName: string
  lastName: string
  specialty: string
  city: string
  gender: Gender | ''              // اختياري حتى يختار
  genderPreference: Gender | ''    // اختياري حتى يختار
  interests: string[]
  availabilitySlots: string[]
  bio: string
}

interface PaymentData {
  paymentMethod: 'credit_card' | 'paypal' | ''
  cardNumber: string
  expiryDate: string
  cvv: string
  paypalEmail: string
}

const SPECIALTIES = [
  "General Practice",
  "Internal Medicine", 
  "Cardiology",
  "Dermatology",
  "Emergency Medicine",
  "Family Medicine",
  "Gastroenterology",
  "Neurology",
  "Oncology",
  "Pediatrics",
  "Psychiatry",
  "Radiology",
  "Surgery",
  "Therapist",
  "Coach",
  "Nutritionist",
  "Other"
]

const INTERESTS = [
  "Research",
  "Clinical Trials", 
  "Medical Education",
  "Public Health",
  "Healthcare Technology",
  "Medical Writing",
  "Telemedicine",
  "Healthcare Administration",
  "Medical Ethics",
  "Global Health",
  "Sports Medicine",
  "Preventive Care",
  "Mental Health",
  "Geriatrics",
  "Pediatric Care"
]

const TIME_SLOTS = [
  "Monday 9:00-12:00",
  "Monday 13:00-17:00", 
  "Monday 18:00-21:00",
  "Tuesday 9:00-12:00",
  "Tuesday 13:00-17:00",
  "Tuesday 18:00-21:00", 
  "Wednesday 9:00-12:00",
  "Wednesday 13:00-17:00",
  "Wednesday 18:00-21:00",
  "Thursday 9:00-12:00", 
  "Thursday 13:00-17:00",
  "Thursday 18:00-21:00",
  "Friday 9:00-12:00",
  "Friday 13:00-17:00",
  "Friday 18:00-21:00",
  "Saturday 9:00-12:00",
  "Saturday 13:00-17:00",
  "Sunday 9:00-12:00",
  "Sunday 13:00-17:00"
]

export default function SettingsPage() {
  const [step, setStep] = useState(1)
  const [user, setUser] = useState<any>(null)
  const [currentProfile, setCurrentProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    specialty: '',
    city: '',
    gender: '',
    genderPreference: '',
    interests: [],
    availabilitySlots: [],
    bio: ''
  })

  const [paymentData, setPaymentData] = useState<PaymentData>({
    paymentMethod: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    paypalEmail: ''
  })

  const supabase = createClient()

  const onlyMF = (v: any) => (v === 'male' || v === 'female') ? v : ''
  const allowed: Gender[] = ['male', 'female']

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          router.push("/auth/login")
          return
        }
        setUser(user)

        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError) {
          console.error("Error loading profile:", profileError)
        } else {
          setCurrentProfile(profileData)
          // Pre-populate form with existing data
          setProfileData({
            firstName: profileData.first_name || '',
            lastName: profileData.last_name || '',
            specialty: profileData.specialty || '',
            city: profileData.city || '',
            gender: onlyMF(profileData.gender),
            genderPreference: onlyMF(profileData.gender_preference),
            interests: profileData.interests || [],
            availabilitySlots: profileData.availability_slots || [],
            bio: profileData.bio || ''
          })
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error loading user data:", error)
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [router, supabase])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateCardNumber = (cardNumber: string) => {
    const cleaned = cardNumber.replace(/\s/g, '')
    return cleaned.length === 16 && /^\d+$/.test(cleaned)
  }

  const validateExpiryDate = (expiryDate: string) => {
    const regex = /^(0[1-9]|1[0-2])\/\d{2}$/
    if (!regex.test(expiryDate)) return false
    
    const [month, year] = expiryDate.split('/')
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear() % 100
    const currentMonth = currentDate.getMonth() + 1
    
    const expYear = parseInt(year)
    const expMonth = parseInt(month)
    
    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      return false
    }
    
    return true
  }

  const validateCVV = (cvv: string) => {
    return cvv.length === 3 && /^\d+$/.test(cvv)
  }

  const handleInterestToggle = (interest: string) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handleAvailabilityToggle = (slot: string) => {
    setProfileData(prev => ({
      ...prev,
      availabilitySlots: prev.availabilitySlots.includes(slot)
        ? prev.availabilitySlots.filter(s => s !== slot)
        : [...prev.availabilitySlots, slot]
    }))
  }

  const canProceedToStep2 =
    profileData.firstName && profileData.lastName &&
    profileData.specialty && profileData.city && profileData.gender

  const canProceedToStep3 =
    (profileData.genderPreference === 'male' || profileData.genderPreference === 'female') &&
    profileData.interests.length > 0
  const canProceedToStep4 = profileData.availabilitySlots.length > 0
  const canProceedToStep5 = profileData.bio.length > 0 && profileData.bio.length <= 500

  const validatePayment = () => {
    if (paymentData.paymentMethod === 'credit_card') {
      return validateCardNumber(paymentData.cardNumber) && 
             validateExpiryDate(paymentData.expiryDate) && 
             validateCVV(paymentData.cvv)
    } else if (paymentData.paymentMethod === 'paypal') {
      return validateEmail(paymentData.paypalEmail)
    }
    return false
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    setError(null)

    const g = String(profileData.gender).trim().toLowerCase()
    const gp = String(profileData.genderPreference).trim().toLowerCase()

    if (!allowed.includes(g as Gender) || !allowed.includes(gp as Gender)) {
      setIsSaving(false)
      setError('Gender and Gender Preference must be either "male" or "female".')
      return
    }

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          specialty: profileData.specialty,
          city: profileData.city,
          gender: g,                       // متوافق مع CHECK
          gender_preference: gp,           // متوافق مع CHECK
          interests: profileData.interests,
          availability_slots: profileData.availabilitySlots,
          bio: profileData.bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Here you would typically integrate with a payment processor
      // For now, we'll just simulate payment processing
      console.log("Payment data:", paymentData)
      
      setSuccess(true)
      
      // Redirect to dashboard after success
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)

    } catch (e: any) {
      setError(e.message || 'Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  const getProgressPercentage = () => {
    switch(step) {
      case 1: return 25
      case 2: return 50
      case 3: return 75
      case 4: return 90
      case 5: return 100
      default: return 0
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/80 border border-gray-200 rounded-2xl p-8 shadow-lg">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Heart className="w-6 h-6 text-white animate-pulse" />
            </div>
            <p className="text-gray-700 text-lg font-medium">Loading settings...</p>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="backdrop-blur-xl bg-white/80 border border-gray-200 rounded-2xl p-8 shadow-lg w-full max-w-md text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">Profile Complete!</h2>
          <p className="text-gray-700 mb-6">Your profile and payment information have been saved successfully</p>
          <p className="text-sm text-gray-600 mb-6">
            Your profile is now complete and you're ready to start receiving weekly matches with fellow medical professionals.
          </p>
          <Button 
            onClick={() => router.push("/dashboard")} 
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-3 mb-6 group">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">BeyondRounds</span>
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">Complete Your Profile</h1>
          <p className="text-gray-600 text-lg">Let's set up your profile and payment information to get started</p>
        </div>

        {/* Progress Bar */}
        <div className="backdrop-blur-xl bg-white/80 border border-gray-200 rounded-2xl p-6 mb-6 shadow-lg">
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-700">
              <span className="font-medium">Step {step} of 5</span>
              <span className="font-medium">{getProgressPercentage()}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full transition-all duration-500 ease-out shadow-lg"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="backdrop-blur-xl bg-white/80 border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                Basic Information
              </h2>
              <p className="text-gray-600 mt-2">
                Let's start with your basic information. Your email ({user?.email}) is already on file.
              </p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="firstName" className="text-gray-700 font-medium">First Name *</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter your first name"
                    className="backdrop-blur-sm bg-white/60 border-gray-300 text-gray-800 placeholder:text-gray-500 focus:bg-white focus:border-blue-400 transition-all duration-300"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="lastName" className="text-gray-700 font-medium">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter your last name"
                    className="backdrop-blur-sm bg-white/60 border-gray-300 text-gray-800 placeholder:text-gray-500 focus:bg-white focus:border-blue-400 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="specialty" className="text-gray-700 font-medium">Specialty *</Label>
                <Select value={profileData.specialty} onValueChange={(value) => setProfileData(prev => ({ ...prev, specialty: value }))}>
                  <SelectTrigger className="backdrop-blur-sm bg-white/60 border-gray-300 text-gray-800 focus:bg-white focus:border-blue-400 transition-all duration-300">
                    <SelectValue placeholder="Select your specialty" className="text-gray-800" />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-xl bg-white/90 border-gray-200">
                    {SPECIALTIES.map((specialty) => (
                      <SelectItem key={specialty} value={specialty} className="text-gray-800 hover:bg-gray-100">
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="city" className="text-gray-700 font-medium">City *</Label>
                <Input
                  id="city"
                  value={profileData.city}
                  onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Enter your city"
                  className="backdrop-blur-sm bg-white/60 border-gray-300 text-gray-800 placeholder:text-gray-500 focus:bg-white focus:border-blue-400 transition-all duration-300"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-gray-700 font-medium">Gender *</Label>
                <RadioGroup
                  value={profileData.gender}
                  onValueChange={(value) =>
                    setProfileData(p => ({ ...p, gender: value as Gender }))
                  }
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="male" id="male" className="border-gray-400 text-blue-500" />
                    <Label htmlFor="male" className="text-gray-700 cursor-pointer">Male</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="female" id="female" className="border-gray-400 text-blue-500" />
                    <Label htmlFor="female" className="text-gray-700 cursor-pointer">Female</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex justify-between pt-6">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/dashboard')}
                  className="backdrop-blur-sm bg-white/60 border-gray-300 text-gray-700 hover:bg-white hover:border-gray-400 transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
                <Button 
                  onClick={() => setStep(2)} 
                  disabled={!canProceedToStep2}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Next Step
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Preferences */}
        {step === 2 && (
          <div className="backdrop-blur-xl bg-white/80 border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                Preferences & Interests
              </h2>
              <p className="text-gray-600 mt-2">
                Tell us about your preferences and professional interests
              </p>
            </div>
            <div className="p-6 space-y-8">
              <div className="space-y-4">
                <Label className="text-gray-700 font-medium">Gender Preference *</Label>
                <p className="text-sm text-gray-600">Who would you prefer to be matched with?</p>
                <RadioGroup
                  value={profileData.genderPreference}
                  onValueChange={(value) =>
                    setProfileData(p => ({ ...p, genderPreference: value as Gender }))
                  }
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="male" id="pref-male" className="border-gray-400 text-blue-500" />
                    <Label htmlFor="pref-male" className="text-gray-700 cursor-pointer">Male professionals</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="female" id="pref-female" className="border-gray-400 text-blue-500" />
                    <Label htmlFor="pref-female" className="text-gray-700 cursor-pointer">Female professionals</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

              <div className="space-y-4">
                <Label className="text-gray-700 font-medium">Professional Interests * (Select at least 1)</Label>
                <p className="text-sm text-gray-600">Choose areas that interest you professionally</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-64 overflow-y-auto backdrop-blur-sm bg-gray-50 rounded-xl p-4">
                  {INTERESTS.map((interest) => (
                    <div key={interest} className="flex items-center space-x-3 group">
                      <Checkbox
                        id={interest}
                        checked={profileData.interests.includes(interest)}
                        onCheckedChange={() => handleInterestToggle(interest)}
                        className="border-gray-400 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                      />
                      <Label htmlFor={interest} className="text-sm text-gray-700 cursor-pointer group-hover:text-gray-900 transition-colors duration-200">{interest}</Label>
                    </div>
                  ))}
                </div>
                {profileData.interests.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {profileData.interests.map((interest) => (
                      <Badge key={interest} className="bg-gradient-to-r from-blue-100 to-purple-100 text-gray-700 border-gray-200 backdrop-blur-sm">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)}
                  className="backdrop-blur-sm bg-white/60 border-gray-300 text-gray-700 hover:bg-white hover:border-gray-400 transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button 
                  onClick={() => setStep(3)} 
                  disabled={!canProceedToStep3}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Next Step
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Availability */}
        {step === 3 && (
          <div className="backdrop-blur-xl bg-white/80 border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                Availability Schedule
              </h2>
              <p className="text-gray-600 mt-2">
                Select your preferred time slots for networking sessions (Select at least 1)
              </p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto backdrop-blur-sm bg-gray-50 rounded-xl p-4">
                {TIME_SLOTS.map((slot) => (
                  <div key={slot} className="flex items-center space-x-3 group">
                    <Checkbox
                      id={slot}
                      checked={profileData.availabilitySlots.includes(slot)}
                      onCheckedChange={() => handleAvailabilityToggle(slot)}
                      className="border-gray-400 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    />
                    <Label htmlFor={slot} className="text-sm text-gray-700 cursor-pointer group-hover:text-gray-900 transition-colors duration-200">{slot}</Label>
                  </div>
                ))}
              </div>
              
              {profileData.availabilitySlots.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">Selected slots:</Label>
                  <div className="flex flex-wrap gap-2">
                    {profileData.availabilitySlots.map((slot) => (
                      <Badge key={slot} className="bg-gradient-to-r from-blue-100 to-purple-100 text-gray-700 border-gray-200 backdrop-blur-sm">
                        {slot}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(2)}
                  className="backdrop-blur-sm bg-white/60 border-gray-300 text-gray-700 hover:bg-white hover:border-gray-400 transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button 
                  onClick={() => setStep(4)} 
                  disabled={!canProceedToStep4}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Next Step
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Bio */}
        {step === 4 && (
          <div className="backdrop-blur-xl bg-white/80 border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                Short Bio
              </h2>
              <p className="text-gray-600 mt-2">
                Write a brief bio about yourself (maximum 500 characters)
              </p>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <Label htmlFor="bio" className="text-gray-700 font-medium">Bio *</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell other medical professionals about yourself, your interests, and what you hope to gain from networking..."
                  className="min-h-32 backdrop-blur-sm bg-white/60 border-gray-300 text-gray-800 placeholder:text-gray-500 focus:bg-white focus:border-blue-400 transition-all duration-300 resize-none"
                  maxLength={500}
                />
                <div className="text-right text-sm text-gray-600">
                  <span className={profileData.bio.length > 450 ? "text-yellow-600" : profileData.bio.length > 480 ? "text-red-600" : ""}>
                    {profileData.bio.length}/500 characters
                  </span>
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(3)}
                  className="backdrop-blur-sm bg-white/60 border-gray-300 text-gray-700 hover:bg-white hover:border-gray-400 transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button 
                  onClick={() => setStep(5)} 
                  disabled={!canProceedToStep5}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Next Step
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Payment Information */}
        {step === 5 && (
          <div className="backdrop-blur-xl bg-white/80 border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                Payment Information
              </h2>
              <p className="text-gray-600 mt-2">
                Choose your preferred payment method to complete your profile
              </p>
            </div>
            <div className="p-6 space-y-8">
              <div className="space-y-4">
                <Label className="text-gray-700 font-medium">Payment Method *</Label>
                <RadioGroup value={paymentData.paymentMethod} onValueChange={(value) => setPaymentData(prev => ({ ...prev, paymentMethod: value as 'credit_card' | 'paypal' }))}>
                  <div className="flex gap-6">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="credit_card" id="credit_card" className="border-gray-400 text-blue-500" />
                      <Label htmlFor="credit_card" className="text-gray-700 cursor-pointer">Credit Card</Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="paypal" id="paypal" className="border-gray-400 text-blue-500" />
                      <Label htmlFor="paypal" className="text-gray-700 cursor-pointer">PayPal</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {paymentData.paymentMethod === 'credit_card' && (
                <div className="space-y-6 p-6 backdrop-blur-sm bg-gray-50 border border-gray-200 rounded-xl">
                  <div className="space-y-3">
                    <Label htmlFor="cardNumber" className="text-gray-700 font-medium">Card Number *</Label>
                    <Input
                      id="cardNumber"
                      value={paymentData.cardNumber}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, cardNumber: e.target.value }))}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="backdrop-blur-sm bg-white/60 border-gray-300 text-gray-800 placeholder:text-gray-500 focus:bg-white focus:border-blue-400 transition-all duration-300"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="expiryDate" className="text-gray-700 font-medium">Expiry Date *</Label>
                      <Input
                        id="expiryDate"
                        value={paymentData.expiryDate}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, expiryDate: e.target.value }))}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="backdrop-blur-sm bg-white/60 border-gray-300 text-gray-800 placeholder:text-gray-500 focus:bg-white focus:border-blue-400 transition-all duration-300"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="cvv" className="text-gray-700 font-medium">CVV *</Label>
                      <Input
                        id="cvv"
                        value={paymentData.cvv}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, cvv: e.target.value }))}
                        placeholder="123"
                        maxLength={3}
                        className="backdrop-blur-sm bg-white/60 border-gray-300 text-gray-800 placeholder:text-gray-500 focus:bg-white focus:border-blue-400 transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentData.paymentMethod === 'paypal' && (
                <div className="space-y-6 p-6 backdrop-blur-sm bg-gray-50 border border-gray-200 rounded-xl">
                  <div className="space-y-3">
                    <Label htmlFor="paypalEmail" className="text-gray-700 font-medium">PayPal Email *</Label>
                    <Input
                      id="paypalEmail"
                      type="email"
                      value={paymentData.paypalEmail}
                      onChange={(e) => setPaymentData(prev => ({ ...prev, paypalEmail: e.target.value }))}
                      placeholder="your.email@example.com"
                      className="backdrop-blur-sm bg-white/60 border-gray-300 text-gray-800 placeholder:text-gray-500 focus:bg-white focus:border-blue-400 transition-all duration-300"
                    />
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              <div className="space-y-6">
                <h3 className="font-semibold text-xl bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent">Profile Summary</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm backdrop-blur-sm bg-gray-50 rounded-xl p-4">
                  <div className="text-gray-700">
                    <strong className="text-gray-900">Name:</strong> {profileData.firstName} {profileData.lastName}
                  </div>
                  <div className="text-gray-700">
                    <strong className="text-gray-900">Specialty:</strong> {profileData.specialty}
                  </div>
                  <div className="text-gray-700">
                    <strong className="text-gray-900">City:</strong> {profileData.city}
                  </div>
                  <div className="text-gray-700">
                    <strong className="text-gray-900">Gender:</strong> {profileData.gender}
                  </div>
                  <div className="text-gray-700">
                    <strong className="text-gray-900">Gender Preference:</strong> {profileData.genderPreference}
                  </div>
                  <div className="text-gray-700">
                    <strong className="text-gray-900">Interests:</strong> {profileData.interests.length} selected
                  </div>
                  <div className="text-gray-700">
                    <strong className="text-gray-900">Availability:</strong> {profileData.availabilitySlots.length} time slots
                  </div>
                  <div className="text-gray-700">
                    <strong className="text-gray-900">Payment Method:</strong> {paymentData.paymentMethod === 'credit_card' ? 'Credit Card' : 'PayPal'}
                  </div>
                </div>
              </div>

              {error && (
                <div className="backdrop-blur-sm bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(4)}
                  className="backdrop-blur-sm bg-white/60 border-gray-300 text-gray-700 hover:bg-white hover:border-gray-400 transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button 
                  onClick={handleSaveProfile} 
                  disabled={!validatePayment() || isSaving}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSaving ? "Saving..." : "Complete Profile"}
                  <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
