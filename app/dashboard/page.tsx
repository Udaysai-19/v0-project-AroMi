import { createClient } from "@/lib/supabase/server"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const [
    { data: profile },
    { data: assessment },
    { data: workoutPlans },
    { data: progressRecords },
    { data: achievements },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("health_assessments")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("workout_plans")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true),
    supabase
      .from("progress_records")
      .select("*")
      .eq("user_id", user.id)
      .order("recorded_date", { ascending: false })
      .limit(7),
    supabase
      .from("achievements")
      .select("*")
      .eq("user_id", user.id)
      .eq("unlocked", true),
  ])

  return (
    <DashboardContent
      profile={profile}
      assessment={assessment}
      workoutPlans={workoutPlans || []}
      progressRecords={progressRecords || []}
      achievements={achievements || []}
    />
  )
}
