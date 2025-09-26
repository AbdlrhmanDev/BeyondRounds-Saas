import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  CreditCard,
  Lock,
  Check,
  AlertCircle,
  Calendar,
  DollarSign
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface PaymentFormProps {
  selectedPlan?: {
    id: string
    name: string
    price: number
    interval: 'month' | 'year'
    features: string[]
  }
  onSubmit: (paymentData: PaymentData) => void
  loading?: boolean
}

interface PaymentData {
  planId: string
  paymentMethod: {
    cardNumber: string
    expiryMonth: string
    expiryYear: string
    cvc: string
    cardholderName: string
  }
  billingAddress: {
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  agreesToTerms: boolean
}

export function PaymentForm({ selectedPlan, onSubmit, loading = false }: PaymentFormProps) {
  const [paymentData, setPaymentData] = useState<PaymentData>({
    planId: selectedPlan?.id || '',
    paymentMethod: {
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvc: '',
      cardholderName: ''
    },
    billingAddress: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    },
    agreesToTerms: false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (section: keyof PaymentData, field: string, value: string | boolean) => {
    setPaymentData(prev => ({
      ...prev,
      [section]: typeof prev[section] === 'object' && prev[section] !== null
        ? { ...prev[section], [field]: value }
        : value
    }))

    // Clear error when user starts typing
    if (errors[`${section}.${field}`]) {
      setErrors(prev => ({ ...prev, [`${section}.${field}`]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate payment method
    if (!paymentData.paymentMethod.cardNumber) {
      newErrors['paymentMethod.cardNumber'] = 'Card number is required'
    } else if (paymentData.paymentMethod.cardNumber.replace(/\s/g, '').length < 16) {
      newErrors['paymentMethod.cardNumber'] = 'Invalid card number'
    }

    if (!paymentData.paymentMethod.expiryMonth) {
      newErrors['paymentMethod.expiryMonth'] = 'Expiry month is required'
    }

    if (!paymentData.paymentMethod.expiryYear) {
      newErrors['paymentMethod.expiryYear'] = 'Expiry year is required'
    }

    if (!paymentData.paymentMethod.cvc) {
      newErrors['paymentMethod.cvc'] = 'CVC is required'
    } else if (paymentData.paymentMethod.cvc.length < 3) {
      newErrors['paymentMethod.cvc'] = 'Invalid CVC'
    }

    if (!paymentData.paymentMethod.cardholderName) {
      newErrors['paymentMethod.cardholderName'] = 'Cardholder name is required'
    }

    // Validate billing address
    if (!paymentData.billingAddress.address) {
      newErrors['billingAddress.address'] = 'Address is required'
    }

    if (!paymentData.billingAddress.city) {
      newErrors['billingAddress.city'] = 'City is required'
    }

    if (!paymentData.billingAddress.state) {
      newErrors['billingAddress.state'] = 'State is required'
    }

    if (!paymentData.billingAddress.zipCode) {
      newErrors['billingAddress.zipCode'] = 'Zip code is required'
    }

    if (!paymentData.agreesToTerms) {
      newErrors['agreesToTerms'] = 'You must agree to the terms and conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(paymentData)
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 20 }, (_, i) => currentYear + i)
  const months = [
    '01', '02', '03', '04', '05', '06',
    '07', '08', '09', '10', '11', '12'
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {selectedPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Selected Plan</span>
              <Badge variant="secondary">
                ${selectedPlan.price}/{selectedPlan.interval}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h3 className="font-semibold">{selectedPlan.name}</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                {selectedPlan.features.slice(0, 3).map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={paymentData.paymentMethod.cardNumber}
                onChange={(e) => {
                  const formatted = formatCardNumber(e.target.value)
                  handleInputChange('paymentMethod', 'cardNumber', formatted)
                }}
                maxLength={19}
                className={errors['paymentMethod.cardNumber'] ? 'border-red-500' : ''}
              />
              {errors['paymentMethod.cardNumber'] && (
                <p className="text-red-500 text-sm">{errors['paymentMethod.cardNumber']}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Expiry Month</Label>
                <Select
                  value={paymentData.paymentMethod.expiryMonth}
                  onValueChange={(value) => handleInputChange('paymentMethod', 'expiryMonth', value)}
                >
                  <SelectTrigger className={errors['paymentMethod.expiryMonth'] ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(month => (
                      <SelectItem key={month} value={month}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors['paymentMethod.expiryMonth'] && (
                  <p className="text-red-500 text-sm">{errors['paymentMethod.expiryMonth']}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Expiry Year</Label>
                <Select
                  value={paymentData.paymentMethod.expiryYear}
                  onValueChange={(value) => handleInputChange('paymentMethod', 'expiryYear', value)}
                >
                  <SelectTrigger className={errors['paymentMethod.expiryYear'] ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors['paymentMethod.expiryYear'] && (
                  <p className="text-red-500 text-sm">{errors['paymentMethod.expiryYear']}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  placeholder="123"
                  value={paymentData.paymentMethod.cvc}
                  onChange={(e) => handleInputChange('paymentMethod', 'cvc', e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className={errors['paymentMethod.cvc'] ? 'border-red-500' : ''}
                />
                {errors['paymentMethod.cvc'] && (
                  <p className="text-red-500 text-sm">{errors['paymentMethod.cvc']}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardholderName">Cardholder Name</Label>
              <Input
                id="cardholderName"
                placeholder="John Doe"
                value={paymentData.paymentMethod.cardholderName}
                onChange={(e) => handleInputChange('paymentMethod', 'cardholderName', e.target.value)}
                className={errors['paymentMethod.cardholderName'] ? 'border-red-500' : ''}
              />
              {errors['paymentMethod.cardholderName'] && (
                <p className="text-red-500 text-sm">{errors['paymentMethod.cardholderName']}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Billing Address */}
        <Card>
          <CardHeader>
            <CardTitle>Billing Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="123 Main St"
                value={paymentData.billingAddress.address}
                onChange={(e) => handleInputChange('billingAddress', 'address', e.target.value)}
                className={errors['billingAddress.address'] ? 'border-red-500' : ''}
              />
              {errors['billingAddress.address'] && (
                <p className="text-red-500 text-sm">{errors['billingAddress.address']}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="New York"
                  value={paymentData.billingAddress.city}
                  onChange={(e) => handleInputChange('billingAddress', 'city', e.target.value)}
                  className={errors['billingAddress.city'] ? 'border-red-500' : ''}
                />
                {errors['billingAddress.city'] && (
                  <p className="text-red-500 text-sm">{errors['billingAddress.city']}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="NY"
                  value={paymentData.billingAddress.state}
                  onChange={(e) => handleInputChange('billingAddress', 'state', e.target.value)}
                  className={errors['billingAddress.state'] ? 'border-red-500' : ''}
                />
                {errors['billingAddress.state'] && (
                  <p className="text-red-500 text-sm">{errors['billingAddress.state']}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input
                  id="zipCode"
                  placeholder="10001"
                  value={paymentData.billingAddress.zipCode}
                  onChange={(e) => handleInputChange('billingAddress', 'zipCode', e.target.value)}
                  className={errors['billingAddress.zipCode'] ? 'border-red-500' : ''}
                />
                {errors['billingAddress.zipCode'] && (
                  <p className="text-red-500 text-sm">{errors['billingAddress.zipCode']}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Country</Label>
                <Select
                  value={paymentData.billingAddress.country}
                  onValueChange={(value) => handleInputChange('billingAddress', 'country', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="UK">United Kingdom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms and Submit */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={paymentData.agreesToTerms}
                  onCheckedChange={(checked) => handleInputChange('agreesToTerms' as any, '', !!checked)}
                />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the{' '}
                  <a href="/terms" className="text-blue-600 hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </a>
                </Label>
              </div>
              {errors['agreesToTerms'] && (
                <p className="text-red-500 text-sm">{errors['agreesToTerms']}</p>
              )}

              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  Your payment information is encrypted and secure. We use industry-standard security measures to protect your data.
                </AlertDescription>
              </Alert>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  'Processing...'
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Complete Payment
                    {selectedPlan && (
                      <span className="ml-2">
                        ${selectedPlan.price}/{selectedPlan.interval}
                      </span>
                    )}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}