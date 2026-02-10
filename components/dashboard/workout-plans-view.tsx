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
  Dumbbell,
  Plus,
  Loader2,
  Play,
  Trash2,
  Clock,
  Flame,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

interface Exercise {
  id: string
  name: string
  muscle_group: string | null
  sets: number | null
  reps: number | null
  duration_minutes: number | null
  rest_seconds: number | null
  youtube_video_id: string | null
  day_of_week: string | null
  order_index: number
}

interface WorkoutPlan {
  id: string
  name: string
  description: string | null
  difficulty: string | null
  duration_weeks: number | null
  goal: string | null
  is_active: boolean
  exercises: Exercise[]
}

interface WorkoutPlansViewProps {
  userId: string
  workoutPlans: WorkoutPlan[]
  profile: { fitness_goal: string | null; activity_level: string | null } | null
}

export function WorkoutPlansView({
  userId,
  workoutPlans,
  profile,
}: WorkoutPlansViewProps) {
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [newPlanName, setNewPlanName] = useState("")
  const [newPlanDifficulty, setNewPlanDifficulty] = useState("")
  const [newPlanDuration, setNewPlanDuration] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null)
  const [activeVideo, setActiveVideo] = useState<string | null>(null)

  // Adding exercises
  const [addingExerciseTo, setAddingExerciseTo] = useState<string | null>(null)
  const [newExName, setNewExName] = useState("")
  const [newExMuscle, setNewExMuscle] = useState("")
  const [newExSets, setNewExSets] = useState("")
  const [newExReps, setNewExReps] = useState("")
  const [newExDuration, setNewExDuration] = useState("")
  const [newExYouTube, setNewExYouTube] = useState("")
  const [newExDay, setNewExDay] = useState("")

  const handleCreatePlan = async () => {
    if (!newPlanName) return
    setCreating(true)
    const supabase = createClient()

    await supabase.from("workout_plans").insert({
      user_id: userId,
      name: newPlanName,
      difficulty: newPlanDifficulty || null,
      duration_weeks: newPlanDuration ? parseInt(newPlanDuration) : null,
      goal: profile?.fitness_goal || null,
    })

    setNewPlanName("")
    setNewPlanDifficulty("")
    setNewPlanDuration("")
    setDialogOpen(false)
    setCreating(false)
    router.refresh()
  }

  const handleAddExercise = async (planId: string) => {
    if (!newExName) return
    const supabase = createClient()

    await supabase.from("exercises").insert({
      workout_plan_id: planId,
      user_id: userId,
      name: newExName,
      muscle_group: newExMuscle || null,
      sets: newExSets ? parseInt(newExSets) : null,
      reps: newExReps ? parseInt(newExReps) : null,
      duration_minutes: newExDuration ? parseInt(newExDuration) : null,
      youtube_video_id: newExYouTube || null,
      day_of_week: newExDay || null,
    })

    setNewExName("")
    setNewExMuscle("")
    setNewExSets("")
    setNewExReps("")
    setNewExDuration("")
    setNewExYouTube("")
    setNewExDay("")
    setAddingExerciseTo(null)
    router.refresh()
  }

  const handleDeletePlan = async (planId: string) => {
    const supabase = createClient()
    await supabase.from("workout_plans").delete().eq("id", planId)
    router.refresh()
  }

  const handleDeleteExercise = async (exerciseId: string) => {
    const supabase = createClient()
    await supabase.from("exercises").delete().eq("id", exerciseId)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">
            Your Workout Plans
          </h2>
          <p className="text-sm text-muted-foreground">
            Create and manage your exercise routines
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
              <DialogTitle className="font-display">Create Workout Plan</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>Plan Name</Label>
                <Input
                  placeholder="e.g. Morning Strength Training"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Difficulty</Label>
                <Select value={newPlanDifficulty} onValueChange={setNewPlanDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Duration (weeks)</Label>
                <Input
                  type="number"
                  placeholder="4"
                  value={newPlanDuration}
                  onChange={(e) => setNewPlanDuration(e.target.value)}
                />
              </div>
              <Button onClick={handleCreatePlan} disabled={creating || !newPlanName}>
                {creating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Create Plan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {workoutPlans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <Dumbbell className="h-7 w-7 text-primary" />
            </div>
            <p className="font-medium text-foreground">No workout plans yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first plan to start training
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {workoutPlans.map((plan) => (
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
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Dumbbell className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{plan.name}</CardTitle>
                      <div className="mt-1 flex items-center gap-2">
                        {plan.difficulty && (
                          <Badge variant="secondary" className="text-xs capitalize">
                            {plan.difficulty}
                          </Badge>
                        )}
                        {plan.duration_weeks && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {plan.duration_weeks} weeks
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {plan.exercises.length} exercises
                        </span>
                      </div>
                    </div>
                    {expandedPlan === plan.id ? (
                      <ChevronUp className="ml-2 h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeletePlan(plan.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              {expandedPlan === plan.id && (
                <CardContent className="flex flex-col gap-3">
                  {plan.exercises.length > 0 && (
                    <div className="flex flex-col gap-2">
                      {plan.exercises.map((ex) => (
                        <div
                          key={ex.id}
                          className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                              <Flame className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {ex.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {[
                                  ex.muscle_group,
                                  ex.sets && `${ex.sets} sets`,
                                  ex.reps && `${ex.reps} reps`,
                                  ex.duration_minutes && `${ex.duration_minutes} min`,
                                  ex.day_of_week,
                                ]
                                  .filter(Boolean)
                                  .join(" | ")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {ex.youtube_video_id && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setActiveVideo(
                                    activeVideo === ex.youtube_video_id
                                      ? null
                                      : ex.youtube_video_id
                                  )
                                }
                                className="text-primary"
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteExercise(ex.id)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* YouTube Player */}
                  {activeVideo && (
                    <div className="overflow-hidden rounded-lg">
                      <iframe
                        width="100%"
                        height="315"
                        src={`https://www.youtube.com/embed/${activeVideo}`}
                        title="Exercise Video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="rounded-lg"
                      />
                    </div>
                  )}

                  {/* Add Exercise Form */}
                  {addingExerciseTo === plan.id ? (
                    <div className="rounded-lg border border-border bg-card p-4">
                      <p className="mb-3 text-sm font-medium text-foreground">
                        Add Exercise
                      </p>
                      <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            placeholder="Exercise name"
                            value={newExName}
                            onChange={(e) => setNewExName(e.target.value)}
                          />
                          <Input
                            placeholder="Muscle group"
                            value={newExMuscle}
                            onChange={(e) => setNewExMuscle(e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <Input
                            type="number"
                            placeholder="Sets"
                            value={newExSets}
                            onChange={(e) => setNewExSets(e.target.value)}
                          />
                          <Input
                            type="number"
                            placeholder="Reps"
                            value={newExReps}
                            onChange={(e) => setNewExReps(e.target.value)}
                          />
                          <Input
                            type="number"
                            placeholder="Minutes"
                            value={newExDuration}
                            onChange={(e) => setNewExDuration(e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            placeholder="YouTube Video ID"
                            value={newExYouTube}
                            onChange={(e) => setNewExYouTube(e.target.value)}
                          />
                          <Select value={newExDay} onValueChange={setNewExDay}>
                            <SelectTrigger>
                              <SelectValue placeholder="Day of week" />
                            </SelectTrigger>
                            <SelectContent>
                              {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map((d) => (
                                <SelectItem key={d} value={d}>{d}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setAddingExerciseTo(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => handleAddExercise(plan.id)}
                            disabled={!newExName}
                          >
                            Add Exercise
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => setAddingExerciseTo(plan.id)}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Exercise
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
