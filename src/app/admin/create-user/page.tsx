'use client'
 
import React, { useState } from 'react'
import { useAuthUser } from '@/hooks/features/auth/useAuthUser'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserPlus, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
 
export default function CreateUserPage() {
  const { user, profile } = useAuthUser()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    tempPassword: '',
    role: 'user',
    medicalSpecialty: '',
    city: ''
  })
 
  // Only allow admin access
  if (!profile || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">You need admin privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    )
  }
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setSuccess(false)
 
    try {
      // Create user account via API route
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
 
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create user')
      }
 
      const result = await response.json()
      setSuccess(true)
      toast.success(`User created successfully! User ID: ${result.user.id}`)
 
      // Reset form
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        tempPassword: '',
        role: 'user',
        medicalSpecialty: '',
        city: ''
      })
 
    } catch (error: unknown) {
      console.error('Error creating user:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create user'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }
 
  const generatePassword = () => {
    const password = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-2).toUpperCase()
    setFormData(prev => ({ ...prev, tempPassword: password }))
  }
 
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New User Account</h1>
          <p className="text-gray-600">
            Add new medical professionals to the BeyondRounds platform
          </p>
        </div>
 
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="w-5 h-5 mr-2" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {success && (
              <Alert className="mb-6 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  User account created successfully! They can now log in with their email and temporary password.
                </AlertDescription>
              </Alert>
            )}
 
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                    disabled={isLoading}
                  />
                </div>
 
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
 
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  disabled={isLoading}
                  placeholder="user@hospital.com"
                />
              </div>
 
              <div className="space-y-2">
                <Label htmlFor="tempPassword">Temporary Password *</Label>
                <div className="flex space-x-2">
                  <Input
                    id="tempPassword"
                    type="text"
                    value={formData.tempPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, tempPassword: e.target.value }))}
                    required
                    disabled={isLoading}
                    placeholder="Enter temporary password"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generatePassword}
                    disabled={isLoading}
                  >
                    Generate
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  User will be able to change this after first login
                </p>
              </div>
 
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
 
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    required
                    disabled={isLoading}
                    placeholder="London, New York, etc."
                  />
                </div>
              </div>
 
              <div className="space-y-2">
                <Label htmlFor="medicalSpecialty">Medical Specialty (Optional)</Label>
                <Input
                  id="medicalSpecialty"
                  value={formData.medicalSpecialty}
                  onChange={(e) => setFormData(prev => ({ ...prev, medicalSpecialty: e.target.value }))}
                  disabled={isLoading}
                  placeholder="Cardiology, Internal Medicine, etc."
                />
              </div>
 
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Make sure to share the temporary password securely with the new user.
                  They should change it on their first login.
                </AlertDescription>
              </Alert>
 
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create User Account
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}