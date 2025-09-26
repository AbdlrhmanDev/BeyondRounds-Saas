'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Camera,
  Shield,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Eye,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

interface VerificationStepProps {
  data: Record<string, unknown>
  onNext: (data?: Record<string, unknown>) => void
  onPrevious: () => void
  userId?: string
}

interface VerificationDocument {
  id: string
  profile_id: string
  id_document_url: string | null
  selfie_url: string | null
  license_url: string | null
  status: 'pending' | 'approved' | 'rejected'
  admin_notes: string | null
  submitted_at: string
  reviewed_at: string | null
}

const DOCUMENT_TYPES = [
  {
    id: 'id_document',
    name: 'Government ID',
    description: 'Upload a clear photo of your government-issued ID (Driver\'s License, Passport, etc.)',
    icon: FileText,
    acceptedTypes: 'image/*,.pdf',
    maxSize: 5 * 1024 * 1024, // 5MB
    required: true,
    tips: [
      'Ensure all text is clearly visible',
      'Avoid glare and shadows',
      'Include all four corners of the document'
    ]
  },
  {
    id: 'selfie',
    name: 'Identity Selfie',
    description: 'Take a selfie holding your ID next to your face for identity verification',
    icon: Camera,
    acceptedTypes: 'image/*',
    maxSize: 5 * 1024 * 1024, // 5MB
    required: true,
    tips: [
      'Hold your ID next to your face',
      'Ensure both your face and ID are clearly visible',
      'Use good lighting',
      'Look directly at the camera'
    ]
  },
  {
    id: 'license',
    name: 'Medical License',
    description: 'Upload your medical license, diploma, or medical school certificate',
    icon: Shield,
    acceptedTypes: 'image/*,.pdf',
    maxSize: 10 * 1024 * 1024, // 10MB
    required: true,
    tips: [
      'Include your full name and license number',
      'Ensure the document is current and valid',
      'Upload the highest quality image possible'
    ]
  }
]

function VerificationStep({ data: _data, onNext, onPrevious, userId }: VerificationStepProps) {
  const [documents, setDocuments] = useState<VerificationDocument | null>(null)
  const [uploading, setUploading] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [loading, setLoading] = useState(true)
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  // Load existing verification documents
  useEffect(() => {
    if (userId) {
      loadVerificationDocuments()
    } else {
      setLoading(false)
    }
  }, [userId])

  const loadVerificationDocuments = async () => {
    try {
      const response = await fetch(`/api/verification?userId=${userId}`)
      if (response.ok) {
        const result = await response.json()
        setDocuments(result.data)
      }
    } catch (error) {
      console.error('Error loading verification documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = async (documentType: string, file: File) => {
    const docType = DOCUMENT_TYPES.find(dt => dt.id === documentType)
    if (!docType) return

    // Validate file
    if (file.size > docType.maxSize) {
      toast.error(`File size must be less than ${docType.maxSize / (1024 * 1024)}MB`)
      return
    }

    setUploading(documentType)
    setUploadProgress(0)

    try {
      // Simulate file upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Convert file to base64 for upload
      const reader = new FileReader()
      reader.onload = async () => {
        const fileUrl = reader.result as string
        
        // Upload to our API
        const requestData = {
          userId,
          documentType,
          fileUrl,
          fileName: file.name
        }
        
        console.log('Uploading verification document:', requestData)
        
        const response = await fetch('/api/verification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData)
        })

        clearInterval(progressInterval)
        setUploadProgress(100)

        if (response.ok) {
          const result = await response.json()
          setDocuments(result.data)
          toast.success(`${docType.name} uploaded successfully!`)
        } else {
          const error = await response.json()
          console.error('Upload failed:', error)
          toast.error(error.error || 'Upload failed')
        }
      }
      
      reader.readAsDataURL(file)
      
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Upload failed. Please try again.')
    } finally {
      setUploading(null)
      setUploadProgress(0)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Pending Review</Badge>
      default:
        return null
    }
  }

  const isDocumentUploaded = (documentType: string) => {
    if (!documents) return false
    return documents[`${documentType}_url` as keyof VerificationDocument] !== null
  }

  const getDocumentUrl = (documentType: string) => {
    if (!documents) return null
    return documents[`${documentType}_url` as keyof VerificationDocument] as string
  }

  const allRequiredDocumentsUploaded = () => {
    return DOCUMENT_TYPES.every(docType => isDocumentUploaded(docType.id))
  }

  const handleNext = () => {
    if (allRequiredDocumentsUploaded()) {
      onNext({ 
        verification: 'completed',
        verificationStatus: documents?.status || 'pending',
        verificationDocuments: documents
      })
    } else {
      toast.error('Please upload all required documents before continuing')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading verification status...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Shield className="h-6 w-6 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Identity Verification</h3>
        <p className="text-sm text-gray-600 mb-4">
          To ensure the safety and authenticity of our medical community, we require verification of your identity and medical credentials.
        </p>
      </div>

      {/* Verification Status */}
      {documents && (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <div className="flex items-center justify-between">
              <span><strong>Verification Status:</strong></span>
              {getStatusBadge(documents.status)}
            </div>
            {documents.admin_notes && (
              <div className="mt-2 text-sm">
                <strong>Admin Notes:</strong> {documents.admin_notes}
              </div>
            )}
            <div className="mt-2 text-xs">
              Submitted: {new Date(documents.submitted_at).toLocaleDateString()}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Document Upload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {DOCUMENT_TYPES.map((docType) => {
          const IconComponent = docType.icon
          const isUploaded = isDocumentUploaded(docType.id)
          const isCurrentlyUploading = uploading === docType.id
          const documentUrl = getDocumentUrl(docType.id)

          return (
            <Card key={docType.id} className={`relative ${isUploaded ? 'border-green-200 bg-green-50 dark:bg-green-950' : 'border-blue-200'}`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-sm">
                  <IconComponent className="h-4 w-4 mr-2 text-blue-600" />
                  {docType.name}
                  {docType.required && <span className="text-red-500 ml-1">*</span>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-gray-600">{docType.description}</p>
                
                {/* Upload Tips */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-700">Tips:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {docType.tips.map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-500 mr-1">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {isUploaded ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-green-600 font-medium">✓ Uploaded</span>
                      {documents && getStatusBadge(documents.status)}
                    </div>
                    {documentUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => window.open(documentUrl, '_blank')}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Document
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-blue-600"
                      onClick={() => {
                        const input = fileInputRefs.current[docType.id]
                        if (input) input.click()
                      }}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Replace Document
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input
                      ref={(el) => { 
                        fileInputRefs.current[docType.id] = el
                      }}
                      type="file"
                      accept={docType.acceptedTypes}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleFileSelect(docType.id, file)
                        }
                      }}
                      className="hidden"
                    />
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => fileInputRefs.current[docType.id]?.click()}
                      disabled={isCurrentlyUploading}
                    >
                      {isCurrentlyUploading ? (
                        <>
                          <Upload className="h-3 w-3 mr-1 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-3 w-3 mr-1" />
                          Upload {docType.name}
                        </>
                      )}
                    </Button>

                    {isCurrentlyUploading && (
                      <div className="space-y-1">
                        <Progress value={uploadProgress} className="h-2" />
                        <p className="text-xs text-center text-gray-500">{uploadProgress}% complete</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Security Notice */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-2">
          <Shield className="h-4 w-4 text-gray-600 mt-0.5" />
          <div className="text-sm">
            <p className="text-gray-800 dark:text-gray-200 mb-1">
              <strong>Security & Privacy</strong>
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              All documents are encrypted and stored securely. Your information is only accessible to our verification team 
              and is never shared with third parties. Verification typically takes 24-48 hours.
            </p>
          </div>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Verification Progress</span>
          <span className="text-sm text-blue-600 dark:text-blue-400">
            {DOCUMENT_TYPES.filter(doc => isDocumentUploaded(doc.id)).length} / {DOCUMENT_TYPES.length} documents uploaded
          </span>
        </div>
        <Progress 
          value={(DOCUMENT_TYPES.filter(doc => isDocumentUploaded(doc.id)).length / DOCUMENT_TYPES.length) * 100} 
          className="h-2" 
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={onPrevious}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!allRequiredDocumentsUploaded()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {allRequiredDocumentsUploaded() ? 'Continue' : 'Upload Required Documents'}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

export default VerificationStep
