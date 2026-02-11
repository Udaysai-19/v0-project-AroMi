import {
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai"

export const maxDuration = 60

export async function POST(req: Request) {
  const body = await req.json()

  // Support both formats: direct messages array or wrapped with context
  const messages: UIMessage[] = body.messages || []
  const context = body.context as
    | {
        profile?: {
          full_name?: string
          age?: number
          weight_kg?: number
          height_cm?: number
          fitness_goal?: string
          activity_level?: string
          dietary_preference?: string
        }
        assessment?: {
          bmi?: number
          bmi_category?: string
          health_conditions?: string[]
          injuries?: string[]
          sleep_hours?: number
          stress_level?: string
        }
      }
    | undefined

  const profileInfo = context?.profile
    ? `User Profile:
- Name: ${context.profile.full_name || "Not set"}
- Age: ${context.profile.age || "Not set"}
- Weight: ${context.profile.weight_kg ? `${context.profile.weight_kg} kg` : "Not set"}
- Height: ${context.profile.height_cm ? `${context.profile.height_cm} cm` : "Not set"}
- Fitness Goal: ${context.profile.fitness_goal || "Not set"}
- Activity Level: ${context.profile.activity_level || "Not set"}
- Dietary Preference: ${context.profile.dietary_preference || "Not set"}`
    : ""

  const assessmentInfo = context?.assessment
    ? `Health Assessment:
- BMI: ${context.assessment.bmi || "Not set"} (${context.assessment.bmi_category || "N/A"})
- Health Conditions: ${context.assessment.health_conditions?.join(", ") || "None"}
- Injuries: ${context.assessment.injuries?.join(", ") || "None"}
- Sleep: ${context.assessment.sleep_hours || "Not set"} hours
- Stress Level: ${context.assessment.stress_level || "Not set"}`
    : ""

  const systemPrompt = `You are AroMi, an AI-powered health and fitness coach.
You are warm, motivating, and knowledgeable about fitness, nutrition, and wellness.
You provide personalized advice based on the user's profile and health data.
Always be encouraging and provide actionable, specific advice.
Focus on Indian wellness practices and cuisine when relevant.
Keep responses concise but informative (2-3 paragraphs max unless detailed advice is requested).
If the user hasn't completed their health assessment, gently encourage them to do so.

${profileInfo}

${assessmentInfo}

Remember: You are AroMi, an AI health coach. Be supportive and evidence-based in your recommendations.`

  const result = streamText({
    model: "openai/gpt-4o-mini",
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
  })
}
