"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Salad,
  Plus,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Flame,
  Beef,
  Wheat,
  Droplets,
} from "lucide-react"

interface Meal {
  id: string
  name: string
  meal_type: string | null
  calories: number | null
  protein_grams: number | null
  carbs_grams: number | null
  fat_grams: number | null
  ingredients: Array<{ name: string; quantity: string }> | null
  day_of_week: string | null
}

interface NutritionPlan {
  id: string
  name: string
  description: string | null
  daily_calories: number | null
  protein_grams: number | null
  carbs_grams: number | null
  fat_grams: number | null
  dietary_type: string | null
  is_active: boolean
  meals: Meal[]
}

interface NutritionViewProps {
  userId: string
  nutritionPlans: NutritionPlan[]
}

export function NutritionView({ userId, nutritionPlans }: NutritionViewProps) {
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null)
  const [showShopping, setShowShopping] = useState<string | null>(null)

  // New plan form
  const [planName, setPlanName] = useState("")
  const [planCalories, setPlanCalories] = useState("")
  const [planProtein, setPlanProtein] = useState("")
  const [planCarbs, setPlanCarbs] = useState("")
  const [planFat, setPlanFat] = useState("")
  const [planDietType, setPlanDietType] = useState("")

  // New meal form
  const [addingMealTo, setAddingMealTo] = useState<string | null>(null)
  const [mealName, setMealName] = useState("")
  const [mealType, setMealType] = useState("")
  const [mealCalories, setMealCalories] = useState("")
  const [mealProtein, setMealProtein] = useState("")
  const [mealCarbs, setMealCarbs] = useState("")
  const [mealFat, setMealFat] = useState("")
  const [mealIngredients, setMealIngredients] = useState("")
  const [mealDay, setMealDay] = useState("")

  const handleCreatePlan = async () => {
    if (!planName) return
    setCreating(true)
    const supabase = createClient()

    await supabase.from("nutrition_plans").insert({
      user_id: userId,
      name: planName,
      daily_calories: planCalories ? parseInt(planCalories) : null,
      protein_grams: planProtein ? parseInt(planProtein) : null,
      carbs_grams: planCarbs ? parseInt(planCarbs) : null,
      fat_grams: planFat ? parseInt(planFat) : null,
      dietary_type: planDietType || null,
    })

    setPlanName("")
    setPlanCalories("")
    setPlanProtein("")
    setPlanCarbs("")
    setPlanFat("")
    setPlanDietType("")
    setDialogOpen(false)
    setCreating(false)
    router.refresh()
  }

  const handleAddMeal = async (planId: string) => {
    if (!mealName) return
    const supabase = createClient()

    const ingredients = mealIngredients
      ? mealIngredients.split(",").map((i) => ({
          name: i.trim(),
          quantity: "as needed",
        }))
      : []

    await supabase.from("meals").insert({
      nutrition_plan_id: planId,
      user_id: userId,
      name: mealName,
      meal_type: mealType || null,
      calories: mealCalories ? parseInt(mealCalories) : null,
      protein_grams: mealProtein ? parseInt(mealProtein) : null,
      carbs_grams: mealCarbs ? parseInt(mealCarbs) : null,
      fat_grams: mealFat ? parseInt(mealFat) : null,
      ingredients,
      day_of_week: mealDay || null,
    })

    setMealName("")
    setMealType("")
    setMealCalories("")
    setMealProtein("")
    setMealCarbs("")
    setMealFat("")
    setMealIngredients("")
    setMealDay("")
    setAddingMealTo(null)
    router.refresh()
  }

  const handleDeletePlan = async (planId: string) => {
    const supabase = createClient()
    await supabase.from("nutrition_plans").delete().eq("id", planId)
    router.refresh()
  }

  const handleDeleteMeal = async (mealId: string) => {
    const supabase = createClient()
    await supabase.from("meals").delete().eq("id", mealId)
    router.refresh()
  }

  const getShoppingList = (plan: NutritionPlan) => {
    const allIngredients: Record<string, boolean> = {}
    plan.meals.forEach((meal) => {
      if (Array.isArray(meal.ingredients)) {
        meal.ingredients.forEach((ing) => {
          if (ing.name) allIngredients[ing.name] = true
        })
      }
    })
    return Object.keys(allIngredients)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">
            Nutrition Plans
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage meal plans and generate shopping lists
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Plan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">
                Create Nutrition Plan
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>Plan Name</Label>
                <Input
                  placeholder="e.g. High Protein Indian Diet"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label>Daily Calories</Label>
                  <Input
                    type="number"
                    placeholder="2000"
                    value={planCalories}
                    onChange={(e) => setPlanCalories(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Dietary Type</Label>
                  <Select value={planDietType} onValueChange={setPlanDietType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="vegan">Vegan</SelectItem>
                      <SelectItem value="non_vegetarian">Non-Veg</SelectItem>
                      <SelectItem value="eggetarian">Eggetarian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-2">
                  <Label>Protein (g)</Label>
                  <Input
                    type="number"
                    placeholder="150"
                    value={planProtein}
                    onChange={(e) => setPlanProtein(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Carbs (g)</Label>
                  <Input
                    type="number"
                    placeholder="200"
                    value={planCarbs}
                    onChange={(e) => setPlanCarbs(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Fat (g)</Label>
                  <Input
                    type="number"
                    placeholder="60"
                    value={planFat}
                    onChange={(e) => setPlanFat(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleCreatePlan} disabled={creating || !planName}>
                {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create Plan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {nutritionPlans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10">
              <Salad className="h-7 w-7 text-accent" />
            </div>
            <p className="font-medium text-foreground">No nutrition plans yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first meal plan to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {nutritionPlans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div
                    className="flex cursor-pointer items-center gap-3"
                    onClick={() =>
                      setExpandedPlan(expandedPlan === plan.id ? null : plan.id)
                    }
                    onKeyDown={() => {}}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                      <Salad className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{plan.name}</CardTitle>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        {plan.dietary_type && (
                          <Badge variant="secondary" className="text-xs capitalize">
                            {plan.dietary_type.replace("_", " ")}
                          </Badge>
                        )}
                        {plan.daily_calories && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Flame className="h-3 w-3" />
                            {plan.daily_calories} cal/day
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {plan.meals.length} meals
                        </span>
                      </div>
                    </div>
                    {expandedPlan === plan.id ? (
                      <ChevronUp className="ml-2 h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setShowShopping(showShopping === plan.id ? null : plan.id)
                      }
                      className="text-muted-foreground"
                      title="Shopping List"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeletePlan(plan.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Macro breakdown */}
                {(plan.protein_grams || plan.carbs_grams || plan.fat_grams) && (
                  <div className="mt-3 flex gap-4">
                    {plan.protein_grams && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Beef className="h-3 w-3 text-chart-1" />
                        Protein: {plan.protein_grams}g
                      </div>
                    )}
                    {plan.carbs_grams && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Wheat className="h-3 w-3 text-chart-2" />
                        Carbs: {plan.carbs_grams}g
                      </div>
                    )}
                    {plan.fat_grams && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Droplets className="h-3 w-3 text-chart-3" />
                        Fat: {plan.fat_grams}g
                      </div>
                    )}
                  </div>
                )}
              </CardHeader>

              {/* Shopping List */}
              {showShopping === plan.id && (
                <CardContent className="border-t border-border pt-4">
                  <p className="mb-2 text-sm font-medium text-foreground">
                    Shopping List
                  </p>
                  {getShoppingList(plan).length > 0 ? (
                    <ul className="grid grid-cols-2 gap-1 md:grid-cols-3">
                      {getShoppingList(plan).map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-sm text-foreground"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Add meals with ingredients to generate a shopping list
                    </p>
                  )}
                </CardContent>
              )}

              {/* Meals */}
              {expandedPlan === plan.id && (
                <CardContent className="flex flex-col gap-3">
                  {plan.meals.map((meal) => (
                    <div
                      key={meal.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">
                            {meal.name}
                          </p>
                          {meal.meal_type && (
                            <Badge variant="outline" className="text-xs capitalize">
                              {meal.meal_type}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {[
                            meal.calories && `${meal.calories} cal`,
                            meal.protein_grams && `${meal.protein_grams}g protein`,
                            meal.day_of_week,
                          ]
                            .filter(Boolean)
                            .join(" | ")}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteMeal(meal.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}

                  {addingMealTo === plan.id ? (
                    <div className="rounded-lg border border-border bg-card p-4">
                      <p className="mb-3 text-sm font-medium text-foreground">
                        Add Meal
                      </p>
                      <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            placeholder="Meal name"
                            value={mealName}
                            onChange={(e) => setMealName(e.target.value)}
                          />
                          <Select value={mealType} onValueChange={setMealType}>
                            <SelectTrigger>
                              <SelectValue placeholder="Meal type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="breakfast">Breakfast</SelectItem>
                              <SelectItem value="lunch">Lunch</SelectItem>
                              <SelectItem value="dinner">Dinner</SelectItem>
                              <SelectItem value="snack">Snack</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                          <Input
                            type="number"
                            placeholder="Calories"
                            value={mealCalories}
                            onChange={(e) => setMealCalories(e.target.value)}
                          />
                          <Input
                            type="number"
                            placeholder="Protein"
                            value={mealProtein}
                            onChange={(e) => setMealProtein(e.target.value)}
                          />
                          <Input
                            type="number"
                            placeholder="Carbs"
                            value={mealCarbs}
                            onChange={(e) => setMealCarbs(e.target.value)}
                          />
                          <Input
                            type="number"
                            placeholder="Fat"
                            value={mealFat}
                            onChange={(e) => setMealFat(e.target.value)}
                          />
                        </div>
                        <Input
                          placeholder="Ingredients (comma separated): rice, dal, ghee..."
                          value={mealIngredients}
                          onChange={(e) => setMealIngredients(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setAddingMealTo(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => handleAddMeal(plan.id)}
                            disabled={!mealName}
                          >
                            Add Meal
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => setAddingMealTo(plan.id)}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Meal
                    </Button>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
