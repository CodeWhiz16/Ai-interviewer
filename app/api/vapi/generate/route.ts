import { generateText } from "ai";
// import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

export async function POST(request: Request) {
  const { type, role, level, techstack, amount, userid } = await request.json();

  try {
    const { text: questions } = await generateText({
      // model: google("gemini-2.0-flash"),
      model: groq("llama-3.1-8b-instant"),

      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return ONLY a valid JSON array of strings, nothing else.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Also escape any quotes within questions.
        Return the questions in this exact format (no extra text):
        ["Question 1", "Question 2", "Question 3"]
        
        Thank you! <3
    `,
    });

    // Extract JSON array from the response (in case there's extra text)
    const jsonMatch = questions.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error(`No JSON array found in response: ${questions}`);
    }
    
    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Original response:", questions);
      console.error("Extracted JSON:", jsonMatch[0]);
      throw new Error(`Failed to parse questions as JSON: ${parseError}`);
    }

    const interview = {
      role: role,
      type: type,
      level: level,
      techstack: techstack.split(","),
      questions: parsedQuestions,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    await db.collection("interviews").add(interview);

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ success: false, error: error }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}
