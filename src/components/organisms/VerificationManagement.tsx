'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { Alert, AlertDescription } from '../../ui/alert'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { Textarea } from '../../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Eye,
  Search,
  Filter,
  RefreshCw,
  Shield,
  User,
  FileText,
  Camera,
  Download
} from 'lucide-react'
import { toast } from 'sonner'

interface VerificationManagementProps {
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
  profiles?: {
    first_name: string
    last_name: string
    email: string
    medical_specialty: string
  }
}

export function VerificationManagement({ userId }: VerificationManagementProps) {
  const [documents, setDocuments] = useState<VerificationDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedDocument, setSelectedDocument] = useState<VerificationDocument | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected'>('approved')

  useEffect(() => {
    loadVerificationDocuments()
  }, [])

  const loadVerificationDocuments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/verification')
      if (response.ok) {
        const result = await response.json()
        setDocuments(result.data || [])
      } else {
        toast.error('Failed to load verification documents')
      }
    } catch (error) {
      console.error('Error loading verification documents:', error)
      toast.error('Error loading verification documents')
    } finally {
      setLoading(false)
    }
  }

  const handleReviewDocument = async (documentId: string, status: 'approved' | 'rejected', notes: string) => {
    try {
      const response = await fetch('/api/admin/verification', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId,
          status,
          adminNotes: notes
        })
      })

      if (response.ok) {
        toast.success(`Document ${status} successfully`)
        setSelectedDocument(null)
        setReviewNotes('')
        loadVerificationDocuments()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to review document')
      }
    } catch (error) {
      console.error('Error reviewing document:', error)
      toast.error('Error reviewing document')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      default:
        return null
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchTerm || 
      doc.profiles?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.profiles?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getDocumentTypeCounts = () => {
    const counts = { pending: 0, approved: 0, rejected: 0 }
    documents.forEach(doc => {
      counts[doc.status as keyof typeof counts]++
    })
    return counts
  }

  const counts = getDocumentTypeCounts()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading verification documents...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Verification Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Review and manage user verification documents</p>
        </div>
        <Button onClick={loadVerificationDocuments} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{counts.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{counts.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{counts.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="md:w-48">
              <Label htmlFor="status">Status Filter</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <div className="space-y-4">
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No verification documents found</p>
            </CardContent>
          </Card>
        ) : (
          filteredDocuments.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {doc.profiles?.first_name} {doc.profiles?.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">{doc.profiles?.email}</p>
                      <p className="text-xs text-gray-500">
                        {doc.profiles?.medical_specialty} • Submitted: {new Date(doc.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(doc.status)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDocument(doc)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Review Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Review Verification Documents</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDocument(null)}
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">User Information</h4>
                <p><strong>Name:</strong> {selectedDocument.profiles?.first_name} {selectedDocument.profiles?.last_name}</p>
                <p><strong>Email:</strong> {selectedDocument.profiles?.email}</p>
                <p><strong>Specialty:</strong> {selectedDocument.profiles?.medical_specialty}</p>
                <p><strong>Submitted:</strong> {new Date(selectedDocument.submitted_at).toLocaleString()}</p>
              </div>

              {/* Documents */}
              <div className="space-y-4">
                <h4 className="font-semibold">Documents</h4>
                
                {selectedDocument.id_document_url && (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        <span className="font-medium">Government ID</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(selectedDocument.id_document_url!, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                )}

                {selectedDocument.selfie_url && (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Camera className="h-4 w-4 mr-2" />
                        <span className="font-medium">Identity Selfie</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(selectedDocument.selfie_url!, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                )}

                {selectedDocument.license_url && (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        <span className="font-medium">Medical License</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(selectedDocument.license_url!, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Review Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reviewStatus">Decision</Label>
                  <Select value={reviewStatus} onValueChange={(value: 'approved' | 'rejected') => setReviewStatus(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Approve</SelectItem>
                      <SelectItem value="rejected">Reject</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="reviewNotes">Notes (Optional)</Label>
                  <Textarea
                    id="reviewNotes"
                    placeholder="Add any notes about your decision..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedDocument(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleReviewDocument(selectedDocument.id, reviewStatus, reviewNotes)}
                    className={reviewStatus === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                  >
                    {reviewStatus === 'approved' ? 'Approve' : 'Reject'} Document
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}