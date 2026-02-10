import { createClient } from "@/lib/supabase/server"
import { NutritionView } from "@/components/dashboard/nutrition-view"

export default async function NutritionPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: nutritionPlans } = await supabase
    .from("nutrition_plans")
    .select("*, meals(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return <NutritionView userId={user.id} nutritionPlans={nutritionPlans || []} />
}
