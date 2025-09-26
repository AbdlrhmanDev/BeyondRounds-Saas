'use client'
 
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Wifi, RefreshCw, CheckCircle, XCircle } from 'lucide-react'
 
export default function ConnectionTestPage() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed'>('checking')
  const [realtimeStatus, setRealtimeStatus] = useState<'checking' | 'connected' | 'failed'>('checking')
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])
 
  const supabase = createClient()
 
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }
 
  const testConnection = async () => {
    setConnectionStatus('checking')
    setRealtimeStatus('checking')
    setError(null)
    setLogs([])
 
    try {
      addLog('Testing Supabase connection...')
      
      // Test basic connection
      const { error: connectionError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
 
      if (connectionError) {
        throw new Error(`Connection failed: ${connectionError.message}`)
      }
 
      setConnectionStatus('connected')
      addLog('✅ Basic connection successful')
 
      // Test realtime connection
      addLog('Testing Realtime connection...')
      
      const channel = supabase
        .channel('test-connection')
        .on('presence', { event: 'sync' }, () => {
          addLog('✅ Realtime connection successful')
          setRealtimeStatus('connected')
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            addLog('✅ Realtime subscription successful')
            setRealtimeStatus('connected')
          } else if (status === 'CHANNEL_ERROR') {
            addLog('❌ Realtime subscription failed')
            setRealtimeStatus('failed')
          }
        })
 
      // Clean up after 5 seconds
      setTimeout(() => {
        channel.unsubscribe()
        addLog('Test completed')
      }, 5000)
 
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      addLog(`❌ Error: ${errorMessage}`)
      setError(errorMessage)
      setConnectionStatus('failed')
      setRealtimeStatus('failed')
    }
  }
 
  useEffect(() => {
    testConnection()
  }, [])
 
  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Supabase Connection Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Database Connection</h3>
              <div className="flex items-center gap-2">
                {connectionStatus === 'checking' && <RefreshCw className="h-4 w-4 animate-spin" />}
                {connectionStatus === 'connected' && <CheckCircle className="h-4 w-4 text-green-500" />}
                {connectionStatus === 'failed' && <XCircle className="h-4 w-4 text-red-500" />}
                <Badge variant={connectionStatus === 'connected' ? 'default' : 'destructive'}>
                  {connectionStatus === 'checking' && 'Checking...'}
                  {connectionStatus === 'connected' && 'Connected'}
                  {connectionStatus === 'failed' && 'Failed'}
                </Badge>
              </div>
            </div>
 
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Realtime Connection</h3>
              <div className="flex items-center gap-2">
                {realtimeStatus === 'checking' && <RefreshCw className="h-4 w-4 animate-spin" />}
                {realtimeStatus === 'connected' && <CheckCircle className="h-4 w-4 text-green-500" />}
                {realtimeStatus === 'failed' && <XCircle className="h-4 w-4 text-red-500" />}
                <Badge variant={realtimeStatus === 'connected' ? 'default' : 'destructive'}>
                  {realtimeStatus === 'checking' && 'Checking...'}
                  {realtimeStatus === 'connected' && 'Connected'}
                  {realtimeStatus === 'failed' && 'Failed'}
                </Badge>
              </div>
            </div>
          </div>
 
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
              <h4 className="font-semibold text-red-800 dark:text-red-200">Error Details:</h4>
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
 
          {/* Test Logs */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Test Logs</h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md max-h-64 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500">No logs yet...</p>
              ) : (
                <div className="space-y-1">
                  {logs.map((log, index) => (
                    <div key={index} className="text-sm font-mono">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
 
          {/* Environment Info */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Environment</h3>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md text-sm">
              <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : '❌ NOT SET'}</p>
              <p><strong>Supabase Anon Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : '❌ NOT SET'}</p>
              <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
            </div>
          </div>
 
          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={testConnection} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retest Connection
            </Button>
            <Button onClick={() => window.location.href = '/dashboard'}>
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}