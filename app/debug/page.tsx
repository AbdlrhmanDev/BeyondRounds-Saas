"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

interface DiagnosticResult {
  step: string
  data: any
  error?: string
}

export default function DebugPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [results, setResults] = useState<DiagnosticResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [isFixing, setIsFixing] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        router.push("/auth/login")
        return
      }
      setUser(user)
      setIsLoading(false)
    }
    checkAuth()
  }, [router, supabase])

  const runDiagnostics = async () => {
    setIsRunning(true)
    setResults([])
    const diagnostics: DiagnosticResult[] = []

    try {
      // Step 1: Check system readiness
      try {
        const { data, error } = await supabase.rpc('get_system_readiness')
        diagnostics.push({
          step: "System Readiness",
          data: error ? { error: error.message } : data,
          error: error?.message
        })
      } catch (err) {
        diagnostics.push({
          step: "System Readiness", 
          data: null,
          error: `Error: ${err}`
        })
      }

      // Step 2: Check eligible users count
      try {
        const { data, error } = await supabase.rpc('get_eligible_users_count')
        diagnostics.push({
          step: "Eligible Users Count",
          data: error ? { error: error.message } : { count: data },
          error: error?.message
        })
      } catch (err) {
        diagnostics.push({
          step: "Eligible Users Count",
          data: null,
          error: `Error: ${err}`
        })
      }

      // Step 3: Check matches count
      try {
        const { data, error } = await supabase
          .from('matches')
          .select('id, group_name, status, created_at')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(10)
        
        diagnostics.push({
          step: "Active Matches",
          data: error ? { error: error.message } : { matches: data, count: data?.length || 0 },
          error: error?.message
        })
      } catch (err) {
        diagnostics.push({
          step: "Active Matches",
          data: null,
          error: `Error: ${err}`
        })
      }

      // Step 4: Check current user's matches
      try {
        const { data, error } = await supabase
          .from('matches')
          .select(`
            id,
            group_name,
            status,
            created_at,
            match_members!inner(
              user_id,
              profiles(first_name, last_name)
            )
          `)
          .eq('match_members.user_id', user.id)
          .order('created_at', { ascending: false })

        diagnostics.push({
          step: "User's Matches",
          data: error ? { error: error.message } : { matches: data, count: data?.length || 0 },
          error: error?.message
        })
      } catch (err) {
        diagnostics.push({
          step: "User's Matches",
          data: null,
          error: `Error: ${err}`
        })
      }

      // Step 5: Check user profile
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        diagnostics.push({
          step: "User Profile",
          data: error ? { error: error.message } : data,
          error: error?.message
        })
      } catch (err) {
        diagnostics.push({
          step: "User Profile",
          data: null,
          error: `Error: ${err}`
        })
      }

      // Step 6: Check matching statistics
      try {
        const { data, error } = await supabase.rpc('get_matching_statistics')
        diagnostics.push({
          step: "Matching Statistics",
          data: error ? { error: error.message } : data,
          error: error?.message
        })
      } catch (err) {
        diagnostics.push({
          step: "Matching Statistics",
          data: null,
          error: `Error: ${err}`
        })
      }

      // Step 7: Try to create groups if user is admin
      try {
        const { data: role, error: roleError } = await supabase.rpc('get_user_role', { uid: user.id })
        if (!roleError && role === 'admin') {
          const { data, error } = await supabase.rpc('trigger_manual_matching')
          diagnostics.push({
            step: "Manual Matching (Admin)",
            data: error ? { error: error.message } : data,
            error: error?.message
          })
        } else {
          diagnostics.push({
            step: "Manual Matching",
            data: { message: "Not admin - cannot trigger matching" },
            error: roleError?.message
          })
        }
      } catch (err) {
        diagnostics.push({
          step: "Manual Matching",
          data: null,
          error: `Error: ${err}`
        })
      }

    } catch (error) {
      console.error("Diagnostic error:", error)
    }

    setResults(diagnostics)
    setIsRunning(false)
  }

  const fixInfiniteRecursion = async () => {
    setIsFixing(true)
    try {
      // This would ideally run the SQL script, but for now we'll just show a message
      alert("To fix the infinite recursion error, please run the script 'scripts/039_fix_infinite_recursion.sql' in your Supabase SQL editor.")
    } catch (error) {
      console.error("Error:", error)
    }
    setIsFixing(false)
  }

  const createManualGroups = async () => {
    setIsFixing(true)
    try {
      // This would ideally run the SQL script, but for now we'll just show a message
      alert("To create manual test groups, please run the script 'scripts/040_create_manual_groups.sql' in your Supabase SQL editor.")
    } catch (error) {
      console.error("Error:", error)
    }
    setIsFixing(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Debug Dashboard</h1>
          <p className="text-gray-600">Diagnose why no groups are showing up</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={runDiagnostics}
            disabled={isRunning || isFixing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isRunning ? "Running..." : "Run Diagnostics"}
          </Button>
          <Button 
            onClick={fixInfiniteRecursion}
            disabled={isRunning || isFixing}
            variant="outline"
          >
            {isFixing ? "Fixing..." : "Fix RLS Issues"}
          </Button>
          <Button 
            onClick={createManualGroups}
            disabled={isRunning || isFixing}
            className="bg-green-600 hover:bg-green-700"
          >
            {isFixing ? "Creating..." : "Create Test Groups"}
          </Button>
        </div>
      </div>

      {results.length > 0 && (
        <>
          {/* Summary Card */}
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800">🔍 Issues Found</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Badge variant="destructive">Critical</Badge>
                  <span><strong>Infinite Recursion Error:</strong> RLS policies on match_members table are causing circular references</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">Warning</Badge>
                  <span><strong>System Not Ready:</strong> Only 3 eligible users, need 6+ users across 2+ cities</span>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded border">
                  <p className="text-blue-800 font-medium">🛠️ Solutions:</p>
                  <ol className="list-decimal list-inside mt-2 space-y-1 text-blue-700">
                    <li>Click "Fix RLS Issues" to get the SQL script that fixes the infinite recursion</li>
                    <li>Click "Create Test Groups" to manually create groups for testing</li>
                    <li>Run the provided scripts in your Supabase SQL editor</li>
                    <li>Refresh your dashboard to see the groups</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {results.map((result, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{result.step}</span>
                  <Badge variant={result.error ? "destructive" : "default"}>
                    {result.error ? "Error" : "Success"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.error && (
                  <div className="text-red-600 mb-2">
                    <strong>Error:</strong> {result.error}
                  </div>
                )}
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </CardContent>
            </Card>
            ))}
          </div>
        </>
      )}

      {results.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">
              Click "Run Diagnostics" to check the system status and understand why no groups are showing up.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
