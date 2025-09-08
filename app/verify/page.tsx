"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Heart, Upload, CheckCircle, AlertCircle, FileText, Camera, Award as IdCard } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface UploadedFile {
  file: File
  preview: string
  uploaded: boolean
  url?: string
}

export default function VerifyPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const [files, setFiles] = useState<{
    idDocument: UploadedFile | null
    selfie: UploadedFile | null
    license: UploadedFile | null
  }>({
    idDocument: null,
    selfie: null,
    license: null,
  })

  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUser(user)
      setIsLoading(false)
    }

    checkUser()
  }, [router, supabase.auth])

  const handleFileSelect = (type: "idDocument" | "selfie" | "license", file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      setError("File size must be less than 10MB")
      return
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"]
    if (!allowedTypes.includes(file.type)) {
      setError("Only JPEG and PNG files are allowed")
      return
    }

    const preview = URL.createObjectURL(file)
    setFiles((prev) => ({
      ...prev,
      [type]: { file, preview, uploaded: false },
    }))
    setError(null)
  }

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${path}/${fileName}`

    const { data, error } = await supabase.storage.from("verification-documents").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) throw error

    const {
      data: { publicUrl },
    } = supabase.storage.from("verification-documents").getPublicUrl(filePath)

    return publicUrl
  }

  const handleSubmit = async () => {
    if (!files.idDocument || !files.selfie || !files.license) {
      setError("Please upload all required documents")
      return
    }

    setIsUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      // Upload files to Supabase Storage
      setUploadProgress(20)
      const idDocumentUrl = await uploadFile(files.idDocument.file, `${user.id}/id-documents`)

      setUploadProgress(40)
      const selfieUrl = await uploadFile(files.selfie.file, `${user.id}/selfies`)

      setUploadProgress(60)
      const licenseUrl = await uploadFile(files.license.file, `${user.id}/licenses`)

      setUploadProgress(80)

      // Save verification record to database
      const { error: dbError } = await supabase.from("verification_documents").insert({
        user_id: user.id,
        id_document_url: idDocumentUrl,
        selfie_url: selfieUrl,
        license_url: licenseUrl,
        status: "pending",
        submitted_at: new Date().toISOString(),
      })

      if (dbError) throw dbError

      setUploadProgress(100)
      setSuccess(true)

      // Redirect to dashboard after success
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error: any) {
      setError(error.message || "Failed to upload documents")
    } finally {
      setIsUploading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Heart className="w-5 h-5 text-white animate-pulse" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Documents Submitted!</CardTitle>
            <CardDescription>Your verification documents have been uploaded successfully</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Our team will review your documents within 24-48 hours. You'll receive an email notification once your
              account is verified.
            </p>
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">BeyondRounds</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Medical Credentials</h1>
          <p className="text-gray-600">Upload your documents to complete your profile verification</p>
        </div>

        {/* Progress Bar */}
        {isUploading && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading documents...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                Verification Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <IdCard className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Government ID</h4>
                    <p className="text-xs text-gray-600">Valid passport, driver's license, or national ID card</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Camera className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Selfie Photo</h4>
                    <p className="text-xs text-gray-600">Clear photo of yourself holding your ID document</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <FileText className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Medical License</h4>
                    <p className="text-xs text-gray-600">Current medical license or registration certificate</p>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  All documents are stored securely and will be automatically deleted after 90 days. Only our
                  verification team can access these files.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Upload Form */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Documents</CardTitle>
              <CardDescription>Please upload clear, high-quality images of your documents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* ID Document Upload */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <IdCard className="w-4 h-4" />
                  Government ID
                  <Badge variant="secondary" className="text-xs">
                    Required
                  </Badge>
                </Label>
                {!files.idDocument ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Click to upload or drag and drop</p>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileSelect("idDocument", e.target.files[0])}
                      className="hidden"
                      id="id-upload"
                    />
                    <Label htmlFor="id-upload" className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild>
                        <span>Choose File</span>
                      </Button>
                    </Label>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={files.idDocument.preview || "/placeholder.svg"}
                      alt="ID Document"
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setFiles((prev) => ({ ...prev, idDocument: null }))}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              {/* Selfie Upload */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Selfie with ID
                  <Badge variant="secondary" className="text-xs">
                    Required
                  </Badge>
                </Label>
                {!files.selfie ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Photo of you holding your ID</p>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileSelect("selfie", e.target.files[0])}
                      className="hidden"
                      id="selfie-upload"
                    />
                    <Label htmlFor="selfie-upload" className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild>
                        <span>Choose File</span>
                      </Button>
                    </Label>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={files.selfie.preview || "/placeholder.svg"}
                      alt="Selfie"
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setFiles((prev) => ({ ...prev, selfie: null }))}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              {/* License Upload */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Medical License
                  <Badge variant="secondary" className="text-xs">
                    Required
                  </Badge>
                </Label>
                {!files.license ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Medical license or certificate</p>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileSelect("license", e.target.files[0])}
                      className="hidden"
                      id="license-upload"
                    />
                    <Label htmlFor="license-upload" className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild>
                        <span>Choose File</span>
                      </Button>
                    </Label>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={files.license.preview || "/placeholder.svg"}
                      alt="Medical License"
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setFiles((prev) => ({ ...prev, license: null }))}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleSubmit}
                disabled={!files.idDocument || !files.selfie || !files.license || isUploading}
                className="w-full"
              >
                {isUploading ? "Uploading..." : "Submit for Verification"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
