import { createClient } from "@/lib/supabase/server"
import { ProgressView } from "@/components/dashboard/progress-view"

export default async function ProgressPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: progressRecords } = await supabase
    .from("progress_records")
    .select("*")
    .eq("user_id", user.id)
    .order("recorded_date", { ascending: true })

  return <ProgressView userId={user.id} records={progressRecords || []} />
}
