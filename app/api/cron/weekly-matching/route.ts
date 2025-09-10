import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { MatchingAlgorithm } from "@/lib/matching-algorithm"

// ==============================================
// AUTOMATED MATCHING CRON JOB
// ==============================================

export async function POST(request: NextRequest) {
  try {
    // Verify this is an authorized cron request
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      console.error("CRON_SECRET environment variable not set")
      return NextResponse.json({ error: "Cron secret not configured" }, { status: 500 })
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error("Unauthorized cron request")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()
    const algorithm = new MatchingAlgorithm()

    console.log("🤖 Starting automated weekly matching...")

    // Check if matching has already been run this week
    const currentWeek = new Date().toISOString().split("T")[0]
    const { data: existingMatches, error: checkError } = await supabase
      .from("matches")
      .select("id")
      .eq("match_week", currentWeek)
      .limit(1)

    if (checkError) {
      console.error("Error checking existing matches:", checkError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (existingMatches && existingMatches.length > 0) {
      console.log("✅ Matching already completed for this week")
      return NextResponse.json({
        success: true,
        message: "Matching already completed for this week",
        groupsCreated: 0,
      })
    }

    // Run the matching algorithm
    const groups = await algorithm.createMatches(supabase)

    if (groups.length === 0) {
      console.log("ℹ️ No matches created this week (insufficient eligible users)")
      
      // Log this for admin monitoring
      await logMatchingResult(supabase, {
        week: currentWeek,
        groupsCreated: 0,
        eligibleUsers: 0,
        reason: "Insufficient eligible users"
      })

      return NextResponse.json({
        success: true,
        message: "No matches created this week - insufficient eligible users",
        groupsCreated: 0,
      })
    }

    // Save matches to database
    await algorithm.saveMatches(supabase, groups)

    // Log successful matching
    await logMatchingResult(supabase, {
      week: currentWeek,
      groupsCreated: groups.length,
      eligibleUsers: groups.reduce((sum, group) => sum + group.members.length, 0),
      reason: "Success"
    })

    console.log(`🎉 Successfully created ${groups.length} match groups`)

    return NextResponse.json({
      success: true,
      message: `Created ${groups.length} match groups`,
      groupsCreated: groups.length,
      groups: groups.map((g) => ({
        groupId: g.groupId,
        memberCount: g.members.length,
        averageScore: g.averageScore.toFixed(3),
        members: g.members.map((m) => ({
          name: `${m.first_name} ${m.last_name}`,
          specialty: m.specialty,
          city: m.city,
        })),
      })),
    })
  } catch (error: any) {
    console.error("❌ Error running automated matching:", error)
    
    // Log error for monitoring
    try {
      const supabase = await createClient()
      await logMatchingResult(supabase, {
        week: new Date().toISOString().split("T")[0],
        groupsCreated: 0,
        eligibleUsers: 0,
        reason: `Error: ${error.message}`
      })
    } catch (logError) {
      console.error("Failed to log matching error:", logError)
    }

    return NextResponse.json(
      {
        error: "Failed to run matching algorithm",
        details: error.message,
      },
      { status: 500 }
    )
  }
}

// ==============================================
// MANUAL TRIGGER FOR TESTING (Development only)
// ==============================================

export async function GET(request: NextRequest) {
  // Only allow in development or with proper auth
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Manual trigger not available in production" }, { status: 403 })
  }

  try {
    const supabase = await createClient()
    const algorithm = new MatchingAlgorithm()

    console.log("🧪 Manual matching test triggered...")

    const groups = await algorithm.createMatches(supabase)

    return NextResponse.json({
      success: true,
      message: "Manual test completed",
      groupsCreated: groups.length,
      groups: groups.map((g) => ({
        groupId: g.groupId,
        memberCount: g.members.length,
        averageScore: g.averageScore.toFixed(3),
        members: g.members.map((m) => ({
          name: `${m.first_name} ${m.last_name}`,
          specialty: m.specialty,
          city: m.city,
        })),
      })),
    })
  } catch (error: any) {
    console.error("Error in manual matching test:", error)
    return NextResponse.json({ error: "Manual test failed", details: error.message }, { status: 500 })
  }
}

// ==============================================
// MATCHING LOGGING FUNCTION
// ==============================================

async function logMatchingResult(supabase: any, result: {
  week: string
  groupsCreated: number
  eligibleUsers: number
  reason: string
}) {
  try {
    // Create a simple logging table if it doesn't exist
    await supabase.rpc('create_matching_logs_table_if_not_exists')
    
    const { error } = await supabase
      .from("matching_logs")
      .insert({
        week: result.week,
        groups_created: result.groupsCreated,
        eligible_users: result.eligibleUsers,
        reason: result.reason,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error("Failed to log matching result:", error)
    }
  } catch (error) {
    console.error("Error in logging function:", error)
  }
}
