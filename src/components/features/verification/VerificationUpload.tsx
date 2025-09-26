'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Camera,
  FileImage,
  Shield
} from 'lucide-react'
import { toast } from 'sonner'

interface VerificationUploadProps {
  userId: string
  onUploadComplete?: () => void
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
    name: 'ID Document',
    description: 'Upload a clear photo of your government-issued ID',
    icon: FileText,
    acceptedTypes: 'image/*,.pdf',
    maxSize: 5 * 1024 * 1024 // 5MB
  },
  {
    id: 'selfie',
    name: 'Selfie',
    description: 'Take a selfie holding your ID next to your face',
    icon: Camera,
    acceptedTypes: 'image/*',
    maxSize: 5 * 1024 * 1024 // 5MB
  },
  {
    id: 'license',
    name: 'Medical License',
    description: 'Upload your medical license or diploma',
    icon: Shield,
    acceptedTypes: 'image/*,.pdf',
    maxSize: 10 * 1024 * 1024 // 10MB
  }
]

export default function VerificationUpload({ userId, onUploadComplete }: VerificationUploadProps) {
  const [documents, setDocuments] = useState<VerificationDocument | null>(null)
  const [uploading, setUploading] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

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

      // In a real implementation, you would upload to Supabase Storage or AWS S3
      // For now, we'll simulate the upload with a data URL
      const reader = new FileReader()
      reader.onload = async () => {
        const fileUrl = reader.result as string
        
        // Upload to our API
        const response = await fetch('/api/verification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            documentType,
            fileUrl,
            fileName: file.name
          })
        })

        clearInterval(progressInterval)
        setUploadProgress(100)

        if (response.ok) {
          const result = await response.json()
          setDocuments(result.data)
          toast.success(`${docType.name} uploaded successfully!`)
          onUploadComplete?.()
        } else {
          const error = await response.json()
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
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
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

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Identity Verification</h3>
        <p className="text-sm text-gray-600">
          Upload your documents to verify your identity and medical credentials
        </p>
      </div>

      {documents && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Verification Status: {getStatusBadge(documents.status)}
            {documents.admin_notes && (
              <div className="mt-2 text-sm">
                <strong>Admin Notes:</strong> {documents.admin_notes}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {DOCUMENT_TYPES.map((docType) => {
          const IconComponent = docType.icon
          const isUploaded = isDocumentUploaded(docType.id)
          const isCurrentlyUploading = uploading === docType.id
          const documentUrl = getDocumentUrl(docType.id)

          return (
            <Card key={docType.id} className="relative">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-sm">
                  <IconComponent className="h-4 w-4 mr-2" />
                  {docType.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-gray-600">{docType.description}</p>
                
                {isUploaded ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-green-600">✓ Uploaded</span>
                      {getStatusBadge(documents?.status || 'pending')}
                    </div>
                    {documentUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => window.open(documentUrl, '_blank')}
                      >
                        <FileImage className="h-3 w-3 mr-1" />
                        View Document
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      ref={(el) => { fileInputRefs.current[docType.id] = el }}
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
                      <Progress value={uploadProgress} className="h-2" />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          All documents are securely stored and encrypted. Verification typically takes 24-48 hours.
        </p>
      </div>
    </div>
  )
}
