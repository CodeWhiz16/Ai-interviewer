"use server";

import { generateObject } from "ai";
import { groq } from "@ai-sdk/groq";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    const { object } = await generateObject({
  model: groq("llama-3.3-70b-versatile"),
  providerOptions: {
    groq: {
      structuredOutputs: false, // Compatibility for JSON mode
    },
  },
  schema: feedbackSchema,
  prompt: `
    Analyze this mock interview transcript and return a JSON object that matches this EXACT structure:
    {
      "totalScore": number (0-100),
      "categoryScores": [
        { "name": "Communication Skills", "score": number, "comment": string },
        { "name": "Technical Knowledge", "score": number, "comment": string },
        { "name": "Problem Solving", "score": number, "comment": string },
        { "name": "Cultural Fit", "score": number, "comment": string },
        { "name": "Confidence and Clarity", "score": number, "comment": string }
      ],
      "strengths": string[],
      "areasForImprovement": string[],
      "finalAssessment": string
    }

    Transcript:
    ${formattedTranscript}

    Evaluation Criteria:
    - Be thorough and do not be lenient.
    - Provide specific examples from the transcript in the comments.
  `,
  system: "You are a professional interviewer. You MUST always respond with a valid JSON object matching the requested schema. Do not include markdown code blocks or additional text.",
});
    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    let feedbackRef;
    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

// ... rest of your existing functions (getInterviewById, getFeedbackByInterviewId, etc.) remain unchanged
export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();

  return interview.data() as Interview | null;
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}
