import { createClient } from "@/lib/supabase/server"
import { WorkoutPlansView } from "@/components/dashboard/workout-plans-view"

export default async function WorkoutsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: workoutPlans } = await supabase
    .from("workout_plans")
    .select("*, exercises(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const { data: profile } = await supabase
    .from("profiles")
    .select("fitness_goal, activity_level")
    .eq("id", user.id)
    .single()

  return (
    <WorkoutPlansView
      userId={user.id}
      workoutPlans={workoutPlans || []}
      profile={profile}
    />
  )
}
