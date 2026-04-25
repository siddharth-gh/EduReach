import "../config/env.js";
import { GoogleGenAI } from "@google/genai";

const DEFAULT_GOOGLE_AI_MODEL =
    process.env.GOOGLE_AI_MODEL ||
    process.env.GEMMA_MODEL ||
    process.env.AI_CHAT_MODEL ||
    process.env.GEMINI_MODEL ||
    "gemma-3-27b-it";

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
            "Google AI Studio quota is exhausted right now. Try again later or reduce AI usage."
        );
        friendlyError.code = "GOOGLE_AI_QUOTA_EXHAUSTED";
        throw friendlyError;
    }

    throw error;
};

const getGeminiClient = () => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured");
    }

    return new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
    });
};

const isGeminiConfigured = () => Boolean(process.env.GEMINI_API_KEY);

const generateWithGemini = async (
    prompt,
    model = DEFAULT_GOOGLE_AI_MODEL,
    { temperature = 0.2 } = {}
) => {
    try {
        const client = getGeminiClient();
        const response = await client.models.generateContent({
            model,
            contents: prompt,
            config: {
                temperature,
            },
        });

        return extractJson(response.text);
    } catch (error) {
        normalizeGeminiError(error);
    }
};

const generateJson = async (prompt, _schema, options = {}) => {
    return generateWithGemini(prompt, options.model, {
        temperature: options.temperature,
    });
};

export const isAiConfigured = () => isGeminiConfigured();

export const generateLectureSummary = async ({
    courseTitle,
    moduleTitle,
    lectureTitle,
    lectureText,
    transcriptText,
}) => {
    const parsed = await generateJson(`You are helping learners in low-connectivity environments.

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
- Do not include markdown.
- Return valid JSON only.`, {
        type: "object",
        properties: {
            summary: { type: "string" },
            keyPoints: {
                type: "array",
                items: { type: "string" },
            },
        },
        required: ["summary", "keyPoints"],
        additionalProperties: false,
    });

    return {
        summary: typeof parsed.summary === "string" ? parsed.summary.trim() : "",
        keyPoints: Array.isArray(parsed.keyPoints)
            ? parsed.keyPoints
                  .map((item) => String(item || "").trim())
                  .filter(Boolean)
                  .slice(0, 6)
            : [],
    };
};

export const generateLectureAssistantReply = async ({
    courseTitle,
    moduleTitle,
    lectureTitle,
    lectureText,
    transcriptText,
    messages,
}) => {
    if (!isGeminiConfigured()) {
        throw new Error("GEMINI_API_KEY is required for Google AI Studio");
    }
    const assistantModel = DEFAULT_GOOGLE_AI_MODEL;
    const assistantLabel = `Google AI Studio (${assistantModel})`;

    const conversation = messages
        .slice(-6)
        .map(
            (message) =>
                `${message.role === "assistant" ? "Assistant" : "User"}: ${message.content}`
        )
        .join("\n");

    const parsed = await generateJson(`You are an educational assistant for a lecture.

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
- Make options plausible and non-duplicative.
- Return valid JSON only.`, {
        type: "object",
        properties: {
            reply: { type: "string" },
            mcqs: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        question: { type: "string" },
                        options: {
                            type: "array",
                            items: { type: "string" },
                        },
                        correctAnswer: { type: "number" },
                        explanation: { type: "string" },
                    },
                    required: ["question", "options", "correctAnswer", "explanation"],
                    additionalProperties: false,
                },
            },
        },
        required: ["reply", "mcqs"],
        additionalProperties: false,
    }, {
        model: assistantModel,
        temperature: 0.2,
    });

    return {
        provider: "google-ai-studio",
        model: assistantModel,
        label: assistantLabel,
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
};

export const generateAdaptiveQuestionBank = async ({
    courseTitle,
    moduleTitle,
    lectureTitle,
    lectureText,
    transcriptText,
    difficulty = "medium",
    count = 5,
}) => {
    const parsed = await generateJson(`You are an adaptive educational assessment assistant.
    
Course: ${courseTitle}
Module: ${moduleTitle}
Lecture: ${lectureTitle}

Grounding context:
Lecture text:
${lectureText || "N/A"}

Transcript:
${transcriptText || "N/A"}

Return strict JSON with this shape only:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["Full answer option 1", "Full answer option 2", "Full answer option 3", "Full answer option 4"],
      "correctAnswer": 0,
      "explanation": "Why it is correct",
      "difficulty": "${difficulty}",
      "concept": "Specific concept name",
      "learningObjective": "What this question checks"
    }
  ]
}

Rules:
- Generate exactly ${count} questions.
- Every question must be of difficulty: ${difficulty}.
- Cover 2 to 3 distinct concepts from the lecture.
- Keep questions grounded in the context only.
- Each question must have exactly 4 options.
- Options must be complete, descriptive answer choices.
- correctAnswer must be 0, 1, 2 or 3.
- Keep explanations concise and clear.
- Do not include markdown.
- Return valid JSON only.`, {
        type: "object",
        properties: {
            questions: {
                type: "array",
                minItems: count,
                maxItems: count,
                items: {
                    type: "object",
                    properties: {
                        question: { type: "string" },
                        options: {
                            type: "array",
                            minItems: 4,
                            maxItems: 4,
                            items: { type: "string" },
                        },
                        correctAnswer: { type: "number" },
                        explanation: { type: "string" },
                        difficulty: { type: "string" },
                        concept: { type: "string" },
                        learningObjective: { type: "string" },
                    },
                    required: [
                        "question",
                        "options",
                        "correctAnswer",
                        "explanation",
                        "difficulty",
                        "concept",
                        "learningObjective",
                    ],
                    additionalProperties: false,
                },
            },
        },
        required: ["questions"],
        additionalProperties: false,
    });

    const difficulties = ["easy", "medium", "hard"];
    const normalized = Array.isArray(parsed.questions)
        ? parsed.questions
              .map((question) => ({
                  question: String(question?.question || "").trim(),
                  options: Array.isArray(question?.options)
                      ? question.options
                            .map((option) => String(option || "").trim())
                            .filter(Boolean)
                            .slice(0, 4)
                      : [],
                  correctAnswer:
                      typeof question?.correctAnswer === "number"
                          ? Math.max(0, Math.min(3, Math.trunc(question.correctAnswer)))
                          : 0,
                  explanation: String(question?.explanation || "").trim(),
                  difficulty: difficulties.includes(
                      String(question?.difficulty || "").toLowerCase()
                  )
                      ? String(question.difficulty).toLowerCase()
                      : difficulty,
                  concept:
                      String(question?.concept || "").trim() || "Core concept",
                  learningObjective: String(
                      question?.learningObjective || ""
                  ).trim(),
              }))
              .filter(
                  (question) =>
                      question.question &&
                      question.options.length === 4 &&
                      question.options.every(
                          (option) =>
                              option.length > 1 &&
                              !/^[abcd]$/i.test(option) &&
                              !/^option\s*\d+$/i.test(option) &&
                              !/^choice\s*\d+$/i.test(option)
                      )
              )
              .slice(0, count)
        : [];

    if (normalized.length === 0) {
        throw new Error(`AI did not return any valid adaptive questions for ${difficulty}`);
    }

    return normalized;
};
