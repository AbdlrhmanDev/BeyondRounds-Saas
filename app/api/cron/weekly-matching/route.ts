import { type NextRequest, NextResponse } from "next/server"
import { createWeeklyMatchingEngine } from "@/lib/weekly-matching-engine"

// ==============================================
// AUTOMATED MATCHING CRON JOB - PRODUCTION READY
// Runs every Thursday at 16:00 local time
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

    console.log("🤖 Starting BeyondRounds Weekly Matching Engine...")
    console.log(`📅 Execution time: ${new Date().toISOString()}`)

    // Create matching engine instance
    const engine = await createWeeklyMatchingEngine()

    // Check if matching has already been run this week
    const currentWeek = new Date().toISOString().split("T")[0]
    const { data: existingMatches, error: checkError } = await engine.supabase
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
        week: currentWeek
      })
    }

    // Run the complete 7-step matching process
    const results = await engine.runWeeklyMatching()

    // Log results for admin monitoring
    await logMatchingResult(engine.supabase, {
      week: currentWeek,
      groupsCreated: results.finalGroups.length,
      eligibleUsers: results.eligibleUsers.length,
      validPairs: results.scoredPairings.length,
      rolloverUsers: results.rolloverCandidates.length,
      reason: results.finalGroups.length > 0 ? "Success" : "No valid groups formed"
    })

    console.log(`🎉 Weekly matching completed successfully!`)
    console.log(`📊 Final Results:`)
    console.log(`   • Eligible users: ${results.eligibleUsers.length}`)
    console.log(`   • Valid pairs: ${results.scoredPairings.length}`)
    console.log(`   • Groups created: ${results.finalGroups.length}`)
    console.log(`   • Notifications prepared: ${results.notifications.length}`)
    console.log(`   • Rollover candidates: ${results.rolloverCandidates.length}`)

    return NextResponse.json({
      success: true,
      message: `Weekly matching completed - Created ${results.finalGroups.length} groups`,
      week: currentWeek,
      results: {
        eligibleUsers: results.eligibleUsers.length,
        validPairs: results.scoredPairings.length,
        groupsCreated: results.finalGroups.length,
        notificationsPrepared: results.notifications.length,
        rolloverCandidates: results.rolloverCandidates.length,
        groups: results.finalGroups.map((group) => ({
          groupName: group.groupName,
          memberCount: group.members.length,
          averageScore: group.averageScore.toFixed(3),
          members: group.members.map((member) => ({
            name: `${member.first_name} ${member.last_name}`,
            specialty: member.specialty,
            city: member.city,
          })),
        })),
        notifications: results.notifications.map((notif) => ({
          userId: notif.userId,
          email: notif.email,
          firstName: notif.firstName,
          groupName: notif.groupName,
          groupMemberCount: notif.groupMembers.length
        })),
        rolloverUsers: results.rolloverCandidates.map((user) => ({
          name: `${user.first_name} ${user.last_name}`,
          specialty: user.specialty,
          city: user.city,
        }))
      }
    })

  } catch (error: any) {
    console.error("❌ Error running weekly matching engine:", error)
    
    // Log error for monitoring
    try {
      const engine = await createWeeklyMatchingEngine()
      await logMatchingResult(engine.supabase, {
        week: new Date().toISOString().split("T")[0],
        groupsCreated: 0,
        eligibleUsers: 0,
        validPairs: 0,
        rolloverUsers: 0,
        reason: `Error: ${error.message}`
      })
    } catch (logError) {
      console.error("Failed to log matching error:", logError)
    }

    return NextResponse.json(
      {
        error: "Failed to run weekly matching engine",
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
    console.log("🧪 Manual weekly matching test triggered...")
    
    // Create matching engine instance
    const engine = await createWeeklyMatchingEngine()

    // Run the complete 7-step matching process (without saving to avoid duplicate entries)
    const results = await engine.runWeeklyMatching()

    return NextResponse.json({
      success: true,
      message: "Manual test completed - Full 7-step process executed",
      testResults: {
        eligibleUsers: results.eligibleUsers.length,
        validPairs: results.scoredPairings.length,
        groupsCreated: results.finalGroups.length,
        notificationsPrepared: results.notifications.length,
        rolloverCandidates: results.rolloverCandidates.length,
        groups: results.finalGroups.map((group) => ({
          groupName: group.groupName,
          memberCount: group.members.length,
          averageScore: group.averageScore.toFixed(3),
          members: group.members.map((member) => ({
            name: `${member.first_name} ${member.last_name}`,
            specialty: member.specialty,
            city: member.city,
          })),
        })),
        sampleNotifications: results.notifications.slice(0, 3).map((notif) => ({
          email: notif.email,
          firstName: notif.firstName,
          groupName: notif.groupName,
          groupMemberCount: notif.groupMembers.length
        })),
        rolloverUsers: results.rolloverCandidates.map((user) => ({
          name: `${user.first_name} ${user.last_name}`,
          specialty: user.specialty,
          city: user.city,
        }))
      }
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
  validPairs?: number
  rolloverUsers?: number
  reason: string
}) {
  try {
    // Create a simple logging table if it doesn't exist (ignore errors if it already exists)
    try {
      await supabase.rpc('create_matching_logs_table_if_not_exists')
    } catch (rpcError) {
      // Ignore RPC errors - table likely already exists
    }
    
    const { error } = await supabase
      .from("matching_logs")
      .insert({
        week: result.week,
        groups_created: result.groupsCreated,
        eligible_users: result.eligibleUsers,
        valid_pairs: result.validPairs || 0,
        rollover_users: result.rolloverUsers || 0,
        reason: result.reason,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error("Failed to log matching result:", error)
      // Try basic insert without extra columns if table schema is different
      try {
        await supabase
          .from("matching_logs")
          .insert({
            week: result.week,
            groups_created: result.groupsCreated,
            eligible_users: result.eligibleUsers,
            reason: result.reason,
            created_at: new Date().toISOString()
          })
      } catch (fallbackError) {
        console.error("Fallback logging also failed:", fallbackError)
      }
    } else {
      console.log(`📝 Logged matching result for week ${result.week}`)
    }
  } catch (error) {
    console.error("Error in logging function:", error)
  }
}
