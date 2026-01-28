import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, category, candidateName, responses } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (action === "generate-questions") {
      console.log(`Generating questions for category: ${category}`);
      
      const response = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              {
                role: "system",
                content: `You are a technical interviewer for a software company. Generate exactly 5 interview questions for a ${category} developer position. 
                
Questions should be:
- Mix of conceptual and practical
- Progressive in difficulty (start easier, end harder)
- Testing real-world problem-solving skills
- Appropriate for a mid-level developer

Return ONLY a valid JSON array of strings with the 5 questions. No markdown, no explanation.
Example format: ["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]`,
              },
              {
                role: "user",
                content: `Generate 5 interview questions for a ${category} developer position.`,
              },
            ],
            temperature: 0.7,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI gateway error:", response.status, errorText);
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      console.log("AI response:", content);
      
      let questions: string[];
      try {
        // Clean the response - remove markdown code blocks if present
        let cleanContent = content.trim();
        if (cleanContent.startsWith("```")) {
          cleanContent = cleanContent.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
        }
        questions = JSON.parse(cleanContent);
      } catch (e) {
        console.error("Failed to parse questions:", e, content);
        // Fallback questions
        questions = [
          `What are the core principles of ${category} development?`,
          `Can you explain a challenging ${category} project you've worked on?`,
          `How do you approach debugging in ${category}?`,
          `What best practices do you follow when writing ${category} code?`,
          `Where do you see ${category} technology heading in the next few years?`,
        ];
      }

      return new Response(JSON.stringify({ questions }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "analyze-interview") {
      console.log(`Analyzing interview for ${candidateName} in ${category}`);
      
      const formattedResponses = responses
        .map((r: { question: string; answer: string }, i: number) => 
          `Question ${i + 1}: ${r.question}\nAnswer: ${r.answer}`
        )
        .join("\n\n");

      const response = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              {
                role: "system",
                content: `You are an expert technical interviewer evaluating a candidate for a ${category} developer position. 
                
Analyze the candidate's responses and provide a detailed evaluation.

Return ONLY valid JSON in this exact format (no markdown):
{
  "responses": [
    {
      "question": "the question asked",
      "answer": "the candidate's answer",
      "score": 75,
      "feedback": "specific feedback for this answer"
    }
  ],
  "overallScore": 72,
  "overallFeedback": "2-3 sentence summary of the candidate's performance",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["area 1", "area 2", "area 3"],
  "recommendation": "hire" | "consider" | "decline"
}

Scoring guidelines:
- 80-100: Excellent, demonstrates deep understanding
- 60-79: Good, shows solid knowledge with minor gaps
- 40-59: Average, basic understanding but needs improvement
- 0-39: Below expectations

Be fair but constructive in your feedback.`,
              },
              {
                role: "user",
                content: `Candidate: ${candidateName}\nPosition: ${category} Developer\n\nInterview Responses:\n\n${formattedResponses}`,
              },
            ],
            temperature: 0.5,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI gateway error:", response.status, errorText);
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      console.log("AI analysis response:", content);
      
      let analysis;
      try {
        let cleanContent = content.trim();
        if (cleanContent.startsWith("```")) {
          cleanContent = cleanContent.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
        }
        analysis = JSON.parse(cleanContent);
      } catch (e) {
        console.error("Failed to parse analysis:", e, content);
        // Return a default analysis
        analysis = {
          responses: responses.map((r: { question: string; answer: string }) => ({
            question: r.question,
            answer: r.answer,
            score: 60,
            feedback: "Unable to fully analyze this response.",
          })),
          overallScore: 60,
          overallFeedback: "The candidate showed some knowledge but the full analysis could not be completed.",
          strengths: ["Participated in the interview", "Provided responses to all questions"],
          improvements: ["Consider providing more detailed responses", "Practice articulating technical concepts"],
          recommendation: "consider",
        };
      }

      return new Response(JSON.stringify(analysis), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Invalid action");
  } catch (error) {
    console.error("Interview function error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
