import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { MatchingAlgorithm } from "@/lib/matching-algorithm"
import { isAdmin } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is admin using secure role-based check
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userIsAdmin = await isAdmin(user.id)
    if (!userIsAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const algorithm = new MatchingAlgorithm()

    console.log("Admin manually running matching algorithm...")

    // Create matches
    const groups = await algorithm.createMatches(supabase)

    if (groups.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No matches created",
        groupsCreated: 0,
      })
    }

    // Save matches to database
    await algorithm.saveMatches(supabase, groups)

    console.log(`Admin created ${groups.length} match groups`)

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
    return NextResponse.json(
      {
        error: "Failed to run matching algorithm",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
