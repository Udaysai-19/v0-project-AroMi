import { createClient } from "@/lib/supabase/server"
import { AssessmentForm } from "@/components/dashboard/assessment-form"

export default async function AssessmentPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const { data: latestAssessment } = await supabase
    .from("health_assessments")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  return (
    <AssessmentForm
      userId={user.id}
      profile={profile}
      existingAssessment={latestAssessment}
    />
  )
}
