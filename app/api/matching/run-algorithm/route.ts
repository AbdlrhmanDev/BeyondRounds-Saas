import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { MatchingAlgorithm } from "@/lib/matching-algorithm"

export async function POST(request: NextRequest) {
  try {
    // Verify this is an authorized request (you might want to add API key auth)
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()
    const algorithm = new MatchingAlgorithm()

    console.log("Running weekly matching algorithm...")

    // Create matches
    const groups = await algorithm.createMatches(supabase)

    if (groups.length === 0) {
      console.log("No matches created this week")
      return NextResponse.json({
        success: true,
        message: "No matches created this week",
        groupsCreated: 0,
      })
    }

    // Save matches to database
    await algorithm.saveMatches(supabase, groups)

    console.log(`Successfully created ${groups.length} match groups`)

    return NextResponse.json({
      success: true,
      message: `Created ${groups.length} match groups`,
      groupsCreated: groups.length,
      groups: groups.map((g) => ({
        groupId: g.groupId,
        memberCount: g.members.length,
        averageScore: g.averageScore,
        members: g.members.map((m) => ({
          name: `${m.first_name} ${m.last_name}`,
          specialty: m.specialty,
          city: m.city,
        })),
      })),
    })
  } catch (error: any) {
    console.error("Error running matching algorithm:", error)
    return NextResponse.json({ error: "Failed to run matching algorithm", details: error.message }, { status: 500 })
  }
}

// Allow manual triggering via GET for testing
export async function GET(request: NextRequest) {
  // Only allow in development or with proper auth
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Manual triggering not allowed in production" }, { status: 403 })
  }

  return POST(request)
}
