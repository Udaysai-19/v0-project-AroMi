"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"

interface AssessmentFormProps {
  userId: string
  profile: {
    height_cm: number | null
    weight_kg: number | null
    age: number | null
    gender: string | null
    fitness_goal: string | null
    activity_level: string | null
    dietary_preference: string | null
  } | null
  existingAssessment: {
    bmi: number | null
    bmi_category: string | null
    health_conditions: string[]
    injuries: string[]
    sleep_hours: number | null
    stress_level: string | null
    water_intake_liters: number | null
  } | null
}

const healthConditions = [
  "Diabetes",
  "Hypertension",
  "Heart Disease",
  "Asthma",
  "Thyroid Disorder",
  "PCOS",
  "Arthritis",
  "Back Pain",
  "None",
]

const injuries = [
  "Knee Injury",
  "Shoulder Injury",
  "Back Injury",
  "Ankle Injury",
  "Wrist Injury",
  "Hip Injury",
  "None",
]

export function AssessmentForm({
  userId,
  profile,
  existingAssessment,
}: AssessmentFormProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [result, setResult] = useState<{
    bmi: number
    bmi_category: string
  } | null>(null)

  // Form state
  const [height, setHeight] = useState(
    profile?.height_cm?.toString() || ""
  )
  const [weight, setWeight] = useState(
    profile?.weight_kg?.toString() || ""
  )
  const [age, setAge] = useState(profile?.age?.toString() || "")
  const [gender, setGender] = useState(profile?.gender || "")
  const [fitnessGoal, setFitnessGoal] = useState(
    profile?.fitness_goal || ""
  )
  const [activityLevel, setActivityLevel] = useState(
    profile?.activity_level || ""
  )
  const [dietaryPreference, setDietaryPreference] = useState(
    profile?.dietary_preference || ""
  )
  const [selectedConditions, setSelectedConditions] = useState<string[]>(
    existingAssessment?.health_conditions || []
  )
  const [selectedInjuries, setSelectedInjuries] = useState<string[]>(
    existingAssessment?.injuries || []
  )
  const [sleepHours, setSleepHours] = useState(
    existingAssessment?.sleep_hours?.toString() || ""
  )
  const [stressLevel, setStressLevel] = useState(
    existingAssessment?.stress_level || ""
  )
  const [waterIntake, setWaterIntake] = useState(
    existingAssessment?.water_intake_liters?.toString() || ""
  )

  const totalSteps = 3

  const toggleCondition = (condition: string) => {
    if (condition === "None") {
      setSelectedConditions(["None"])
      return
    }
    setSelectedConditions((prev) => {
      const filtered = prev.filter((c) => c !== "None")
      return filtered.includes(condition)
        ? filtered.filter((c) => c !== condition)
        : [...filtered, condition]
    })
  }

  const toggleInjury = (injury: string) => {
    if (injury === "None") {
      setSelectedInjuries(["None"])
      return
    }
    setSelectedInjuries((prev) => {
      const filtered = prev.filter((i) => i !== "None")
      return filtered.includes(injury)
        ? filtered.filter((i) => i !== injury)
        : [...filtered, injury]
    })
  }

  const calculateBMI = (h: number, w: number) => {
    const heightM = h / 100
    const bmi = w / (heightM * heightM)
    let category = "Normal"
    if (bmi < 18.5) category = "Underweight"
    else if (bmi < 25) category = "Normal"
    else if (bmi < 30) category = "Overweight"
    else category = "Obese"
    return { bmi: Math.round(bmi * 10) / 10, category }
  }

  const handleSubmit = async () => {
    setLoading(true)
    const supabase = createClient()

    const h = parseFloat(height)
    const w = parseFloat(weight)
    const bmiResult = calculateBMI(h, w)

    // Update profile
    await supabase
      .from("profiles")
      .update({
        height_cm: h,
        weight_kg: w,
        age: parseInt(age),
        gender,
        fitness_goal: fitnessGoal,
        activity_level: activityLevel,
        dietary_preference: dietaryPreference,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    // Create health assessment
    await supabase.from("health_assessments").insert({
      user_id: userId,
      bmi: bmiResult.bmi,
      bmi_category: bmiResult.category,
      health_conditions: selectedConditions,
      injuries: selectedInjuries,
      sleep_hours: parseFloat(sleepHours) || null,
      stress_level: stressLevel || null,
      water_intake_liters: parseFloat(waterIntake) || null,
    })

    setResult(bmiResult)
    setCompleted(true)
    setLoading(false)
  }

  if (completed && result) {
    return (
      <div className="mx-auto max-w-lg">
        <Card>
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Assessment Complete!
            </h2>
            <p className="mt-2 text-muted-foreground">
              Your health profile has been updated successfully.
            </p>

            <div className="mt-6 flex w-full flex-col gap-4 rounded-xl bg-muted p-6">
              <div>
                <p className="text-sm text-muted-foreground">Your BMI</p>
                <p className="font-display text-4xl font-bold text-primary">
                  {result.bmi}
                </p>
              </div>
              <div className="h-px bg-border" />
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="text-lg font-semibold text-foreground">
                  {result.category}
                </p>
              </div>
            </div>

            <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => {
                  setCompleted(false)
                  setStep(1)
                }}
              >
                Retake Assessment
              </Button>
              <Button className="flex-1" onClick={() => router.push("/dashboard")}>
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress indicator */}
      <div className="mb-8 flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={`step-${i + 1}`}
            className={`h-2 flex-1 rounded-full transition-colors ${
              i + 1 <= step ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display">
              Step 1: Basic Information
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Tell us about yourself so we can personalize your experience.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="170"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="70"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="goal">Fitness Goal</Label>
              <Select value={fitnessGoal} onValueChange={setFitnessGoal}>
                <SelectTrigger id="goal">
                  <SelectValue placeholder="Select your goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight_loss">Weight Loss</SelectItem>
                  <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                  <SelectItem value="endurance">Build Endurance</SelectItem>
                  <SelectItem value="flexibility">Improve Flexibility</SelectItem>
                  <SelectItem value="general_fitness">General Fitness</SelectItem>
                  <SelectItem value="stress_relief">Stress Relief</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="activity">Activity Level</Label>
                <Select
                  value={activityLevel}
                  onValueChange={setActivityLevel}
                >
                  <SelectTrigger id="activity">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary</SelectItem>
                    <SelectItem value="lightly_active">Lightly Active</SelectItem>
                    <SelectItem value="moderately_active">Moderately Active</SelectItem>
                    <SelectItem value="very_active">Very Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="diet">Dietary Preference</Label>
                <Select
                  value={dietaryPreference}
                  onValueChange={setDietaryPreference}
                >
                  <SelectTrigger id="diet">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="vegan">Vegan</SelectItem>
                    <SelectItem value="non_vegetarian">Non-Vegetarian</SelectItem>
                    <SelectItem value="eggetarian">Eggetarian</SelectItem>
                    <SelectItem value="no_preference">No Preference</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => setStep(2)}
                disabled={!height || !weight || !age || !gender}
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display">
              Step 2: Health Conditions
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Select any existing conditions or injuries so we can tailor your plans.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div>
              <p className="mb-3 text-sm font-medium text-foreground">
                Health Conditions
              </p>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {healthConditions.map((condition) => (
                  <label
                    key={condition}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-border p-3 transition-colors hover:bg-muted"
                  >
                    <Checkbox
                      checked={selectedConditions.includes(condition)}
                      onCheckedChange={() => toggleCondition(condition)}
                    />
                    <span className="text-sm text-foreground">{condition}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium text-foreground">
                Injuries
              </p>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {injuries.map((injury) => (
                  <label
                    key={injury}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-border p-3 transition-colors hover:bg-muted"
                  >
                    <Checkbox
                      checked={selectedInjuries.includes(injury)}
                      onCheckedChange={() => toggleInjury(injury)}
                    />
                    <span className="text-sm text-foreground">{injury}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={() => setStep(3)}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display">
              Step 3: Lifestyle
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Help us understand your daily habits for better recommendations.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="sleep">Average Sleep (hours/night)</Label>
              <Input
                id="sleep"
                type="number"
                step="0.5"
                placeholder="7"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="stress">Stress Level</Label>
              <Select value={stressLevel} onValueChange={setStressLevel}>
                <SelectTrigger id="stress">
                  <SelectValue placeholder="Select stress level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="very_high">Very High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="water">Daily Water Intake (liters)</Label>
              <Input
                id="water"
                type="number"
                step="0.5"
                placeholder="2.5"
                value={waterIntake}
                onChange={(e) => setWaterIntake(e.target.value)}
              />
            </div>

            <div className="mt-4 flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Complete Assessment"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
