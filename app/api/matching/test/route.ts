import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { MatchingAlgorithm } from "@/lib/matching-algorithm"

export async function GET(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Test endpoint not available in production" }, { status: 403 })
    }

    const supabase = await createClient()
    const algorithm = new MatchingAlgorithm()

    // Get eligible users for testing
    const { data: users, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("is_verified", true)
      .eq("is_paid", true)
      .not("interests", "is", null)
      .not("availability_slots", "is", null)

    if (error) {
      throw error
    }

    console.log(`Found ${users?.length || 0} eligible users for matching`)

    // Run algorithm without saving
    const groups = await algorithm.createMatches(supabase)

    return NextResponse.json({
      success: true,
      eligibleUsers: users?.length || 0,
      groupsCreated: groups.length,
      groups: groups.map((g) => ({
        groupId: g.groupId,
        memberCount: g.members.length,
        averageScore: g.averageScore.toFixed(3),
        members: g.members.map((m) => ({
          id: m.id,
          name: `${m.first_name} ${m.last_name}`,
          specialty: m.specialty,
          city: m.city,
          gender: m.gender,
          interests: m.interests,
          availability: m.availability_slots,
        })),
      })),
    })
  } catch (error: any) {
    console.error("Error testing matching algorithm:", error)
    return NextResponse.json({ error: "Failed to test matching algorithm", details: error.message }, { status: 500 })
  }
}
