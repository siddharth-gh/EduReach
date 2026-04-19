import { GoogleGenAI } from "@google/genai";

const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const extractJson = (value) => {
    if (!value) {
        throw new Error("AI response was empty");
    }

    const directParse = (() => {
        try {
            return JSON.parse(value);
        } catch {
            return null;
        }
    })();

    if (directParse) {
        return directParse;
    }

    const fencedMatch = value.match(/```json\s*([\s\S]*?)```/i);

    if (fencedMatch?.[1]) {
        return JSON.parse(fencedMatch[1]);
    }

    const objectMatch = value.match(/\{[\s\S]*\}/);

    if (!objectMatch) {
        throw new Error("AI response did not contain valid JSON");
    }

    return JSON.parse(objectMatch[0]);
};

const normalizeGeminiError = (error) => {
    const rawMessage =
        error?.message ||
        error?.error?.message ||
        "Gemini request failed";

    if (
        rawMessage.includes("RESOURCE_EXHAUSTED") ||
        rawMessage.includes("Quota exceeded") ||
        rawMessage.includes('"code":429') ||
        rawMessage.includes("429")
    ) {
        const friendlyError = new Error(
            "Gemini quota is exhausted right now. Try again later or reduce AI usage."
        );
        friendlyError.code = "GEMINI_QUOTA_EXHAUSTED";
        throw friendlyError;
    }

    throw error;
};

const getClient = () => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured");
    }

    return new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
    });
};

export const isGeminiConfigured = () => Boolean(process.env.GEMINI_API_KEY);

export const generateLectureSummary = async ({
    courseTitle,
    moduleTitle,
    lectureTitle,
    lectureText,
    transcriptText,
}) => {
    try {
        const client = getClient();
        const response = await client.models.generateContent({
            model: DEFAULT_GEMINI_MODEL,
            contents: `You are helping learners in low-connectivity environments.

Course: ${courseTitle}
Module: ${moduleTitle}
Lecture: ${lectureTitle}

Lecture text:
${lectureText || "N/A"}

Transcript:
${transcriptText || "N/A"}

Return strict JSON with this shape only:
{
  "summary": "2-4 sentence concise summary",
  "keyPoints": ["point 1", "point 2", "point 3", "point 4"]
}

Rules:
- Be accurate to the provided lecture context only.
- Keep language student-friendly.
- Keep keyPoints practical and short.
- Do not include markdown.`,
            config: {
                responseMimeType: "application/json",
            },
        });

        const parsed = extractJson(response.text);

        return {
            summary:
                typeof parsed.summary === "string" ? parsed.summary.trim() : "",
            keyPoints: Array.isArray(parsed.keyPoints)
                ? parsed.keyPoints
                      .map((item) => String(item || "").trim())
                      .filter(Boolean)
                      .slice(0, 6)
                : [],
        };
    } catch (error) {
        normalizeGeminiError(error);
    }
};

export const generateLectureAssistantReply = async ({
    courseTitle,
    moduleTitle,
    lectureTitle,
    lectureText,
    transcriptText,
    messages,
}) => {
    try {
        const client = getClient();
        const conversation = messages
            .slice(-6)
            .map(
                (message) =>
                    `${message.role === "assistant" ? "Assistant" : "User"}: ${message.content}`
            )
            .join("\n");

        const response = await client.models.generateContent({
            model: DEFAULT_GEMINI_MODEL,
            contents: `You are an educational assistant for a lecture.

Course: ${courseTitle}
Module: ${moduleTitle}
Lecture: ${lectureTitle}

Grounding context:
Lecture text:
${lectureText || "N/A"}

Transcript:
${transcriptText || "N/A"}

Conversation so far:
${conversation || "User: Generate practice MCQs from this lecture."}

Return strict JSON with this shape only:
{
  "reply": "Short helpful answer grounded in the lecture",
  "mcqs": [
    {
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Why it is correct"
    }
  ]
}

Rules:
- Keep replies grounded in the lecture context only.
- If the user asks for MCQs, generate 3 or 4 good ones.
- If the user asks a normal doubt, still include 1 or 2 MCQs when useful.
- Do not use markdown.
- Make options plausible and non-duplicative.`,
            config: {
                responseMimeType: "application/json",
            },
        });

        const parsed = extractJson(response.text);

        return {
            reply: typeof parsed.reply === "string" ? parsed.reply.trim() : "",
            mcqs: Array.isArray(parsed.mcqs)
                ? parsed.mcqs
                      .map((mcq) => ({
                          question: String(mcq?.question || "").trim(),
                          options: Array.isArray(mcq?.options)
                              ? mcq.options
                                    .map((option) => String(option || "").trim())
                                    .filter(Boolean)
                                    .slice(0, 4)
                              : [],
                          correctAnswer:
                              typeof mcq?.correctAnswer === "number"
                                  ? mcq.correctAnswer
                                  : 0,
                          explanation: String(mcq?.explanation || "").trim(),
                      }))
                      .filter((mcq) => mcq.question && mcq.options.length >= 2)
                      .slice(0, 4)
                : [],
        };
    } catch (error) {
        normalizeGeminiError(error);
    }
};
